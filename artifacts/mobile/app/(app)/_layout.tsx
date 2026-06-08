import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";

const INDIGO = "#4F46E5";
const GRAY   = "#9CA3AF";
const WHITE  = "#FFFFFF";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: INDIGO,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
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

const styles = StyleSheet.create({
  bar: {
    backgroundColor: WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    height: Platform.OS === "ios" ? 88 : 62,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  item: {
    paddingTop: 2,
  },
});
