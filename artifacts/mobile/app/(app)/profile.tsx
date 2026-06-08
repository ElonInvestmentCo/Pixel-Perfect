import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#1A1A1A";
const GRAY   = "#9CA3AF";
const INDIGO = "#5B3EFF";
const LIME   = "#C8FF00";

const MENU = [
  { key: "member",   label: "Member ID",         icon: "grid"        as const, iconBg: "#F0EDFF", iconColor: INDIGO },
  { key: "settings", label: "Settings",           icon: "settings"    as const, iconBg: "#F0EDFF", iconColor: INDIGO },
  { key: "privacy",  label: "Privacy & Security", icon: "lock"        as const, iconBg: "#F0EDFF", iconColor: INDIGO },
  { key: "help",     label: "Help Center",        icon: "help-circle" as const, iconBg: "#F0EDFF", iconColor: INDIGO },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={20} color={BLACK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Profile</Text>
          <View style={s.headerBtn} />
        </View>

        {/* ── Avatar + name ── */}
        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarInitials}>JL</Text>
          </View>
          <Text style={s.name}>Jennifer Lopez</Text>
          <Text style={s.accountType}>Personal Account</Text>
        </View>

        {/* ── Invite banner ── */}
        <TouchableOpacity activeOpacity={0.88} style={{ marginBottom: 28 }}>
          <LinearGradient
            colors={["#5540FF", "#6B52FF", "#7B62FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.bannerCircle1} />
            <View style={s.bannerRing1} />
            <View style={s.bannerRing2} />
            <View style={s.bannerCircle2} />
            <View style={{ maxWidth: "62%" }}>
              <Text style={s.bannerTitle}>{"Invite a friend and\nboth earn cashback"}</Text>
              <Text style={s.bannerLink}>Invite friends →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Menu ── */}
        <View style={s.menuCard}>
          {MENU.map((item, idx) => (
            <React.Fragment key={item.key}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.65}>
                <View style={[s.menuIconWrap, { backgroundColor: item.iconBg }]}>
                  <Feather name={item.icon} size={18} color={item.iconColor} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color="#ABABAB" />
              </TouchableOpacity>
              {idx < MENU.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}

          {/* Log Out */}
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.65}>
            <View style={[s.menuIconWrap, { backgroundColor: "#FFF0EE" }]}>
              <Feather name="log-out" size={18} color="#FF3B30" />
            </View>
            <Text style={[s.menuLabel, { color: "#FF3B30" }]}>Log Out</Text>
            <Feather name="chevron-right" size={16} color="#ABABAB" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 24,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.2 },

  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
    marginBottom: 14, borderWidth: 3, borderColor: "#F3F4F6",
  },
  avatarInitials: {
    fontSize: 28, fontFamily: "Inter_700Bold", color: "#8A8A8A", letterSpacing: 1,
  },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 4, letterSpacing: -0.3 },
  accountType: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY },

  banner: {
    borderRadius: 22, padding: 22,
    overflow: "hidden", minHeight: 110, justifyContent: "center",
  },
  bannerCircle1: {
    position: "absolute", right: -24, top: -28,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bannerRing1: {
    position: "absolute", right: 14, top: 15,
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.18)",
  },
  bannerRing2: {
    position: "absolute", right: 34, top: 35,
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
  },
  bannerCircle2: {
    position: "absolute", right: -10, bottom: -30,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bannerTitle: {
    color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold",
    lineHeight: 28, letterSpacing: -0.4,
  },
  bannerLink: {
    color: LIME, fontSize: 14, fontFamily: "Inter_700Bold",
    marginTop: 12, letterSpacing: -0.1,
  },

  menuCard: { paddingBottom: 4 },
  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 16 },
  menuIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: BLACK },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.06)", marginLeft: 58,
  },
});
