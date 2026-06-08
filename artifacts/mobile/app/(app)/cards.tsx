import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = insets.top;

  return (
    <View style={[s.root, { paddingTop: topPad + 16 }]}>
      <Text style={s.screenTitle}>Cards</Text>

      <View style={s.placeholder}>
        <View style={s.iconWrap}>
          <Feather name="credit-card" size={32} color={INDIGO} />
        </View>
        <Text style={s.comingSoon}>Coming Soon</Text>
        <Text style={s.sub}>
          Manage your virtual and physical cards, set spending limits, and freeze cards instantly.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EBEBEB",
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    marginBottom: 32,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: 16,
  },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: BLACK,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8A8A8A",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
});
