import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup"         options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="signin"         options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="phone-verify"   options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="verify-code"    options={{ headerShown: false }} />
      <Stack.Screen name="account-reason" options={{ headerShown: false }} />
      <Stack.Screen name="identity-upload" options={{ headerShown: false }} />
    </Stack>
  );
}
