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

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";

const googleLogo = require("../assets/images/google-logo.png");

export default function SignUpScreen() {
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
          {/* X close button */}
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Feather name="x" size={15} color="#999999" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={s.title}>Welcome to PayVora</Text>
          <Text style={s.subtitle}>
            Create a commitment-free profile to{"\n"}explore financial products
          </Text>

          {/* Full name */}
          <Text style={s.label}>Full name</Text>
          <View style={s.field}>
            <TextInput
              style={s.input}
              placeholder="John Doe"
              placeholderTextColor="#C0C0C0"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <Text style={[s.label, { marginTop: 20 }]}>Your email</Text>
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

          {/* Sign Up button */}
          <TouchableOpacity style={s.cta} activeOpacity={0.85}>
            <Text style={s.ctaText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>Or sign up with</Text>
            <View style={s.divLine} />
          </View>

          {/* Apple button */}
          <TouchableOpacity style={s.appleBtn} activeOpacity={0.85}>
            <FontAwesome name="apple" size={20} color="#000000" />
            <Text style={s.appleBtnText}>Apple</Text>
          </TouchableOpacity>

          {/* Google button */}
          <TouchableOpacity style={s.googleBtn} activeOpacity={0.85}>
            <Image source={googleLogo} style={s.googleLogo} resizeMode="contain" />
            <Text style={s.googleBtnText}>Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: "#FFFFFF" },

  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center", justifyContent: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 30, fontFamily: "Inter_700Bold",
    color: BLACK, letterSpacing: -0.3, marginBottom: 10,
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
    marginTop: 30, marginBottom: 18,
  },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: "#E8E8E8" },
  divText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginHorizontal: 12,
  },

  appleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#D0D0D0",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  appleBtnText: {
    fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#000000",
  },

  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#D0D0D0",
    backgroundColor: "#FFFFFF",
  },
  googleLogo: { width: 22, height: 22 },
  googleBtnText: {
    fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#1A1A1A",
  },
});
