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

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";
const INDIGO = "#5540FF";
const GRAY  = "#ABABAB";

const TRANSACTIONS = [
  {
    id: "1",
    iconBg: "#EDE8FF",
    letter: "F",
    arrow: false,
    name: "Figma",
    date: "Today, 12:30 PM",
    amount: "-$250.00",
    category: "Subscriptions",
    positive: false,
  },
  {
    id: "2",
    iconBg: "#DCFF7A",
    letter: null,
    arrow: true,
    name: "Receive from Alex",
    date: "Yesterday, 08:00 AM",
    amount: "+$580.00",
    category: "Money In",
    positive: true,
  },
  {
    id: "3",
    iconBg: "#FFF3C0",
    letter: "M",
    arrow: false,
    name: "Medium",
    date: "May 10, 06:00 PM",
    amount: "-$99.00",
    category: "Subscriptions",
    positive: false,
  },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>J</Text>
            </View>
            <View>
              <Text style={s.hiText}>Hi, Jennifer</Text>
              <Text style={s.subText}>Good Morning!</Text>
            </View>
          </View>
          <TouchableOpacity style={s.bellBtn} activeOpacity={0.75}>
            <Feather name="bell" size={22} color={BLACK} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── Balance ── */}
        <View style={s.balanceSection}>
          <View style={s.balanceLabelRow}>
            <Text style={s.balanceLabel}>Total Balance</Text>
            <Feather name="eye" size={16} color={GRAY} style={{ marginLeft: 8 }} />
          </View>
          <Text style={s.balanceAmount}>$12,765.00</Text>
        </View>

        {/* ── Action pills ── */}
        <View style={s.pillRow}>
          <TouchableOpacity style={s.pill} activeOpacity={0.82}>
            <View style={s.pillRing}>
              <Feather name="arrow-up" size={16} color={BLACK} />
            </View>
            <Text style={s.pillLabel}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.pill} activeOpacity={0.82}>
            <View style={s.pillRing}>
              <Feather name="arrow-down" size={16} color={BLACK} />
            </View>
            <Text style={s.pillLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.pillCircle} activeOpacity={0.82}>
            <Feather name="menu" size={18} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* ── Invite banner ── */}
        <TouchableOpacity activeOpacity={0.88} style={{ marginBottom: 24 }}>
          <LinearGradient
            colors={["#5540FF", "#6B52FF", "#7B62FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.bannerCircleLg} />
            <View style={s.bannerRingMd} />
            <View style={s.bannerRingSm} />
            <View style={s.bannerCircleBr} />
            <View style={{ maxWidth: "62%" }}>
              <Text style={s.bannerTitle}>{"Invite a friend and\nboth earn cashback"}</Text>
              <Text style={s.bannerLink}>Invite friends →</Text>
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
            <TouchableOpacity key={tx.id} style={s.txCard} activeOpacity={0.75}>
              <View style={[s.txIcon, { backgroundColor: tx.iconBg }]}>
                {tx.arrow ? (
                  <Feather name="arrow-down" size={18} color={BLACK} />
                ) : (
                  <Text style={s.txLetter}>{tx.letter}</Text>
                )}
              </View>
              <View style={s.txInfo}>
                <Text style={s.txName}>{tx.name}</Text>
                <Text style={s.txDate}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[s.txAmount, tx.positive && s.txPos]}>
                  {tx.amount}
                </Text>
                <Text style={s.txCat}>{tx.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 22 },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: INDIGO, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#E8E8E8",
  },
  avatarLetter: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  hiText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.2 },
  subText: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2 },
  bellBtn: { position: "relative", padding: 6 },
  bellDot: {
    position: "absolute", top: 4, right: 4,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: "#FF3B30", borderWidth: 1.5, borderColor: "#FFFFFF",
  },

  balanceSection: { marginBottom: 20 },
  balanceLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY, letterSpacing: 0.1 },
  balanceAmount: {
    fontSize: 42, fontFamily: "Inter_700Bold", color: BLACK,
    letterSpacing: -2, lineHeight: 50,
  },

  pillRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: LIME, borderRadius: 50,
    height: 52, paddingLeft: 8, paddingRight: 20,
  },
  pillRing: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: "rgba(0,0,0,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  pillLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.2 },
  pillCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
  },

  banner: {
    borderRadius: 22, padding: 22,
    overflow: "hidden", minHeight: 110, justifyContent: "center",
  },
  bannerCircleLg: {
    position: "absolute", right: -24, top: -28,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bannerRingMd: {
    position: "absolute", right: 14, top: 15,
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.18)",
  },
  bannerRingSm: {
    position: "absolute", right: 34, top: 35,
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
  },
  bannerCircleBr: {
    position: "absolute", right: -10, bottom: -30,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bannerTitle: {
    color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold",
    lineHeight: 28, letterSpacing: -0.4,
  },
  bannerLink: {
    color: LIME, fontSize: 14, fontFamily: "Inter_700Bold",
    marginTop: 12, letterSpacing: -0.1,
  },

  txHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  txTitle: { fontSize: 19, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.4 },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: INDIGO },

  txList: { gap: 10 },
  txCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 13,
    borderWidth: 1.5, borderColor: "rgba(0,0,0,0.07)",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  txIcon: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  txLetter: { fontSize: 18, fontFamily: "Inter_700Bold", color: BLACK },
  txInfo: { flex: 1 },
  txName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK, letterSpacing: -0.1 },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 3 },
  txAmount: { fontSize: 15, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.3 },
  txPos: { color: "#16A34A" },
  txCat: { fontSize: 11, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 3 },
});
