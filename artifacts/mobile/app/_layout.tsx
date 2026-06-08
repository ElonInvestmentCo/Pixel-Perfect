import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ─── Safe KeyboardProvider ────────────────────────────────────────────────────
// react-native-keyboard-controller requires a native module that is not bundled
// in Expo Go. We load it lazily so the app still runs in Expo Go; the module
// is only used in development builds and production.
let KeyboardProviderSafe: React.ComponentType<{ children: React.ReactNode }>;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
      {/* ── Onboarding ──────────────────────────────────────────────────────── */}
      <Stack.Screen name="index" options={{ headerShown: false, animation: "none" }} />

      {/* ── Auth group ──────────────────────────────────────────────────────── */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
          gestureEnabled: false,
        }}
      />

      {/* ── App group ───────────────────────────────────────────────────────── */}
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: "fade",
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
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProviderSafe>
              <RootLayoutNav />
            </KeyboardProviderSafe>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
