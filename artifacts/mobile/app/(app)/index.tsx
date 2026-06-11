import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Rect, Ellipse, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ─── Design tokens ────────────────────────────────────────────── */
const LIME   = "#d4ff00";
const BLACK  = "#000000";
const INDIGO = "#6366f1";
const GRAY5  = "#6B7280";   /* gray-500 */
const GRAY4  = "#9CA3AF";   /* gray-400 */
const GRAY2  = "#E5E7EB";   /* gray-200 */

/* ─── SVG icons (from design zip) ─────────────────────────────── */
function FigmaIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83"/>
      <Path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF"/>
      <Path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E"/>
      <Path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262"/>
      <Path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="#1ABCFE"/>
    </Svg>
  );
}

function MediumIcon() {
  return (
    <Svg width={32} height={18} viewBox="0 0 32 18" fill="black">
      <Path d="M3.6 0C1.61177 0 0 1.61177 0 3.6V14.4C0 16.3882 1.61177 18 3.6 18C5.58823 18 7.2 16.3882 7.2 14.4V3.6C7.2 1.61177 5.58823 0 3.6 0Z"/>
      <Path d="M13.6 0C11.6118 0 10 1.61177 10 3.6V14.4C10 16.3882 11.6118 18 13.6 18C15.5882 18 17.2 16.3882 17.2 14.4V3.6C17.2 1.61177 15.5882 0 13.6 0Z"/>
      <Ellipse cx="25.6" cy="9" rx="3.6" ry="9" fill="black"/>
    </Svg>
  );
}

function ArrowIcon({ name }: { name: "invite" }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M4 10H16M16 10L11 5M16 10L11 15" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/* ─── Transactions data ─────────────────────────────────────────── */
const TRANSACTIONS = [
  {
    id: "1",
    iconBg: "#ede9fe",
    icon: <FigmaIcon />,
    name: "Figma",
    date: "Today, 12:30 PM",
    amount: "-$250.00",
    category: "Subscriptions",
  },
  {
    id: "2",
    iconBg: LIME,
    icon: null,
    name: "Receive from Alex",
    date: "Yesterday, 08:00 AM",
    amount: "+$580.00",
    category: "Money In",
  },
  {
    id: "3",
    iconBg: "#fef3c7",
    icon: <MediumIcon />,
    name: "Medium",
    date: "May 10, 06:00 PM",
    amount: "-$99.00",
    category: "Subscriptions",
  },
] as const;

/* ─── Screen ────────────────────────────────────────────────────── */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.avatarRow}>
            <LinearGradient
              colors={["#D1D5DB", "#9CA3AF"]}
              style={s.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View>
              <Text style={s.hiText}>Hi, Jennifer</Text>
              <Text style={s.morningText}>Good Morning!</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.75} style={{ position: "relative" }}>
            <Feather name="bell" size={24} color={BLACK} strokeWidth={1.5} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── Wallet Card ── */}
        <View style={s.walletCard}>
          {/* Balance */}
          <View style={s.balanceSection}>
            <View style={s.balanceLabelRow}>
              <Text style={s.balanceLabel}>Total Balance</Text>
              <Feather name="eye" size={20} color={GRAY5} style={{ marginLeft: 8 }} />
            </View>
            <Text style={s.balanceAmount}>$12,765.00</Text>
          </View>

          {/* Action pills */}
          <View style={s.pillRow}>
            <TouchableOpacity style={[s.pill, { flex: 1 }]} activeOpacity={0.82} onPress={() => router.push("/transfer")}>
              <View style={s.pillIconWrap}>
                <Feather name="arrow-up" size={22} color={BLACK} />
              </View>
              <Text style={s.pillLabel}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.pill, { flex: 1 }]} activeOpacity={0.82}>
              <View style={s.pillIconWrap}>
                <Feather name="arrow-down" size={22} color={BLACK} />
              </View>
              <Text style={s.pillLabel}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.menuBtn} activeOpacity={0.82}>
              <Feather name="menu" size={26} color={BLACK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Promo card ── */}
        <TouchableOpacity activeOpacity={0.9} style={s.promoWrap}>
          <LinearGradient
            colors={["#6366f1", "#7c3aed", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.promoCard}
          >
            {/* Decorative circles */}
            <View style={s.promoCircle1} />
            <View style={s.promoCircle2} />
            <View style={s.promoContent}>
              <Text style={s.promoTitle}>{"Invite a friend and\nboth earn cashback"}</Text>
              <View style={s.promoLink}>
                <Text style={s.promoLinkText}>Invite friends</Text>
                <ArrowIcon name="invite" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Transactions ── */}
        <View style={s.txHeader}>
          <Text style={s.txTitle}>Transactions</Text>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={s.txList}>
          {TRANSACTIONS.map((tx) => (
            <TouchableOpacity key={tx.id} style={s.txCard} activeOpacity={0.7}>
              <View style={[s.txIconWrap, { backgroundColor: tx.iconBg }]}>
                {tx.icon ? tx.icon : (
                  <Feather name="arrow-down" size={24} color={BLACK} />
                )}
              </View>
              <View style={s.txInfo}>
                <Text style={s.txName}>{tx.name}</Text>
                <Text style={s.txDate}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.txAmount}>{tx.amount}</Text>
                <Text style={s.txCat}>{tx.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 32,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
  },
  hiText: { fontSize: 22, fontFamily: "Inter_600SemiBold", color: BLACK, lineHeight: 28 },
  morningText: { fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
  bellDot: {
    position: "absolute", top: -2, right: -2,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#EF4444",
  },

  /* Wallet Card */
  walletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#E2E4E8",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 10,
  },

  /* Balance */
  balanceSection: { marginBottom: 22 },
  balanceLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  balanceLabel: { fontSize: 16, fontFamily: "Inter_500Medium", color: "#374151", letterSpacing: 0.1 },
  balanceAmount: {
    fontSize: 58, fontFamily: "Inter_700Bold", color: BLACK,
    letterSpacing: -2, lineHeight: 66,
  },

  /* Action pills */
  pillRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 0 },
  pill: {
    height: 72, backgroundColor: LIME,
    borderRadius: 50, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 10,
  },
  pillIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
  },
  pillLabel: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK },
  menuBtn: {
    width: 72, height: 72, borderRadius: 50,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "center",
  },

  /* Promo */
  promoWrap: { marginBottom: 24 },
  promoCard: {
    height: 200, borderRadius: 28,
    padding: 24, overflow: "hidden",
    justifyContent: "flex-end",
  },
  promoCircle1: {
    position: "absolute", top: 32, right: 32,
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  promoCircle2: {
    position: "absolute", bottom: 32, right: 64,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  promoContent: { position: "relative" },
  promoTitle: {
    color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold",
    lineHeight: 34, marginBottom: 16,
  },
  promoLink: { flexDirection: "row", alignItems: "center", gap: 8 },
  promoLinkText: { color: LIME, fontSize: 16, fontFamily: "Inter_600SemiBold" },

  /* Transactions */
  txHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  txTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: BLACK },
  seeAll: { fontSize: 15, fontFamily: "Inter_500Medium", color: INDIGO },
  txList: { gap: 12 },
  txCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: GRAY2,
  },
  txIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK, marginBottom: 2 },
  txDate: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
  txAmount: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK },
  txCat: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
});
