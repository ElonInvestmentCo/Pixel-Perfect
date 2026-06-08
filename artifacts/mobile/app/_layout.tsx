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
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ── Onboarding ──────────────────────────────────────────────────────── */}
      {/* Full-screen landing carousel; stays in history so sign-out returns here */}
      <Stack.Screen name="index" options={{ headerShown: false, animation: "none" }} />

      {/* ── Auth group ──────────────────────────────────────────────────────── */}
      {/* Slides up from bottom like a modal but is a full-screen card —
          no iOS PageSheet handle, no pull-to-dismiss, completely isolated
          from the onboarding route so back navigation is explicit only.     */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
          gestureEnabled: false,
        }}
      />

      {/* ── App group ───────────────────────────────────────────────────────── */}
      {/* Entered via CommonActions.reset — no auth history behind it.
          Fade in for a clean "you're logged in" feel.
          gestureEnabled:false prevents any swipe-back to auth.              */}
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
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
