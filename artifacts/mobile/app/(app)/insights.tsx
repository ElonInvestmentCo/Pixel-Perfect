import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top + 20 }]}>
      <Text style={s.title}>Insights</Text>
      <View style={s.body}>
        <View style={s.iconWrap}>
          <Feather name="bar-chart-2" size={32} color={INDIGO} />
        </View>
        <Text style={s.heading}>Spending Insights</Text>
        <Text style={s.sub}>
          Track your spending patterns, category breakdowns, and monthly trends — all in one place.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: "#F7F7F7", paddingHorizontal: 20,
  },
  title: {
    fontSize: 24, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 32,
  },
  body: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80, gap: 16,
  },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  heading: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  sub: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#8A8A8A",
    textAlign: "center", maxWidth: 280, lineHeight: 22,
  },
});
