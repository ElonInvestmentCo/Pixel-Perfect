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
    <View style={s.root}>
      {/* ── White bottom sheet only — no purple header ─────────── */}
      <View style={[s.sheet, { paddingBottom: insets.bottom + 24 }]}>

        {/* Drag handle */}
        <View style={s.handle} />

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
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingTop: 16, paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },

  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center", marginBottom: 24,
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
  detailRight: { flexDirection: "row", alignItems: "center" },
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
    backgroundColor: "#E5E7EB", alignSelf: "center", marginTop: 24,
  },
});
