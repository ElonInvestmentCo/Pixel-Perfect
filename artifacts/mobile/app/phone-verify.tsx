import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COUNTRIES, DEFAULT_COUNTRY } from "../lib/countries";
import type { Country } from "../lib/countries";

const LIME    = "#C8FF00";
const BLACK   = "#1A1A1A";
const TEAL    = "#0D9488";
const ERROR_C = "#DC2626";
const GRAY    = "#F2F2F2";

const PAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

// ─── Mock OTP service ─────────────────────────────────────────────────────────
// Swap this body for a real POST /api/auth/send-otp in production.
async function sendOtpRequest(_dialCode: string, _phone: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1400));
}

// ─── Blinking cursor ──────────────────────────────────────────────────────────
function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={{ width: 2, height: 20, backgroundColor: BLACK, opacity }} />;
}

// ─── Country picker modal ─────────────────────────────────────────────────────
function CountryPickerModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: Country;
  onSelect: (c: Country) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.dialCode.includes(query),
      ),
    [query],
  );

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* ── Full-screen overlay: tap outside to close ── */}
      <View style={pk.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* ── Bottom sheet ── */}
        <View style={[pk.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Handle */}
          <View style={pk.handle} />

          {/* Header row */}
          <View style={pk.header}>
            <Text style={pk.title}>Select Country</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={pk.searchRow}>
            <Feather name="search" size={15} color="#AAAAAA" style={{ marginRight: 8 }} />
            <TextInput
              style={pk.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or dial code…"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={15} color="#BBBBBB" />
              </TouchableOpacity>
            )}
          </View>

          {/* Country list */}
          <FlatList
            data={filtered}
            keyExtractor={(c) => `${c.dialCode}-${c.name}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={pk.separator} />}
            renderItem={({ item }) => {
              const selected =
                item.dialCode === current.dialCode && item.name === current.name;
              return (
                <TouchableOpacity
                  style={pk.row}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item);
                    setQuery("");
                    onClose();
                  }}
                >
                  <Text style={pk.flag}>{item.flag}</Text>
                  <Text
                    style={[pk.countryName, selected && pk.countryNameBold]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[pk.dialCode, selected && pk.dialCodeBold]}>
                    {item.dialCode}
                  </Text>
                  {selected && (
                    <Feather name="check" size={15} color={BLACK} style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Numeric keypad ───────────────────────────────────────────────────────────
function NumPad({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={np.wrap}>
      {PAD_ROWS.map((row, ri) => (
        <View key={ri} style={np.row}>
          {row.map((k) => {
            const isStar = k === "*";
            return (
              <TouchableOpacity
                key={k}
                style={[np.key, (disabled || isStar) && np.keyDim]}
                activeOpacity={0.55}
                disabled={disabled || isStar}
                onPress={() => {
                  if (k === "⌫") onChange(value.slice(0, -1));
                  else onChange(value + k);
                }}
              >
                {k === "⌫" ? (
                  <Feather name="delete" size={22} color={BLACK} />
                ) : (
                  <Text style={np.keyText}>{k}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type SendStatus = "idle" | "loading" | "error";

export default function PhoneVerifyScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [country, setCountry]     = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone]         = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [errorMsg, setErrorMsg]   = useState("");

  const isValid   = phone.length >= country.minLen && phone.length <= country.maxLen;
  const isLoading = sendStatus === "loading";
  const canSend   = isValid && !isLoading;

  const handleSend = async () => {
    if (!canSend) return;
    setSendStatus("loading");
    setErrorMsg("");
    try {
      await sendOtpRequest(country.dialCode, phone);
      // Navigate to OTP screen with params
      router.push(
        `/verify-code?phone=${encodeURIComponent(phone)}&dialCode=${encodeURIComponent(country.dialCode)}&flag=${encodeURIComponent(country.flag)}`,
      );
      setSendStatus("idle");
    } catch (e: any) {
      setSendStatus("error");
      setErrorMsg(e?.message ?? "Failed to send code. Please try again.");
    }
  };

  const handlePhoneChange = (v: string) => {
    if (sendStatus === "error") { setSendStatus("idle"); setErrorMsg(""); }
    setPhone(v);
  };

  const handleCountrySelect = (c: Country) => {
    setCountry(c);
    setPhone("");
    setSendStatus("idle");
    setErrorMsg("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* ── Header + inputs ─────────────────────────────────────────── */}
      <View style={[s.top, { paddingTop: topPad + 14 }]}>
        {/* Close (X) */}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="x" size={15} color="#999999" />
        </TouchableOpacity>

        <Text style={s.title}>{"Verify your phone\nnumber with a code"}</Text>
        <Text style={s.subtitle}>We will send you a confirmation code</Text>

        <Text style={s.label}>Phone number</Text>

        {/* Phone row */}
        <View style={s.phoneRow}>
          {/* Country selector pill */}
          <TouchableOpacity
            style={s.countryPill}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={s.pillFlag}>{country.flag}</Text>
            <Text style={s.pillCode}>{country.dialCode}</Text>
            <Feather name="chevron-down" size={13} color="#888888" />
          </TouchableOpacity>

          {/* Phone number display */}
          <View style={[s.phoneBox, sendStatus === "error" && s.phoneBoxError]}>
            <Text style={s.phoneText} numberOfLines={1}>{phone}</Text>
            {!isLoading && <BlinkingCursor />}
          </View>
        </View>

        {/* Length hint */}
        {phone.length > 0 && !isValid && (
          <Text style={s.hintText}>
            {country.name} numbers:{" "}
            {country.minLen === country.maxLen
              ? `${country.minLen} digits`
              : `${country.minLen}–${country.maxLen} digits`}
          </Text>
        )}

        {/* Error message */}
        {sendStatus === "error" && errorMsg ? (
          <Text style={s.errorText}>{errorMsg}</Text>
        ) : null}

        {/* Send Code button */}
        <TouchableOpacity
          style={[s.cta, !canSend && s.ctaDim]}
          activeOpacity={0.85}
          disabled={!canSend}
          onPress={handleSend}
        >
          {isLoading ? (
            <ActivityIndicator color={BLACK} size="small" />
          ) : (
            <Text style={[s.ctaText, !canSend && s.ctaTextDim]}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Custom numpad ────────────────────────────────────────────── */}
      <View style={{ paddingBottom: botPad + 6 }}>
        <NumPad value={phone} onChange={handlePhoneChange} disabled={isLoading} />
        {/* Resend via email fallback */}
        <TouchableOpacity style={np.resendWrap} activeOpacity={0.7}>
          <Text style={np.resendText}>Resend code via email</Text>
        </TouchableOpacity>
      </View>

      {/* ── Country picker ───────────────────────────────────────────── */}
      <CountryPickerModal
        visible={pickerOpen}
        current={country}
        onSelect={handleCountrySelect}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

// ─── Country picker styles ────────────────────────────────────────────────────
const pk = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "74%",
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#D8D8D8",
    alignSelf: "center", marginBottom: 16,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22, marginBottom: 14,
  },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK },

  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: GRAY, borderRadius: 12,
    marginHorizontal: 18, marginBottom: 10,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: {
    flex: 1, fontSize: 14, fontFamily: "Inter_400Regular",
    color: BLACK, outlineStyle: "none",
  } as any,

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F0F0F0",
    marginLeft: 58,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, height: 52,
  },
  flag: { fontSize: 22, marginRight: 12 },
  countryName: {
    flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: BLACK,
  },
  countryNameBold: { fontFamily: "Inter_600SemiBold" },
  dialCode: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888" },
  dialCodeBold: { color: BLACK, fontFamily: "Inter_600SemiBold" },
});

// ─── Numpad styles ────────────────────────────────────────────────────────────
const np = StyleSheet.create({
  wrap: { paddingHorizontal: 20 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  key: {
    flex: 1, height: 62,
    backgroundColor: GRAY, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  keyDim: { opacity: 0.32 },
  keyText: { fontSize: 26, fontFamily: "Inter_400Regular", color: BLACK },
  resendWrap: { paddingVertical: 10, alignItems: "center" },
  resendText: { fontSize: 14, fontFamily: "Inter_500Medium", color: TEAL },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  top: { flex: 1, paddingHorizontal: 22 },

  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EBEBEB",
    alignItems: "center", justifyContent: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 28, fontFamily: "Inter_700Bold",
    color: BLACK, lineHeight: 36, letterSpacing: -0.3, marginBottom: 10,
  },
  subtitle: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#888888", marginBottom: 28,
  },
  label: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#888888", marginBottom: 10,
  },

  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 6 },

  countryPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10,
    backgroundColor: GRAY, borderRadius: 10, height: 50,
    minWidth: 80,
  },
  pillFlag: { fontSize: 18 },
  pillCode: { fontSize: 14, fontFamily: "Inter_500Medium", color: BLACK },

  phoneBox: {
    flex: 1, height: 50,
    borderWidth: 1.5, borderColor: BLACK, borderRadius: 10,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 2,
  },
  phoneBoxError: { borderColor: ERROR_C },
  phoneText: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular", color: BLACK },

  hintText: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginBottom: 8, marginTop: 4,
  },
  errorText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: ERROR_C, marginBottom: 8, marginTop: 4,
  },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center", marginTop: 16,
  },
  ctaDim: { backgroundColor: "#E8E8E8" },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },
});
