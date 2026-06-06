import { Feather, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
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

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

const googleLogo = require("../assets/images/google-logo.png");

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [showPw, setShowPw] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: topPad + 14, paddingBottom: botPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Emoji avatar */}
          <View style={s.avatarWrap}>
            <Text style={s.avatarEmoji}>🎒</Text>
          </View>

          {/* Title */}
          <Text style={s.title}>Welcome back</Text>
          <Text style={s.subtitle}>Sign in to your account</Text>

          {/* Email */}
          <Text style={s.label}>Your email</Text>
          <View style={s.field}>
            <TextInput
              style={s.input}
              placeholder="johndoe@mail.com"
              placeholderTextColor="#C0C0C0"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={[s.label, { marginTop: 20 }]}>Password</Text>
          <View style={s.field}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder=""
              placeholderTextColor="#C0C0C0"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={s.eyeBtn}>
              <Feather name={showPw ? "eye" : "eye-off"} size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>

          {/* Sign In button */}
          <TouchableOpacity style={s.cta} activeOpacity={0.85}>
            <Text style={s.ctaText}>Sign In</Text>
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity style={s.forgotRow}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>Or sign in with</Text>
            <View style={s.divLine} />
          </View>

          {/* Social */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}>
              <FontAwesome name="apple" size={20} color={BLACK} />
              <Text style={s.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.googleBtn} activeOpacity={0.85}>
              <Image source={googleLogo} style={s.googleImg} resizeMode="cover" />
            </TouchableOpacity>
          </View>
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
    marginBottom: 28,
  },
  avatarEmoji: { fontSize: 28 },

  title: {
    fontSize: 30, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -0.3, marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#888888", lineHeight: 22, marginBottom: 32,
  },

  label: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#888888", marginBottom: 10,
  },
  field: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F5F5", borderRadius: 12,
    height: 56, paddingHorizontal: 16,
  },
  input: {
    flex: 1, fontSize: 15, fontFamily: "Inter_400Regular",
    color: BLACK, height: "100%",
    outlineStyle: "none",
  } as any,
  eyeBtn: { paddingLeft: 8 },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 58,
    alignItems: "center", justifyContent: "center",
    marginTop: 30, marginBottom: 16,
  },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },

  forgotRow: { alignItems: "center", paddingVertical: 4, marginBottom: 28 },
  forgotText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: INDIGO },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: "#E8E8E8" },
  divText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginHorizontal: 12,
  },

  socialRow: { flexDirection: "row", gap: 14 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
    borderWidth: 1.5, borderColor: "#E0E0E0",
    borderRadius: 14, height: 56,
    backgroundColor: "#FFFFFF",
  },
  socialText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
  googleBtn: {
    flex: 1, borderRadius: 14, height: 56,
    overflow: "hidden", backgroundColor: "#000000",
  },
  googleImg: { width: "100%", height: "100%" },
});
