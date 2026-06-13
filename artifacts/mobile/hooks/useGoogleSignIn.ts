/**
 * useGoogleSignIn — Google OAuth for Expo Go (native) and web.
 *
 * ── Why server-side OAuth? ──────────────────────────────────────────────────
 * expo-auth-session v7 (SDK 54) fully removed the auth.expo.io proxy
 * (useProxy/projectNameForProxy). Without the proxy, makeRedirectUri() always
 * returns exp://... which Google rejects as an invalid redirect URI.
 *
 * ── Native flow (server-side authorization-code exchange) ───────────────────
 *  1. App opens system browser to  GET /api/auth/google/init?returnUrl=exp://...
 *  2. Backend redirects to Google OAuth (server's own callback URI registered
 *     in Google Cloud Console)
 *  3. Google → backend GET /api/auth/google/callback  (code exchange, DB upsert)
 *  4. Backend redirects to returnUrl (exp://...) with token+user params
 *  5. expo-web-browser intercepts the exp:// redirect → resolves the promise
 *
 * ── What must be registered in Google Cloud Console ─────────────────────────
 *   Authorized Redirect URI (production):
 *     https://www.payvora.org/api/auth/google/callback
 *
 * ── Web flow ─────────────────────────────────────────────────────────────────
 * On web the regular expo-auth-session useAuthRequest still works fine
 * (same-origin redirect, no proxy needed).
 */

import {
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";
import { AUTH_BASE_URL } from "@/constants/apiUrls";
import { useToast } from "@/contexts/ToastContext";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IS_WEB    = Platform.OS === "web";

/**
 * The auth backend URL — always the production domain.
 * Google OAuth init/callback and JWT issuance must always go to
 * https://www.payvora.org because that is the Google Cloud Console redirect
 * URI registered for this OAuth app.
 */
function getBackendUrl(): string {
  return AUTH_BASE_URL;
}

// ── Web redirect URI (only used on web) ─────────────────────────────────────
const WEB_REDIRECT_URI =
  IS_WEB && typeof window !== "undefined" ? window.location.origin : "https://placeholder";

type OnSuccess = (token: string, user: SessionUser) => Promise<void>;

export function useGoogleSignIn(onSuccess: OnSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  const { showToast } = useToast();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Web: keep the existing expo-auth-session flow ─────────────────────────
  // (useAuthRequest is always called — hooks can't be conditional)
  const [webRequest, webResponse, webPromptAsync] = useAuthRequest(
    {
      clientId:    CLIENT_ID ?? "unconfigured",
      redirectUri: WEB_REDIRECT_URI,
      scopes:      ["openid", "profile", "email"],
      usePKCE:     true,
    },
    Google.discovery,
  );

  // Handle web OAuth response
  useEffect(() => {
    if (!IS_WEB || !webResponse || !CLIENT_ID) return;

    if (webResponse.type === "error") {
      if (__DEV__) console.error("[GoogleOAuth/web] Error:", webResponse.error);
      if (mountedRef.current) {
        showToast("error", webResponse.error?.message ?? "Google sign-in failed.");
      }
      return;
    }

    if (webResponse.type !== "success") return;

    (async () => {
      if (!mountedRef.current) return;
      setIsLoading(true);
      try {
        let accessToken: string | null = null;

        if (webResponse.authentication?.accessToken) {
          accessToken = webResponse.authentication.accessToken;
        } else if (webResponse.params.code && webRequest?.codeVerifier) {
          const result = await exchangeCodeAsync(
            {
              code:        webResponse.params.code,
              redirectUri: WEB_REDIRECT_URI,
              clientId:    CLIENT_ID,
              extraParams: { code_verifier: webRequest.codeVerifier },
            },
            Google.discovery,
          );
          accessToken = result.accessToken ?? null;
        }

        if (!accessToken) throw new Error("No access token received from Google.");

        const apiUrl = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${apiUrl}/api/auth/google`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accessToken }),
        });
        const data = (await res.json()) as {
          token?: string;
          user?:  SessionUser;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Google sign-in failed.");
        await onSuccess(data.token!, data.user!);
      } catch (err) {
        if (!mountedRef.current) return;
        showToast("error", err instanceof Error ? err.message : "Google sign-in failed.");
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    })();
  }, [webResponse]);

  // ── Native: server-side authorization-code flow ──────────────────────────
  const handleNativeSignIn = useCallback(async () => {
    const backendUrl = getBackendUrl();

    // The return URL that the backend redirects to after OAuth completes.
    // In Expo Go: exp://xxx.expo.dev/--/oauth-callback  (dynamic, generated by Linking.createURL)
    // openAuthSessionAsync watches for navigations to this prefix and closes.
    const returnUrl = Linking.createURL("oauth-callback");

    if (__DEV__) console.log("[GoogleOAuth/native] Backend:", backendUrl, "| Return:", returnUrl);

    const initUrl =
      `${backendUrl}/api/auth/google/init?` +
      new URLSearchParams({ returnUrl }).toString();

    if (!mountedRef.current) return;
    setIsLoading(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(initUrl, returnUrl);
      if (__DEV__) console.log(`[GoogleOAuth/native] Browser result type: ${result.type}`);

      if (result.type !== "success") {
        // User cancelled or dismissed the browser — not an error
        return;
      }

      // Parse token + user from the return URL params
      const parsed   = Linking.parse(result.url);
      const qp       = parsed.queryParams ?? {};
      const token    = qp.token as string | undefined;
      const errParam = qp.error as string | undefined;

      if (errParam) {
        const friendly = decodeURIComponent(errParam).replace(/_/g, " ");
        throw new Error(`Google declined: ${friendly}`);
      }
      if (!token) {
        if (__DEV__) console.error("[GoogleOAuth/native] Return URL:", result.url);
        throw new Error("No authentication token received. Please try again.");
      }

      const user: SessionUser = {
        id:        qp.id        as string,
        email:     qp.email     as string,
        name:      qp.name      as string,
        avatarUrl: (qp.avatarUrl as string) ?? null,
      };

      if (__DEV__) console.log("[GoogleOAuth/native] ✓ Token received — saving session…");
      await onSuccess(token, user);
      if (__DEV__) console.log("[GoogleOAuth/native] ✓ Done.");
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (__DEV__) console.error("[GoogleOAuth/native] ✗ Error:", msg);
      showToast("error", msg);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [onSuccess, showToast]);

  // ── Public API ────────────────────────────────────────────────────────────
  const promptAsync = useCallback(() => {
    if (!CLIENT_ID) {
      showToast("info", "Google sign-in is not available. Please sign in with Apple or email.");
      return;
    }
    if (IS_WEB) {
      webPromptAsync();
    } else {
      handleNativeSignIn();
    }
  }, [webPromptAsync, handleNativeSignIn, showToast]);

  return {
    promptAsync,
    isLoading,
    isReady: !!CLIENT_ID,
    // Expose the callback URL for debugging — printed in sign-in screen
    debugCallbackUrl: IS_WEB
      ? WEB_REDIRECT_URI
      : `${getBackendUrl()}/api/auth/google/callback`,
  };
}
