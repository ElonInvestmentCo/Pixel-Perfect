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
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

// Required for Google OAuth on Expo web / Expo Go web preview.
// Must be called at module level (before any navigation) so the app can
// intercept and complete the OAuth redirect when the browser returns to it.
WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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

      {/* ── Top Up flow ─────────────────────────────────────────────── */}
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

      {/* ── Transfer flow ───────────────────────────────────────────── */}
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

  useEffect(() => {
    setBaseUrl(API_URL);
    setAuthTokenGetter(() => SecureStore.getItemAsync("auth_token"));
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
