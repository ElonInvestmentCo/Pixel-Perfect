import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";

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

  const redirectUri = makeRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID ?? "__unconfigured__",
    redirectUri,
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const { access_token } = response.params;
    if (!access_token) return;

    setIsLoading(true);
    fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: access_token }),
    })
      .then(async (res) => {
        const data = await res.json() as { token?: string; user?: SessionUser; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Google sign-in failed");
        return { token: data.token!, user: data.user! };
      })
      .then(({ token, user }) => onSuccess(token, user))
      .catch((e: Error) => {
        if (!mountedRef.current) return;
        Alert.alert("Sign In Failed", e.message ?? "Google sign-in failed. Please try again.");
      })
      .finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });
  }, [response]);

  const handlePress = () => {
    if (!CLIENT_ID) {
      Alert.alert(
        "Not Configured",
        "Google Sign-In requires a Google OAuth Client ID.\nSet EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment.",
      );
      return;
    }
    promptAsync();
  };

  return { promptAsync: handlePress, isLoading, isReady: !!request };
}
