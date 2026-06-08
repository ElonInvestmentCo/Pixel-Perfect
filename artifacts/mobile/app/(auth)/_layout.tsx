import { Stack } from "expo-router";
import React from "react";

// This entire group is presented as a full-screen slide-up overlay from the
// root Stack (animation: "slide_from_bottom", gestureEnabled: false).
// Screens inside use default card transitions (slide from right) — no extra
// modal presentation is needed here since the group itself is the "modal".
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="signup"          options={{ headerShown: false }} />
      <Stack.Screen name="signin"          options={{ headerShown: false }} />
      <Stack.Screen name="phone-verify"    options={{ headerShown: false }} />
      <Stack.Screen name="reset-password"  options={{ headerShown: false }} />
      <Stack.Screen name="verify-code"     options={{ headerShown: false }} />
      <Stack.Screen name="account-reason"  options={{ headerShown: false }} />
      <Stack.Screen name="identity-upload" options={{ headerShown: false }} />
    </Stack>
  );
}
