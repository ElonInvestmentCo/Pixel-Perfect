import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK = "#000000";
const LIME  = "#C8FF00";

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity style={s.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Feather name="chevron-left" size={22} color={BLACK} />
      </TouchableOpacity>
      <View style={s.body}>
        <View style={s.iconWrap}>
          <Feather name="file-text" size={32} color={BLACK} />
        </View>
        <Text style={s.title}>Pay Bills</Text>
        <Text style={s.sub}>Pay electricity, water, internet, cable TV, and more — all in one place. Instant confirmation.</Text>
        <TouchableOpacity style={s.cta} activeOpacity={0.85}>
          <Text style={s.ctaLabel}>Pay a Bill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 100, gap: 16 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: BLACK },
  sub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#6B7280", textAlign: "center", maxWidth: 280, lineHeight: 22 },
  cta: {
    marginTop: 8, backgroundColor: LIME, borderRadius: 99,
    paddingHorizontal: 32, paddingVertical: 16,
  },
  ctaLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
});
