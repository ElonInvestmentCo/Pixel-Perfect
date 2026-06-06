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

import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";
const TEAL  = "#0D9488";
const ERROR_C = "#DC2626";

const PAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

// ─── Mock OTP service ─────────────────────────────────────────────────────────
// Replace body with real SMS provider (Twilio, AWS SNS, etc.) in production.
async function sendOtp(_dialCode: string, _phone: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1400));
  // throw new Error("Network error"); // uncomment to test error state
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={pk.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={[pk.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Handle bar */}
        <View style={pk.handle} />

        {/* Header */}
        <View style={pk.header}>
          <Text style={pk.title}>Select Country</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={pk.searchWrap}>
          <Feather name="search" size={16} color="#AAAAAA" style={{ marginRight: 8 }} />
          <TextInput
            style={pk.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search country or code…"
            placeholderTextColor="#AAAAAA"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x-circle" size={16} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.dialCode + c.name}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={pk.separator} />}
          renderItem={({ item }) => {
            const selected = item.dialCode === current.dialCode && item.name === current.name;
            return (
              <TouchableOpacity
                style={pk.row}
                activeOpacity={0.7}
                onPress={() => { onSelect(item); onClose(); setQuery(""); }}
              >
                <Text style={pk.flag}>{item.flag}</Text>
                <Text style={[pk.countryName, selected && pk.countryNameSelected]}>
                  {item.name}
                </Text>
                <Text style={[pk.dialCode, selected && pk.dialCodeSelected]}>
                  {item.dialCode}
                </Text>
                {selected && (
                  <Feather name="check" size={16} color={BLACK} style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

// ─── Numeric pad ──────────────────────────────────────────────────────────────
function NumPad({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={np.wrap}>
      {PAD_ROWS.map((row, ri) => (
        <View key={ri} style={np.row}>
          {row.map((k) => (
            <TouchableOpacity
              key={k}
              style={[np.key, (disabled || k === "*") && { opacity: 0.35 }]}
              activeOpacity={0.55}
              disabled={disabled || k === "*"}
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
          ))}
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

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone]     = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [errorMsg, setErrorMsg]     = useState("");

  const isValid = phone.length >= country.minLen && phone.length <= country.maxLen;
  const isLoading = sendStatus === "loading";

  const handleSend = async () => {
    if (!isValid || isLoading) return;
    setSendStatus("loading");
    setErrorMsg("");
    try {
      await sendOtp(country.dialCode, phone);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* ── Top content ─────────────────────────────────────────────── */}
      <View style={[s.top, { paddingTop: topPad + 14 }]}>
        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="x" size={15} color="#999999" />
        </TouchableOpacity>

        <Text style={s.title}>{"Verify your phone\nnumber with a code"}</Text>
        <Text style={s.subtitle}>We will send you a confirmation code</Text>

        <Text style={s.label}>Phone number</Text>
        <View style={s.phoneRow}>
          {/* Country code selector */}
          <TouchableOpacity
            style={s.countryBox}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={s.countryFlag}>{country.flag}</Text>
            <Text style={s.countryCode}>{country.dialCode}</Text>
            <Feather name="chevron-down" size={13} color="#888" />
          </TouchableOpacity>

          {/* Phone display with blinking cursor */}
          <View style={[s.phoneInputBox, sendStatus === "error" && s.phoneInputBoxError]}>
            <Text style={s.phoneDisplayText} numberOfLines={1}>{phone}</Text>
            {!isLoading && <BlinkingCursor />}
          </View>
        </View>

        {/* Validation hint */}
        {phone.length > 0 && !isValid && (
          <Text style={s.hintText}>
            {country.name} numbers are {country.minLen === country.maxLen
              ? `${country.minLen} digits`
              : `${country.minLen}–${country.maxLen} digits`}
          </Text>
        )}

        {/* Error message */}
        {sendStatus === "error" && errorMsg ? (
          <Text style={s.errorText}>{errorMsg}</Text>
        ) : null}

        {/* Send Code CTA */}
        <TouchableOpacity
          style={[s.cta, (!isValid || isLoading) && s.ctaDisabled]}
          activeOpacity={0.85}
          disabled={!isValid || isLoading}
          onPress={handleSend}
        >
          {isLoading ? (
            <ActivityIndicator color={BLACK} size="small" />
          ) : (
            <Text style={[s.ctaText, (!isValid || isLoading) && s.ctaTextDisabled]}>
              Send Code
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Numpad ──────────────────────────────────────────────────── */}
      <View style={{ paddingBottom: botPad + 6 }}>
        <NumPad value={phone} onChange={handlePhoneChange} disabled={isLoading} />
        <TouchableOpacity style={np.resendWrap} activeOpacity={0.7}>
          <Text style={np.resendLabel}>Resend code via email</Text>
        </TouchableOpacity>
      </View>

      {/* ── Country picker ───────────────────────────────────────────── */}
      <CountryPickerModal
        visible={pickerOpen}
        current={country}
        onSelect={(c) => { setCountry(c); setPhone(""); setSendStatus("idle"); }}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pk = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "72%",
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

  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F2F2F2", borderRadius: 12,
    marginHorizontal: 18, marginBottom: 8,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: {
    flex: 1, fontSize: 14, fontFamily: "Inter_400Regular",
    color: BLACK, outlineStyle: "none",
  } as any,

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#F0F0F0", marginLeft: 58 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, height: 52,
  },
  flag: { fontSize: 22, marginRight: 12 },
  countryName: {
    flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: BLACK,
  },
  countryNameSelected: { fontFamily: "Inter_600SemiBold" },
  dialCode: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#888",
  },
  dialCodeSelected: { color: BLACK, fontFamily: "Inter_600SemiBold" },
});

const np = StyleSheet.create({
  wrap: { paddingHorizontal: 20 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  key: {
    flex: 1, height: 62,
    backgroundColor: "#F2F2F2", borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  keyText: { fontSize: 26, fontFamily: "Inter_400Regular", color: BLACK },
  resendWrap: { paddingVertical: 10, alignItems: "center" },
  resendLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: TEAL },
});

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

  countryBox: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10,
    backgroundColor: "#F2F2F2", borderRadius: 10, height: 50,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 14, fontFamily: "Inter_500Medium", color: BLACK },

  phoneInputBox: {
    flex: 1, height: 50,
    borderWidth: 1.5, borderColor: BLACK, borderRadius: 10,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 2,
  },
  phoneInputBoxError: { borderColor: ERROR_C },
  phoneDisplayText: {
    flex: 1, fontSize: 16, fontFamily: "Inter_400Regular", color: BLACK,
  },

  hintText: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginBottom: 10,
  },
  errorText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: ERROR_C, marginBottom: 10,
  },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center", marginTop: 14,
  },
  ctaDisabled: { backgroundColor: "#E8E8E8" },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDisabled: { color: "#AAAAAA" },
});
