import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";
const { width: SW } = Dimensions.get("window");

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={qa.wrap}
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={qa.iconWrap}>
        <Feather name={icon as any} size={20} color={BLACK} />
      </View>
      <Text style={qa.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const qa = StyleSheet.create({
  wrap:     { alignItems: "center", gap: 8 },
  iconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: LIME, borderWidth: 1.5, borderColor: BLACK,
    alignItems: "center", justifyContent: "center",
  },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", color: BLACK },
});

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxRow({
  icon,
  title,
  subtitle,
  amount,
  positive,
}: {
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
}) {
  return (
    <View style={tx.row} accessibilityRole="none">
      <View style={tx.iconWrap}>
        <Feather name={icon as any} size={18} color={BLACK} />
      </View>
      <View style={tx.info}>
        <Text style={tx.title} numberOfLines={1}>{title}</Text>
        <Text style={tx.subtitle}>{subtitle}</Text>
      </View>
      <Text style={[tx.amount, positive ? tx.pos : tx.neg]}>
        {positive ? "+" : "-"}{amount}
      </Text>
    </View>
  );
}

const tx = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, gap: 12,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#F2F2F2",
    alignItems: "center", justifyContent: "center",
  },
  info:     { flex: 1 },
  title:    { fontSize: 15, fontFamily: "Inter_500Medium", color: BLACK },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8A8A8A", marginTop: 2 },
  amount:   { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  pos:      { color: "#16A34A" },
  neg:      { color: BLACK },
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleSignOut = () => {
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#EBEBEB" }}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: topPad + 16, paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.greeting}>
            <Text style={s.greetSub}>Good morning 👋</Text>
            <Text style={s.greetName}>Jennifer Lopez</Text>
          </View>
          <TouchableOpacity
            style={s.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Feather name="log-out" size={18} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* ── Balance card ────────────────────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardLabel}>Total Balance</Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              accessibilityRole="button"
              accessibilityLabel={balanceVisible ? "Hide balance" : "Show balance"}
            >
              <Feather name={balanceVisible ? "eye" : "eye-off"} size={18} color="#8A8A8A" />
            </TouchableOpacity>
          </View>
          <Text style={s.balance}>
            {balanceVisible ? "$12,485.50" : "••••••••"}
          </Text>
          <View style={s.badge}>
            <Feather name="trending-up" size={13} color="#16A34A" />
            <Text style={s.badgeText}>+2.4% this month</Text>
          </View>

          {/* Card number strip */}
          <View style={s.cardBottom}>
            <Text style={s.cardNum}>•••• •••• •••• 7865</Text>
            <Text style={s.cardVisa}>VISA</Text>
          </View>
        </View>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.qaRow}>
            <QuickAction icon="arrow-up" label="Send" />
            <QuickAction icon="arrow-down" label="Receive" />
            <QuickAction icon="refresh-cw" label="Transfer" />
            <QuickAction icon="more-horizontal" label="More" />
          </View>
        </View>

        {/* ── Recent transactions ──────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="See all transactions"
            >
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={s.txCard}>
            <TxRow icon="shopping-bag"   title="Amazon"        subtitle="Today, 09:24 AM"      amount="$34.99"  positive={false} />
            <View style={s.divider} />
            <TxRow icon="coffee"         title="Starbucks"     subtitle="Today, 07:15 AM"      amount="$6.50"   positive={false} />
            <View style={s.divider} />
            <TxRow icon="briefcase"      title="Salary"        subtitle="Jun 1, 12:00 PM"      amount="$3,200"  positive />
            <View style={s.divider} />
            <TxRow icon="zap"            title="Netflix"       subtitle="May 31, 09:00 AM"     amount="$15.99"  positive={false} />
            <View style={s.divider} />
            <TxRow icon="user"           title="John sent you" subtitle="May 30, 04:45 PM"     amount="$120.00" positive />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  greeting: { gap: 2 },
  greetSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#666666" },
  greetName: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  signOutBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#E0E0E0",
  },

  card: {
    backgroundColor: BLACK, borderRadius: 24,
    padding: 22, marginBottom: 20,
    minHeight: 170,
  },
  cardTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 6,
  },
  cardLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#AAAAAA" },
  balance: {
    fontSize: 36, fontFamily: "Inter_700Bold",
    color: "#FFFFFF", letterSpacing: -0.5, marginBottom: 10,
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#1E2E1E", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: "flex-start", marginBottom: 20,
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#16A34A" },
  cardBottom: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  cardNum: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888", letterSpacing: 1.5 },
  cardVisa: { fontSize: 18, fontFamily: "Inter_700Bold", color: LIME, fontStyle: "italic" },

  section: {
    backgroundColor: "#FFFFFF", borderRadius: 20,
    padding: 18, marginBottom: 16,
  },
  qaRow: {
    flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8,
  },

  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 6,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
  seeAll:       { fontSize: 13, fontFamily: "Inter_500Medium", color: "#4F46E5" },

  txCard: {},
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#F0F0F0" },
});
