import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  );
}
