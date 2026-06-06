import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME    = "#C8FF00";
const BLACK   = "#1A1A1A";
const INDIGO  = "#4F46E5";
const SUCCESS = "#16A34A";
const ERROR_C = "#DC2626";

const PAD_ROWS = [
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

// ─── Development config ───────────────────────────────────────────────────────
// In production: verify against your backend (POST /api/auth/verify-otp).
// The dev code is printed below the OTP boxes in __DEV__ mode.
const DEV_OTP = "1234";

async function verifyOtp(code: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  if (code !== DEV_OTP) throw new Error("Wrong code. Please try again.");
}

async function resendOtp(dialCode: string, phone: string): Promise<void> {
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
  return <Animated.View style={{ width: 2, height: 28, backgroundColor: BLACK, opacity }} />;
}

// ─── OTP box ──────────────────────────────────────────────────────────────────
function OTPBox({
  digit,
  active,
  hasError,
  isSuccess,
}: {
  digit: string;
  active: boolean;
  hasError: boolean;
  isSuccess: boolean;
}) {
  const filled = digit !== "";
  return (
    <View
      style={[
        otp.box,
        active  && otp.boxActive,
        !active && !hasError && otp.boxIdle,
        hasError  && otp.boxError,
        isSuccess && otp.boxSuccess,
      ]}
    >
      {filled ? (
        <Text style={[otp.digit, hasError && { color: ERROR_C }, isSuccess && { color: SUCCESS }]}>
          {digit}
        </Text>
      ) : active ? (
        <BlinkingCursor />
      ) : null}
    </View>
  );
}

// ─── Partial numpad ───────────────────────────────────────────────────────────
function PartialNumPad({
  onKey,
  disabled,
}: {
  onKey: (k: string) => void;
  disabled: boolean;
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
              onPress={() => onKey(k)}
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
type Status = "idle" | "loading" | "success" | "error";

const RESEND_SECONDS = 60;

export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const {
    phone    = "",
    dialCode = "+65",
    flag     = "🇸🇬",
  } = useLocalSearchParams<{ phone: string; dialCode: string; flag: string }>();

  const [code, setCode]       = useState("");
  const [status, setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Hidden TextInput enables iOS SMS OTP autofill (textContentType="oneTimeCode").
  // iOS surfaces the code suggestion above the keyboard / in QuickType bar
  // and fills this field automatically when the user taps it.
  const hiddenRef = useRef<TextInput>(null);

  // ── Countdown ──
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Shake helper ──
  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  9, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 65, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // ── Verify OTP ──
  const submit = useCallback(async (c: string) => {
    if (c.length < 4 || status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await verifyOtp(c);
      setStatus("success");
      // Navigate out after the success flash
      setTimeout(() => router.replace("/"), 1800);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Invalid code. Please try again.");
      shake();
    }
  }, [status, shake]);

  // ── Numpad key handler ──
  const handleKey = (k: string) => {
    if (status === "loading" || status === "success") return;
    if (status === "error") {
      // First keypress clears the error and resets
      setStatus("idle");
      setErrorMsg("");
      setCode("");
      return;
    }
    setCode((prev) => {
      const next =
        k === "⌫" ? prev.slice(0, -1) :
        prev.length < 4 ? prev + k : prev;
      // Auto-submit when 4 digits complete
      if (next.length === 4 && k !== "⌫") {
        setTimeout(() => submit(next), 0);
      }
      return next;
    });
  };

  // ── SMS autofill (iOS) ──
  const handleAutofill = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4) setTimeout(() => submit(digits), 0);
  };

  // ── Resend ──
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setCode("");
    setStatus("idle");
    setErrorMsg("");
    try {
      await resendOtp(dialCode, phone);
      setCountdown(RESEND_SECONDS);
    } finally {
      setResending(false);
    }
  };

  // ── Derived display ──
  const maskedPhone =
    phone.length > 3
      ? "*".repeat(Math.max(0, phone.length - 3)) + phone.slice(-3)
      : phone || "*****341";

  const digits   = code.split("").concat(["", "", "", ""]).slice(0, 4);
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const hasError  = status === "error";
  const padDisabled = isLoading || isSuccess;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Hidden TextInput for iOS SMS OTP autofill */}
      <TextInput
        ref={hiddenRef}
        style={s.hiddenInput}
        textContentType="oneTimeCode"
        keyboardType="number-pad"
        maxLength={4}
        caretHidden
        value={code}
        onChangeText={handleAutofill}
        importantForAccessibility="no"
        accessible={false}
      />

      {/* ── Top content ─────────────────────────────────────────────── */}
      <View style={[s.top, { paddingTop: topPad + 14 }]}>
        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="x" size={15} color="#999999" />
        </TouchableOpacity>

        <Text style={s.title}>Verify your Code</Text>
        <Text style={s.subtitle}>
          Enter the security code we sent to{"\n"}
          <Text style={s.maskedAddr}>{dialCode} {maskedPhone}</Text>
        </Text>

        {/* OTP boxes with shake on error */}
        <Animated.View
          style={[s.otpRow, { transform: [{ translateX: shakeAnim }] }]}
        >
          {[0, 1, 2, 3].map((i) => (
            <OTPBox
              key={i}
              digit={digits[i]}
              active={i === code.length && code.length < 4 && !padDisabled}
              hasError={hasError}
              isSuccess={isSuccess}
            />
          ))}
        </Animated.View>

        {/* Dev hint */}
        {__DEV__ && !isSuccess && (
          <Text style={s.devHint}>
            Dev code: <Text style={{ fontFamily: "Inter_600SemiBold" }}>{DEV_OTP}</Text>
          </Text>
        )}

        {/* Error */}
        {hasError && <Text style={s.errorMsg}>{errorMsg}</Text>}

        {/* Success */}
        {isSuccess && (
          <View style={s.successRow}>
            <Feather name="check-circle" size={16} color={SUCCESS} />
            <Text style={s.successMsg}>Verified! Signing you in…</Text>
          </View>
        )}

        {/* Resend row */}
        {!isSuccess && (
          <View style={s.resendRow}>
            {countdown > 0 ? (
              <Text style={s.resendCountdown}>
                Resend in{" "}
                <Text style={s.resendTimer}>{countdown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                activeOpacity={0.7}
              >
                <Text style={[s.resendNow, resending && { opacity: 0.5 }]}>
                  {resending ? "Sending…" : "Resend code now"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* Done CTA */}
        <TouchableOpacity
          style={[
            s.cta,
            code.length < 4 && !isSuccess && s.ctaDisabled,
            isSuccess && s.ctaSuccess,
          ]}
          activeOpacity={0.85}
          disabled={code.length < 4 || padDisabled}
          onPress={() => submit(code)}
        >
          {isLoading ? (
            <ActivityIndicator color={BLACK} size="small" />
          ) : isSuccess ? (
            <Feather name="check" size={22} color="#FFFFFF" />
          ) : (
            <Text style={[s.ctaText, code.length < 4 && s.ctaTextDim]}>Done</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </View>

      {/* ── Partial numpad ──────────────────────────────────────────── */}
      <View style={{ paddingBottom: botPad + 6 }}>
        <PartialNumPad onKey={handleKey} disabled={padDisabled} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const otp = StyleSheet.create({
  box: {
    flex: 1, height: 64, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  boxIdle:    { backgroundColor: "#F2F2F2" },
  boxActive:  { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: BLACK },
  boxError:   { backgroundColor: "#FEF2F2", borderWidth: 2, borderColor: ERROR_C },
  boxSuccess: { backgroundColor: "#F0FDF4", borderWidth: 2, borderColor: SUCCESS },
  digit: { fontSize: 26, fontFamily: "Inter_600SemiBold", color: BLACK },
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
});

const s = StyleSheet.create({
  hiddenInput: {
    position: "absolute", left: -9999, height: 1, width: 1, opacity: 0,
  },

  top: { flex: 1, paddingHorizontal: 22 },

  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EBEBEB",
    alignItems: "center", justifyContent: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 28, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -0.3, marginBottom: 10,
  },
  subtitle: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: BLACK, lineHeight: 23, marginBottom: 24,
  },
  maskedAddr: { fontFamily: "Inter_600SemiBold", color: BLACK },

  otpRow: { flexDirection: "row", gap: 10, marginBottom: 12 },

  devHint: {
    fontSize: 12, color: "#AAAAAA", fontFamily: "Inter_400Regular",
    textAlign: "center", marginBottom: 6,
  },
  errorMsg: {
    fontSize: 13, color: ERROR_C, fontFamily: "Inter_400Regular",
    textAlign: "center", marginBottom: 4,
  },
  successRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginBottom: 4,
  },
  successMsg: {
    fontSize: 13, color: SUCCESS, fontFamily: "Inter_500Medium",
  },

  resendRow: { alignItems: "center", paddingVertical: 8 },
  resendCountdown: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#AAAAAA",
  },
  resendTimer: { fontFamily: "Inter_600SemiBold", color: BLACK },
  resendNow: {
    fontSize: 15, fontFamily: "Inter_600SemiBold", color: INDIGO,
  },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center",
  },
  ctaDisabled: { backgroundColor: "#E8E8E8" },
  ctaSuccess:  { backgroundColor: SUCCESS },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },
});
