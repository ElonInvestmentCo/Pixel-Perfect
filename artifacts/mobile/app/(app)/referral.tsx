import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK = "#000000";
const LIME  = "#C8FF00";
const GRAY5 = "#6B7280";
const GRAY2 = "#E5E7EB";

const STEPS = [
  { step: "1", title: "Share your code", desc: "Send your unique referral link to friends." },
  { step: "2", title: "Friend signs up",  desc: "They create a PayVora account using your link."    },
  { step: "3", title: "Both earn $10",    desc: "You and your friend each receive $10 cashback."     },
];

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={s.back} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={22} color={BLACK} />
        </TouchableOpacity>

        <LinearGradient
          colors={["#6366F1", "#7C3AED", "#8B5CF6"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.heroBanner}
        >
          <View style={s.heroCircle1} />
          <View style={s.heroCircle2} />
          <Text style={s.heroTitle}>{"Invite friends,\nearn cashback"}</Text>
          <Text style={s.heroSub}>You both get $10 for every successful referral</Text>
        </LinearGradient>

        <View style={s.codeCard}>
          <Text style={s.codeLabel}>Your referral code</Text>
          <View style={s.codeRow}>
            <Text style={s.code}>PAYVORA-JL48</Text>
            <TouchableOpacity style={s.copyBtn} activeOpacity={0.75}>
              <Feather name="copy" size={16} color={BLACK} />
              <Text style={s.copyLabel}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.sectionTitle}>How it works</Text>
        {STEPS.map((s2) => (
          <View key={s2.step} style={s.stepRow}>
            <View style={s.stepNum}>
              <Text style={s.stepNumText}>{s2.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{s2.title}</Text>
              <Text style={s.stepDesc}>{s2.desc}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.shareBtn} activeOpacity={0.85}>
          <Feather name="share-2" size={18} color={BLACK} />
          <Text style={s.shareBtnLabel}>Share Invite Link</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  heroBanner: {
    borderRadius: 28, padding: 28, overflow: "hidden",
    minHeight: 160, justifyContent: "flex-end", marginBottom: 20,
  },
  heroCircle1: {
    position: "absolute", top: 16, right: 24,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroCircle2: {
    position: "absolute", bottom: 16, right: 60,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 34, marginBottom: 8 },
  heroSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },

  codeCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20,
    borderWidth: 1.5, borderColor: "#E5E7EB", marginBottom: 28,
  },
  codeLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY5, marginBottom: 10 },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  code: { fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: 1 },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: LIME, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99,
  },
  copyLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLACK },

  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16 },
  stepRow: {
    flexDirection: "row", gap: 14, alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepNumText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  stepTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK, marginBottom: 2 },
  stepDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, lineHeight: 20 },

  shareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: LIME, borderRadius: 99,
    paddingVertical: 18, marginTop: 12,
  },
  shareBtnLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
});
