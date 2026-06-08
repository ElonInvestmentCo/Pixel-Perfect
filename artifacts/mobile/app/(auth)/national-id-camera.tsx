import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OF } from "@/components/onboarding";

const LIME = "#C8FF00";
const DARK = "#1C1C2E";

export default function NationalIDCameraScreen() {
  const insets = useSafeAreaInsets();

  const handleCapture = useCallback(() => {
    router.push("/(auth)/upload-selfie");
  }, []);

  return (
    <View style={[s.root, { paddingTop: insets.top + 14 }]}>
      {/* Close */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Feather name="x" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={s.title}>National ID</Text>
      <Text style={s.subtitle}>Take a photo of the front of your ID</Text>

      {/* Viewfinder / card frame */}
      <View style={s.frameArea}>
        <View style={s.cardPreview}>
          <View style={s.photoBox}>
            <Feather name="user" size={28} color="#1A1A1A" />
          </View>
          <View style={s.linesBlock}>
            <View style={[s.line, { width: "62%" }]} />
            <View style={[s.line, { width: "46%" }]} />
            <View style={[s.line, { width: "52%" }]} />
            <View style={s.flagRow}>
              <View style={[s.line, { width: "25%" }]} />
              <View style={[s.line, { width: "18%" }]} />
              <Text style={s.flagEmoji}>🇸🇬</Text>
            </View>
          </View>
        </View>

        {/* Corner accents */}
        <View style={[s.corner, s.tl]} />
        <View style={[s.corner, s.tr]} />
        <View style={[s.corner, s.bl]} />
        <View style={[s.corner, s.br]} />
      </View>

      {/* Bottom controls */}
      <View style={[s.controls, { paddingBottom: insets.bottom + 24 }]}>
        <View style={s.side} />
        <TouchableOpacity style={s.shutter} activeOpacity={0.85} onPress={handleCapture}>
          <View style={s.shutterCore} />
        </TouchableOpacity>
        <View style={s.side}>
          <TouchableOpacity style={s.flashBtn} activeOpacity={0.7}>
            <Feather name="zap" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK, paddingHorizontal: 24 },

  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 22,
  },

  title:    { fontSize: 28, fontFamily: OF.bold,    color: "#FFFFFF", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: OF.regular, color: "rgba(255,255,255,0.6)", marginBottom: 36 },

  frameArea: {
    flex: 1, alignItems: "center", justifyContent: "center",
    position: "relative", marginHorizontal: -4,
  },
  cardPreview: {
    width: "100%", aspectRatio: 1.586,
    backgroundColor: "#FFFFFF", borderRadius: 14,
    flexDirection: "row", alignItems: "center",
    padding: 16, gap: 14,
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  photoBox: {
    width: 60, height: 60, borderRadius: 8,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  linesBlock: { flex: 1, gap: 9 },
  line: { height: 8, borderRadius: 4, backgroundColor: "#E5E5E5" },
  flagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flagEmoji: { fontSize: 16, marginLeft: "auto" },

  corner: {
    position: "absolute",
    width: 24, height: 24,
    borderColor: LIME, borderWidth: 2.5,
  },
  tl: { top: 0, left: 0,  borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius:     6 },
  tr: { top: 0, right: 0, borderLeftWidth:  0, borderBottomWidth: 0, borderTopRightRadius:    6 },
  bl: { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0,  borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderLeftWidth:  0, borderTopWidth: 0,  borderBottomRightRadius:6 },

  controls: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingTop: 32,
  },
  side: { width: 60, alignItems: "center" },
  shutter: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 4, borderColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
  },
  shutterCore: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: LIME,
  },
  flashBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
});
