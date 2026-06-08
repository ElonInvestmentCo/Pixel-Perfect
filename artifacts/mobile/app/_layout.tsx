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
