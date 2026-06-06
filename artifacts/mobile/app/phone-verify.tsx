import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";
const TEAL  = "#0D9488";

const PAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "⌫"],
];

function NumPad({
  value,
  onChange,
  bottomLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  bottomLabel?: string;
}) {
  return (
    <View style={np.wrap}>
      {PAD_ROWS.map((row, ri) => (
        <View key={ri} style={np.row}>
          {row.map((k) => (
            <TouchableOpacity
              key={k}
              style={np.key}
              activeOpacity={0.6}
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
      {bottomLabel && (
        <TouchableOpacity style={{ paddingVertical: 8 }}>
          <Text style={np.bottomLabel}>{bottomLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PhoneVerifyScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [phone, setPhone] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={[s.top, { paddingTop: topPad + 14 }]}>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={15} color="#999999" />
        </TouchableOpacity>

        <Text style={s.title}>{"Verify your phone\nnumber with a code"}</Text>
        <Text style={s.subtitle}>We will send you confirmation code</Text>

        <Text style={s.label}>Phone number</Text>
        <View style={s.phoneRow}>
          <View style={s.countryBox}>
            <Text style={s.countryText}>+65</Text>
          </View>
          <View style={s.phoneInputBox}>
            <Text style={s.phoneDisplayText} numberOfLines={1}>{phone}</Text>
            <View style={s.cursor} />
          </View>
        </View>

        <TouchableOpacity style={s.cta} activeOpacity={0.85}>
          <Text style={s.ctaText}>Send Code</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingBottom: botPad + 8 }}>
        <NumPad
          value={phone}
          onChange={setPhone}
          bottomLabel="Resend code via email"
        />
      </View>
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
  keyText: {
    fontSize: 26, fontFamily: "Inter_400Regular", color: BLACK,
  },
  bottomLabel: {
    textAlign: "center", fontSize: 14,
    fontFamily: "Inter_500Medium", color: TEAL,
  },
});

const s = StyleSheet.create({
  top: { flex: 1, paddingHorizontal: 22 },

  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EBEBEB",
    alignItems: "center", justifyContent: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 28, fontFamily: "Inter_700Bold",
    color: BLACK, lineHeight: 36,
    letterSpacing: -0.3, marginBottom: 10,
  },
  subtitle: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#888888", marginBottom: 28,
  },
  label: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#888888", marginBottom: 10,
  },

  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  countryBox: {
    width: 62, height: 50,
    backgroundColor: "#F2F2F2", borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  countryText: {
    fontSize: 15, fontFamily: "Inter_500Medium", color: BLACK,
  },
  phoneInputBox: {
    flex: 1, height: 50,
    borderWidth: 1.5, borderColor: BLACK,
    borderRadius: 10, flexDirection: "row",
    alignItems: "center", paddingHorizontal: 14,
  },
  phoneDisplayText: {
    fontSize: 16, fontFamily: "Inter_400Regular", color: BLACK, flex: 1,
  },
  cursor: { width: 2, height: 20, backgroundColor: BLACK },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 56,
    alignItems: "center", justifyContent: "center",
  },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
});
