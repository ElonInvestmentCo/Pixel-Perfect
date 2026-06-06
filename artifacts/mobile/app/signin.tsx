import { Feather, FontAwesome } from "@expo/vector-icons";
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

const LIME    = "#C8FF00";
const BLACK   = "#1A1A1A";
const INDIGO  = "#4338CA";

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold" }}>
        <Text style={{ color: "#4285F4" }}>G</Text>
      </Text>
    </View>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <View style={s.dividerRow}>
      <View style={s.dividerLine} />
      <Text style={s.dividerText}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: topPad + 12, paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet emoji avatar */}
        <View style={s.avatarWrap}>
          <Text style={s.avatarEmoji}>🎒</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.subtitle}>Sign in to your account</Text>

        {/* Email */}
        <Text style={s.label}>Your email</Text>
        <View style={s.inputBox}>
          <TextInput
            style={s.input}
            placeholder="johndoe@mail.com"
            placeholderTextColor="#BBBBBB"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        {/* Password */}
        <Text style={[s.label, { marginTop: 18 }]}>Password</Text>
        <View style={s.inputBox}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder=""
            placeholderTextColor="#BBBBBB"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="done"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        {/* Sign In button */}
        <TouchableOpacity style={s.primaryBtn} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>

        {/* Forgot password */}
        <TouchableOpacity style={s.forgotRow} activeOpacity={0.7}>
          <Text style={s.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Divider */}
        <Divider label="Or sign in with" />

        {/* Social buttons */}
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
            <FontAwesome name="apple" size={20} color={BLACK} />
            <Text style={s.socialBtnText}>Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
            <GoogleIcon />
            <Text style={s.socialBtnText}>Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#888888",
    lineHeight: 22,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#888888",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: BLACK,
    height: "100%",
    outlineStyle: "none",
  } as any,
  eyeBtn: {
    paddingLeft: 10,
  },
  primaryBtn: {
    backgroundColor: LIME,
    borderRadius: 28,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginBottom: 16,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: BLACK,
  },
  forgotRow: {
    alignItems: "center",
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: INDIGO,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8E8E8",
  },
  dividerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#AAAAAA",
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    height: 54,
    backgroundColor: "#FFFFFF",
  },
  socialBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: BLACK,
  },
});
