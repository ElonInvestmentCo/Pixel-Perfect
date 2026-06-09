import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";
const RED    = "#DC2626";

export default function SettingsScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();
  const { clearSession } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setSigningOut(true);
            try {
              await clearSession();
              const rootNav = navigation.getParent() ?? navigation;
              rootNav.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: "index" }] }),
              );
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  }, [clearSession, navigation]);

  return (
    <View style={[s.root, { paddingTop: insets.top + 16 }]}>
      <Text style={s.screenTitle}>Settings</Text>

      <View style={s.placeholder}>
        <View style={s.iconWrap}>
          <Feather name="settings" size={32} color={INDIGO} />
        </View>
        <Text style={s.comingSoon}>Coming Soon</Text>
        <Text style={s.sub}>
          Profile, notifications, security preferences, linked accounts, and more — all in one place.
        </Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[s.signOutBtn, signingOut && s.signOutBtnDisabled]}
        onPress={handleSignOut}
        disabled={signingOut}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        {signingOut ? (
          <ActivityIndicator size="small" color={RED} />
        ) : (
          <Feather name="log-out" size={16} color={RED} />
        )}
        <Text style={s.signOutText}>
          {signingOut ? "Signing out…" : "Sign Out"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: insets.bottom + 16 }} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EBEBEB",
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    marginBottom: 32,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: 16,
  },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: BLACK,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8A8A8A",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },

  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 8,
  },
  signOutBtnDisabled: { opacity: 0.6 },
  signOutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: RED,
  },
});
