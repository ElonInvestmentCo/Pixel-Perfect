/**
 * useGoogleSignIn — Google OAuth via expo-auth-session/providers/google.
 *
 * Implementation follows the official Expo Google authentication guide:
 * https://docs.expo.dev/guides/google-authentication/
 *
 * Flow (PKCE — no client secret required in the mobile app):
 *  1. useAuthRequest builds the authorization request with a PKCE code challenge.
 *  2. promptAsync() opens the system browser to Google's OAuth consent screen.
 *  3. On success, expo-auth-session auto-exchanges the code for tokens
 *     (shouldAutoExchangeCode: true) and stores them in response.authentication.
 *  4. If auto-exchange didn't run (web/Expo-Go preview), we call
 *     exchangeCodeAsync() manually with the PKCE code_verifier.
 *  5. The access token is forwarded to the backend which calls Google's
 *     userinfo endpoint, upserts the user, and returns a signed JWT.
 *
 * WebBrowser.maybeCompleteAuthSession() is called at module load so that any
 * redirect from the OAuth browser flow is intercepted and the session
 * completed — this is required for Expo web and Expo Go web preview.
 */
import { exchangeCodeAsync } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";

// Must be called at module level — completes any in-flight auth session when
// the app returns from the OAuth redirect (Expo web, Expo Go web preview).
WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const API_URL   = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type OnSuccess = (token: string, user: SessionUser) => Promise<void>;

export function useGoogleSignIn(onSuccess: OnSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /**
   * Google.useAuthRequest configures a PKCE authorization request.
   *   - webClientId       : OAuth Web Application client ID (Google Cloud Console)
   *   - shouldAutoExchangeCode : automatically exchanges the authorization code
   *     for tokens on native (iOS / Android). Defaults true on native, false on
   *     web — we enable it explicitly so the hook tries it on every platform.
   *
   * The redirect URI is calculated automatically by the provider for each
   * platform — do NOT pass a manual redirectUri here, it would cause a
   * mismatch with what the provider registers in the auth request.
   */
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: CLIENT_ID,
    shouldAutoExchangeCode: true,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    (async () => {
      if (!mountedRef.current) return;
      setIsLoading(true);
      try {
        let accessToken: string | null = null;

        // Path A — auto-exchange succeeded (native iOS/Android, or web when
        // shouldAutoExchangeCode was honoured by the provider).
        if (response.authentication?.accessToken) {
          accessToken = response.authentication.accessToken;
        }

        // Path B — manual PKCE exchange (Expo Go / Expo web preview).
        // expo-auth-session returns the raw authorization code in
        // response.params.code and stores the code_verifier on the request
        // object. We exchange them with Google's token endpoint without a
        // client secret — PKCE proves authenticity instead.
        if (!accessToken && response.params.code && request?.codeVerifier) {
          const tokenResult = await exchangeCodeAsync(
            {
              code:        response.params.code,
              redirectUri: request.redirectUri,
              clientId:    CLIENT_ID!,
              extraParams: { code_verifier: request.codeVerifier },
            },
            Google.discovery,
          );
          accessToken = tokenResult.accessToken ?? null;
        }

        // Path C — implicit flow fallback (older Expo Go behavior).
        if (!accessToken && response.params.access_token) {
          accessToken = response.params.access_token;
        }

        if (!accessToken) {
          throw new Error(
            "Google sign-in did not return an access token. " +
            "Ensure your Google Cloud OAuth client is configured correctly.",
          );
        }

        const res = await fetch(`${API_URL}/api/auth/google`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accessToken }),
        });
        const data = await res.json() as { token?: string; user?: SessionUser; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Google sign-in failed");

        await onSuccess(data.token!, data.user!);
      } catch (e: unknown) {
        if (!mountedRef.current) return;
        const msg = e instanceof Error ? e.message : "Google sign-in failed. Please try again.";
        Alert.alert("Sign In Failed", msg);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handlePress = () => {
    if (!CLIENT_ID) {
      Alert.alert(
        "Google Sign-In Not Configured",
        "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment secrets to enable Google Sign-In.",
      );
      return;
    }
    promptAsync();
  };

  return { promptAsync: handlePress, isLoading, isReady: !!request };
}
