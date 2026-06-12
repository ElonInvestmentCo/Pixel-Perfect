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
 *   Authorized Redirect URI (production / Railway):
 *     https://pixel-perfect-production-812e.up.railway.app/api/auth/google/callback
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
import { Alert, Platform } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IS_WEB    = Platform.OS === "web";

/**
 * The publicly accessible HTTPS URL for the API server.
 *
 * On web: derived from window.location.origin (same-origin, goes through the
 *   dev proxy which routes /api/* to Express).
 * On native: use the EXPO_PUBLIC_BACKEND_URL env var (the Replit dev HTTPS URL)
 *   or fall back to the EXPO_PUBLIC_API_URL. Localhost doesn't work on a real
 *   physical device, so this must be a real HTTPS address.
 */
function getBackendUrl(): string {
  if (IS_WEB) {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  // Prefer the explicit backend URL if configured
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  // Derive from the Expo Metro URL:
  //   exp://xxx.expo.dev  →  https://xxx.dev
  // (strips the .expo. subdomain that Metro adds — fallback only; superseded by EXPO_PUBLIC_BACKEND_URL)
  try {
    const expoUrl = Linking.createURL("");
    const match   = expoUrl.match(/^exp:\/\/([^/?]+)/);
    if (match?.[1]) {
      const apiHost = match[1].replace(".expo.", ".");
      return `https://${apiHost}`;
    }
  } catch {
    // ignore — fall through to fallback
  }
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}

// ── Web redirect URI (only used on web) ─────────────────────────────────────
const WEB_REDIRECT_URI =
  IS_WEB && typeof window !== "undefined" ? window.location.origin : "https://placeholder";

type OnSuccess = (token: string, user: SessionUser) => Promise<void>;

export function useGoogleSignIn(onSuccess: OnSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

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
      console.error("[GoogleOAuth/web] Error:", webResponse.error);
      if (mountedRef.current) {
        Alert.alert("Sign In Failed", webResponse.error?.message ?? "Google sign-in failed.");
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
        Alert.alert("Sign In Failed", err instanceof Error ? err.message : "Google sign-in failed.");
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

    console.log("╔════════════════════════════════════════════╗");
    console.log("║    Google OAuth — Server-Side Flow          ║");
    console.log("╠════════════════════════════════════════════╣");
    console.log(`║ Backend URL : ${backendUrl}`);
    console.log(`║ Return URL  : ${returnUrl}`);
    console.log("╠════════════════════════════════════════════╣");
    console.log("║ ACTION: Register this redirect URI in GCC:");
    console.log(`║   ${backendUrl}/api/auth/google/callback`);
    console.log("╚════════════════════════════════════════════╝");

    const initUrl =
      `${backendUrl}/api/auth/google/init?` +
      new URLSearchParams({ returnUrl }).toString();

    if (!mountedRef.current) return;
    setIsLoading(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(initUrl, returnUrl);
      console.log(`[GoogleOAuth/native] Browser result type: ${result.type}`);

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
        console.error("[GoogleOAuth/native] Return URL:", result.url);
        throw new Error("No authentication token received. Please try again.");
      }

      const user: SessionUser = {
        id:        qp.id        as string,
        email:     qp.email     as string,
        name:      qp.name      as string,
        avatarUrl: (qp.avatarUrl as string) ?? null,
      };

      console.log("[GoogleOAuth/native] ✓ Token received — saving session…");
      await onSuccess(token, user);
      console.log("[GoogleOAuth/native] ✓ Done.");
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      console.error("[GoogleOAuth/native] ✗ Error:", msg);
      Alert.alert("Sign In Failed", msg);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [onSuccess]);

  // ── Public API ────────────────────────────────────────────────────────────
  const promptAsync = useCallback(() => {
    if (!CLIENT_ID) {
      Alert.alert(
        "Google Sign-In Not Configured",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing from Replit Secrets.",
      );
      return;
    }
    if (IS_WEB) {
      webPromptAsync();
    } else {
      handleNativeSignIn();
    }
  }, [webPromptAsync, handleNativeSignIn]);

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
