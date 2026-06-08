import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK = "#1A1A1A";
const GRAY  = "#9CA3AF";
const INDIGO = "#5B3EFF";

const CARD_DETAILS = [
  { label: "Available Balance", value: "$8,240.00", highlight: true },
  { label: "Credit Limit",      value: "$15,000.00", highlight: false },
  { label: "Due Date",          value: "June 28, 2026", highlight: false },
  { label: "Minimum Payment",   value: "$120.00",     highlight: false },
];

export default function MyCardsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <Text style={s.title}>My Cards</Text>

        {/* ── Virtual card ── */}
        <LinearGradient
          colors={["#5B3EFF", "#8B6EFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.card}
        >
          <View style={s.cardCircle1} />
          <View style={s.cardCircle2} />

          {/* Top row */}
          <View style={s.cardTopRow}>
            <Text style={s.cardType}>Visa Platinum</Text>
            {/* Mastercard-style overlap circles */}
            <View style={s.mcWrap}>
              <View style={[s.mcCircle, { backgroundColor: "#FF7262", opacity: 0.9 }]} />
              <View style={[s.mcCircle, { backgroundColor: "#FF3B30", opacity: 0.7, marginLeft: -14 }]} />
            </View>
          </View>

          {/* Number */}
          <Text style={s.cardNumber}>•••• •••• •••• 4892</Text>

          {/* Bottom row */}
          <View style={s.cardBottomRow}>
            <View>
              <Text style={s.cardFieldLabel}>CARD HOLDER</Text>
              <Text style={s.cardFieldValue}>Jennifer Lopez</Text>
            </View>
            <View>
              <Text style={s.cardFieldLabel}>EXPIRES</Text>
              <Text style={s.cardFieldValue}>09/28</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Add card button ── */}
        <TouchableOpacity style={s.addBtn} activeOpacity={0.75}>
          <Feather name="plus" size={20} color={GRAY} />
          <Text style={s.addBtnLabel}>Add New Card</Text>
        </TouchableOpacity>

        {/* ── Card details ── */}
        <View style={s.detailsSection}>
          <Text style={s.detailsTitle}>Card Details</Text>
          {CARD_DETAILS.map((item, i) => (
            <View
              key={item.label}
              style={[s.detailRow, i < CARD_DETAILS.length - 1 && s.detailBorder]}
            >
              <Text style={s.detailLabel}>{item.label}</Text>
              <Text style={[s.detailValue, item.highlight && s.detailHighlight]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  title: {
    fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK,
    letterSpacing: -0.4, marginBottom: 16,
  },

  card: {
    borderRadius: 24, padding: 28,
    overflow: "hidden", marginBottom: 16,
    shadowColor: "#5B3EFF", shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  cardCircle1: {
    position: "absolute", right: -30, top: -30,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardCircle2: {
    position: "absolute", right: 20, bottom: -50,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cardTopRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 36,
  },
  cardType: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold", opacity: 0.9 },
  mcWrap: { flexDirection: "row", alignItems: "center" },
  mcCircle: { width: 28, height: 28, borderRadius: 14 },
  cardNumber: {
    color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold",
    letterSpacing: 4, marginBottom: 24, fontVariant: ["tabular-nums"],
  },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between" },
  cardFieldLabel: {
    color: "rgba(255,255,255,0.6)", fontSize: 10,
    fontFamily: "Inter_500Medium", letterSpacing: 1, textTransform: "uppercase",
  },
  cardFieldValue: {
    color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 4,
  },

  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 2, borderColor: "#E5E7EB", borderStyle: "dashed",
    borderRadius: 16, padding: 16, marginBottom: 24,
  },
  addBtnLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: GRAY },

  detailsSection: {},
  detailsTitle: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 14,
  },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  detailLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY },
  detailValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: BLACK },
  detailHighlight: { color: INDIGO },
});
