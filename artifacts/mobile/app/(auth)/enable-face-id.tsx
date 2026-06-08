import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OF } from "@/components/onboarding";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";

export default function EnableFaceIDScreen() {
  const insets = useSafeAreaInsets();

  const goNext = useCallback(() => {
    router.push("/(auth)/create-pin");
  }, []);

  return (
    <View style={s.root}>
      {/* Purple top with concentric rings */}
      <View style={s.topSection}>
        <View style={s.ring3} />
        <View style={s.ring2} />
        <View style={s.ring1} />
        <View style={s.iconCircle}>
          <MaterialCommunityIcons name="face-recognition" size={34} color={BLACK} />
        </View>
      </View>

      {/* White bottom sheet */}
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
        <Text style={s.title}>Enable Face ID</Text>
        <Text style={s.subtitle}>
          Enabling face ID will give you faster{"\n"}access to your information
        </Text>

        <TouchableOpacity style={s.enableBtn} activeOpacity={0.85} onPress={goNext}>
          <Text style={s.enableText}>Enable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.laterBtn} activeOpacity={0.7} onPress={goNext}>
          <Text style={s.laterText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = "#5B52F0";

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },

  topSection: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  ring3: {
    position: "absolute",
    width: 270, height: 270, borderRadius: 135,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  ring2: {
    position: "absolute",
    width: 196, height: 196, borderRadius: 98,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  ring1: {
    position: "absolute",
    width: 132, height: 132, borderRadius: 66,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  iconCircle: {
    width: 82, height: 82, borderRadius: 41,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "center",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 36,
    alignItems: "center",
  },
  title: {
    fontSize: 27, fontFamily: OF.bold, color: "#1A1A1A", marginBottom: 12,
  },
  subtitle: {
    fontSize: 14, fontFamily: OF.regular, color: "#888888",
    textAlign: "center", lineHeight: 21, marginBottom: 32,
  },
  enableBtn: {
    width: "100%", height: 56, borderRadius: 16,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  enableText: { fontSize: 16, fontFamily: OF.bold, color: "#1A1A1A" },
  laterBtn: {
    width: "100%", height: 56, borderRadius: 16,
    borderWidth: 1.5, borderColor: "#E0E0E0",
    alignItems: "center", justifyContent: "center",
  },
  laterText: { fontSize: 16, fontFamily: OF.semibold, color: "#1A1A1A" },
});
