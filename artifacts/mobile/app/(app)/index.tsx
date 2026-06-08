import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";
const GRAY   = "#888888";

// ─── Transaction data ──────────────────────────────────────────────────────────
const TRANSACTIONS = [
  {
    id: "1",
    type: "initial",    bg: "#EEF2FF",  color: INDIGO,
    letter: "F",        icon: undefined,
    title: "Figma",     subtitle: "Today, 12:30 PM",
    amount: "-$250.00", category: "Subscriptions", positive: false,
  },
  {
    id: "2",
    type: "icon",       bg: LIME,       color: BLACK,
    letter: undefined,  icon: "arrow-down" as const,
    title: "Receive from Alex", subtitle: "Yesterday, 08:00 AM",
    amount: "+$580.00", category: "Money In",       positive: true,
  },
  {
    id: "3",
    type: "initial",    bg: "#1A1A1A",  color: "#FFFFFF",
    letter: "M",        icon: undefined,
    title: "Medium",    subtitle: "May 10, 06:00 PM",
    amount: "-$99.00",  category: "Subscriptions",  positive: false,
  },
] as const;

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Text style={s.avatarInitial}>J</Text>
            </View>
            <View>
              <Text style={s.hiText}>Hi, Jennifer</Text>
              <Text style={s.morningText}>Good Morning!</Text>
            </View>
          </View>
          <TouchableOpacity style={s.bellWrap} activeOpacity={0.75}>
            <Feather name="bell" size={20} color={BLACK} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── Balance card ────────────────────────────────────────────────── */}
        <View style={s.balanceCard}>
          <View style={s.balanceLabelRow}>
            <Text style={s.balanceLabel}>Total Balance</Text>
            <Feather name="eye" size={15} color={GRAY} style={{ marginLeft: 6 }} />
          </View>
          <Text style={s.balanceAmount}>$12,765.00</Text>

          {/* Quick action pills */}
          <View style={s.pillRow}>
            <TouchableOpacity style={s.pill} activeOpacity={0.8}>
              <View style={s.pillIconWrap}>
                <Feather name="arrow-up" size={16} color={BLACK} />
              </View>
              <Text style={s.pillLabel}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.pill} activeOpacity={0.8}>
              <View style={s.pillIconWrap}>
                <Feather name="arrow-down" size={16} color={BLACK} />
              </View>
              <Text style={s.pillLabel}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.pillMenu} activeOpacity={0.8}>
              <Feather name="menu" size={18} color={BLACK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Invite banner ───────────────────────────────────────────────── */}
        <TouchableOpacity style={s.banner} activeOpacity={0.88}>
          {/* Decorative circles */}
          <View style={s.bannerCircle1} />
          <View style={s.bannerCircle2} />

          <View style={s.bannerContent}>
            <Text style={s.bannerTitle}>
              Invite a friend and{"\n"}both earn cashback
            </Text>
            <Text style={s.bannerLink}>Invite friends →</Text>
          </View>
        </TouchableOpacity>

        {/* ── Transactions ────────────────────────────────────────────────── */}
        <View style={s.txCard}>
          <View style={s.txHeader}>
            <Text style={s.txTitle}>Transactions</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {TRANSACTIONS.map((tx, i) => (
            <View key={tx.id}>
              <View style={s.txRow}>
                <View style={[s.txIconWrap, { backgroundColor: tx.bg }]}>
                  {tx.type === "icon" && tx.icon ? (
                    <Feather name={tx.icon} size={18} color={tx.color} />
                  ) : (
                    <Text style={[s.txInitial, { color: tx.color }]}>
                      {tx.letter}
                    </Text>
                  )}
                </View>

                <View style={s.txInfo}>
                  <Text style={s.txName}>{tx.title}</Text>
                  <Text style={s.txSub}>{tx.subtitle}</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[s.txAmount, tx.positive ? s.pos : s.neg]}>
                    {tx.amount}
                  </Text>
                  <Text style={s.txCategory}>{tx.category}</Text>
                </View>
              </View>
              {i < TRANSACTIONS.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  // ── Header
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: INDIGO, alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  hiText:      { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
  morningText: { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2 },
  bellWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2, position: "relative",
  },
  bellDot: {
    position: "absolute", top: 10, right: 11,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#FFFFFF",
  },

  // ── Balance
  balanceCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 22, marginBottom: 16,
  },
  balanceLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  balanceLabel:   { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY },
  balanceAmount:  { fontSize: 38, fontFamily: "Inter_700Bold",    color: BLACK, marginBottom: 22 },

  pillRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  pill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: LIME, borderRadius: 50,
    paddingVertical: 10, paddingHorizontal: 16, gap: 8,
  },
  pillIconWrap: { },
  pillLabel:    { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLACK },
  pillMenu: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
  },

  // ── Invite banner
  banner: {
    backgroundColor: INDIGO, borderRadius: 20,
    padding: 22, marginBottom: 20, overflow: "hidden",
    minHeight: 112, justifyContent: "center",
  },
  bannerContent: { zIndex: 1 },
  bannerTitle: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF",
    lineHeight: 26, marginBottom: 10,
  },
  bannerLink: {
    fontSize: 14, fontFamily: "Inter_500Medium", color: LIME,
    textDecorationLine: "underline",
  },
  bannerCircle1: {
    position: "absolute", right: -24, top: -24,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bannerCircle2: {
    position: "absolute", right: 32, bottom: -36,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // ── Transactions
  txCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 18,
  },
  txHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 6,
  },
  txTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  seeAll:  { fontSize: 13, fontFamily: "Inter_500Medium", color: INDIGO },

  txRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, gap: 12,
  },
  txIconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  txInitial:   { fontSize: 16, fontFamily: "Inter_700Bold" },
  txInfo:      { flex: 1 },
  txName:      { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },
  txSub:       { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2 },
  txAmount:    { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  pos:         { color: "#16A34A" },
  neg:         { color: BLACK },
  txCategory:  { fontSize: 11, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2 },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#F0F0F0" },
});
