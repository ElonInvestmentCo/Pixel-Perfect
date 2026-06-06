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
const GRAY    = "#F2F2F2";

const PAD_ROWS = [
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

const RESEND_SECS = 60;

// ─── Development config ───────────────────────────────────────────────────────
// In production: call POST /api/auth/verify-otp and check against your backend.
const DEV_CODE = "1234";

async function verifyOtpRequest(code: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 1200));
  if (code !== DEV_CODE) throw new Error("Wrong code. Please try again.");
}

async function resendOtpRequest(_dialCode: string, _phone: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 1400));
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

// ─── Single OTP box ───────────────────────────────────────────────────────────
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
        active    && otp.active,
        hasError  && otp.error,
        isSuccess && otp.success,
        !active && !hasError && !isSuccess && otp.idle,
      ]}
    >
      {filled ? (
        <Text
          style={[
            otp.digit,
            hasError  && { color: ERROR_C },
            isSuccess && { color: SUCCESS },
          ]}
        >
          {digit}
        </Text>
      ) : active ? (
        <BlinkingCursor />
      ) : null}
    </View>
  );
}

// ─── Partial numpad (4–9, *, 0, ⌫) ───────────────────────────────────────────
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
          {row.map((k) => {
            const isStar = k === "*";
            return (
              <TouchableOpacity
                key={k}
                style={[np.key, (disabled || isStar) && np.keyDim]}
                activeOpacity={0.55}
                disabled={disabled || isStar}
                onPress={() => onKey(k)}
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
type Status = "idle" | "loading" | "success" | "error";

export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const {
    phone    = "",
    dialCode = "+65",
    flag     = "🇸🇬",
  } = useLocalSearchParams<{ phone: string; dialCode: string; flag: string }>();

  const [code, setCode]           = useState("");
  const [status, setStatus]       = useState<Status>("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [resending, setResending] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Hidden TextInput for iOS SMS OTP autofill (textContentType="oneTimeCode").
  // iOS presents the code in the QuickType bar even without the keyboard showing.
  const hiddenRef = useRef<TextInput>(null);

  // ── 60 s resend countdown ──
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Horizontal shake animation ──
  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  9, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 65, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // ── OTP verification ──
  const submit = useCallback(async (c: string) => {
    if (c.length < 4) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await verifyOtpRequest(c);
      setStatus("success");
      setTimeout(() => router.replace("/"), 1800);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Invalid code. Please try again.");
      shake();
    }
  }, [shake]);

  // ── Numpad key press ──
  // NOTE: side-effects (submit) live here, NOT inside the setCode updater,
  // to avoid double-invocation in React StrictMode.
  const handleKey = (k: string) => {
    if (status === "loading" || status === "success") return;

    // Any key after an error resets the field
    if (status === "error") {
      setStatus("idle");
      setErrorMsg("");
      setCode("");
      return;
    }

    let next: string;
    if (k === "⌫") {
      next = code.slice(0, -1);
    } else if (code.length < 4) {
      next = code + k;
    } else {
      return; // 4 digits already filled, ignore extra keys
    }

    setCode(next);

    // Auto-submit when the 4th digit is entered
    if (next.length === 4) {
      submit(next);
    }
  };

  // ── SMS autofill (iOS textContentType="oneTimeCode") ──
  const handleAutofill = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4 && status === "idle") {
      submit(digits);
    }
  };

  // ── Resend code ──
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setCode("");
    setStatus("idle");
    setErrorMsg("");
    try {
      await resendOtpRequest(dialCode, phone);
      setCountdown(RESEND_SECS);
    } finally {
      setResending(false);
    }
  };

  // ── Derived values ──
  const maskedPhone =
    phone.length > 3
      ? "*".repeat(Math.max(0, phone.length - 3)) + phone.slice(-3)
      : phone || "*****341";

  const digits     = code.split("").concat(["", "", "", ""]).slice(0, 4);
  const isLoading  = status === "loading";
  const isSuccess  = status === "success";
  const hasError   = status === "error";
  const padDisabled = isLoading || isSuccess;
  const doneEnabled = code.length === 4 && !padDisabled;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Hidden TextInput — enables iOS SMS OTP autofill */}
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

        {/* 4 OTP boxes — shake on wrong code */}
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

        {/* Dev hint — hidden in production builds */}
        {__DEV__ && !isSuccess && (
          <Text style={s.devHint}>
            Test code:{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>{DEV_CODE}</Text>
          </Text>
        )}

        {/* Error message */}
        {hasError && <Text style={s.errorMsg}>{errorMsg}</Text>}

        {/* Success banner */}
        {isSuccess && (
          <View style={s.successRow}>
            <Feather name="check-circle" size={15} color={SUCCESS} />
            <Text style={s.successMsg}>Verified! Signing you in…</Text>
          </View>
        )}

        {/* Resend countdown / button */}
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

        {/* Done / verify button */}
        <TouchableOpacity
          style={[
            s.cta,
            !doneEnabled && !isSuccess && s.ctaDim,
            isSuccess && s.ctaSuccess,
          ]}
          activeOpacity={0.85}
          disabled={!doneEnabled}
          onPress={() => submit(code)}
        >
          {isLoading ? (
            <ActivityIndicator color={BLACK} size="small" />
          ) : isSuccess ? (
            <Feather name="check" size={22} color="#FFFFFF" />
          ) : (
            <Text style={[s.ctaText, !doneEnabled && s.ctaTextDim]}>Done</Text>
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

// ─── OTP box styles ───────────────────────────────────────────────────────────
const otp = StyleSheet.create({
  box: {
    flex: 1, height: 64, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  idle:    { backgroundColor: GRAY },
  active:  { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: BLACK },
  error:   { backgroundColor: "#FEF2F2", borderWidth: 2, borderColor: ERROR_C },
  success: { backgroundColor: "#F0FDF4", borderWidth: 2, borderColor: SUCCESS },
  digit:   { fontSize: 26, fontFamily: "Inter_600SemiBold", color: BLACK },
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
});

// ─── Screen styles ────────────────────────────────────────────────────────────
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
    textAlign: "center", marginBottom: 4,
  },
  errorMsg: {
    fontSize: 13, color: ERROR_C, fontFamily: "Inter_400Regular",
    textAlign: "center", marginBottom: 2,
  },

  successRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, marginBottom: 2,
  },
  successMsg: { fontSize: 13, color: SUCCESS, fontFamily: "Inter_500Medium" },

  resendRow: { alignItems: "center", paddingVertical: 10 },
  resendCountdown: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#AAAAAA",
  },
  resendTimer: { fontFamily: "Inter_600SemiBold", color: BLACK },
  resendNow: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: INDIGO },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center",
  },
  ctaDim:     { backgroundColor: "#E8E8E8" },
  ctaSuccess: { backgroundColor: SUCCESS },
  ctaText:    { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },
});
