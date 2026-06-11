import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import * as SecureStore from "expo-secure-store";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";

// Required for Google OAuth on Expo web / Expo Go web preview.
WebBrowser.maybeCompleteAuthSession();

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// On web: use the same origin so requests go through the dev proxy on port 5000.
// On native: use the configured env var (or localhost for local development).
const API_URL =
  Platform.OS === "web"
    ? typeof window !== "undefined"
      ? window.location.origin
      : ""
    : (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000");

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
    setBaseUrl(API_URL);
    setAuthTokenGetter(() => SecureStore.getItemAsync("auth_token"));
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
              <KeyboardProviderSafe>
                <RootLayoutNav />
              </KeyboardProviderSafe>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
