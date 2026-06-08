import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INDIGO = "#4F46E5";
const GRAY   = "#9CA3AF";
const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const WHITE  = "#FFFFFF";

const TAB_CONTENT_HEIGHT = 58;

// ─── Centre QR tab button ─────────────────────────────────────────────────────
// tabBarButton renders a fully custom pressable; tabBarIcon is unused for this tab.
function CentreTabButton(props: {
  onPress?: (e: any) => void;
  children?: React.ReactNode;
  style?: any;
}) {
  return (
    <TouchableOpacity
      style={ctr.wrap}
      activeOpacity={0.8}
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel="Scan QR code"
    >
      <View style={ctr.circle}>
        <Feather name="grid" size={24} color={BLACK} />
      </View>
    </TouchableOpacity>
  );
}

const ctr = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function AppLayout() {
  const insets = useSafeAreaInsets();

  const tabBarHeight    = TAB_CONTENT_HEIGHT + insets.bottom;
  const tabBarPadBottom = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   INDIGO,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "#E5E7EB",
          height:         tabBarHeight,
          paddingBottom:  tabBarPadBottom,
          paddingTop:     10,
          elevation:      0,
          shadowOpacity:  0,
        },
        tabBarLabelStyle: s.label,
        tabBarItemStyle:  s.item,
      }}
    >
      {/* ── Home ─────────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ── Insights ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />

      {/* ── Scan — lime raised centre button ─────────────────────────────────── */}
      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size }} />
          ),
          tabBarButton: (props) => <CentreTabButton {...props} />,
        }}
      />

      {/* ── My Cards ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="my-cards"
        options={{
          title: "My Cards",
          tabBarIcon: ({ color, size }) => (
            <Feather name="credit-card" size={size} color={color} />
          ),
        }}
      />

      {/* ── Profile ──────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />

      {/* ── Hide legacy tabs (file still exists, just not shown) ─────────────── */}
      <Tabs.Screen
        name="cards"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  item:  { paddingTop: 2 },
});
