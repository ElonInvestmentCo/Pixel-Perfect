import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME  = "#c8ff00";
const BLACK = "#000000";
const GRAY5 = "#6B7280";
const TEAL  = "#00bfa5";

const ROWS = [
  { label: "Top up ID",       key: "id" },
  { label: "Top up amount",   key: "amount" },
  { label: "Top up fee",      key: "fee" },
  { label: "Payment method",  key: "payment" },
  { label: "Time",            key: "time" },
  { label: "Total amount",    key: "total" },
];

export default function TopUpConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const displayAmount = amount ?? "1,567.00";

  const values: Record<string, { text: string; color?: string; icon?: boolean }> = {
    id:      { text: "7685901XXX" },
    amount:  { text: `${displayAmount} SGD` },
    fee:     { text: "Free", color: TEAL },
    payment: { text: "Mastercards", icon: true },
    time:    { text: "May 10, 9:00 AM" },
    total:   { text: `${displayAmount} SGD` },
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ── Purple gradient background ──────────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[s.gradTop, { height: "55%" }]} />
        <View style={[s.gradMid, { flex: 1 }]} />
      </View>

      {/* ── Faded background content (decorative blur effect) ──────── */}
      <View style={[s.bgContent, { paddingTop: insets.top + 60 }]}>
        <Text style={s.bgLabel}>Add Money</Text>
        <View style={s.bgCard}>
          <Text style={s.bgAmount}>
            <Text style={s.bgDollar}>$  </Text>1,567.00
          </Text>
          <View style={s.bgBadge}>
            <View style={[s.bgBadgeColor, { backgroundColor: "#EF4444" }]} />
            <Text style={s.bgBadgeText}>USD  $60</Text>
          </View>
        </View>
      </View>

      {/* ── Header bar ─────────────────────────────────────────────── */}
      <View style={[s.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.75}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
        <Text style={s.topTitle}>Top Up Balance</Text>
        <TouchableOpacity style={s.backBtn} activeOpacity={0.75}>
          <Feather name="info" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom sheet ───────────────────────────────────────────── */}
      <View style={[s.sheet, { paddingBottom: insets.bottom + 24 }]}>
        {/* Sheet header */}
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Top Up Confirmation</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="x" size={26} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Details */}
        <View style={s.detailList}>
          {ROWS.map((row) => {
            const val = values[row.key];
            return (
              <View key={row.key} style={s.detailRow}>
                <Text style={s.detailLabel}>{row.label}</Text>
                <View style={s.detailRight}>
                  {val.icon && (
                    <Feather name="credit-card" size={20} color={BLACK} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[s.detailValue, val.color ? { color: val.color } : null]}>
                    {val.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={s.confirmBtn}
          activeOpacity={0.85}
          onPress={() => router.dismissAll()}
        >
          <Text style={s.confirmBtnText}>Confirm Top Up</Text>
        </TouchableOpacity>

        {/* Home indicator */}
        <View style={s.homeBar} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  gradTop: {
    position: "absolute", top: 0, left: 0, right: 0,
    backgroundColor: "#4a4a8d",
  },
  gradMid: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#5858a8",
  },

  bgContent: {
    position: "absolute", top: 0, left: 0, right: 0,
    paddingHorizontal: 24, opacity: 0.2,
  },
  bgLabel: {
    fontSize: 20, fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)", marginBottom: 16,
  },
  bgCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 28, padding: 28,
  },
  bgAmount: {
    fontSize: 52, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)", letterSpacing: -1,
  },
  bgDollar: {
    fontSize: 36, fontFamily: "Inter_400Regular",
  },
  bgBadge: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginTop: 24,
  },
  bgBadgeColor: {
    width: 40, height: 22, borderRadius: 4,
  },
  bgBadgeText: {
    fontSize: 16, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },

  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 20,
  },
  backBtn: {
    width: 44, height: 44, alignItems: "center", justifyContent: "center",
  },
  topTitle: {
    fontSize: 18, fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.3)", letterSpacing: -0.3,
  },

  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingTop: 36, paddingHorizontal: 28,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 28,
  },
  sheetTitle: {
    fontSize: 28, fontFamily: "Inter_600SemiBold",
    color: BLACK, letterSpacing: -0.5, flex: 1, paddingRight: 12,
  },
  divider: {
    height: 1, backgroundColor: "#E5E7EB", marginBottom: 32,
  },

  detailList: { gap: 28, marginBottom: 40 },
  detailRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 17, fontFamily: "Inter_400Regular", color: GRAY5,
  },
  detailRight: {
    flexDirection: "row", alignItems: "center",
  },
  detailValue: {
    fontSize: 17, fontFamily: "Inter_600SemiBold",
    color: BLACK, letterSpacing: -0.3,
  },

  confirmBtn: {
    backgroundColor: LIME, borderRadius: 24,
    paddingVertical: 18, alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 19, fontFamily: "Inter_600SemiBold",
    color: BLACK, letterSpacing: -0.3,
  },
  homeBar: {
    width: 144, height: 5, borderRadius: 3,
    backgroundColor: BLACK, alignSelf: "center", marginTop: 24,
  },
});
