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

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4338CA";

function GoogleG() {
  return (
    <View style={{ flexDirection: "row" }}>
      {(["G","o","o","g","l","e"] as const).map((c, i) => {
        const colors = ["#4285F4","#EA4335","#FBBC05","#34A853","#EA4335","#34A853"];
        return <Text key={i} style={{ fontSize:14, fontFamily:"Inter_700Bold", color:colors[i] }}>{c}</Text>;
      })}
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

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [showPw, setShowPw] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: topPad + 14, paddingBottom: botPad + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top nav */}
          <View style={s.navRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={BLACK} />
            </TouchableOpacity>

            {/* QPay badge */}
            <View style={s.badge}>
              <Text style={s.badgeText}>QPay</Text>
            </View>
          </View>

          {/* Greeting */}
          <View style={s.greetBlock}>
            <Text style={s.greet}>Welcome back 👋</Text>
            <Text style={s.greetSub}>Sign in to continue to QPay</Text>
          </View>

          {/* Social first (switched layout) */}
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

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>or sign in with email</Text>
            <View style={s.divLine} />
          </View>

          {/* Email */}
          <Text style={s.label}>Email address</Text>
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
              placeholder="Enter your password"
              placeholderTextColor="#CCCCCC"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ paddingRight: 16 }}>
              <Feather name={showPw ? "eye" : "eye-off"} size={18} color="#AAAAAA" />
            </TouchableOpacity>
          </FieldRow>

          {/* Forgot */}
          <TouchableOpacity style={s.forgotRow}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* CTA */}
          <TouchableOpacity style={s.cta} activeOpacity={0.85}>
            <Text style={s.ctaText}>Sign In</Text>
          </TouchableOpacity>

          {/* Switch to sign up */}
          <TouchableOpacity style={s.switchLink} onPress={() => router.replace("/signup")}>
            <Text style={s.switchText}>
              Don't have an account?{"  "}
              <Text style={s.switchBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: "#FFFFFF" },

  navRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 36,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: LIME, letterSpacing: 0.5 },

  greetBlock: { marginBottom: 28 },
  greet: { fontSize: 30, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.3, marginBottom: 6 },
  greetSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#888888" },

  socialRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#E0E0E0",
    borderRadius: 14, height: 52,
  },
  socialText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  divLine: { flex: 1, height: 1, backgroundColor: "#EEEEEE" },
  divText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#AAAAAA", marginHorizontal: 10 },

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
    color: BLACK, paddingHorizontal: 14, height: "100%",
    outlineStyle: "none",
  } as any,

  forgotRow: { alignSelf: "flex-end", marginTop: 12, marginBottom: 24 },
  forgotText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: INDIGO },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 56,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },

  switchLink: { alignItems: "center", paddingVertical: 4 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888" },
  switchBold: { fontFamily: "Inter_700Bold", color: BLACK },
});
