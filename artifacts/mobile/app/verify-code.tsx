import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

const PAD_ROWS = [
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

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

// ─── Close button ─────────────────────────────────────────────────────────────
function CloseBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={close.btn} onPress={onPress} activeOpacity={0.7}>
      <Feather name="x" size={15} color="#999999" />
    </TouchableOpacity>
  );
}
const close = StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EBEBEB",
    alignItems: "center", justifyContent: "center",
    marginBottom: 28,
  },
});

// ─── OTP Box ──────────────────────────────────────────────────────────────────
function OTPBox({ digit, active }: { digit: string; active: boolean }) {
  const filled = digit !== "";
  return (
    <View style={[otp.box, active ? otp.boxActive : otp.boxIdle]}>
      {filled ? (
        <Text style={otp.digit}>{digit}</Text>
      ) : active ? (
        <BlinkingCursor />
      ) : null}
    </View>
  );
}
const otp = StyleSheet.create({
  box: {
    flex: 1, height: 64, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  boxIdle: { backgroundColor: "#F2F2F2" },
  boxActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2, borderColor: BLACK,
  },
  digit: { fontSize: 26, fontFamily: "Inter_600SemiBold", color: BLACK },
});

// ─── Partial numpad (rows 4–9, *, 0, ⌫) ──────────────────────────────────────
function PartialNumPad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <View style={np.wrap}>
      {PAD_ROWS.map((row, ri) => (
        <View key={ri} style={np.row}>
          {row.map((k) => (
            <TouchableOpacity
              key={k}
              style={np.key}
              activeOpacity={0.55}
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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [code, setCode] = useState("");

  const digits = code.split("").concat(["", "", "", ""]).slice(0, 4);

  const handleKey = (k: string) => {
    if (k === "⌫") setCode((c) => c.slice(0, -1));
    else if (code.length < 4) setCode((c) => c + k);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* ── Top content ─────────────────────────────── */}
      <View style={[s.top, { paddingTop: topPad + 14 }]}>
        <CloseBtn onPress={() => router.back()} />

        <Text style={s.title}>Verify your Code</Text>
        <Text style={s.subtitle}>
          Enter the security code we sent to{"\n"}
          <Text style={s.maskedAddress}>*********341</Text>
        </Text>

        {/* OTP row */}
        <View style={s.otpRow}>
          {[0, 1, 2, 3].map((i) => (
            <OTPBox
              key={i}
              digit={digits[i]}
              active={i === code.length && code.length < 4}
            />
          ))}
        </View>

        {/* Resend link */}
        <TouchableOpacity style={s.resendRow}>
          <Text style={s.resendText}>Didn't receive a code?</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* Done CTA */}
        <TouchableOpacity style={s.cta} activeOpacity={0.85}>
          <Text style={s.ctaText}>Done</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </View>

      {/* ── Partial numpad ──────────────────────────── */}
      <View style={{ paddingBottom: botPad + 6 }}>
        <PartialNumPad onKey={handleKey} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { flex: 1, paddingHorizontal: 22 },

  title: {
    fontSize: 28, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -0.3, marginBottom: 10,
  },
  subtitle: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: BLACK, lineHeight: 23, marginBottom: 24,
  },
  maskedAddress: { fontFamily: "Inter_600SemiBold", color: BLACK },

  otpRow: { flexDirection: "row", gap: 10, marginBottom: 20 },

  resendRow: { alignItems: "center", paddingVertical: 6 },
  resendText: { fontSize: 15, fontFamily: "Inter_500Medium", color: INDIGO },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center",
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
});
