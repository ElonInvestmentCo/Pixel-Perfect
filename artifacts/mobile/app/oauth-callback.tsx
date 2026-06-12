/**
 * oauth-callback.tsx — Deep-link handler for Google OAuth return URLs.
 *
 * Route: exp://.../oauth-callback?token=...&id=...&email=...&name=...
 *
 * This screen catches the exp:// deep link when Railway redirects back after
 * Google OAuth completes. expo-web-browser intercepts it first when an active
 * openAuthSessionAsync session is running (handled in useGoogleSignIn.ts).
 * This screen is the fallback for any other entry point (e.g. app opened cold
 * from a notification, or a link opened outside the browser session).
 *
 * Railway remains the only auth authority — this screen only receives and
 * stores a JWT that Railway has already issued.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import type { SessionUser } from "@/contexts/AuthContext";
import colors from "@/constants/colors";

/** Minimum valid JWT: three base64url segments separated by dots. */
function isValidJwt(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export default function OAuthCallbackScreen() {
  const router      = useRouter();
  const { saveSession } = useAuth();
  const processedRef    = useRef(false);

  const params = useLocalSearchParams<{
    token?:    string;
    id?:       string;
    email?:    string;
    name?:     string;
    avatarUrl?: string;
    error?:    string;
  }>();

  useEffect(() => {
    // Prevent duplicate processing if the component re-renders.
    if (processedRef.current) return;
    processedRef.current = true;

    (async () => {
      try {
        const { token, id, email, name, avatarUrl, error } = params;

        if (error) {
          const msg = decodeURIComponent(error).replace(/_/g, " ");
          console.warn("[oauth-callback] Server returned error:", msg);
          router.replace({ pathname: "/(auth)/signin", params: { oauthError: msg } });
          return;
        }

        if (!token || !isValidJwt(token)) {
          console.warn("[oauth-callback] Missing or malformed token — aborting.");
          router.replace("/(auth)/signin");
          return;
        }

        if (!id || !email || !name) {
          console.warn("[oauth-callback] Incomplete user params — aborting.");
          router.replace("/(auth)/signin");
          return;
        }

        const user: SessionUser = {
          id,
          email,
          name,
          avatarUrl: avatarUrl ?? null,
        };

        console.log("[oauth-callback] ✓ Valid token received — saving session.");
        await saveSession(token, user);

        // Replace so the user can't navigate back to this transient screen.
        router.replace("/(app)");
      } catch (err) {
        console.error("[oauth-callback] Unexpected error:", err);
        router.replace("/(auth)/signin");
      }
    })();
  }, []); // run once on mount — processedRef guards against any re-runs

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    justifyContent:  "center",
    alignItems:      "center",
    backgroundColor: "#FFFFFF",
  },
});
