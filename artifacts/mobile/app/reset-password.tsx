import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import { isValidEmail, validateEmail } from "../lib/validation";

const LIME    = "#C8FF00";
const BLACK   = "#1A1A1A";
const ERROR_C = "#DC2626";

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [email, setEmail]         = useState("");
  const [emailErr, setEmailErr]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const isFormValid = useMemo(() => isValidEmail(email), [email]);

  const handleEmailChange = useCallback((v: string) => {
    setEmail(v);
    setEmailErr("");
    setSubmitErr("");
  }, []);

  const handleEmailBlur = useCallback(() => {
    setEmailErr(validateEmail(email));
  }, [email]);

  const handleContinue = useCallback(async () => {
    const err = validateEmail(email);
    setEmailErr(err);
    if (err || loading) return;

    Keyboard.dismiss();
    setLoading(true);
    setSubmitErr("");
    try {
      await requestPasswordReset(email.trim());
      router.push(
        `/verify-code?mode=reset&email=${encodeURIComponent(email.trim())}`,
      );
    } catch (e: any) {
      if (!mountedRef.current) return;
      setSubmitErr(e?.message ?? "Failed to send code. Please try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [email, loading]);

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
          {/* Back button */}
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={18} color={BLACK} />
          </TouchableOpacity>

          {/* emoji avatar */}
          <View style={s.avatarWrap} accessibilityElementsHidden>
            <Text style={s.avatarEmoji}>💰</Text>
          </View>

          <Text style={s.title} accessibilityRole="header">Reset Password</Text>
          <Text style={s.subtitle}>
            Enter the email address associated{"\n"}with your account
          </Text>

          {/* Submit error */}
          {submitErr ? (
            <View style={s.submitErrBox} accessibilityLiveRegion="polite">
              <Feather name="alert-circle" size={14} color={ERROR_C} />
              <Text style={s.submitErrText}>{submitErr}</Text>
            </View>
          ) : null}

          <Text style={s.label}>Your email</Text>

          <View style={[s.borderedField, emailErr ? s.fieldError : null]}>
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
              returnKeyType="done"
              autoFocus
              onSubmitEditing={handleContinue}
              accessibilityLabel="Email address"
              accessibilityHint="Enter the email associated with your account"
              editable={!loading}
            />
          </View>
          {emailErr ? <Text style={s.fieldErrText} accessibilityLiveRegion="polite">{emailErr}</Text> : null}

          <TouchableOpacity
            style={[s.cta, (!isFormValid || loading) && s.ctaDim]}
            activeOpacity={0.85}
            disabled={!isFormValid || loading}
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            accessibilityState={{ disabled: !isFormValid || loading }}
          >
            {loading ? (
              <ActivityIndicator color={BLACK} size="small" />
            ) : (
              <Text style={[s.ctaText, (!isFormValid || loading) && s.ctaTextDim]}>Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Auth service stub ─────────────────────────────────────────────────────────
async function requestPasswordReset(_email: string): Promise<void> {
  // Replace with real API call: POST /api/auth/forgot-password
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: "#FFFFFF" },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },

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
  borderedField: {
    height: 52, borderWidth: 1.5, borderColor: BLACK,
    borderRadius: 12, paddingHorizontal: 16,
    justifyContent: "center", marginBottom: 8,
  },
  fieldError: { borderColor: ERROR_C },
  fieldErrText: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: ERROR_C, marginBottom: 12,
  },
  input: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: BLACK, outlineStyle: "none",
  } as any,

  cta: {
    backgroundColor: LIME, borderRadius: 28, height: 54,
    alignItems: "center", justifyContent: "center", marginTop: 16,
  },
  ctaDim: { backgroundColor: "#E8E8E8" },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
  ctaTextDim: { color: "#AAAAAA" },
});
