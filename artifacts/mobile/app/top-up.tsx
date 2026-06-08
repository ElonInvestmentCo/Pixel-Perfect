import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE = "#5856D6";
const LIME   = "#C6FF00";
const CREAM  = "#F5F3EF";
const BLACK  = "#000000";
const GRAY   = "#6B6B6B";
const GRAY99 = "#999999";
const KEYPAD_BG = "#E8E8E8";

function formatNumber(raw: string): string {
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function TopUpScreen() {
  const insets = useSafeAreaInsets();
  const [whole, setWhole] = useState("1567");

  const display = formatNumber(whole) + ".00";

  const handleKey = (num: string) => {
    setWhole((prev) => {
      if (prev === "0") return num;
      if (prev.length >= 7) return prev;
      return prev + num;
    });
  };

  const handleDelete = () => {
    setWhole((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleContinue = () => {
    router.push({ pathname: "/top-up-confirm", params: { amount: display } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: PURPLE }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={s.headerBtn}
          activeOpacity={0.75}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={s.headerTitle}>Top Up Balance</Text>

        <TouchableOpacity style={s.headerBtn} activeOpacity={0.75}>
          <Feather name="help-circle" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Content area ───────────────────────────────────────────── */}
      <View style={s.content}>
        {/* "Add Money" label */}
        <Text style={s.sectionLabel}>Add Money</Text>

        {/* Amount input box */}
        <View style={s.amountBox}>
          <View style={s.amountRow}>
            <Text style={s.dollarSign}>$</Text>
            <Text style={s.amountText}>{display}</Text>
          </View>
          <View style={s.currencyPill}>
            <View style={s.flagWrap}>
              {/* Singapore flag simplified */}
              <View style={{ flex: 1, backgroundColor: "#ED2939" }} />
              <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
            </View>
            <Text style={s.currencyCode}>SGD</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Payment method */}
        <TouchableOpacity style={s.paymentRow} activeOpacity={0.75}>
          <View style={s.payIconWrap}>
            <Feather name="credit-card" size={24} color={PURPLE} />
          </View>
          <View style={s.payInfo}>
            <Text style={s.payName}>Mastercards</Text>
            <Text style={s.payLast4}>**** 7865</Text>
          </View>
          <Feather name="chevron-right" size={20} color={GRAY99} />
        </TouchableOpacity>

        {/* Keypad */}
        <View style={s.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <TouchableOpacity
              key={n}
              style={s.key}
              activeOpacity={0.65}
              onPress={() => handleKey(n.toString())}
            >
              <Text style={s.keyText}>{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.key} activeOpacity={0.65}>
            <Text style={s.keyText}>*</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.key}
            activeOpacity={0.65}
            onPress={() => handleKey("0")}
          >
            <Text style={s.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.key}
            activeOpacity={0.65}
            onPress={handleDelete}
          >
            <Feather name="delete" size={28} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={s.continueBtn}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={s.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 16 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 24,
    backgroundColor: PURPLE,
  },
  headerBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22, fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF", letterSpacing: -0.4,
  },

  content: {
    flex: 1, backgroundColor: CREAM,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 28,
  },

  sectionLabel: {
    fontSize: 17, fontFamily: "Inter_400Regular",
    color: GRAY, marginBottom: 16,
  },

  amountBox: {
    backgroundColor: "#FFFFFF", borderRadius: 20,
    borderWidth: 2, borderColor: BLACK,
    paddingHorizontal: 20, paddingVertical: 20,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  amountRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  dollarSign: {
    fontSize: 32, fontFamily: "Inter_400Regular", color: GRAY99,
  },
  amountText: {
    fontSize: 40, fontFamily: "Inter_600SemiBold",
    color: BLACK, letterSpacing: -1,
  },
  currencyPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: CREAM, borderRadius: 50,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  flagWrap: {
    width: 24, height: 16, borderRadius: 2,
    overflow: "hidden", flexDirection: "column",
  },
  currencyCode: {
    fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK,
  },

  paymentRow: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center",
    marginBottom: 24, gap: 12,
  },
  payIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: "#E8E5FF",
    alignItems: "center", justifyContent: "center",
  },
  payInfo: { flex: 1 },
  payName: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK },
  payLast4: { fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY99, marginTop: 2 },

  keypad: {
    flexDirection: "row", flexWrap: "wrap", gap: 12,
    marginBottom: 24,
  },
  key: {
    width: "30%", height: 68,
    flexBasis: "30%", flexGrow: 1,
    backgroundColor: KEYPAD_BG, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  keyText: {
    fontSize: 28, fontFamily: "Inter_400Regular", color: BLACK,
  },

  continueBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 60,
    alignItems: "center", justifyContent: "center",
  },
  continueBtnText: {
    fontSize: 20, fontFamily: "Inter_600SemiBold",
    color: BLACK, letterSpacing: -0.3,
  },
});
