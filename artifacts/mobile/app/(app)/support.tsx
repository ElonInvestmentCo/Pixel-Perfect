import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK = "#000000";
const LIME  = "#C8FF00";
const GRAY5 = "#6B7280";
const GRAY2 = "#E5E7EB";

const FAQ = [
  { q: "How do I top up my wallet?",           a: "Go to Home → Transfer or use the top-up option from any payment screen."               },
  { q: "How long does crypto withdrawal take?", a: "Withdrawals are typically processed within 10-30 minutes depending on network congestion." },
  { q: "Are there fees for gift cards?",        a: "Zero fees for buying gift cards. A small service fee applies for selling."               },
  { q: "How do I freeze my virtual card?",      a: "Go to Cards → select the card → tap Freeze. You can unfreeze at any time."             },
];

export default function SupportScreen() {
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

        <Text style={s.screenTitle}>Help & Support</Text>
        <Text style={s.screenSub}>We're here to help</Text>

        <View style={s.contactRow}>
          <TouchableOpacity style={[s.contactCard, { backgroundColor: LIME }]} activeOpacity={0.82}>
            <Feather name="message-circle" size={24} color={BLACK} />
            <Text style={s.contactLabel}>Live Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.contactCard, { backgroundColor: "#F3F4F6" }]} activeOpacity={0.82}>
            <Feather name="mail" size={24} color={BLACK} />
            <Text style={s.contactLabel}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ.map((item, idx) => (
          <View key={idx} style={s.faqCard}>
            <View style={s.faqQ}>
              <Text style={s.faqQText}>{item.q}</Text>
              <Feather name="chevron-down" size={18} color={GRAY5} />
            </View>
            <Text style={s.faqA}>{item.a}</Text>
          </View>
        ))}
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
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 4 },
  screenSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY5, marginBottom: 28 },

  contactRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  contactCard: {
    flex: 1, height: 80, borderRadius: 20,
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  contactLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLACK },

  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16 },
  faqCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: GRAY2, marginBottom: 10,
  },
  faqQ: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  faqQText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK, flex: 1, marginRight: 8 },
  faqA: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, lineHeight: 22 },
});
