/**
 * bills.tsx — Utility bill payment screen powered by Reloadly.
 *
 * Flow:
 *  1. Pick country (default NG) → load billers
 *  2. Filter by bill type (Electricity, Water, TV, Internet, etc.)
 *  3. Tap biller → enter account/meter number + amount
 *  4. Confirm modal → pay → success screen
 */

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthContext } from "@/contexts/AuthContext";
import {
  getBillers,
  payBill,
  type BillerType,
  type UtilityBiller,
  type UtilityPayResult,
} from "@/lib/utilities";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = "#000000";
const LIME  = "#C8FF00";
const GRAY1 = "#F3F4F6";
const GRAY3 = "#D1D5DB";
const GRAY5 = "#6B7280";
const WHITE = "#FFFFFF";

// ── Country options ───────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania" },
  { code: "UG", flag: "🇺🇬", name: "Uganda" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
];

// ── Bill type config ──────────────────────────────────────────────────────────
type TabType = "ALL" | BillerType;

const BILL_TABS: { label: string; emoji: string; type: TabType }[] = [
  { label: "All",          emoji: "🏠",  type: "ALL" },
  { label: "Electricity",  emoji: "⚡",  type: "ELECTRICITY_BILL_PAYMENT" },
  { label: "Water",        emoji: "💧",  type: "WATER_BILL_PAYMENT" },
  { label: "TV",           emoji: "📺",  type: "TV_BILL_PAYMENT" },
  { label: "Internet",     emoji: "🌐",  type: "INTERNET_BILL_PAYMENT" },
  { label: "Education",    emoji: "📚",  type: "EDUCATION_BILL_PAYMENT" },
  { label: "Government",   emoji: "🏛️", type: "GOVERNMENT_BILL_PAYMENT" },
  { label: "Transport",    emoji: "🚌",  type: "TRANSPORT_BILL_PAYMENT" },
];

function typeEmoji(type: BillerType): string {
  return BILL_TABS.find(t => t.type === type)?.emoji ?? "🏠";
}

