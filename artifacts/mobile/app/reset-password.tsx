import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [email, setEmail] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingTop: topPad + 14, paddingBottom: botPad + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 💰 emoji avatar */}
          <View style={s.avatarWrap}>
            <Text style={s.avatarEmoji}>💰</Text>
          </View>

          <Text style={s.title}>Reset Password</Text>
          <Text style={s.subtitle}>
            Enter the email address associated{"\n"}with your account
          </Text>

          <Text style={s.label}>Your email</Text>

          {/* Bordered input — matches mockup (NOT gray-filled) */}
          <View style={s.borderedField}>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="johndoe@mail.com"
              placeholderTextColor="#C0C0C0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              autoFocus
              onSubmitEditing={() => router.push("/verify-code")}
            />
          </View>

          <TouchableOpacity
            style={s.cta}
            activeOpacity={0.85}
            onPress={() => router.push("/verify-code")}
          >
            <Text style={s.ctaText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: "#FFFFFF" },

  avatarWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "#FFF3DC",
    alignItems: "center", justifyContent: "center",
    marginBottom: 26,
  },
  avatarEmoji: { fontSize: 28 },

  title: {
    fontSize: 30, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -0.5, marginBottom: 10,
  },
  subtitle: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#555555", lineHeight: 23, marginBottom: 28,
  },

  label: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#888888", marginBottom: 10,
  },
  borderedField: {
    height: 52, borderWidth: 1.5, borderColor: BLACK,
    borderRadius: 12, paddingHorizontal: 16,
    justifyContent: "center", marginBottom: 26,
  },
  input: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: BLACK, outlineStyle: "none",
  } as any,

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center",
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
});
