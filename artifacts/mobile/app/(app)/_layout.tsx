import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME   = "#d4ff00";
const BLACK  = "#000000";
const GRAY4  = "#9CA3AF";
const WHITE  = "#FFFFFF";

const TAB_CONTENT_HEIGHT = 60;

/* ─── Centre Scan button ───────────────────────────────────────── */
function CentreTabButton(props: {
  onPress?: (e: any) => void;
  children?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={ctr.wrap}
      activeOpacity={0.8}
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel="Scan"
    >
      <View style={ctr.circle}>
        <Feather name="maximize" size={26} color={BLACK} />
      </View>
    </TouchableOpacity>
  );
}

const ctr = StyleSheet.create({
  wrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    marginTop: -24,
  },
  circle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.15,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});

/* ─── Layout ───────────────────────────────────────────────────── */
export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   BLACK,
        tabBarInactiveTintColor: GRAY4,
        tabBarStyle: {
          backgroundColor:  WHITE,
          borderTopWidth:   StyleSheet.hairlineWidth,
          borderTopColor:   "#E5E7EB",
          height:           tabBarHeight,
          paddingBottom:    insets.bottom,
          paddingTop:       10,
          elevation:        0,
          shadowOpacity:    0,
        },
        tabBarLabelStyle: s.label,
        tabBarItemStyle:  s.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarIcon: () => <View />,
          tabBarButton: (props) => <CentreTabButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="my-cards"
        options={{
          title: "My Cards",
          tabBarIcon: ({ color }) => (
            <Feather name="credit-card" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  item:  { paddingTop: 2 },
});
