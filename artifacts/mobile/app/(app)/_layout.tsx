import { Tabs } from "expo-router";
import React from "react";
import { FloatingTabBar } from "@/components/tab-bar/FloatingTabBar";
import { Feather } from "@expo/vector-icons";

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      {/* ── Primary tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trade"
        options={{
          title: "Trade",
          tabBarIcon: ({ color }) => (
            <Feather name="repeat" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color }) => (
            <Feather name="credit-card" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => (
            <Feather name="clock" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />

      {/* ── Hidden routes (accessible via expandable menu) ── */}
      <Tabs.Screen name="airtime"        options={{ href: null }} />
      <Tabs.Screen name="settings"       options={{ href: null }} />
      <Tabs.Screen name="buy-gift-card"  options={{ href: null }} />
      <Tabs.Screen name="sell-gift-card" options={{ href: null }} />
      <Tabs.Screen name="buy-crypto"     options={{ href: null }} />
      <Tabs.Screen name="sell-crypto"    options={{ href: null }} />
      <Tabs.Screen name="virtual-card"   options={{ href: null }} />
      <Tabs.Screen name="bills"          options={{ href: null }} />
      <Tabs.Screen name="esim"           options={{ href: null }} />
      <Tabs.Screen name="referral"       options={{ href: null }} />
      <Tabs.Screen name="support"        options={{ href: null }} />
    </Tabs>
  );
}
