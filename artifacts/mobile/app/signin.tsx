import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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
  isValidEmail,
  validateEmail,
  validateSignInPassword,
} from "../lib/validation";

const isIOS = Platform.OS === "ios";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";
const ERROR_C = "#DC2626";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const navigation = useNavigation();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [emailErr, setEmailErr]   = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [submitErr, setSubmitErr] = useState("");

  const mountedRef  = useRef(true);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const isFormValid = useMemo(
    () => isValidEmail(email) && password.length > 0,
    [email, password],
  );

  const handleEmailChange = useCallback((v: string) => {
    setEmail(v);
    setEmailErr("");
    setSubmitErr("");
  }, []);

  const handlePasswordChange = useCallback((v: string) => {
    setPassword(v);
    setPasswordErr("");
    setSubmitErr("");
  }, []);

  const handleEmailBlur = useCallback(() => {
    setEmailErr(validateEmail(email));
  }, [email]);

  const handlePasswordBlur = useCallback(() => {
    setPasswordErr(validateSignInPassword(password));
  }, [password]);

  const toggleShowPw = useCallback(() => setShowPw((v) => !v), []);

  const handleSignIn = useCallback(async () => {
    const eErr = validateEmail(email);
    const pErr = validateSignInPassword(password);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (eErr || pErr || loading) return;

    Keyboard.dismiss();
    setLoading(true);
    setSubmitErr("");
    try {
      await signIn(email.trim(), password);
      // Reset the entire navigation stack so Dashboard is a true full-screen
      // root — not stacked inside the modal presentation context of sign-in.
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "dashboard" }],
        }),
      );
    } catch (e: any) {
      if (!mountedRef.current) return;
      setSubmitErr(e?.message ?? "Sign in failed. Please try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [email, password, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: topPad + 14, paddingBottom: botPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={s.avatarWrap} accessibilityElementsHidden>
            <Text style={s.avatarEmoji}>🎒</Text>
          </View>

          <Text style={s.title} accessibilityRole="header">Welcome back</Text>
          <Text style={s.subtitle}>Sign in to your account</Text>

          {/* Submit error */}
          {submitErr ? (
            <View style={s.submitErrBox} accessibilityLiveRegion="polite">
              <Feather name="alert-circle" size={14} color={ERROR_C} />
              <Text style={s.submitErrText}>{submitErr}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={s.label}>Your email</Text>
          <View style={[s.field, emailErr ? s.fieldError : null]}>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
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
              editable={!loading}
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
              onChangeText={handlePasswordChange}
              onBlur={handlePasswordBlur}
              placeholder="Your password"
              placeholderTextColor="#C0C0C0"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              accessibilityLabel="Password"
              accessibilityHint="Enter your account password"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={toggleShowPw}
              style={s.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={showPw ? "Hide password" : "Show password"}
            >
              <Feather name={showPw ? "eye" : "eye-off"} size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>
          {passwordErr ? <Text style={s.fieldErrText} accessibilityLiveRegion="polite">{passwordErr}</Text> : null}

          {/* Sign In CTA */}
          <TouchableOpacity
            style={[s.cta, (!isFormValid || loading) && s.ctaDim]}
            activeOpacity={0.85}
            disabled={!isFormValid || loading}
            onPress={handleSignIn}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
            accessibilityState={{ disabled: !isFormValid || loading }}
          >
            {loading ? (
              <ActivityIndicator color={BLACK} size="small" />
            ) : (
              <Text style={[s.ctaText, (!isFormValid || loading) && s.ctaTextDim]}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity
            style={s.forgotRow}
            onPress={() => router.push("/reset-password")}
            disabled={loading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Forgot Password"
          >
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow} accessibilityElementsHidden>
            <View style={s.divLine} />
            <Text style={s.divText}>Or sign in with</Text>
            <View style={s.divLine} />
          </View>

          {/* Apple — iOS only (Apple guidelines prohibit showing it on Android) */}
          {isIOS && <AppleSignInButton variant="signin" disabled={loading} />}

          {/* Google — both platforms */}
          <GoogleSignInButton variant="signin" horizontalPadding={24} disabled={loading} />

          {/* Sign up link */}
          <TouchableOpacity
            style={s.signupRow}
            onPress={() => router.push("/signup")}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Don't have an account? Sign Up"
          >
            <Text style={s.signupText}>
              Don't have an account?{" "}
              <Text style={s.signupBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Auth service stub ─────────────────────────────────────────────────────────
async function signIn(_email: string, _password: string): Promise<void> {
  // Replace with real API call: POST /api/auth/signin
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
    color: "#888888", lineHeight: 22, marginBottom: 28,
  },

  submitErrBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16, borderWidth: 1, borderColor: "#FECACA",
  },
  submitErrText: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: ERROR_C, flex: 1,
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
  input: {
    flex: 1, fontSize: 15, fontFamily: "Inter_400Regular",
    color: BLACK, height: "100%",
    outlineStyle: "none",
  } as any,
  eyeBtn: { paddingLeft: 8 },

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 58,
    alignItems: "center", justifyContent: "center",
    marginTop: 28, marginBottom: 14,
  },
  ctaDim: { backgroundColor: "#E8E8E8" },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },

  forgotRow: { alignItems: "center", paddingVertical: 4, marginBottom: 28 },
  forgotText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: INDIGO },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: "#E8E8E8" },
  divText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#AAAAAA", marginHorizontal: 12,
  },

  signupRow: { alignItems: "center", paddingVertical: 8, marginTop: 4 },
  signupText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#888888" },
  signupBold: { fontFamily: "Inter_600SemiBold", color: BLACK },
});
