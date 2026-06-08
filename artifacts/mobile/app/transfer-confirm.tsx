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

const PURPLE = "#5856D6";
const LIME   = "#C6FF00";
const BLACK  = "#000000";
const GRAY   = "#6B6B6B";
const GRAY99 = "#999999";
const CREAM  = "#F5F3EF";

export default function TransferConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { amount, recipientName, recipientBank, recipientInitials, recipientColor } =
    useLocalSearchParams<{
      amount: string;
      recipientName: string;
      recipientBank: string;
      recipientInitials: string;
      recipientColor: string;
    }>();

  const handleConfirm = () => {
    router.dismissAll();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}>
      {/* Tap-outside to dismiss */}
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => router.back()} />

      {/* Bottom sheet */}
      <View style={[s.sheet, { paddingBottom: insets.bottom + 24 }]}>
        {/* Drag handle */}
        <View style={s.handle} />

        {/* Title */}
        <Text style={s.title}>Confirm Transfer</Text>

        {/* Recipient avatar */}
        <View style={s.avatarWrap}>
          <View style={[s.avatar, { backgroundColor: recipientColor ?? "#6366f1" }]}>
            <Text style={s.avatarText}>{recipientInitials ?? "?"}</Text>
          </View>
          <Text style={s.recipientName}>{recipientName}</Text>
          <Text style={s.recipientBank}>{recipientBank}</Text>
        </View>

        {/* Amount */}
        <View style={s.amountWrap}>
          <Text style={s.amountLabel}>Amount</Text>
          <Text style={s.amountValue}>${amount}</Text>
        </View>

        {/* Detail rows */}
        <View style={s.detailsBox}>
          <Row label="Transfer ID"   value="#TXN-28491" />
          <Row label="From"          value="Main Account" />
          <Row label="Fee"           value="Free" highlight />
          <Row label="Date"          value={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
          <Row label="Total"         value={`$${amount}`} bold />
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={s.confirmBtn}
          activeOpacity={0.85}
          onPress={handleConfirm}
        >
          <Text style={s.confirmBtnText}>Confirm Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.cancelBtn}
          activeOpacity={0.75}
          onPress={() => router.back()}
        >
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  highlight,
  bold,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={r.row}>
      <Text style={r.label}>{label}</Text>
      <Text
        style={[
          r.value,
          highlight && r.highlight,
          bold && r.bold,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const r = StyleSheet.create({
  row: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: "#EFEFEF",
  },
  label: { fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY },
  value: { fontSize: 15, fontFamily: "Inter_500Medium", color: BLACK },
  highlight: { color: "#16a34a", fontFamily: "Inter_600SemiBold" },
  bold: { fontFamily: "Inter_700Bold", fontSize: 17 },
});

const s = StyleSheet.create({
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center", marginBottom: 24,
  },
  title: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -0.4,
    textAlign: "center", marginBottom: 24,
  },

  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  recipientName: {
    fontSize: 18, fontFamily: "Inter_600SemiBold",
    color: BLACK, marginBottom: 4,
  },
  recipientBank: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY99,
  },

  amountWrap: {
    backgroundColor: CREAM, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 20,
    alignItems: "center", marginBottom: 20,
  },
  amountLabel: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: GRAY99, marginBottom: 4,
  },
  amountValue: {
    fontSize: 36, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -1,
  },

  detailsBox: { marginBottom: 24 },

  confirmBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 60,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  confirmBtnText: {
    fontSize: 18, fontFamily: "Inter_600SemiBold",
    color: BLACK, letterSpacing: -0.3,
  },

  cancelBtn: {
    height: 48, alignItems: "center", justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 16, fontFamily: "Inter_500Medium", color: GRAY,
  },
});
