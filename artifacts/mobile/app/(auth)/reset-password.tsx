import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  FormField,
  OC,
  OF,
  OnboardingHeader,
  OnboardingLayout,
  PrimaryButton,
} from "@/components/onboarding";
import { isValidEmail, validateEmail } from "@/lib/validation";

const ERROR_C = "#DC2626";

export default function ResetPasswordScreen() {
  const [email,     setEmail]     = useState("");
  const [emailErr,  setEmailErr]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const isFormValid = useMemo(() => isValidEmail(email), [email]);

  const handleEmailChange = useCallback((v: string) => {
    setEmail(v); setEmailErr(""); setSubmitErr("");
  }, []);

  const handleEmailBlur = useCallback(() => setEmailErr(validateEmail(email)), [email]);

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
    <OnboardingLayout keyboard>
      <OnboardingHeader
        onBack={() => router.back()}
        title="Reset Password"
        subtitle={`Enter the email address associated\nwith your account`}
        gap={28}
        topSlot={
          <View style={s.avatarWrap} accessibilityElementsHidden>
            <Text style={s.avatarEmoji}>💰</Text>
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

      <FormField
        label="Your email"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        error={emailErr}
        variant="bordered"
        placeholder="johndoe@mail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        autoFocus
        onSubmitEditing={handleContinue}
        editable={!loading}
        accessibilityLabel="Email address"
        accessibilityHint="Enter the email associated with your account"
      />

      <PrimaryButton
        label="Continue"
        onPress={handleContinue}
        disabled={!isFormValid}
        loading={loading}
        style={s.cta}
      />
    </OnboardingLayout>
  );
}

// ─── Auth service stub ─────────────────────────────────────────────────────────
async function requestPasswordReset(_email: string): Promise<void> {
  // Replace with real API call: POST /api/auth/forgot-password
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

  cta: { marginTop: 16 },
});
