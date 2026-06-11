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
const LIME   = "#C8FF00";
const GRAY2  = "#E5E7EB";

const MENU_SECTIONS = [
  {
    title: "Profile",
    items: [
      { key: "kyc",      label: "KYC Verification",  icon: "shield"      as const, iconBg: "#EFF6FF", iconColor: "#3B82F6", badge: "Verified" },
      { key: "security", label: "Security",           icon: "lock"        as const, iconBg: "#FFF7ED", iconColor: "#F97316", badge: null        },
    ],
  },
  {
    title: "Rewards",
    items: [
      { key: "referral", label: "Referral Program",  icon: "users"       as const, iconBg: "#F0FDF4", iconColor: "#22C55E", badge: "Earn $10"  },
    ],
  },
  {
    title: "Preferences",
    items: [
      { key: "settings", label: "Settings",          icon: "settings"    as const, iconBg: "#F5F3FF", iconColor: "#7C3AED", badge: null        },
      { key: "support",  label: "Help & Support",    icon: "help-circle" as const, iconBg: "#FFF1F2", iconColor: "#F43F5E", badge: null        },
    ],
  },
];

const ROUTE_MAP: Record<string, string> = {
  settings: "/settings",
  referral: "/referral",
  support:  "/support",
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();

  function handleItemPress(key: string) {
    const route = ROUTE_MAP[key];
    if (route) router.navigate(route as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.screenTitle}>Account</Text>
          <TouchableOpacity
            style={s.notifBtn}
            activeOpacity={0.75}
            onPress={() => handleItemPress("settings")}
          >
            <Feather name="settings" size={20} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* ── Avatar card ── */}
        <View style={s.avatarCard}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={s.avatarCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={s.avatarInitials}>JL</Text>
          </LinearGradient>
          <View style={s.avatarInfo}>
            <Text style={s.avatarName}>Jennifer Lopez</Text>
            <Text style={s.avatarEmail}>jennifer@payvora.com</Text>
          </View>
          <View style={s.kycBadge}>
            <Feather name="check-circle" size={14} color="#22C55E" />
            <Text style={s.kycLabel}>Verified</Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          <View style={[s.statBox, { borderRightWidth: 1, borderRightColor: GRAY2 }]}>
            <Text style={s.statValue}>$12,765</Text>
            <Text style={s.statLabel}>Balance</Text>
          </View>
          <View style={[s.statBox, { borderRightWidth: 1, borderRightColor: GRAY2 }]}>
            <Text style={s.statValue}>48</Text>
            <Text style={s.statLabel}>Transactions</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>3</Text>
            <Text style={s.statLabel}>Referrals</Text>
          </View>
        </View>

        {/* ── Invite banner ── */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={{ marginBottom: 28 }}
          onPress={() => handleItemPress("referral")}
        >
          <LinearGradient
            colors={["#6366F1", "#7C3AED", "#8B5CF6"]}
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

        {/* ── Menu sections ── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.key}>
                  <TouchableOpacity
                    style={s.menuRow}
                    activeOpacity={0.65}
                    onPress={() => handleItemPress(item.key)}
                  >
                    <View style={[s.menuIconWrap, { backgroundColor: item.iconBg }]}>
                      <Feather name={item.icon} size={20} color={item.iconColor} />
                    </View>
                    <Text style={s.menuLabel}>{item.label}</Text>
                    {item.badge && (
                      <View style={s.menuBadge}>
                        <Text style={s.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={18} color={GRAY4} />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={s.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign out ── */}
        <TouchableOpacity style={s.signOutRow} activeOpacity={0.65}>
          <View style={[s.menuIconWrap, { backgroundColor: "#FEF2F2" }]}>
            <Feather name="log-out" size={20} color="#EF4444" />
          </View>
          <Text style={[s.menuLabel, { color: "#EF4444" }]}>Sign Out</Text>
          <Feather name="chevron-right" size={18} color={GRAY4} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: BLACK },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },

  avatarCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20,
    borderWidth: 1.5, borderColor: "#E5E7EB",
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitials: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  avatarEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
  kycBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 99,
  },
  kycLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#22C55E" },

  statsRow: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    borderRadius: 20, borderWidth: 1.5, borderColor: GRAY2,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 4 },

  banner: {
    borderRadius: 28, padding: 24, overflow: "hidden",
    minHeight: 130, justifyContent: "center",
  },
  bannerCircle1: {
    position: "absolute", top: 20, right: 24,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bannerCircle2: {
    position: "absolute", bottom: 20, right: 60,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bannerTitle: {
    color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold",
    lineHeight: 30, marginBottom: 12,
  },
  bannerLink: { flexDirection: "row", alignItems: "center", gap: 8 },
  bannerLinkText: { color: LIME, fontSize: 15, fontFamily: "Inter_600SemiBold" },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13, fontFamily: "Inter_600SemiBold",
    color: GRAY5, textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: 10, marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20,
    borderWidth: 1.5, borderColor: GRAY2,
    paddingHorizontal: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, gap: 14, minHeight: 44,
  },
  menuIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: BLACK },
  menuBadge: {
    backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 99, marginRight: 4,
  },
  menuBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#22C55E" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GRAY2, marginLeft: 58,
  },

  signOutRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", borderRadius: 20,
    borderWidth: 1.5, borderColor: GRAY2,
    minHeight: 44,
  },
});
