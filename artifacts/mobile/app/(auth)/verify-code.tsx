import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OC, OnboardingHeader } from "@/components/onboarding";

const BLACK   = "#1A1A1A";
const INDIGO  = "#4F46E5";
const SUCCESS = "#16A34A";
const ERROR_C = "#DC2626";
const GRAY    = "#F2F2F2";
const LIME    = OC.lime;

const PAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

const RESEND_SECS = 60;
const DEV_CODE    = "1234";

// ─── Auth service stubs ────────────────────────────────────────────────────────
async function verifyOtp(code: string): Promise<void> {
  // Replace with real API call: POST /api/auth/verify-otp
  if (code !== DEV_CODE) throw new Error("Wrong code. Please try again.");
}

async function resendOtp(_to: string): Promise<void> {
  // Replace with real API call: POST /api/auth/resend-otp
}

// ─── Blinking cursor ──────────────────────────────────────────────────────────
const BlinkingCursor = React.memo(function BlinkingCursor() {
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
});

// ─── Single OTP box ───────────────────────────────────────────────────────────
const OTPBox = React.memo(function OTPBox({
  digit, active, hasError, isSuccess,
}: {
  digit: string; active: boolean; hasError: boolean; isSuccess: boolean;
}) {
  return (
    <View
      style={[
        otp.box,
        active    && otp.active,
        hasError  && otp.error,
        isSuccess && otp.success,
        !active && !hasError && !isSuccess && otp.idle,
      ]}
      accessibilityElementsHidden
    >
      {digit !== "" ? (
        <Text style={[otp.digit, hasError && { color: ERROR_C }, isSuccess && { color: SUCCESS }]}>
          {digit}
        </Text>
      ) : active ? (
        <BlinkingCursor />
      ) : null}
    </View>
  );
});

