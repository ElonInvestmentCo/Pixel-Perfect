import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INDIGO = "#4F46E5";
const GRAY   = "#9CA3AF";
const WHITE  = "#FFFFFF";

// Standard visible height of tab bar content (icons + labels)
const TAB_CONTENT_HEIGHT = 50;

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  // Total tab bar height = content area + device bottom inset (home indicator).
  // On iPhone 14 Pro:  50 + 34 = 84pt — icons sit clearly above the home indicator.
  // On older iPhone:   50 +  0 = 50pt — standard compact tab bar.
  // On Android nav bar: dynamic based on reported inset.
  const tabBarHeight    = TAB_CONTENT_HEIGHT + insets.bottom;
  const tabBarPadBottom = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: INDIGO,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "#E5E7EB",
          height: tabBarHeight,
          paddingBottom: tabBarPadBottom,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: s.label,
        tabBarItemStyle: s.item,
      }}
    >
      {/* ── Home / Dashboard ───────────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ── Cards ──────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color, size }) => (
            <Feather name="credit-card" size={size} color={color} />
          ),
        }}
      />

      {/* ── Settings ───────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  item: {
    paddingTop: 2,
  },
});
