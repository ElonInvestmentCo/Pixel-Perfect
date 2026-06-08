/**
 * Insights — empty-state tab screen.
 * Reference: IMG_1349
 *
 * Layout:
 *  • Light gray (#F5F5F5) full-screen background
 *  • "Insights" title top-left, Inter 700, 28 px
 *  • Body perfectly centered: lavender icon circle → bold heading → subtitle
 */

import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <View style={[s.titleRow, { paddingTop: insets.top + 18 }]}>
        <Text style={s.title}>Insights</Text>
      </View>

      {/* ── Empty state body ──────────────────────────────────────────────── */}
      <View style={s.body}>
        <View style={s.iconCircle}>
          <Feather name="bar-chart-2" size={34} color={INDIGO} />
        </View>
        <Text style={s.heading}>Spending Insights</Text>
        <Text style={s.sub}>
          Track your spending patterns,{"\n"}category breakdowns, and{"\n"}monthly trends — all in one place.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  titleRow: {
    paddingHorizontal: 22,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    letterSpacing: -0.5,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    paddingHorizontal: 32,
    gap: 18,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAE9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heading: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 23,
  },
});
