import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import * as storage from "@/lib/storage";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { getDataBaseUrl } from "@/constants/apiUrls";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationOverlay } from "@/components/notifications/NotificationOverlay";

// Required for Google OAuth on Expo web / Expo Go web preview.
WebBrowser.maybeCompleteAuthSession();

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

let KeyboardProviderSafe: React.ComponentType<{ children: React.ReactNode }>;
try {
  const mod = require("react-native-keyboard-controller");
  if (mod && mod.KeyboardProvider) {
    KeyboardProviderSafe = mod.KeyboardProvider;
  } else {
    KeyboardProviderSafe = ({ children }) => <>{children}</>;
  }
} catch {
  KeyboardProviderSafe = ({ children }) => <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false, animation: "none" }} />

      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false, animation: "slide_from_bottom", gestureEnabled: false }}
      />

      <Stack.Screen
        name="(app)"
        options={{ headerShown: false, gestureEnabled: false, animation: "fade" }}
      />

      {/* ── Top Up flow ──────────────────────────────────────────────── */}
      <Stack.Screen
        name="top-up"
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="top-up-confirm"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
          animationDuration: 320,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />

      {/* ── Transfer flow ────────────────────────────────────────────── */}
      <Stack.Screen
        name="transfer"
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="transfer-confirm"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />

      {/* ── OAuth deep-link handler ──────────────────────────────────── */}
      {/* Catches exp://.../oauth-callback?token=...&id=...&email=...   */}
      {/* when the link arrives outside an active openAuthSessionAsync. */}
      <Stack.Screen
        name="oauth-callback"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Track whether the animated splash has completed its 2.2s sequence.
  // On web, ?nosplash=1 skips straight to onboarding (for screenshot capture).
  const skipSplash =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("nosplash") === "1";
  const [splashDone, setSplashDone] = useState(skipSplash);

  useEffect(() => {
    // Non-auth data routes follow the local-API toggle.
    // Auth routes (Apple, Google, email/password) always use AUTH_BASE_URL — see lib/auth.ts.
    setBaseUrl(getDataBaseUrl());
    setAuthTokenGetter(() => storage.getItem("auth_token"));
  }, []);

  // Hide the native Expo splash as soon as fonts are ready.
  // Our animated SplashScreen is already rendered at this point,
  // so there is no visible gap — it seamlessly takes over from the native splash.
  useEffect(() => {
    if (fontsLoaded || fontError) {
      ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show the animated splash screen until its 2.2 s animation completes.
  // Wrap in SafeAreaProvider so useSafeAreaInsets() works inside SplashScreen.
  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NotificationProvider>
                <KeyboardProviderSafe>
                  <View style={{ flex: 1 }}>
                    <RootLayoutNav />
                    <NotificationOverlay />
                  </View>
                </KeyboardProviderSafe>
              </NotificationProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
