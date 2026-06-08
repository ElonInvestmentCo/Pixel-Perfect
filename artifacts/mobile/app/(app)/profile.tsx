import { Feather } from "@expo/vector-icons";
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

// ─── Tokens ───────────────────────────────────────────────────────────────────
const WHITE   = "#FFFFFF";
const BLACK   = "#1A1A1A";
const GRAY    = "#9CA3AF";
const INDIGO  = "#4F46E5";
const DIVIDER = "#F2F2F2";
const ICON_BG = "#F4F4F5";

// ─── Menu rows ────────────────────────────────────────────────────────────────
const MENU: {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  iconBg: string;
  iconColor: string;
  textColor: string;
}[] = [
  {
    key: "member",
    label: "Member ID",
    icon: "grid",
    iconBg: ICON_BG,
    iconColor: BLACK,
    textColor: BLACK,
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    iconBg: ICON_BG,
    iconColor: BLACK,
    textColor: BLACK,
  },
  {
    key: "privacy",
    label: "Privacy & Security",
    icon: "lock",
    iconBg: ICON_BG,
    iconColor: BLACK,
    textColor: BLACK,
  },
  {
    key: "help",
    label: "Help Center",
    icon: "help-circle",
    iconBg: ICON_BG,
    iconColor: BLACK,
    textColor: BLACK,
  },
];

// ─── Profile Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={20} color={BLACK} />
          </TouchableOpacity>

          <Text style={s.headerTitle}>Profile</Text>

          {/* Invisible spacer keeps title centered */}
          <View style={s.backBtn} pointerEvents="none" />
        </View>

        {/* ── Avatar + name ────────────────────────────────────────────────── */}
        <View style={s.avatarSection}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarInitials}>JL</Text>
            </View>
          </View>

          <Text style={s.name}>Jennifer Lopez</Text>
          <Text style={s.accountType}>Personal Account</Text>
        </View>

        {/* ── Invite banner ────────────────────────────────────────────────── */}
        <TouchableOpacity style={s.banner} activeOpacity={0.88}>
          <View style={s.bannerCircle1} />
          <View style={s.bannerCircle2} />
          <Text style={s.bannerText}>{"Invite a friend and\nboth earn cashback"}</Text>
        </TouchableOpacity>

        {/* ── Menu list ────────────────────────────────────────────────────── */}
        <View style={s.menuList}>
          {MENU.map((item, idx) => (
            <React.Fragment key={item.key}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.65}>
                <View style={[s.menuIconWrap, { backgroundColor: item.iconBg }]}>
                  <Feather name={item.icon} size={18} color={item.iconColor} />
                </View>
                <Text style={[s.menuLabel, { color: item.textColor }]}>
                  {item.label}
                </Text>
                <Feather name="chevron-right" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              {idx < MENU.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}

          {/* ── Log Out ────────────────────────────────────────────────────── */}
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.65}>
            <View style={[s.menuIconWrap, { backgroundColor: "#FEF2F2" }]}>
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>
            <Text style={[s.menuLabel, { color: "#EF4444" }]}>Log Out</Text>
            <Feather name="chevron-right" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: WHITE },
  scroll: { paddingHorizontal: 20 },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    letterSpacing: -0.2,
  },

  // ── Avatar
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitials: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#8A8A8A",
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  accountType: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: GRAY,
  },

  // ── Invite banner
  banner: {
    backgroundColor: INDIGO,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 30,
    overflow: "hidden",
    minHeight: 90,
    justifyContent: "center",
  },
  bannerCircle1: {
    position: "absolute",
    right: -20,
    top: -32,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bannerCircle2: {
    position: "absolute",
    right: 60,
    bottom: -48,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  bannerText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    lineHeight: 26,
    zIndex: 1,
  },

  // ── Menu list
  menuList: { paddingBottom: 8 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: BLACK,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: 54,
  },
});
