import { exchangeCodeAsync, makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// On web: use the same origin so requests go through the dev proxy on port 5000,
// which routes /api/* to Express on port 3000 — same-origin, no CORS/mixed-content.
// On native: use the configured env var (or localhost for local development).
const API_URL =
  Platform.OS === "web"
    ? typeof window !== "undefined"
      ? window.location.origin
      : ""
    : (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000");

// Build the redirect URI that must be registered in Google Cloud Console.
// On web: use the current origin so Google redirects back to the Replit preview.
// On native: use the Expo proxy so Expo Go can intercept the OAuth callback.
const REDIRECT_URI = makeRedirectUri(
  Platform.OS === "web"
    ? { scheme: undefined }
    : { useProxy: true },
);

type OnSuccess = (token: string, user: SessionUser) => Promise<void>;

export function useGoogleSignIn(onSuccess: OnSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  const loggedRef  = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Use the lower-level useAuthRequest instead of Google.useAuthRequest so we
  // are NOT forced to supply iosClientId / androidClientId for Expo Go native
  // testing (which uses the auth proxy and only needs the web client ID).
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId:             CLIENT_ID ?? "unconfigured",
      redirectUri:          REDIRECT_URI,
      scopes:               ["openid", "profile", "email"],
      usePKCE:              true,
    },
    Google.discovery,
  );

  // Log all diagnostic info once the request object is ready.
  useEffect(() => {
    if (!request?.redirectUri || loggedRef.current) return;
    loggedRef.current = true;

    const platform = Platform.OS === "web" ? "web" : `native (${Platform.OS})`;
    const origin   = typeof window !== "undefined" ? window.location.origin : "N/A (non-web)";

    console.log("=== [GoogleOAuth] Diagnostic Info ===");
    console.log(`  Platform         : ${platform}`);
    console.log(`  window.location.origin : ${origin}`);
    console.log(`  Computed redirectUri   : ${REDIRECT_URI}`);
    console.log(`  request.redirectUri    : ${request.redirectUri}`);
    console.log(`  AuthSession redirectUri: ${makeRedirectUri()}`);
    console.log(`  Client ID configured   : ${!!CLIENT_ID}`);
    console.log(`  API_URL                : ${API_URL}`);
    console.log("=====================================");
    console.log(
      "[GoogleOAuth] ⚠️  Register this Redirect URI in Google Cloud Console:",
      request.redirectUri,
    );
    console.log(
      "[GoogleOAuth] ⚠️  Register this JavaScript Origin in Google Cloud Console:",
      origin,
    );
  }, [request?.redirectUri]);

  // Handle OAuth response — log full response for debugging.
  useEffect(() => {
    if (!response) return;

    console.log(`[GoogleOAuth] Response type: ${response.type}`);
    console.log("[GoogleOAuth] Full OAuth response:", JSON.stringify(response, null, 2));

    if (!CLIENT_ID || response.type !== "success") return;

    (async () => {
      if (!mountedRef.current) return;

      setIsLoading(true);

      try {
        let accessToken: string | null = null;

        if (response.authentication?.accessToken) {
          accessToken = response.authentication.accessToken;
          console.log("[GoogleOAuth] ✓ Got access token from authentication object");
        }

        if (!accessToken && response.params.code && request?.codeVerifier) {
          console.log("[GoogleOAuth] Exchanging code for access token…");
          const tokenResult = await exchangeCodeAsync(
            {
              code:        response.params.code,
              redirectUri: request.redirectUri,
              clientId:    CLIENT_ID,
              extraParams: { code_verifier: request.codeVerifier },
            },
            Google.discovery,
          );
          accessToken = tokenResult.accessToken ?? null;
          console.log("[GoogleOAuth] ✓ Code exchange result:", JSON.stringify(tokenResult, null, 2));
        }

        if (!accessToken && response.params.access_token) {
          accessToken = response.params.access_token;
          console.log("[GoogleOAuth] ✓ Got access token from params");
        }

        if (!accessToken) {
          throw new Error("Google sign-in did not return an access token.");
        }

        console.log("[GoogleOAuth] Exchanging access token with backend…");
        console.log(`[GoogleOAuth] POST ${API_URL}/api/auth/google`);

        const res = await fetch(`${API_URL}/api/auth/google`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accessToken }),
        });

        const data = (await res.json()) as {
          token?: string;
          user?:  SessionUser;
          error?: string;
        };

        console.log(`[GoogleOAuth] Backend response status: ${res.status}`);
        console.log("[GoogleOAuth] Backend response body:", JSON.stringify(data, null, 2));

        if (!res.ok) {
          throw new Error(data.error ?? "Google sign-in failed");
        }

        console.log("[GoogleOAuth] ✓ Backend returned JWT — saving session…");
        await onSuccess(data.token!, data.user!);
        console.log("[GoogleOAuth] ✓ Session saved successfully.");
      } catch (error) {
        if (!mountedRef.current) return;
        console.error("[GoogleOAuth] ✗ Error:", error);
        Alert.alert(
          "Sign In Failed",
          error instanceof Error ? error.message : "Google sign-in failed.",
        );
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    })();
  }, [response]);

  return {
    promptAsync: () => {
      if (!CLIENT_ID) {
        Alert.alert(
          "Google Sign-In Not Configured",
          "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in Replit Secrets to enable Google Sign-In.",
        );
        return;
      }
      console.log("[GoogleOAuth] Launching OAuth flow…");
      console.log(`[GoogleOAuth]   redirectUri : ${request?.redirectUri}`);
      console.log(`[GoogleOAuth]   origin      : ${typeof window !== "undefined" ? window.location.origin : "N/A"}`);
      promptAsync();
    },
    isLoading,
    isReady:     !!request && !!CLIENT_ID,
    redirectUri: request?.redirectUri ?? REDIRECT_URI,
  };
}
