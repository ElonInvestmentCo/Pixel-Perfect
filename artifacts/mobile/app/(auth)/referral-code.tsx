import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useCallback } from "react";
import {
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OF } from "@/components/onboarding";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";
const PURPLE = "#5B52F0";

export default function ReferralCodeScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  const goHome = useCallback(() => {
    const rootNav = navigation.getParent() ?? navigation;
    rootNav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "(app)" }] }));
  }, [navigation]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: "Join PayVora with my referral code R47865BM and we both earn cashback!" });
    } catch {}
    goHome();
  }, [goHome]);

  return (
    <View style={s.root}>
      {/* ─── Purple top section ─────────────────────────────────────────────── */}
      <View style={[s.topSection, { paddingTop: insets.top + 16 }]}>
        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={goHome} activeOpacity={0.7}>
          <Feather name="x" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Decorative sparkles */}
        <Text style={[s.sparkle, { top: insets.top + 60,  left: 32 }]}>+</Text>
        <Text style={[s.sparkle, { top: insets.top + 100, right: 44 }]}>◆</Text>
        <Text style={[s.sparkle, { bottom: 90,            left: 28 }]}>◆</Text>
        <Text style={[s.sparkle, { bottom: 70,            right: 36 }]}>+</Text>

        {/* Halo rings + envelope */}
        <View style={s.haloOuter}>
          <View style={s.haloInner}>
            <View style={s.envelope}>
              <View style={s.envelopeFlap} />
              <View style={s.letter}>
                <Text style={s.letterText}>R.</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={s.inviteTitle}>Invite and Get $20</Text>
        <Text style={s.inviteSubtitle}>
          Invite a friend and both earn cashback.{"\n"}When a friend get QPay card
        </Text>

        {/* Drag indicator */}
        <View style={s.handle} />
      </View>

      {/* ─── White bottom sheet ─────────────────────────────────────────────── */}
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
        {/* Referral code */}
        <View style={s.codeRow}>
          <Text style={s.codeText}>R47865BM</Text>
          <TouchableOpacity
            style={s.copyBtn}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <Feather name="copy" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Share button */}
        <TouchableOpacity style={s.shareBtn} activeOpacity={0.85} onPress={handleShare}>
          <Text style={s.shareBtnText}>Share</Text>
        </TouchableOpacity>

        {/* They get */}
        <Text style={s.benefitHeading}>They get:</Text>
        <View style={s.benefitRow}>
          <View style={s.checkCircle}>
            <Feather name="check" size={11} color="#888" />
          </View>
          <Text style={s.benefitText}>
            A free transfer up to{" "}
            <Text style={s.highlight}>$1000</Text>
            {" "}when{"\n"}they sign up with your link
          </Text>
        </View>

        {/* You get */}
        <Text style={[s.benefitHeading, { marginTop: 16 }]}>You get:</Text>
        <View style={s.benefitRow}>
          <View style={s.checkCircle}>
            <Feather name="check" size={11} color="#888" />
          </View>
          <Text style={s.benefitText}>
            <Text style={s.highlight}>$120</Text>
            {" "}when 3 friends send over{"\n"}
            <Text style={{ textDecorationLine: "line-through" }}>$600 in charges</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },

  topSection: {
    flex: 1, alignItems: "center",
    paddingHorizontal: 24, position: "relative",
  },

  closeBtn: {
    position: "absolute", top: 0, left: 24,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },

  sparkle: {
    position: "absolute",
    fontSize: 18, color: "rgba(255,255,255,0.65)", fontWeight: "700",
  },

  haloOuter: {
    width: 166, height: 166, borderRadius: 83,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    marginTop: 44, marginBottom: 26,
  },
  haloInner: {
    width: 114, height: 114, borderRadius: 57,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },

  envelope: {
    width: 72, height: 54, borderRadius: 8,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "flex-end",
    overflow: "hidden", paddingBottom: 6,
  },
  envelopeFlap: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 28, backgroundColor: "#AEDD00",
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  letter: {
    width: 46, height: 36, borderRadius: 5,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    zIndex: 1,
  },
  letterText: { fontSize: 15, fontFamily: OF.bold, color: INDIGO },

  inviteTitle: {
    fontSize: 26, fontFamily: OF.bold, color: "#FFFFFF",
    textAlign: "center", marginBottom: 10,
  },
  inviteSubtitle: {
    fontSize: 14, fontFamily: OF.regular,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center", lineHeight: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.38)",
    marginTop: 22,
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 24,
  },

  codeRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F5F5", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 14,
  },
  codeText: { flex: 1, fontSize: 17, fontFamily: OF.semibold, color: BLACK },
  copyBtn:  { padding: 4 },

  shareBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 56,
    alignItems: "center", justifyContent: "center", marginBottom: 22,
  },
  shareBtnText: { fontSize: 16, fontFamily: OF.bold, color: BLACK },

  benefitHeading: {
    fontSize: 14, fontFamily: OF.semibold, color: BLACK, marginBottom: 8,
  },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: "#D0D0D0",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 1,
  },
  benefitText: {
    fontSize: 13, fontFamily: OF.regular,
    color: "#555555", flex: 1, lineHeight: 20,
  },
  highlight: { fontFamily: OF.semibold, color: INDIGO },
});
