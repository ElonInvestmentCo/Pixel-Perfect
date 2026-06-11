import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK = "#000000";
const LIME  = "#C8FF00";
const GRAY5 = "#6B7280";
const GRAY2 = "#E5E7EB";

type FilterKey = "all" | "gift-cards" | "crypto" | "bills" | "transfers";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",        label: "All"         },
  { key: "gift-cards", label: "Gift Cards"  },
  { key: "crypto",     label: "Crypto"      },
  { key: "bills",      label: "Bills"       },
  { key: "transfers",  label: "Transfers"   },
];

const TRANSACTIONS = [
  { id: "1",  type: "gift-cards", icon: "gift",        iconBg: "#FFF7ED", iconColor: "#F97316", name: "Amazon Gift Card",   date: "Today, 2:30 PM",     amount: "-$50.00",   label: "Gift Card",    status: "completed" },
  { id: "2",  type: "crypto",     icon: "trending-up", iconBg: "#F0FDF4", iconColor: "#22C55E", name: "Buy Bitcoin",        date: "Today, 11:00 AM",    amount: "-$200.00",  label: "Crypto",       status: "completed" },
  { id: "3",  type: "transfers",  icon: "arrow-down",  iconBg: "#C8FF00", iconColor: "#000000", name: "Receive from Alex",  date: "Yesterday, 8:00 AM", amount: "+$580.00",  label: "Transfer",     status: "completed" },
  { id: "4",  type: "bills",      icon: "file-text",   iconBg: "#EFF6FF", iconColor: "#3B82F6", name: "Electricity Bill",   date: "Jun 9, 4:00 PM",     amount: "-$120.00",  label: "Bill Payment", status: "completed" },
  { id: "5",  type: "gift-cards", icon: "tag",         iconBg: "#FDF4FF", iconColor: "#A855F7", name: "Sell Google Card",   date: "Jun 8, 1:15 PM",     amount: "+$45.00",   label: "Gift Card",    status: "completed" },
  { id: "6",  type: "crypto",     icon: "trending-down",iconBg: "#FFF1F2", iconColor: "#F43F5E", name: "Sell Ethereum",     date: "Jun 7, 9:30 AM",     amount: "+$350.00",  label: "Crypto",       status: "completed" },
  { id: "7",  type: "bills",      icon: "wifi",        iconBg: "#ECFDF5", iconColor: "#10B981", name: "Internet Bill",      date: "Jun 6, 3:00 PM",     amount: "-$65.00",   label: "Bill Payment", status: "completed" },
  { id: "8",  type: "transfers",  icon: "arrow-up",    iconBg: "#FFF7ED", iconColor: "#F97316", name: "Send to Maria",      date: "Jun 5, 10:00 AM",    amount: "-$100.00",  label: "Transfer",     status: "completed" },
];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered = activeFilter === "all"
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.type === activeFilter);

  const totalIn  = filtered.filter((t) => t.amount.startsWith("+")).reduce((s, t) => s + parseFloat(t.amount.replace(/[^0-9.]/g, "")), 0);
  const totalOut = filtered.filter((t) => t.amount.startsWith("-")).reduce((s, t) => s + parseFloat(t.amount.replace(/[^0-9.]/g, "")), 0);

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
          <View>
            <Text style={s.screenTitle}>Activity</Text>
            <Text style={s.screenSub}>Transaction history</Text>
          </View>
          <TouchableOpacity style={s.filterBtn} activeOpacity={0.75}>
            <Feather name="sliders" size={18} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* ── Summary card ── */}
        <View style={s.summaryCard}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Money In</Text>
            <Text style={[s.summaryValue, { color: "#10B981" }]}>
              +${totalIn.toFixed(2)}
            </Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Money Out</Text>
            <Text style={[s.summaryValue, { color: "#EF4444" }]}>
              -${totalOut.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* ── Filter pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtersRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[s.filterPill, active && s.filterPillActive]}
                activeOpacity={0.75}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[s.filterPillLabel, active && s.filterPillLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Transactions list ── */}
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Feather name="inbox" size={40} color={GRAY5} />
            <Text style={s.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={s.txList}>
            {filtered.map((tx) => (
              <TouchableOpacity key={tx.id} style={s.txCard} activeOpacity={0.72}>
                <View style={[s.txIconWrap, { backgroundColor: tx.iconBg }]}>
                  <Feather name={tx.icon as any} size={22} color={tx.iconColor} />
                </View>
                <View style={s.txInfo}>
                  <Text style={s.txName}>{tx.name}</Text>
                  <Text style={s.txDate}>{tx.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[
                    s.txAmount,
                    { color: tx.amount.startsWith("+") ? "#10B981" : BLACK },
                  ]}>
                    {tx.amount}
                  </Text>
                  <Text style={s.txLabel}>{tx.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: BLACK, lineHeight: 34 },
  screenSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },

  summaryCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 24,
    padding: 20, marginBottom: 20,
    borderWidth: 1.5, borderColor: GRAY2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY5, marginBottom: 6 },
  summaryValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryDivider: { width: 1, height: 40, backgroundColor: GRAY2 },

  filtersRow: { gap: 8, paddingBottom: 20 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 99, backgroundColor: "#F3F4F6",
    borderWidth: 1.5, borderColor: "transparent",
  },
  filterPillActive: { backgroundColor: LIME, borderColor: LIME },
  filterPillLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: GRAY5 },
  filterPillLabelActive: { color: BLACK, fontFamily: "Inter_600SemiBold" },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: GRAY5 },

  txList: { gap: 10 },
  txCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: GRAY2,
  },
  txIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK, marginBottom: 2 },
  txDate: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY5 },
  txAmount: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  txLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
});
