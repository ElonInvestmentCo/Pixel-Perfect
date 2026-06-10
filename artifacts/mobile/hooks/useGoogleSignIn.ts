import { exchangeCodeAsync } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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

  // IMPORTANT:
  // Never initialize Google Auth if no Client ID exists.
  if (!CLIENT_ID) {
    return {
      promptAsync: () => {
        Alert.alert(
          "Google Sign-In Not Configured",
          "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in Replit Secrets to enable Google Sign-In.",
        );
      },
      isLoading: false,
      isReady: false,
    };
  }

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

        if (response.authentication?.accessToken) {
          accessToken = response.authentication.accessToken;
        }

        if (!accessToken && response.params.code && request?.codeVerifier) {
          const tokenResult = await exchangeCodeAsync(
            {
              code: response.params.code,
              redirectUri: request.redirectUri,
              clientId: CLIENT_ID,
              extraParams: {
                code_verifier: request.codeVerifier,
              },
            },
            Google.discovery,
          );

          accessToken = tokenResult.accessToken ?? null;
        }

        if (!accessToken && response.params.access_token) {
          accessToken = response.params.access_token;
        }

        if (!accessToken) {
          throw new Error("Google sign-in did not return an access token.");
        }

        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
          }),
        });

        const data = (await res.json()) as {
          token?: string;
          user?: SessionUser;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Google sign-in failed");
        }

        await onSuccess(data.token!, data.user!);
      } catch (error) {
        if (!mountedRef.current) return;

        Alert.alert(
          "Sign In Failed",
          error instanceof Error ? error.message : "Google sign-in failed.",
        );
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    })();
  }, [response]);

  return {
    promptAsync: () => {
      promptAsync();
    },
    isLoading,
    isReady: !!request,
  };
}
