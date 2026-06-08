import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";
const LIME   = "#C8FF00";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top + 20 }]}>
      <Text style={s.title}>Profile</Text>

      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>J</Text>
        </View>
        <Text style={s.name}>Jennifer Lopez</Text>
        <Text style={s.email}>jennifer@mail.com</Text>
      </View>

      {/* Menu items */}
      {[
        { icon: "user",       label: "Personal Info" },
        { icon: "bell",       label: "Notifications" },
        { icon: "shield",     label: "Security" },
        { icon: "help-circle",label: "Help & Support" },
      ].map((item) => (
        <TouchableOpacity key={item.label} style={s.row} activeOpacity={0.7}>
          <View style={s.rowIcon}>
            <Feather name={item.icon as any} size={18} color={INDIGO} />
          </View>
          <Text style={s.rowLabel}>{item.label}</Text>
          <Feather name="chevron-right" size={16} color="#CCCCCC" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={s.signOutBtn}
        activeOpacity={0.85}
        onPress={() => router.replace("/")}
      >
        <Feather name="log-out" size={16} color={BLACK} />
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: "#F7F7F7", paddingHorizontal: 20,
  },
  title: {
    fontSize: 24, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 24,
  },

  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: INDIGO, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  name:  { fontSize: 20, fontFamily: "Inter_700Bold",    color: BLACK,     marginBottom: 4 },
  email: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888" },

  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 16,
    marginBottom: 10, gap: 14,
  },
  rowIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: BLACK },

  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, marginTop: 24,
    backgroundColor: LIME, borderRadius: 16, paddingVertical: 16,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },
});
