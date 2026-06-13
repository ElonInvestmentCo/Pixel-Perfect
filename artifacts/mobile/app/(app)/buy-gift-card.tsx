/**
 * buy-gift-card.tsx — Gift card purchase screen powered by Reloadly.
 *
 * Flow:
 *  1. Browse products by country (default US) — searchable grid
 *  2. Tap product → select denomination (fixed chips or custom amount for RANGE)
 *  3. Enter recipient email
 *  4. Confirm modal → purchase → show result with PIN / redemption code
 */

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  getGCProducts,
  placeGCOrder,
  type GCOrderResult,
  type GCProduct,
} from "@/lib/giftcards";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = "#000000";
const LIME  = "#C8FF00";
const GRAY1 = "#F3F4F6";
const GRAY3 = "#D1D5DB";
const GRAY5 = "#6B7280";
const WHITE = "#FFFFFF";

// ── Country options ───────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa" },
];

function categoryEmoji(name?: string | null): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("gaming") || n.includes("game"))           return "🎮";
  if (n.includes("entertainment") || n.includes("stream"))  return "🎬";
  if (n.includes("shopping") || n.includes("retail"))       return "🛍️";
  if (n.includes("food") || n.includes("restaurant"))       return "🍔";
  if (n.includes("travel"))  return "✈️";
  if (n.includes("music"))   return "🎵";
  return "🎁";
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function BuyGiftCardScreen() {
  const insets    = useSafeAreaInsets();
  const authCtx = useContext(AuthContext);
  const session = authCtx?.session ?? null;

  const [countryCode, setCountryCode] = useState("US");
  const [products, setProducts]       = useState<GCProduct[]>([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const [selected, setSelected]         = useState<GCProduct | null>(null);
  const [denomination, setDenomination] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const [recipientEmail, setRecipientEmail] = useState("");
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [purchasing, setPurchasing]         = useState(false);
  const [result, setResult]                 = useState<GCOrderResult | null>(null);
  const [resultOpen, setResultOpen]         = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Load products ──────────────────────────────────────────────────────────
  const loadProducts = useCallback(async (code: string, pg: number, reset: boolean) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const data = await getGCProducts(code, pg, 20);
      if (!mountedRef.current) return;
      const items = data.content ?? [];
      setProducts(prev => (reset ? items : [...prev, ...items]));
      setHasMore(!data.last);
      setPage(pg);
    } catch {
      if (mountedRef.current) Alert.alert("Error", "Could not load gift cards. Please try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setProducts([]);
    setHasMore(true);
    setSelected(null);
    setDenomination(null);
    loadProducts(countryCode, 1, true);
  }, [countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = search.trim()
    ? products.filter(p =>
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand?.brandName ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  // ── Purchase ───────────────────────────────────────────────────────────────
  const finalAmount = denomination ?? (customAmount ? parseFloat(customAmount) : null);

  async function handlePurchase() {
    if (!selected || !finalAmount || !recipientEmail || !session?.token) return;
    setPurchasing(true);
    try {
      const res = await placeGCOrder(session.token, {
        productId:      selected.productId,
        unitPrice:      finalAmount,
        recipientEmail: recipientEmail.trim(),
      });
      if (!mountedRef.current) return;
      setResult(res);
      setConfirmOpen(false);
      setResultOpen(true);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      setConfirmOpen(false);
      Alert.alert("Purchase Failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      if (mountedRef.current) setPurchasing(false);
    }
  }

  function resetFlow() {
    setSelected(null);
    setDenomination(null);
    setCustomAmount("");
    setRecipientEmail("");
    setResult(null);
    setResultOpen(false);
  }

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0]!;

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selected) {
    const senderFixed = selected.fixedSenderDenominations;
    const fixedAmounts = senderFixed.length
      ? senderFixed
      : selected.fixedRecipientDenominations;
    const isRange = selected.denominationType === "RANGE";
    const logo    = selected.logoUrls?.[0] ?? null;

    return (
      <View style={[s.root, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerRow}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => { setSelected(null); setDenomination(null); setCustomAmount(""); }}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color={BLACK} />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{selected.productName}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Product hero */}
          <View style={s.detailCard}>
            {logo ? (
              <Image source={{ uri: logo }} style={s.detailLogo} resizeMode="contain" />
            ) : (
              <View style={[s.detailLogo, s.logoPlaceholder]}>
                <Text style={{ fontSize: 36 }}>{categoryEmoji(selected.category?.name)}</Text>
              </View>
            )}
            <Text style={s.detailName}>{selected.productName}</Text>
            {selected.country?.name && (
              <Text style={s.detailCountry}>{selected.country.name}</Text>
            )}
            <View style={s.currencyBadge}>
              <Text style={s.currencyBadgeText}>{selected.senderCurrencyCode}</Text>
            </View>
          </View>

          {/* Amount selector */}
          <Text style={s.sectionLabel}>Select Amount</Text>
          {isRange ? (
            <View style={s.rangeWrap}>
              <Text style={s.rangeCurrency}>{selected.senderCurrencyCode}</Text>
              <TextInput
                style={s.rangeInput}
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="decimal-pad"
                placeholder={`${selected.minSenderDenomination ?? 1} – ${selected.maxSenderDenomination ?? 500}`}
                placeholderTextColor={GRAY5}
              />
              {selected.minSenderDenomination != null && (
                <Text style={s.rangeHint}>
                  Min {selected.minSenderDenomination} · Max {selected.maxSenderDenomination}
                </Text>
              )}
            </View>
          ) : (
            <View style={s.chipsRow}>
              {fixedAmounts.map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[s.chip, denomination === amt && s.chipActive]}
                  onPress={() => setDenomination(amt)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipText, denomination === amt && s.chipTextActive]}>
                    {selected.senderCurrencyCode} {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recipient */}
          <Text style={[s.sectionLabel, { marginTop: 28 }]}>Recipient Email</Text>
          <TextInput
            style={s.emailInput}
            value={recipientEmail}
            onChangeText={setRecipientEmail}
            placeholder="email@example.com"
            placeholderTextColor={GRAY5}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={s.emailHint}>
            The gift card code will be delivered to this email address.
          </Text>
        </ScrollView>

        {/* Buy bar */}
        <View style={[s.buyBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[s.buyBtn, (!finalAmount || !recipientEmail.includes("@")) && s.buyBtnOff]}
            onPress={() => setConfirmOpen(true)}
            activeOpacity={0.85}
            disabled={!finalAmount || !recipientEmail.includes("@")}
          >
            <Text style={s.buyBtnText}>
              Buy · {selected.senderCurrencyCode} {finalAmount?.toFixed(2) ?? "—"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm modal */}
        <Modal visible={confirmOpen} transparent animationType="fade">
          <View style={s.overlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Confirm Purchase</Text>
              <View style={s.modalRow}>
                <Text style={s.modalLabel}>Gift Card</Text>
                <Text style={s.modalVal} numberOfLines={1}>{selected.productName}</Text>
              </View>
              <View style={s.modalRow}>
                <Text style={s.modalLabel}>Amount</Text>
                <Text style={s.modalVal}>{selected.senderCurrencyCode} {finalAmount?.toFixed(2)}</Text>
              </View>
              <View style={[s.modalRow, { borderBottomWidth: 0 }]}>
                <Text style={s.modalLabel}>Recipient</Text>
                <Text style={s.modalVal} numberOfLines={1}>{recipientEmail}</Text>
              </View>
              <View style={s.modalBtns}>
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => setConfirmOpen(false)}
                  disabled={purchasing}
                >
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.confirmBtn}
                  onPress={handlePurchase}
                  disabled={purchasing}
                  activeOpacity={0.85}
                >
                  {purchasing
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
              <Text style={s.resultTitle}>Purchase Successful!</Text>
              <Text style={s.resultSub}>
                {"Your gift card has been sent to\n"}{result?.recipientEmail ?? recipientEmail}
              </Text>

              {result?.pins?.map((pin, i) =>
                pin.pinCode ? (
                  <View key={i} style={s.pinBox}>
                    <Text style={s.pinLabel}>Redemption Code</Text>
                    <Text style={s.pinCode}>{pin.pinCode}</Text>
                    {pin.serialNumber && (
                      <Text style={s.pinMeta}>S/N: {pin.serialNumber}</Text>
                    )}
                    {pin.expiryDate && (
                      <Text style={s.pinMeta}>Expires: {pin.expiryDate}</Text>
                    )}
                    {pin.info1 && (
                      <Text style={s.pinInfo}>{pin.info1}</Text>
                    )}
                  </View>
                ) : null,
              )}

              <View style={s.txRow}>
                <Text style={s.txText}>Transaction #{result?.transactionId}</Text>
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

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { paddingTop: insets.top + 8 }]}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={22} color={BLACK} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Buy Gift Card</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Controls */}
      <View style={s.controlRow}>
        <TouchableOpacity style={s.countryPill} onPress={() => setCountryOpen(true)} activeOpacity={0.8}>
          <Text style={s.pillFlag}>{selectedCountry.flag}</Text>
          <Text style={s.pillCode}>{selectedCountry.code}</Text>
          <Feather name="chevron-down" size={13} color={GRAY5} />
        </TouchableOpacity>
        <View style={s.searchBox}>
          <Feather name="search" size={15} color={GRAY5} style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search gift cards…"
            placeholderTextColor={GRAY5}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color={GRAY5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Product grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.productId)}
        numColumns={2}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 24 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        onEndReached={() => {
          if (hasMore && !loading && !search) loadProducts(countryCode, page + 1, false);
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 24 }} color={BLACK} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 36 }}>🎁</Text>
              <Text style={s.emptyText}>No gift cards found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const logo     = item.logoUrls?.[0] ?? null;
          const minPrice = item.fixedSenderDenominations[0]
            ?? item.minSenderDenomination
            ?? item.fixedRecipientDenominations[0];
          return (
            <TouchableOpacity
              style={s.productCard}
              onPress={() => {
                setSelected(item);
                const firstFixed = item.fixedSenderDenominations[0]
                  ?? item.fixedRecipientDenominations[0]
                  ?? null;
                setDenomination(firstFixed ?? null);
              }}
              activeOpacity={0.8}
            >
              {logo ? (
                <Image source={{ uri: logo }} style={s.productLogo} resizeMode="contain" />
              ) : (
                <View style={[s.productLogo, s.logoPlaceholder]}>
                  <Text style={{ fontSize: 28 }}>{categoryEmoji(item.category?.name)}</Text>
                </View>
              )}
              <Text style={s.productName} numberOfLines={2}>{item.productName}</Text>
              <Text style={s.productPrice}>
                {item.senderCurrencyCode} {minPrice != null ? `from ${minPrice}` : "Flexible"}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

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

  controlRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, paddingBottom: 12, alignItems: "center",
  },
  countryPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GRAY1, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  pillFlag: { fontSize: 16 },
  pillCode: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLACK },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: GRAY1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: {
    flex: 1, fontSize: 14,
    fontFamily: "Inter_400Regular", color: BLACK,
  },

  productCard: {
    flex: 1, backgroundColor: GRAY1, borderRadius: 16,
    padding: 12, alignItems: "center", gap: 8,
  },
  productLogo: { width: "100%", height: 80, borderRadius: 10, backgroundColor: WHITE },
  logoPlaceholder: { alignItems: "center", justifyContent: "center" },
  productName: {
    fontSize: 13, fontFamily: "Inter_600SemiBold",
    color: BLACK, textAlign: "center",
  },
  productPrice: { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY5 },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: GRAY5, fontFamily: "Inter_400Regular" },

  // Detail
  detailCard: {
    backgroundColor: GRAY1, borderRadius: 20, padding: 24,
    alignItems: "center", marginBottom: 28, gap: 8,
  },
  detailLogo: { width: 140, height: 90, borderRadius: 12, backgroundColor: WHITE, marginBottom: 8 },
  detailName: { fontSize: 18, fontFamily: "Inter_700Bold", color: BLACK, textAlign: "center" },
  detailCountry: { fontSize: 13, color: GRAY5, fontFamily: "Inter_400Regular" },
  currencyBadge: {
    backgroundColor: WHITE, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 4, marginTop: 4,
  },
  currencyBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: BLACK },

  sectionLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: GRAY5,
    marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.6,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    borderWidth: 1.5, borderColor: GRAY3, borderRadius: 99,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  chipActive: { backgroundColor: LIME, borderColor: LIME },
  chipText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: GRAY5 },
  chipTextActive: { color: BLACK },

  rangeWrap: { backgroundColor: GRAY1, borderRadius: 14, padding: 16 },
  rangeCurrency: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: GRAY5, marginBottom: 6 },
  rangeInput: { fontSize: 26, fontFamily: "Inter_700Bold", color: BLACK },
  rangeHint: { fontSize: 12, color: GRAY5, marginTop: 8, fontFamily: "Inter_400Regular" },

  emailInput: {
    backgroundColor: GRAY1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: "Inter_400Regular", color: BLACK,
  },
  emailHint: { fontSize: 12, color: GRAY5, marginTop: 8, fontFamily: "Inter_400Regular" },

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
  pinBox: {
    backgroundColor: GRAY1, borderRadius: 16, padding: 16,
    width: "100%", alignItems: "center", gap: 4,
  },
  pinLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: GRAY5,
    textTransform: "uppercase", letterSpacing: 0.6,
  },
  pinCode: { fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: 2 },
  pinMeta: { fontSize: 12, color: GRAY5, fontFamily: "Inter_400Regular" },
  pinInfo: { fontSize: 13, color: BLACK, fontFamily: "Inter_400Regular", textAlign: "center" },
  txRow: {
    backgroundColor: GRAY1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  txText: { fontSize: 12, color: GRAY5, fontFamily: "Inter_400Regular" },
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
