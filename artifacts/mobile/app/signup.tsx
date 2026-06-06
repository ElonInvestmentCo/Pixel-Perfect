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

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";

function GoogleG() {
  const COLORS = ["#4285F4","#EA4335","#FBBC05","#34A853"];
  const CHARS  = ["G","o","o","g"];
  return (
    <View style={{ flexDirection:"row" }}>
      {CHARS.map((c,i) => (
        <Text key={i} style={{ fontSize:14, fontFamily:"Inter_700Bold", color:COLORS[i] }}>{c}</Text>
      ))}
      <Text style={{ fontSize:14, fontFamily:"Inter_700Bold", color:"#EA4335" }}>l</Text>
      <Text style={{ fontSize:14, fontFamily:"Inter_700Bold", color:"#34A853" }}>e</Text>
    </View>
  );
}

function FieldRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <View style={s.fieldOuter}>
      <View style={s.fieldIcon}>
        <Feather name={icon as any} size={17} color="#AAAAAA" />
      </View>
      <View style={s.fieldDivider} />
      {children}
    </View>
  );
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [showPw, setShowPw] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: LIME }}>
      {/* Lime header */}
      <View style={[s.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={BLACK} />
        </TouchableOpacity>

        <View style={s.logoWrap}>
          <Text style={s.logoQ}>Q</Text>
        </View>
        <Text style={s.headerTitle}>QPay</Text>
        <Text style={s.headerSub}>Your money, your way</Text>
      </View>

      {/* White card body */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={s.sheet}
          contentContainerStyle={[s.sheetContent, { paddingBottom: botPad + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Sign up to get started with QPay</Text>

          {/* Full name */}
          <Text style={s.label}>Full name</Text>
          <FieldRow icon="user">
            <TextInput
              style={s.input}
              placeholder="John Doe"
              placeholderTextColor="#CCCCCC"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </FieldRow>

          {/* Email */}
          <Text style={[s.label, { marginTop: 16 }]}>Email address</Text>
          <FieldRow icon="mail">
            <TextInput
              style={s.input}
              placeholder="johndoe@mail.com"
              placeholderTextColor="#CCCCCC"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </FieldRow>

          {/* Password */}
          <Text style={[s.label, { marginTop: 16 }]}>Password</Text>
          <FieldRow icon="lock">
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Min. 8 characters"
              placeholderTextColor="#CCCCCC"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ paddingRight: 16 }}>
              <Feather name={showPw ? "eye" : "eye-off"} size={18} color="#AAAAAA" />
            </TouchableOpacity>
          </FieldRow>

          {/* Primary CTA */}
          <TouchableOpacity style={s.cta} activeOpacity={0.85}>
            <Text style={s.ctaText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>or continue with</Text>
            <View style={s.divLine} />
          </View>

          {/* Social */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}>
              <FontAwesome name="apple" size={19} color={BLACK} />
              <Text style={s.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <GoogleG />
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign in link */}
          <TouchableOpacity style={s.switchLink} onPress={() => router.replace("/signin")}>
            <Text style={s.switchText}>
              Already have an account?{"  "}
              <Text style={s.switchBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: LIME,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "flex-start",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  logoWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: BLACK,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  logoQ: { fontSize: 28, fontFamily: "Inter_700Bold", color: LIME },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 4 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#333333" },

  sheet: {
    flex: 1, backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -2,
  },
  sheetContent: { paddingHorizontal: 24, paddingTop: 30 },

  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1A1A1A", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888", marginBottom: 24 },

  label: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#555555", marginBottom: 8 },
  fieldOuter: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F7F7F7", borderRadius: 14,
    borderWidth: 1, borderColor: "#EEEEEE", height: 54,
  },
  fieldIcon: { width: 50, alignItems: "center", justifyContent: "center" },
  fieldDivider: { width: 1, height: 28, backgroundColor: "#E0E0E0" },
  input: {
    flex: 1, fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#1A1A1A", paddingHorizontal: 14, height: "100%",
    outlineStyle: "none",
  } as any,

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 56,
    alignItems: "center", justifyContent: "center",
    marginTop: 28, marginBottom: 20,
  },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1A1A1A" },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: "#EEEEEE" },
  divText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#AAAAAA", marginHorizontal: 12 },

  socialRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#E0E0E0",
    borderRadius: 14, height: 52, backgroundColor: "#FFFFFF",
  },
  socialText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },

  switchLink: { alignItems: "center", paddingVertical: 4 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888" },
  switchBold: { fontFamily: "Inter_700Bold", color: "#1A1A1A" },
});
