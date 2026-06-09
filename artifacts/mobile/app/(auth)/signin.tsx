import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppleSignInButton } from "@/components/AppleSignInButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import {
  AuthDivider,
  FormField,
  OC,
  OF,
  OnboardingHeader,
  OnboardingLayout,
  PrimaryButton,
} from "@/components/onboarding";
import { isValidEmail, validateEmail, validateSignInPassword } from "@/lib/validation";

const ERROR_C  = "#DC2626";

export default function SignInScreen() {
  const navigation = useNavigation();

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [emailErr,  setEmailErr]  = useState("");
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
    setEmail(v); setEmailErr(""); setSubmitErr("");
  }, []);

  const handlePasswordChange = useCallback((v: string) => {
    setPassword(v); setPasswordErr(""); setSubmitErr("");
  }, []);

  const handleEmailBlur    = useCallback(() => setEmailErr(validateEmail(email)),           [email]);
  const handlePasswordBlur = useCallback(() => setPasswordErr(validateSignInPassword(password)), [password]);
  const toggleShowPw       = useCallback(() => setShowPw((v) => !v), []);

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
      const rootNav = navigation.getParent() ?? navigation;
      rootNav.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "(app)" }] }),
      );
    } catch (e: any) {
      if (!mountedRef.current) return;
      setSubmitErr(e?.message ?? "Sign in failed. Please try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [email, password, loading, navigation]);

  return (
    <OnboardingLayout keyboard>
      <OnboardingHeader
        onClose={() => router.back()}
        title="Welcome back"
        subtitle="Sign in to your account"
        gap={28}
        topSlot={
          <View style={s.avatarWrap} accessibilityElementsHidden>
            <Text style={s.avatarEmoji}>🎒</Text>
          </View>
        }
      />

      {/* Submit-level error */}
      {submitErr ? (
        <View style={s.submitErrBox} accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={14} color={ERROR_C} />
          <Text style={s.submitErrText}>{submitErr}</Text>
        </View>
      ) : null}

      {/* Email */}
      <FormField
        label="Your email"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        error={emailErr}
        placeholder="johndoe@mail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
        editable={!loading}
        accessibilityLabel="Email address"
        accessibilityHint="Enter your email address"
      />

      {/* Password */}
      <FormField
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={handlePasswordChange}
        onBlur={handlePasswordBlur}
        error={passwordErr}
        placeholder="Your password"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleSignIn}
        editable={!loading}
        topSpacing={20}
        accessibilityLabel="Password"
        accessibilityHint="Enter your account password"
        rightElement={
          <TouchableOpacity
            onPress={toggleShowPw}
            style={s.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={showPw ? "Hide password" : "Show password"}
          >
            <Feather name={showPw ? "eye" : "eye-off"} size={20} color="#AAAAAA" />
          </TouchableOpacity>
        }
      />

      <PrimaryButton
        label="Sign In"
        onPress={handleSignIn}
        disabled={!isFormValid}
        loading={loading}
        style={s.cta}
      />

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

      <AuthDivider label="Or sign in with" />

      <AppleSignInButton disabled={loading} />
      <GoogleSignInButton variant="signin" disabled={loading} />

      <TouchableOpacity
        style={s.switchRow}
        onPress={() => router.push("/signup")}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Don't have an account? Sign Up"
      >
        <Text style={s.switchText}>
          Don't have an account?{" "}
          <Text style={s.switchBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </OnboardingLayout>
  );
}

// ─── Auth service stub ─────────────────────────────────────────────────────────
async function signIn(_email: string, _password: string): Promise<void> {
  // Replace with real API call: POST /api/auth/signin
}

const s = StyleSheet.create({
  avatarWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "#FFF3DC",
    alignItems: "center", justifyContent: "center",
  },
  avatarEmoji: { fontSize: 28 },

  submitErrBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16, borderWidth: 1, borderColor: "#FECACA",
  },
  submitErrText: {
    fontSize: 13, fontFamily: OF.regular, color: ERROR_C, flex: 1,
  },

  eyeBtn: { paddingLeft: 8 },

  cta: { marginTop: 28, marginBottom: 14 },

  forgotRow: { alignItems: "center", paddingVertical: 4, marginBottom: 28 },
  forgotText: { fontSize: 15, fontFamily: OF.semibold, color: OC.indigo },

  switchRow: { alignItems: "center", paddingVertical: 8, marginTop: 4 },
  switchText: { fontSize: 14, fontFamily: OF.regular, color: OC.muted },
  switchBold: { fontFamily: OF.semibold, color: OC.black },
});
