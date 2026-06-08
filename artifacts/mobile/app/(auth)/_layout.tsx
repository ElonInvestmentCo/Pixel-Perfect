import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="signup"             options={{ headerShown: false }} />
      <Stack.Screen name="signin"             options={{ headerShown: false }} />
      <Stack.Screen name="phone-verify"       options={{ headerShown: false }} />
      <Stack.Screen name="reset-password"     options={{ headerShown: false }} />
      <Stack.Screen name="verify-code"        options={{ headerShown: false }} />
      <Stack.Screen name="country-residence"  options={{ headerShown: false }} />
      <Stack.Screen name="account-reason"     options={{ headerShown: false }} />
      <Stack.Screen name="identity-upload"    options={{ headerShown: false }} />
      <Stack.Screen name="national-id-camera" options={{ headerShown: false }} />
      <Stack.Screen name="upload-selfie"      options={{ headerShown: false }} />
      <Stack.Screen name="enable-face-id"     options={{ headerShown: false }} />
      <Stack.Screen name="create-pin"         options={{ headerShown: false }} />
      <Stack.Screen name="verify-success"     options={{ headerShown: false }} />
      <Stack.Screen name="referral-code"      options={{ headerShown: false }} />
      <Stack.Screen name="referral-share"     options={{ headerShown: false }} />
    </Stack>
  );
}
