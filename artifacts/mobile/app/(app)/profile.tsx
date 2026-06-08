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

const BLACK  = "#000000";
const GRAY5  = "#6B7280";
const GRAY4  = "#9CA3AF";
const LIME   = "#d4ff00";
const INDIGO = "#6366f1";

const MENU = [
  { key: "member",   label: "Member ID",         icon: "grid"        as const },
  { key: "settings", label: "Settings",           icon: "settings"    as const },
  { key: "privacy",  label: "Privacy & Security", icon: "lock"        as const },
  { key: "help",     label: "Help Center",        icon: "help-circle" as const },
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
            <Feather name="chevron-left" size={22} color={BLACK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Profile</Text>
          <View style={s.headerBtn} />
        </View>

        {/* ── Avatar + name ── */}
        <View style={s.avatarSection}>
          <LinearGradient
            colors={["#D1D5DB", "#9CA3AF"]}
            style={s.avatarCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={s.avatarInitials}>JL</Text>
          </LinearGradient>
          <Text style={s.name}>Jennifer Lopez</Text>
          <Text style={s.accountType}>Personal Account</Text>
        </View>

        {/* ── Invite banner ── */}
        <TouchableOpacity activeOpacity={0.88} style={{ marginBottom: 28 }}>
          <LinearGradient
            colors={["#6366f1", "#7c3aed", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.bannerCircle1} />
            <View style={s.bannerCircle2} />
            <Text style={s.bannerTitle}>{"Invite a friend and\nboth earn cashback"}</Text>
            <View style={s.bannerLink}>
              <Text style={s.bannerLinkText}>Invite friends</Text>
              <Feather name="arrow-right" size={16} color={LIME} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Menu ── */}
        <View style={s.menuCard}>
          {MENU.map((item, idx) => (
            <React.Fragment key={item.key}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.65}>
                <View style={s.menuIconWrap}>
                  <Feather name={item.icon} size={20} color={INDIGO} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color={GRAY4} />
              </TouchableOpacity>
              {idx < MENU.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}

          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.65}>
            <View style={[s.menuIconWrap, { backgroundColor: "#FEF2F2" }]}>
              <Feather name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={[s.menuLabel, { color: "#EF4444" }]}>Log Out</Text>
            <Feather name="chevron-right" size={18} color={GRAY4} />
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
    justifyContent: "space-between", marginBottom: 28,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },

  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  avatarInitials: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 4 },
  accountType: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },

  banner: {
    borderRadius: 28, padding: 24, overflow: "hidden",
    minHeight: 140, justifyContent: "center",
  },
  bannerCircle1: {
    position: "absolute", top: 32, right: 32,
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bannerCircle2: {
    position: "absolute", bottom: 32, right: 64,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bannerTitle: {
    color: "#FFFFFF", fontSize: 24, fontFamily: "Inter_700Bold",
    lineHeight: 32, marginBottom: 16,
  },
  bannerLink: { flexDirection: "row", alignItems: "center", gap: 8 },
  bannerLinkText: { color: LIME, fontSize: 16, fontFamily: "Inter_600SemiBold" },

  menuCard: { paddingBottom: 4 },
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 16, gap: 16,
  },
  menuIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: BLACK },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB", marginLeft: 60,
  },
});
