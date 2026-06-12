/**
 * airtime.tsx — Airtime & Data top-up screen powered by Reloadly.
 *
 * Flow:
 *  1. User picks a country + enters a phone number
 *  2. Taps "Detect Operator" → API auto-detects the carrier
 *  3. Switches between Airtime (amount grid) and Data Bundles (bundle list)
 *  4. Selects amount / bundle → taps "Buy Now" → confirmation modal → purchase
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
  Platform,
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
  detectAirtimeOperator,
  getDataBundles,
  getOperatorsByCountry,
  OperatorDetectError,
  purchaseTopup,
  type AirtimeBundle,
  type AirtimeOperator,
} from "@/lib/airtime";
import { COUNTRIES, type Country } from "@/lib/countries";

// ── Design tokens ────────────────────────────────────────────────────────────

const BLACK  = "#000000";
const LIME   = "#C8FF00";
const DARK   = "#0D0D0D";
const GRAY1  = "#F3F4F6";
const GRAY3  = "#D1D5DB";
const GRAY5  = "#6B7280";
const WHITE  = "#FFFFFF";
const RED    = "#EF4444";
const GREEN  = "#22C55E";

// ── ISO code mapping ──────────────────────────────────────────────────────────
// Maps country names (from COUNTRIES array) to 2-letter ISO codes for Reloadly

const ISO_CODES: Record<string, string> = {
  "Singapore":      "SG",
  "United States":  "US",
  "United Kingdom": "GB",
  "Australia":      "AU",
  "India":          "IN",
  "China":          "CN",
  "Japan":          "JP",
  "South Korea":    "KR",
  "Germany":        "DE",
  "France":         "FR",
  "Indonesia":      "ID",
  "Malaysia":       "MY",
  "Philippines":    "PH",
  "Thailand":       "TH",
  "Vietnam":        "VN",
  "Brazil":         "BR",
  "Canada":         "CA",
  "Pakistan":       "PK",
  "South Africa":   "ZA",
  "UAE":            "AE",
  "Saudi Arabia":   "SA",
  "Nigeria":        "NG",
  "Egypt":          "EG",
  "Turkey":         "TR",
  "Italy":          "IT",
  "Spain":          "ES",
  "Mexico":         "MX",
  "Russia":         "RU",
  "Netherlands":    "NL",
  "Switzerland":    "CH",
};

// Default preset amounts (USD) when operator has a RANGE denomination
const DEFAULT_AMOUNTS = [1, 2, 5, 10, 20, 50];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

interface AmountChipProps {
  amount:     number;
  selected:   boolean;
  currency:   string;
  onPress:    () => void;
}

function AmountChip({ amount, selected, currency, onPress }: AmountChipProps) {
  return (
    <TouchableOpacity
      style={[s.chip, selected && s.chipSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[s.chipText, selected && s.chipTextSelected]}>
        {currency}{amount}
      </Text>
    </TouchableOpacity>
  );
}

interface BundleCardProps {
  bundle:   AirtimeBundle;
  selected: boolean;
  onPress:  () => void;
}

function BundleCard({ bundle, selected, onPress }: BundleCardProps) {
  return (
    <TouchableOpacity
      style={[s.bundleCard, selected && s.bundleCardSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={s.bundleLeft}>
        <Text style={[s.bundleDesc, selected && s.bundleDescSelected]} numberOfLines={2}>
          {bundle.description}
        </Text>
        {bundle.validityInDays != null && (
          <Text style={s.bundleValidity}>
            Valid {bundle.validityInDays} {bundle.validityInDays === 1 ? "day" : "days"}
          </Text>
        )}
      </View>
      <View style={[s.bundlePrice, selected && s.bundlePriceSelected]}>
        <Text style={[s.bundlePriceText, selected && s.bundlePriceTextSelected]}>
          ${bundle.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Country Picker Modal ──────────────────────────────────────────────────────

interface CountryPickerProps {
  visible:  boolean;
  current:  Country;
  onSelect: (c: Country) => void;
  onClose:  () => void;
}

function CountryPicker({ visible, current, onSelect, onClose }: CountryPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={cp.root}>
        <View style={cp.header}>
          <Text style={cp.title}>Select Country</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={24} color={BLACK} />
          </TouchableOpacity>
        </View>

        <View style={cp.searchWrap}>
          <Feather name="search" size={16} color={GRAY5} style={cp.searchIcon} />
          <TextInput
            style={cp.searchInput}
            placeholder="Search countries…"
            placeholderTextColor={GRAY5}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.name}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[cp.row, item.name === current.name && cp.rowActive]}
              onPress={() => { onSelect(item); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={cp.flag}>{item.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={cp.countryName}>{item.name}</Text>
                <Text style={cp.dialCode}>{item.dialCode}</Text>
              </View>
              {item.name === current.name && (
                <Feather name="check" size={18} color={BLACK} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

// ── Operator Picker Modal (manual fallback) ───────────────────────────────────

interface OperatorPickerProps {
  visible:    boolean;
  operators:  AirtimeOperator[];
  loading:    boolean;
  onSelect:   (op: AirtimeOperator) => void;
  onClose:    () => void;
}

function OperatorPickerModal({ visible, operators, loading, onSelect, onClose }: OperatorPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = operators.filter((op) =>
    op.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={op2.root}>
        <View style={op2.header}>
          <Text style={op2.title}>Select Operator</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={24} color={BLACK} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={op2.loadingWrap}>
            <ActivityIndicator size="large" color={DARK} />
            <Text style={op2.loadingText}>Loading operators…</Text>
          </View>
        ) : (
          <>
            <View style={op2.searchWrap}>
              <Feather name="search" size={16} color={GRAY5} style={{ marginRight: 8 }} />
              <TextInput
                style={op2.searchInput}
                placeholder="Search operators…"
                placeholderTextColor={GRAY5}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(o) => String(o.operatorId)}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <Text style={op2.emptyText}>No operators found.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={op2.row}
                  onPress={() => { onSelect(item); onClose(); }}
                  activeOpacity={0.7}
                >
                  {item.logoUrls?.[0] ? (
                    <Image source={{ uri: item.logoUrls[0] }} style={op2.logo} resizeMode="contain" />
                  ) : (
                    <View style={op2.logoPlaceholder}>
                      <Feather name="phone" size={18} color={GRAY5} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={op2.operatorName}>{item.name}</Text>
                    <Text style={op2.operatorMeta}>
                      {item.denominationType === "RANGE"
                        ? `$${item.minAmount}–$${item.maxAmount}`
                        : `${item.fixedAmounts.length} fixed amounts`}
                      {item.data ? "  ·  Data" : ""}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={GRAY5} />
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

// ── Confirmation Modal ────────────────────────────────────────────────────────

interface ConfirmModalProps {
  visible:     boolean;
  operator:    AirtimeOperator;
  phone:       string;
  country:     Country;
  tab:         "airtime" | "data";
  amount:      number | null;
  bundle:      AirtimeBundle | null;
  isPurchasing: boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

function ConfirmModal({
  visible, operator, phone, country, tab,
  amount, bundle, isPurchasing, onConfirm, onCancel,
}: ConfirmModalProps) {
  const label  = tab === "airtime"
    ? `$${amount?.toFixed(2) ?? "0"} Airtime`
    : bundle?.description ?? "";
  const price  = tab === "airtime"
    ? `$${amount?.toFixed(2) ?? "0"}`
    : `$${bundle?.price.toFixed(2) ?? "0"}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={cm.overlay}>
        <View style={cm.sheet}>
          <View style={cm.iconWrap}>
            <Feather name="phone" size={28} color={BLACK} />
          </View>

          <Text style={cm.title}>Confirm Purchase</Text>

          <View style={cm.row}>
            <Text style={cm.rowLabel}>Recipient</Text>
            <Text style={cm.rowValue}>{country.flag} {country.dialCode} {phone}</Text>
          </View>
          <View style={cm.row}>
            <Text style={cm.rowLabel}>Operator</Text>
            <Text style={cm.rowValue}>{operator.name}</Text>
          </View>
          <View style={cm.row}>
            <Text style={cm.rowLabel}>Product</Text>
            <Text style={cm.rowValue} numberOfLines={2}>{label}</Text>
          </View>
          <View style={[cm.row, cm.rowLast]}>
            <Text style={cm.rowLabel}>Amount</Text>
            <Text style={cm.rowAmount}>{price}</Text>
          </View>

          <TouchableOpacity
            style={[cm.btn, isPurchasing && cm.btnDisabled]}
            onPress={onConfirm}
            activeOpacity={0.85}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={BLACK} size="small" />
            ) : (
              <Text style={cm.btnLabel}>Pay {price}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={cm.cancel} onPress={onCancel} disabled={isPurchasing}>
            <Text style={cm.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

type Tab = "airtime" | "data";

export default function AirtimeScreen() {
  const insets    = useSafeAreaInsets();
  const authCtx   = useContext(AuthContext);
  const session   = authCtx?.session ?? null;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── form state ──────────────────────────────────────────────────────────────
  const [country,      setCountry]      = useState<Country>(
    COUNTRIES.find((c) => c.name === "Nigeria") ?? COUNTRIES[0]!,
  );
  const [phone,        setPhone]        = useState("");
  const [pickerOpen,   setPickerOpen]   = useState(false);

  // ── detection state ─────────────────────────────────────────────────────────
  const [operator,     setOperator]     = useState<AirtimeOperator | null>(null);
  const [detecting,    setDetecting]    = useState(false);
  const [detectError,  setDetectError]  = useState<string | null>(null);
  const [detectMissed, setDetectMissed] = useState(false); // true → show manual selector

  // ── manual operator picker state ─────────────────────────────────────────────
  const [manualPickerOpen,   setManualPickerOpen]   = useState(false);
  const [manualOperators,    setManualOperators]    = useState<AirtimeOperator[]>([]);
  const [loadingManualOps,   setLoadingManualOps]   = useState(false);

  // ── tab + selection state ───────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<Tab>("airtime");
  const [selectedAmt,  setSelectedAmt]  = useState<number | null>(null);
  const [bundles,      setBundles]      = useState<AirtimeBundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundlesError, setBundlesError] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<AirtimeBundle | null>(null);

  // ── purchase state ──────────────────────────────────────────────────────────
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isPurchasing,   setIsPurchasing]   = useState(false);

  // ── Reset operator when country or phone changes ────────────────────────────
  useEffect(() => {
    setOperator(null);
    setDetectError(null);
    setDetectMissed(false);
    setSelectedAmt(null);
    setSelectedBundle(null);
    setBundles([]);
    setManualOperators([]);
  }, [country, phone]);

  // ── Detect operator ─────────────────────────────────────────────────────────
  const handleDetect = useCallback(async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 4) {
      setDetectError("Enter a valid phone number first.");
      return;
    }

    const isoCode = ISO_CODES[country.name];
    if (!isoCode) {
      setDetectError(`${country.name} is not yet supported.`);
      return;
    }

    setDetecting(true);
    setDetectError(null);
    setOperator(null);
    setSelectedAmt(null);
    setSelectedBundle(null);
    setBundles([]);

    try {
      const fullPhone = `${country.dialCode}${digits}`;
      const op = await detectAirtimeOperator(fullPhone, isoCode);
      if (!mountedRef.current) return;
      setOperator(op);
      setDetectMissed(false);
      setActiveTab("airtime");

      // Pre-select first suggested amount if available
      if (op.suggestedAmounts?.length) {
        setSelectedAmt(op.suggestedAmounts[0]!);
      } else if (op.fixedAmounts?.length) {
        setSelectedAmt(op.fixedAmounts[0]!);
      } else {
        setSelectedAmt(DEFAULT_AMOUNTS[3]!);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if (err instanceof OperatorDetectError) {
        setDetectMissed(true);
        setDetectError("Could not auto-detect. Choose your operator below.");
      } else {
        setDetectError(
          err instanceof Error ? err.message : "Could not detect operator. Try again.",
        );
      }
    } finally {
      if (mountedRef.current) setDetecting(false);
    }
  }, [country, phone]);

  // ── Open manual operator picker ───────────────────────────────────────────
  const openManualPicker = useCallback(async () => {
    const isoCode = ISO_CODES[country.name];
    if (!isoCode) return;

    setManualPickerOpen(true);
    if (manualOperators.length > 0) return; // already loaded for this country

    setLoadingManualOps(true);
    try {
      const ops = await getOperatorsByCountry(isoCode);
      if (!mountedRef.current) return;
      setManualOperators(ops);
    } catch {
      // leave empty — OperatorPickerModal shows "No operators found."
    } finally {
      if (mountedRef.current) setLoadingManualOps(false);
    }
  }, [country, manualOperators]);

  const handleManualSelect = useCallback((op: AirtimeOperator) => {
    setOperator(op);
    setDetectMissed(false);
    setDetectError(null);
    setActiveTab("airtime");
    if (op.suggestedAmounts?.length) {
      setSelectedAmt(op.suggestedAmounts[0]!);
    } else if (op.fixedAmounts?.length) {
      setSelectedAmt(op.fixedAmounts[0]!);
    } else {
      setSelectedAmt(DEFAULT_AMOUNTS[3]!);
    }
  }, []);

  // ── Load bundles when switching to data tab ──────────────────────────────────
  const loadBundles = useCallback(async (op: AirtimeOperator) => {
    setBundlesLoading(true);
    setBundlesError(null);
    try {
      const data = await getDataBundles(op.operatorId);
      if (!mountedRef.current) return;
      setBundles(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setBundlesError(err instanceof Error ? err.message : "Failed to load bundles.");
    } finally {
      if (mountedRef.current) setBundlesLoading(false);
    }
  }, []);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setSelectedAmt(null);
    setSelectedBundle(null);
    if (tab === "data" && operator && bundles.length === 0 && !bundlesLoading) {
      loadBundles(operator);
    }
  }

  // ── Purchase ─────────────────────────────────────────────────────────────────
  async function handlePurchase() {
    if (!operator || !session) {
      Alert.alert("Sign In Required", "Please sign in to make purchases.");
      return;
    }

    const isoCode = ISO_CODES[country.name];
    if (!isoCode) return;

    const amount = activeTab === "airtime" ? selectedAmt : selectedBundle?.price ?? null;
    if (!amount) return;

    setIsPurchasing(true);
    try {
      const result = await purchaseTopup(session.token, {
        operatorId:  operator.operatorId,
        amount,
        phone:       phone.replace(/\D/g, ""),
        countryCode: isoCode,
        useLocalAmount: false,
      });

      if (!mountedRef.current) return;
      setConfirmVisible(false);

      Alert.alert(
        "Top-up Successful! 🎉",
        `${operator.name} delivered ${result.deliveredAmount} ${result.deliveredCurrency} to ${result.recipientPhone}.\n\nTransaction ID: ${result.transactionId}`,
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setConfirmVisible(false);
      Alert.alert(
        "Purchase Failed",
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      if (mountedRef.current) setIsPurchasing(false);
    }
  }

  // ── Amounts to display ────────────────────────────────────────────────────────
  const amountsToShow: number[] = operator
    ? operator.denominationType === "FIXED" && operator.fixedAmounts.length
      ? operator.fixedAmounts
      : operator.suggestedAmounts.length
        ? operator.suggestedAmounts
        : DEFAULT_AMOUNTS
    : DEFAULT_AMOUNTS;

  const canProceed =
    !!operator &&
    (activeTab === "airtime" ? selectedAmt !== null : selectedBundle !== null);

  const buyLabel = (() => {
    if (!canProceed) return "Select an Amount";
    if (activeTab === "airtime") return `Buy $${selectedAmt?.toFixed(2)} Airtime`;
    return `Buy ${selectedBundle?.description.substring(0, 20)}… $${selectedBundle?.price.toFixed(2)}`;
  })();

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={22} color={WHITE} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Airtime & Data</Text>
          <Text style={s.headerSub}>Powered by Reloadly</Text>
        </View>

        <View style={s.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Phone number section ── */}
        <View style={s.card}>
          <SectionLabel>Phone Number</SectionLabel>

          <View style={s.phoneRow}>
            {/* Country picker trigger */}
            <TouchableOpacity
              style={s.countryBtn}
              onPress={() => setPickerOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={s.countryFlag}>{country.flag}</Text>
              <Text style={s.countryCode}>{country.dialCode}</Text>
              <Feather name="chevron-down" size={14} color={GRAY5} />
            </TouchableOpacity>

            {/* Phone input */}
            <TextInput
              style={s.phoneInput}
              placeholder="Enter phone number"
              placeholderTextColor={GRAY5}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
              returnKeyType="done"
              onSubmitEditing={handleDetect}
            />
          </View>

          {/* Detect button */}
          <TouchableOpacity
            style={[s.detectBtn, detecting && s.detectBtnDisabled]}
            onPress={handleDetect}
            activeOpacity={0.85}
            disabled={detecting}
          >
            {detecting ? (
              <ActivityIndicator color={BLACK} size="small" />
            ) : (
              <>
                <Feather name="search" size={16} color={BLACK} />
                <Text style={s.detectLabel}>Detect Operator</Text>
              </>
            )}
          </TouchableOpacity>

          {detectError != null && (
            <View style={{ gap: 8 }}>
              <View style={s.errorRow}>
                <Feather name="alert-circle" size={14} color={RED} />
                <Text style={s.errorText}>{detectError}</Text>
              </View>

              {detectMissed && (
                <TouchableOpacity
                  style={s.manualSelectBtn}
                  onPress={openManualPicker}
                  activeOpacity={0.85}
                >
                  <Feather name="list" size={15} color={BLACK} />
                  <Text style={s.manualSelectLabel}>Select Operator Manually</Text>
                  <Feather name="chevron-right" size={15} color={BLACK} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── Detected operator card ── */}
        {operator != null && (
          <View style={s.operatorCard}>
            {/* Logo */}
            {operator.logoUrls?.[0] ? (
              <Image
                source={{ uri: operator.logoUrls[0] }}
                style={s.operatorLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={s.operatorLogoPlaceholder}>
                <Feather name="phone" size={22} color={GRAY5} />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={s.operatorName}>{operator.name}</Text>
              <Text style={s.operatorCountry}>{operator.country.name}</Text>
            </View>

            <View style={s.detectedBadge}>
              <Feather name="check" size={12} color={GREEN} />
              <Text style={s.detectedBadgeText}>Detected</Text>
            </View>
          </View>
        )}

        {/* ── Tab bar (only when operator detected) ── */}
        {operator != null && (
          <>
            <View style={s.tabs}>
              <TouchableOpacity
                style={[s.tab, activeTab === "airtime" && s.tabActive]}
                onPress={() => handleTabChange("airtime")}
                activeOpacity={0.8}
              >
                <Feather
                  name="phone-call"
                  size={15}
                  color={activeTab === "airtime" ? BLACK : GRAY5}
                />
                <Text style={[s.tabLabel, activeTab === "airtime" && s.tabLabelActive]}>
                  Airtime
                </Text>
              </TouchableOpacity>

              {operator.data && (
                <TouchableOpacity
                  style={[s.tab, activeTab === "data" && s.tabActive]}
                  onPress={() => handleTabChange("data")}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="wifi"
                    size={15}
                    color={activeTab === "data" ? BLACK : GRAY5}
                  />
                  <Text style={[s.tabLabel, activeTab === "data" && s.tabLabelActive]}>
                    Data Bundles
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Airtime tab ── */}
            {activeTab === "airtime" && (
              <View style={s.card}>
                <SectionLabel>
                  {operator.denominationType === "FIXED"
                    ? "Choose Amount"
                    : "Select Amount (USD)"}
                </SectionLabel>

                <View style={s.chipsGrid}>
                  {amountsToShow.map((amt) => (
                    <AmountChip
                      key={amt}
                      amount={amt}
                      currency={operator.denominationType === "FIXED" ? operator.destinationCurrencyCode + " " : "$"}
                      selected={selectedAmt === amt}
                      onPress={() => setSelectedAmt(amt)}
                    />
                  ))}
                </View>

                {operator.denominationType === "RANGE" && operator.minAmount != null && (
                  <Text style={s.rangeHint}>
                    Range: ${operator.minAmount} – ${operator.maxAmount} {operator.senderCurrencyCode}
                  </Text>
                )}
              </View>
            )}

            {/* ── Data bundles tab ── */}
            {activeTab === "data" && (
              <View style={s.card}>
                <SectionLabel>Choose a Data Bundle</SectionLabel>

                {bundlesLoading && (
                  <View style={s.loadingWrap}>
                    <ActivityIndicator color={DARK} size="large" />
                    <Text style={s.loadingText}>Loading bundles…</Text>
                  </View>
                )}

                {bundlesError != null && (
                  <View style={s.errorRow}>
                    <Feather name="alert-circle" size={14} color={RED} />
                    <Text style={s.errorText}>{bundlesError}</Text>
                  </View>
                )}

                {!bundlesLoading && !bundlesError && bundles.length === 0 && (
                  <Text style={s.emptyText}>No data bundles available for this operator.</Text>
                )}

                {bundles.map((b) => (
                  <BundleCard
                    key={b.id}
                    bundle={b}
                    selected={selectedBundle?.id === b.id}
                    onPress={() => setSelectedBundle(b)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Placeholder when no operator yet ── */}
        {operator == null && !detecting && (
          <View style={s.placeholderWrap}>
            <View style={s.placeholderIcon}>
              <Feather name="phone" size={32} color={GRAY5} />
            </View>
            <Text style={s.placeholderTitle}>Top Up Any Phone</Text>
            <Text style={s.placeholderSub}>
              Enter a phone number above and tap "Detect Operator" to get started. Supports 900+ operators in 150+ countries.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* ── Sticky buy button ── */}
      {operator != null && (
        <View style={[s.stickyFooter, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[s.buyBtn, !canProceed && s.buyBtnDisabled]}
            onPress={() => canProceed && setConfirmVisible(true)}
            activeOpacity={0.85}
            disabled={!canProceed}
          >
            <Text style={s.buyBtnLabel} numberOfLines={1}>{buyLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Country picker modal ── */}
      <CountryPicker
        visible={pickerOpen}
        current={country}
        onSelect={(c) => { setCountry(c); setPhone(""); }}
        onClose={() => setPickerOpen(false)}
      />

      {/* ── Confirm + purchase modal ── */}
      {operator != null && (
        <ConfirmModal
          visible={confirmVisible}
          operator={operator}
          phone={phone}
          country={country}
          tab={activeTab}
          amount={selectedAmt}
          bundle={selectedBundle}
          isPurchasing={isPurchasing}
          onConfirm={handlePurchase}
          onCancel={() => !isPurchasing && setConfirmVisible(false)}
        />
      )}

      <OperatorPickerModal
        visible={manualPickerOpen}
        operators={manualOperators}
        loading={loadingManualOps}
        onSelect={handleManualSelect}
        onClose={() => setManualPickerOpen(false)}
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    backgroundColor: DARK,
    flexDirection:   "row",
    alignItems:      "center",
    paddingHorizontal: 20,
    paddingBottom:   20,
    borderBottomLeftRadius:  28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle:  {
    fontSize:    20,
    fontFamily:  "Inter_700Bold",
    color:       WHITE,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize:   12,
    fontFamily: "Inter_400Regular",
    color:      "rgba(255,255,255,0.45)",
    marginTop:  2,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  card: {
    backgroundColor: WHITE,
    borderRadius:    20,
    padding:         18,
    borderWidth:     1,
    borderColor:     GRAY3,
    gap:             12,
    ...(Platform.OS === "ios"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }
      : { elevation: 2 }),
  },

  sectionLabel: {
    fontSize:    13,
    fontFamily:  "Inter_600SemiBold",
    color:       GRAY5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  phoneRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            10,
  },
  countryBtn: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             6,
    backgroundColor: GRAY1,
    borderRadius:    12,
    paddingHorizontal: 12,
    paddingVertical:   12,
    borderWidth:     1,
    borderColor:     GRAY3,
  },
  countryFlag: { fontSize: 20 },
  countryCode: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },

  phoneInput: {
    flex:            1,
    backgroundColor: GRAY1,
    borderRadius:    12,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:        16,
    fontFamily:      "Inter_400Regular",
    color:           BLACK,
    borderWidth:     1,
    borderColor:     GRAY3,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}),
  },

  detectBtn: {
    backgroundColor: LIME,
    borderRadius:    12,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             8,
    paddingVertical: 14,
  },
  detectBtnDisabled: { opacity: 0.6 },
  detectLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: BLACK },

  errorRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           6,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", color: RED, flex: 1 },

  operatorCard: {
    backgroundColor: WHITE,
    borderRadius:    20,
    padding:         16,
    flexDirection:   "row",
    alignItems:      "center",
    gap:             12,
    borderWidth:     1.5,
    borderColor:     LIME,
    ...(Platform.OS === "ios"
      ? { shadowColor: LIME, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 10 }
      : { elevation: 3 }),
  },
  operatorLogo: { width: 52, height: 52, borderRadius: 12 },
  operatorLogoPlaceholder: {
    width:           52,
    height:          52,
    borderRadius:    12,
    backgroundColor: GRAY1,
    alignItems:      "center",
    justifyContent:  "center",
  },
  operatorName:    { fontSize: 17, fontFamily: "Inter_700Bold",    color: BLACK },
  operatorCountry: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
  detectedBadge: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             4,
    backgroundColor: "#DCFCE7",
    borderRadius:    99,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  detectedBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: GREEN },

  tabs: {
    flexDirection:   "row",
    backgroundColor: GRAY1,
    borderRadius:    14,
    padding:         4,
    gap:             4,
  },
  tab: {
    flex:            1,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             6,
    borderRadius:    10,
    paddingVertical: 10,
  },
  tabActive: { backgroundColor: WHITE, ...(Platform.OS === "ios" ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 } : { elevation: 2 }) },
  tabLabel:       { fontSize: 14, fontFamily: "Inter_500Medium", color: GRAY5 },
  tabLabelActive: { color: BLACK, fontFamily: "Inter_700Bold" },

  chipsGrid: {
    flexDirection:  "row",
    flexWrap:       "wrap",
    gap:            10,
  },
  chip: {
    minWidth:        90,
    flex:            1,
    paddingVertical:   14,
    borderRadius:    12,
    backgroundColor: GRAY1,
    alignItems:      "center",
    borderWidth:     1.5,
    borderColor:     GRAY3,
  },
  chipSelected: { backgroundColor: LIME, borderColor: LIME },
  chipText:     { fontSize: 16, fontFamily: "Inter_700Bold", color: GRAY5 },
  chipTextSelected: { color: BLACK },

  rangeHint: {
    fontSize:   12,
    fontFamily: "Inter_400Regular",
    color:      GRAY5,
    textAlign:  "center",
  },

  loadingWrap: {
    alignItems:      "center",
    justifyContent:  "center",
    paddingVertical: 32,
    gap:             12,
  },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
  emptyText:   { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, textAlign: "center", paddingVertical: 24 },

  bundleCard: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    padding:         14,
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     GRAY3,
    backgroundColor: WHITE,
    gap:             12,
  },
  bundleCardSelected: { borderColor: LIME, backgroundColor: "#FAFFF0" },
  bundleLeft:         { flex: 1 },
  bundleDesc:         { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLACK, lineHeight: 20 },
  bundleDescSelected: { color: DARK },
  bundleValidity:     { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 3 },
  bundlePrice: {
    backgroundColor: GRAY1,
    borderRadius:    10,
    paddingHorizontal: 12,
    paddingVertical:   8,
    minWidth:        68,
    alignItems:      "center",
  },
  bundlePriceSelected: { backgroundColor: LIME },
  bundlePriceText:     { fontSize: 15, fontFamily: "Inter_700Bold", color: GRAY5 },
  bundlePriceTextSelected: { color: BLACK },

  placeholderWrap: {
    alignItems:      "center",
    justifyContent:  "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap:             14,
  },
  placeholderIcon: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: GRAY1,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    6,
  },
  placeholderTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  placeholderSub:   { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, textAlign: "center", lineHeight: 22 },

  manualSelectBtn: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             8,
    backgroundColor: LIME,
    borderRadius:    12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  manualSelectLabel: {
    flex:       1,
    fontSize:   14,
    fontFamily: "Inter_600SemiBold",
    color:      BLACK,
  },

  stickyFooter: {
    position:        "absolute",
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop:      14,
    borderTopWidth:  1,
    borderTopColor:  GRAY3,
  },
  buyBtn: {
    backgroundColor: LIME,
    borderRadius:    14,
    paddingVertical: 17,
    alignItems:      "center",
  },
  buyBtnDisabled: { backgroundColor: GRAY3 },
  buyBtnLabel:    { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
});

// ── Country picker styles ─────────────────────────────────────────────────────

const cp = StyleSheet.create({
  root:        { flex: 1, backgroundColor: WHITE },
  header: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    paddingHorizontal: 20,
    paddingTop:      24,
    paddingBottom:   12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY3,
  },
  title:       { fontSize: 18, fontFamily: "Inter_700Bold", color: BLACK },
  searchWrap: {
    flexDirection:   "row",
    alignItems:      "center",
    margin:          16,
    paddingHorizontal: 14,
    backgroundColor: GRAY1,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     GRAY3,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: {
    flex:       1,
    fontSize:   15,
    fontFamily: "Inter_400Regular",
    color:      BLACK,
    paddingVertical: 12,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}),
  },
  row: {
    flexDirection:   "row",
    alignItems:      "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: GRAY3,
    gap:             12,
  },
  rowActive:   { backgroundColor: "#FAFFF0" },
  flag:        { fontSize: 24 },
  countryName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },
  dialCode:    { fontSize: 13, fontFamily: "Inter_400Regular",  color: GRAY5, marginTop: 1 },
});

// ── Confirm modal styles ──────────────────────────────────────────────────────

const cm = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent:  "flex-end",
  },
  sheet: {
    backgroundColor:    WHITE,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop:        28,
    paddingBottom:     40,
    gap:               4,
  },
  iconWrap: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: LIME,
    alignItems:      "center",
    justifyContent:  "center",
    alignSelf:       "center",
    marginBottom:    12,
  },
  title: {
    fontSize:    22,
    fontFamily:  "Inter_700Bold",
    color:       BLACK,
    textAlign:   "center",
    marginBottom: 16,
  },
  row: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY3,
  },
  rowLast:      { borderBottomWidth: 0 },
  rowLabel:     { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
  rowValue:     { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLACK, maxWidth: "55%", textAlign: "right" },
  rowAmount:    { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  btn: {
    backgroundColor: LIME,
    borderRadius:    14,
    paddingVertical: 17,
    alignItems:      "center",
    marginTop:       20,
  },
  btnDisabled: { opacity: 0.6 },
  btnLabel:    { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  cancel: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  cancelLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: GRAY5 },
});

// ── Operator picker modal styles ──────────────────────────────────────────────

const op2 = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: WHITE,
    paddingTop:      20,
  },
  header: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    paddingHorizontal: 20,
    paddingBottom:   16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY3,
  },
  title: {
    fontSize:   20,
    fontFamily: "Inter_700Bold",
    color:      BLACK,
  },
  searchWrap: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: GRAY1,
    borderRadius:    12,
    paddingHorizontal: 14,
    paddingVertical:   11,
    marginHorizontal:  20,
    marginTop:         16,
    marginBottom:       8,
  },
  searchInput: {
    flex:       1,
    fontSize:   15,
    fontFamily: "Inter_400Regular",
    color:      BLACK,
    ...({ outlineStyle: "none" } as any),
  },
  row: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: GRAY3,
  },
  logo: {
    width:        44,
    height:       44,
    borderRadius: 22,
    backgroundColor: GRAY1,
  },
  logoPlaceholder: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: GRAY1,
    alignItems:      "center",
    justifyContent:  "center",
  },
  operatorName: {
    fontSize:   15,
    fontFamily: "Inter_600SemiBold",
    color:      BLACK,
    lineHeight: 21,
  },
  operatorMeta: {
    fontSize:   12,
    fontFamily: "Inter_400Regular",
    color:      GRAY5,
    marginTop:   2,
  },
  loadingWrap: {
    flex:            1,
    alignItems:      "center",
    justifyContent:  "center",
    gap:             16,
  },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
  emptyText:   {
    fontSize:        14,
    fontFamily:      "Inter_400Regular",
    color:           GRAY5,
    textAlign:       "center",
    paddingVertical: 40,
  },
});
