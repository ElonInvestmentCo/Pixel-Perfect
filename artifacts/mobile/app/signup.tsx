import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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

import { AppleSignInButton } from "../components/AppleSignInButton";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import {
  isStrongPassword,
  isValidEmail,
  isValidName,
  validateEmail,
  validateName,
  validateSignUpPassword,
} from "../lib/validation";

const isIOS = Platform.OS === "ios";

const LIME    = "#C8FF00";
const BLACK   = "#1A1A1A";
const ERROR_C = "#DC2626";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);

  const [nameErr, setNameErr]         = useState("");
  const [emailErr, setEmailErr]       = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isFormValid = isValidName(name) && isValidEmail(email) && isStrongPassword(password);

  const handleSignUp = () => {
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validateSignUpPassword(password);
    setNameErr(nErr);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (nErr || eErr || pErr) return;
    router.push("/phone-verify");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: topPad + 14, paddingBottom: botPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Close button */}
          <TouchableOpacity
            style={s.closeBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={15} color="#999999" />
          </TouchableOpacity>

          <Text style={s.title} accessibilityRole="header">Welcome to PayVora</Text>
          <Text style={s.subtitle}>
            Create a commitment-free profile to{"\n"}explore financial products
          </Text>

          {/* Full name */}
          <Text style={s.label}>Full name</Text>
          <View style={[s.field, nameErr ? s.fieldError : null]}>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={(v) => { setName(v); if (nameErr) setNameErr(""); }}
              onBlur={() => setNameErr(validateName(name))}
              placeholder="John Doe"
              placeholderTextColor="#C0C0C0"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              accessibilityLabel="Full name"
              accessibilityHint="Enter your full name"
            />
          </View>
          {nameErr ? <Text style={s.fieldErrText} accessibilityLiveRegion="polite">{nameErr}</Text> : null}

          {/* Email */}
          <Text style={[s.label, { marginTop: 20 }]}>Your email</Text>
          <View style={[s.field, emailErr ? s.fieldError : null]}>
            <TextInput
              ref={emailRef}
              style={s.input}
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailErr) setEmailErr(""); }}
              onBlur={() => setEmailErr(validateEmail(email))}
              placeholder="johndoe@mail.com"
              placeholderTextColor="#C0C0C0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email address"
            />
          </View>
          {emailErr ? <Text style={s.fieldErrText} accessibilityLiveRegion="polite">{emailErr}</Text> : null}

          {/* Password */}
          <Text style={[s.label, { marginTop: 20 }]}>Password</Text>
          <View style={[s.field, passwordErr ? s.fieldError : null]}>
            <TextInput
              ref={passwordRef}
              style={[s.input, { flex: 1 }]}
              value={password}
              onChangeText={(v) => { setPassword(v); if (passwordErr) setPasswordErr(""); }}
              onBlur={() => setPasswordErr(validateSignUpPassword(password))}
              placeholder="Min. 8 characters"
              placeholderTextColor="#C0C0C0"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              accessibilityLabel="Password"
              accessibilityHint="Enter a password with at least 8 characters"
            />
            <TouchableOpacity
              onPress={() => setShowPw(!showPw)}
              style={s.eyeBtn}
              accessibilityRole="button"
              accessibilityLabel={showPw ? "Hide password" : "Show password"}
            >
              <Feather name={showPw ? "eye" : "eye-off"} size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>
          {passwordErr ? <Text style={s.fieldErrText} accessibilityLiveRegion="polite">{passwordErr}</Text> : null}

          {/* Password strength hint */}
          {!passwordErr && password.length > 0 && !isStrongPassword(password) ? (
            <Text style={s.hintText}>
              {8 - password.length} more character{8 - password.length !== 1 ? "s" : ""} needed
            </Text>
          ) : null}

          {/* Sign Up CTA */}
          <TouchableOpacity
            style={[s.cta, !isFormValid && s.ctaDim]}
            activeOpacity={0.85}
            disabled={!isFormValid}
            onPress={handleSignUp}
            accessibilityRole="button"
            accessibilityLabel="Sign Up"
            accessibilityState={{ disabled: !isFormValid }}
          >
            <Text style={[s.ctaText, !isFormValid && s.ctaTextDim]}>Sign Up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow} accessibilityElementsHidden>
            <View style={s.divLine} />
            <Text style={s.divText}>Or sign up with</Text>
            <View style={s.divLine} />
          </View>

          {/* Apple — iOS only */}
          {isIOS && <AppleSignInButton variant="signup" />}

          {/* Google — both platforms */}
          <GoogleSignInButton variant="signup" horizontalPadding={24} />

          {/* Sign in link */}
          <TouchableOpacity
            style={s.signinRow}
            onPress={() => router.replace("/signin")}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Sign In"
          >
            <Text style={s.signinText}>
              Already have an account?{" "}
              <Text style={s.signinBold}>Sign In</Text>
            </Text>
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
    borderWidth: 1.5, borderColor: "transparent",
  },
  fieldError: {
    borderColor: ERROR_C, backgroundColor: "#FEF9F9",
  },
  fieldErrText: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: ERROR_C, marginTop: 5, marginBottom: 2,
  },
  hintText: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginTop: 5, marginBottom: 2,
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
    marginTop: 28, marginBottom: 18,
  },
  ctaDim: { backgroundColor: "#E8E8E8" },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: "#E8E8E8" },
  divText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginHorizontal: 12,
  },

  signinRow: { alignItems: "center", paddingVertical: 8, marginTop: 4 },
  signinText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888" },
  signinBold: { fontFamily: "Inter_600SemiBold", color: BLACK },
});