// ─── Numpad ───────────────────────────────────────────────────────────────────
const NumPad = React.memo(function NumPad({
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
                accessibilityRole="button"
                accessibilityLabel={k === "⌫" ? "Delete" : k === "*" ? "" : k}
                accessibilityElementsHidden={isStar}
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
});

// ─── Screen ───────────────────────────────────────────────────────────────────
type Status = "idle" | "loading" | "success" | "error";

export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = insets.top;
  const botPad = insets.bottom;

  const {
    phone    = "",
    dialCode = "+65",
    mode     = "phone",
    email    = "",
  } = useLocalSearchParams<{
    phone: string; dialCode: string; mode: string; email: string;
  }>();

  const isResetMode = mode === "reset";

  const [code, setCode]           = useState("");
  const [status, setStatus]       = useState<Status>("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [resending, setResending] = useState(false);

  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const hiddenRef   = useRef<TextInput>(null);
  const mountedRef  = useRef(true);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  9, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 65, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 65, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const submit = useCallback(async (c: string) => {
    if (c.length < 4) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await verifyOtp(c);
      if (!mountedRef.current) return;
      setStatus("success");
      const dest = isResetMode ? "/signin" : "/account-reason";
      navTimerRef.current = setTimeout(() => {
        if (mountedRef.current) router.replace(dest);
      }, 1800);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setStatus("error");
      setErrorMsg(e?.message ?? "Invalid code. Please try again.");
      shake();
    }
  }, [shake, isResetMode]);

  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; }, [submit]);

  const handleKey = useCallback((k: string) => {
    if (status === "loading" || status === "success") return;
    if (status === "error") {
      setStatus("idle"); setErrorMsg(""); setCode(""); return;
    }
    setCode((prev) => {
      const next = k === "⌫"     ? prev.slice(0, -1)
        : prev.length < 4         ? prev + k
        : prev;
      if (next.length === 4 && next !== prev) submitRef.current(next);
      return next;
    });
  }, [status]);

  const handleAutofill = useCallback((text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4 && status !== "loading" && status !== "success") {
      submitRef.current(digits);
    }
  }, [status]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setCode(""); setStatus("idle"); setErrorMsg("");
    try {
      const to = isResetMode ? email : `${dialCode}${phone}`;
      await resendOtp(to);
      if (!mountedRef.current) return;
      setCountdown(RESEND_SECS);
    } finally {
      if (mountedRef.current) setResending(false);
    }
  }, [countdown, resending, isResetMode, email, dialCode, phone]);

  const maskedAddress = useMemo(() => {
    if (isResetMode) {
      return email.replace(/(.{2}).+(@.+)/, (_, a, b) => `${a}*****${b}`);
    }
    return phone.length > 3
      ? `${dialCode} ${"*".repeat(Math.max(0, phone.length - 3))}${phone.slice(-3)}`
      : `${dialCode} *****341`;
  }, [isResetMode, email, phone, dialCode]);

  const digits = useMemo(
    () => code.split("").concat(["", "", "", ""]).slice(0, 4),
    [code],
  );

  const isLoading   = status === "loading";
  const isSuccess   = status === "success";
  const hasError    = status === "error";
  const padDisabled = isLoading || isSuccess;
  const doneEnabled = code.length === 4 && !padDisabled;

  const successMsg = isResetMode
    ? "Verified! Redirecting to sign in…"
    : "Verified! Signing you in…";

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

      {/* ── Top content ────────────────────────────────────────────────────────── */}
      <View style={[s.top, { paddingTop: topPad + 14 }]}>
        {/* Shared header: close button + progress + title */}
        <OnboardingHeader
          onClose={() => router.back()}
          title="Verify your Code"
          progress={{ step: 2, total: 4 }}
          gap={0}
        />

        {/* Dynamic subtitle (contains styled nested text — rendered separately) */}
        <Text style={s.subtitle} accessibilityLiveRegion="polite">
          {isResetMode ? "Enter the code we sent to" : "Enter the security code we sent to"}{"\n"}
          <Text style={s.maskedAddr}>{maskedAddress}</Text>
        </Text>

        {/* 4 OTP boxes */}
        <Animated.View
          style={[s.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          accessibilityLabel={`OTP entered: ${code.length} of 4 digits`}
          accessibilityLiveRegion="polite"
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

        {__DEV__ && !isSuccess && (
          <Text style={s.devHint}>
            Test code: <Text style={{ fontFamily: "Inter_600SemiBold" }}>{DEV_CODE}</Text>
          </Text>
        )}

        {hasError && (
          <Text style={s.errorMsg} accessibilityLiveRegion="assertive">{errorMsg}</Text>
        )}

        {isSuccess && (
          <View style={s.successRow} accessibilityLiveRegion="polite">
            <Feather name="check-circle" size={15} color={SUCCESS} />
            <Text style={s.successMsg}>{successMsg}</Text>
          </View>
        )}

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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={resending ? "Sending code…" : "Resend code now"}
                accessibilityState={{ disabled: resending }}
              >
                <Text style={[s.resendNow, resending && { opacity: 0.5 }]}>
                  {resending ? "Sending…" : "Resend code now"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* Done / verify CTA — has tri-state (normal / success) so kept custom */}
        <TouchableOpacity
          style={[
            s.cta,
            !doneEnabled && !isSuccess && s.ctaDim,
            isSuccess && s.ctaSuccess,
            doneEnabled && !isSuccess && s.ctaGlow,
          ]}
          activeOpacity={0.85}
          disabled={!doneEnabled}
          onPress={() => submitRef.current(code)}
          accessibilityRole="button"
          accessibilityLabel={isSuccess ? "Verified" : "Confirm code"}
          accessibilityState={{ disabled: !doneEnabled }}
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

      {/* ── Numpad ─────────────────────────────────────────────────────────────── */}
      <View style={{ paddingBottom: botPad + 6 }}>
        <NumPad onKey={handleKey} disabled={padDisabled} />
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
  row:  { flexDirection: "row", gap: 8, marginBottom: 8 },
  key: {
    flex: 1, height: 62,
    backgroundColor: GRAY, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  keyDim:  { opacity: 0.32 },
  keyText: { fontSize: 26, fontFamily: "Inter_400Regular", color: BLACK },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  hiddenInput: { position: "absolute", left: -9999, height: 1, width: 1, opacity: 0 },
  top: { flex: 1, paddingHorizontal: 22 },

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
  resendCountdown: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#AAAAAA" },
  resendTimer: { fontFamily: "Inter_600SemiBold", color: BLACK },
  resendNow:   { fontSize: 15, fontFamily: "Inter_600SemiBold", color: INDIGO },

  // Custom tri-state CTA (lime / green-success / gray-disabled)
  cta: {
    backgroundColor: "#E8E8E8", borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center",
  },
  ctaGlow: {
    backgroundColor: LIME,
    shadowColor: "#A8D400",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaDim:     { backgroundColor: "#E8E8E8" },
  ctaSuccess: { backgroundColor: SUCCESS },
  ctaText:    { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },
});