function typeLabel(type: BillerType): string {
  return BILL_TABS.find(t => t.type === type)?.label ?? type.replace(/_BILL_PAYMENT/, "");
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function BillsScreen() {
  const insets    = useSafeAreaInsets();
  const authCtx = useContext(AuthContext);
  const session = authCtx?.session ?? null;

  const [countryCode, setCountryCode] = useState("NG");
  const [billers, setBillers]         = useState<UtilityBiller[]>([]);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState<TabType>("ALL");
  const [countryOpen, setCountryOpen] = useState(false);

  // Selected biller + payment
  const [selected, setSelected]           = useState<UtilityBiller | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount]               = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paying, setPaying]           = useState(false);
  const [result, setResult]           = useState<UtilityPayResult | null>(null);
  const [resultOpen, setResultOpen]   = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Load billers ───────────────────────────────────────────────────────────
  const loadBillers = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const data = await getBillers(code);
      if (mountedRef.current) setBillers(data);
    } catch {
      if (mountedRef.current) Alert.alert("Error", "Could not load billers. Please try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setBillers([]);
    setSelected(null);
    loadBillers(countryCode);
  }, [countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = activeTab === "ALL"
    ? billers
    : billers.filter(b => b.type === activeTab);

  // ── Payment ────────────────────────────────────────────────────────────────
  const amountNum  = parseFloat(amount);
  const canPay     = selected && accountNumber.trim().length >= 3 && !isNaN(amountNum) && amountNum > 0;

  async function handlePay() {
    if (!selected || !canPay || !session?.token) return;
    setPaying(true);
    try {
      const res = await payBill(session.token, {
        billerId:               selected.id,
        amount:                 amountNum,
        subscriberAccountNumber: accountNumber.trim(),
      });
      if (!mountedRef.current) return;
      setResult(res);
      setConfirmOpen(false);
      setResultOpen(true);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      setConfirmOpen(false);
      Alert.alert("Payment Failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      if (mountedRef.current) setPaying(false);
    }
  }

  function resetFlow() {
    setSelected(null);
    setAccountNumber("");
    setAmount("");
    setResult(null);
    setResultOpen(false);
  }

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0]!;

  // ── Payment detail view ────────────────────────────────────────────────────
  if (selected) {
    const isRange = selected.denominationType === "RANGE";

    return (
      <View style={[s.root, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerRow}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => { setSelected(null); setAccountNumber(""); setAmount(""); }}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color={BLACK} />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{selected.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Biller info card */}
          <View style={s.billerCard}>
            <View style={s.billerIcon}>
              <Text style={{ fontSize: 28 }}>{typeEmoji(selected.type)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.billerCardName}>{selected.name}</Text>
              <View style={s.badgeRow}>
                <View style={s.typeBadge}>
                  <Text style={s.typeBadgeText}>{typeLabel(selected.type)}</Text>
                </View>
                <View style={s.typeBadge}>
                  <Text style={s.typeBadgeText}>{selected.serviceType}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account number */}
          <Text style={s.fieldLabel}>
            {selected.serviceType === "PREPAID" ? "Meter Number" : "Account Number"}
          </Text>
          <TextInput
            style={s.fieldInput}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder={selected.serviceType === "PREPAID" ? "e.g. 45006123456" : "e.g. 1234567890"}
            placeholderTextColor={GRAY5}
            keyboardType="number-pad"
          />

          {/* Amount */}
          <Text style={[s.fieldLabel, { marginTop: 24 }]}>Amount (USD)</Text>

          {isRange ? (
            <View style={s.amountWrap}>
              <Text style={s.amountPrefix}>$</Text>
              <TextInput
                style={s.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder={`${selected.minAmount ?? 1} – ${selected.maxAmount ?? 1000}`}
                placeholderTextColor={GRAY5}
              />
              {selected.minAmount != null && (
                <Text style={s.amountHint}>
                  Min ${selected.minAmount} · Max ${selected.maxAmount}
                </Text>
              )}
            </View>
          ) : (
            <View style={s.chipsRow}>
              {selected.fixedAmounts.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[s.chip, amount === String(a) && s.chipActive]}
                  onPress={() => setAmount(String(a))}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipText, amount === String(a) && s.chipTextActive]}>
                    ${a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Pay bar */}
        <View style={[s.buyBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[s.buyBtn, !canPay && s.buyBtnOff]}
            onPress={() => setConfirmOpen(true)}
            activeOpacity={0.85}
            disabled={!canPay}
          >
            <Text style={s.buyBtnText}>
              Pay · ${amountNum > 0 ? amountNum.toFixed(2) : "—"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm modal */}
        <Modal visible={confirmOpen} transparent animationType="fade">
          <View style={s.overlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Confirm Payment</Text>
              <View style={s.modalRow}>
                <Text style={s.modalLabel}>Biller</Text>
                <Text style={s.modalVal} numberOfLines={1}>{selected.name}</Text>
              </View>
              <View style={s.modalRow}>
                <Text style={s.modalLabel}>Account</Text>
                <Text style={s.modalVal}>{accountNumber}</Text>
              </View>
              <View style={[s.modalRow, { borderBottomWidth: 0 }]}>
                <Text style={s.modalLabel}>Amount</Text>
                <Text style={s.modalVal}>${amountNum.toFixed(2)}</Text>
              </View>
              <View style={s.modalBtns}>
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => setConfirmOpen(false)}
                  disabled={paying}
                >
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.confirmBtn}
                  onPress={handlePay}
                  disabled={paying}
                  activeOpacity={0.85}
                >
                  {paying
                    ? <ActivityIndicator color={BLACK} size="small" />
                    : <Text style={s.confirmBtnText}>Confirm</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Result modal */}
        <Modal visible={resultOpen} transparent animationType="slide">
          <View style={s.overlay}>
            <View style={s.resultCard}>
              <View style={s.successIcon}>
                <Feather name="check" size={28} color={BLACK} />
              </View>
              <Text style={s.resultTitle}>Payment Successful!</Text>
              <Text style={s.resultSub}>
                Your bill has been paid successfully.
              </Text>
              <View style={s.resultDetails}>
                <View style={s.resultRow}>
                  <Text style={s.resultRowLabel}>Biller</Text>
                  <Text style={s.resultRowVal}>{result?.billerName ?? selected.name}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultRowLabel}>Account</Text>
                  <Text style={s.resultRowVal}>{result?.subscriberAccountNumber ?? accountNumber}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultRowLabel}>Amount</Text>
                  <Text style={s.resultRowVal}>
                    ${result?.amount ?? amountNum} {result?.currencyCode ?? "USD"}
                  </Text>
                </View>
                <View style={[s.resultRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.resultRowLabel}>Tx ID</Text>
                  <Text style={s.resultRowVal}>#{result?.transactionId}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.doneBtn} onPress={resetFlow} activeOpacity={0.85}>
                <Text style={s.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── Biller list view ───────────────────────────────────────────────────────
  return (
    <View style={[s.root, { paddingTop: insets.top + 8 }]}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={22} color={BLACK} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Pay Bills</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => setCountryOpen(true)} activeOpacity={0.8}>
          <Text style={{ fontSize: 20 }}>{selectedCountry.flag}</Text>
        </TouchableOpacity>
      </View>

      {/* Type tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabsRow}
      >
        {BILL_TABS.map(tab => (
          <TouchableOpacity
            key={tab.type}
            style={[s.tab, activeTab === tab.type && s.tabActive]}
            onPress={() => setActiveTab(tab.type)}
            activeOpacity={0.8}
          >
            <Text style={s.tabEmoji}>{tab.emoji}</Text>
            <Text style={[s.tabLabel, activeTab === tab.type && s.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Biller list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={BLACK} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 36 }}>🏠</Text>
              <Text style={s.emptyText}>No billers available</Text>
              <Text style={s.emptySubText}>Try a different country or category</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.billerRow}
              onPress={() => setSelected(item)}
              activeOpacity={0.8}
            >
              <View style={s.billerRowIcon}>
                <Text style={{ fontSize: 22 }}>{typeEmoji(item.type)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.billerRowName}>{item.name}</Text>
                <Text style={s.billerRowMeta}>
                  {item.serviceType}
                  {item.minAmount != null ? ` · $${item.minAmount}–$${item.maxAmount}` : ""}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={GRAY3} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Country picker */}
      <Modal visible={countryOpen} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.pickerCard}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryOpen(false)}>
                <Feather name="x" size={20} color={BLACK} />
              </TouchableOpacity>
            </View>
            {COUNTRIES.map(c => (
              <TouchableOpacity
                key={c.code}
                style={[s.pickerRow, c.code === countryCode && s.pickerRowActive]}
                onPress={() => { setCountryCode(c.code); setCountryOpen(false); }}
                activeOpacity={0.8}
              >
                <Text style={s.pickerFlag}>{c.flag}</Text>
                <Text style={s.pickerName}>{c.name}</Text>
                {c.code === countryCode && <Feather name="check" size={16} color={BLACK} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE },

  headerRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GRAY1, alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    flex: 1, textAlign: "center",
    fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK,
  },

  tabsRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GRAY1, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  tabActive: { backgroundColor: LIME },
  tabEmoji: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: GRAY5 },
  tabLabelActive: { color: BLACK },

  billerRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: GRAY1, borderRadius: 16, padding: 16,
  },
  billerRowIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, alignItems: "center", justifyContent: "center",
  },
  billerRowName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK, marginBottom: 3 },
  billerRowMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY5 },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: BLACK, fontFamily: "Inter_600SemiBold" },
  emptySubText: { fontSize: 14, color: GRAY5, fontFamily: "Inter_400Regular" },

  // Detail
  billerCard: {
    backgroundColor: GRAY1, borderRadius: 20, padding: 20,
    flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 28,
  },
  billerIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: WHITE, alignItems: "center", justifyContent: "center",
  },
  billerCardName: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 8 },
  typeBadge: {
    backgroundColor: WHITE, borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  typeBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: BLACK },

  fieldLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: GRAY5,
    marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6,
  },
  fieldInput: {
    backgroundColor: GRAY1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: "Inter_400Regular", color: BLACK,
  },

  amountWrap: { backgroundColor: GRAY1, borderRadius: 14, padding: 16 },
  amountPrefix: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: GRAY5, marginBottom: 6 },
  amountInput: { fontSize: 26, fontFamily: "Inter_700Bold", color: BLACK },
  amountHint: { fontSize: 12, color: GRAY5, marginTop: 8, fontFamily: "Inter_400Regular" },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    borderWidth: 1.5, borderColor: GRAY3, borderRadius: 99,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  chipActive: { backgroundColor: LIME, borderColor: LIME },
  chipText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: GRAY5 },
  chipTextActive: { color: BLACK },

  buyBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: WHITE, paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: GRAY3,
  },
  buyBtn: { backgroundColor: LIME, borderRadius: 99, paddingVertical: 16, alignItems: "center" },
  buyBtnOff: { opacity: 0.4 },
  buyBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },

  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  modalCard: { backgroundColor: WHITE, borderRadius: 24, padding: 24, width: "88%" },
  modalTitle: {
    fontSize: 18, fontFamily: "Inter_700Bold",
    color: BLACK, textAlign: "center", marginBottom: 20,
  },
  modalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GRAY1,
  },
  modalLabel: { fontSize: 14, color: GRAY5, fontFamily: "Inter_400Regular" },
  modalVal: {
    fontSize: 14, fontFamily: "Inter_600SemiBold",
    color: BLACK, maxWidth: "60%", textAlign: "right",
  },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, backgroundColor: GRAY1, borderRadius: 99,
    paddingVertical: 14, alignItems: "center",
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },
  confirmBtn: {
    flex: 1, backgroundColor: LIME, borderRadius: 99,
    paddingVertical: 14, alignItems: "center",
  },
  confirmBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: BLACK },

  resultCard: {
    backgroundColor: WHITE, borderRadius: 28, padding: 28,
    width: "90%", alignItems: "center", gap: 12,
  },
  successIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: LIME,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK },
  resultSub: {
    fontSize: 14, color: GRAY5, textAlign: "center",
    lineHeight: 22, fontFamily: "Inter_400Regular",
  },
  resultDetails: {
    backgroundColor: GRAY1, borderRadius: 16, padding: 16,
    width: "100%", gap: 0,
  },
  resultRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: WHITE,
  },
  resultRowLabel: { fontSize: 13, color: GRAY5, fontFamily: "Inter_400Regular" },
  resultRowVal: {
    fontSize: 13, fontFamily: "Inter_600SemiBold",
    color: BLACK, maxWidth: "60%", textAlign: "right",
  },
  doneBtn: {
    backgroundColor: LIME, borderRadius: 99,
    paddingVertical: 14, paddingHorizontal: 48, marginTop: 4,
  },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },

  pickerCard: { backgroundColor: WHITE, borderRadius: 24, padding: 20, width: "90%" },
  pickerHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  pickerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  pickerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GRAY1,
  },
  pickerRowActive: { backgroundColor: GRAY1, borderRadius: 12, paddingHorizontal: 8 },
  pickerFlag: { fontSize: 22 },
  pickerName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: BLACK },
});
