import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppleSignInButton }  from "@/components/AppleSignInButton";
import { GoogleSignInButton }  from "@/components/GoogleSignInButton";
import {
  AuthDivider,
  FormField,
  OC,
  OF,
  OnboardingHeader,
  OnboardingLayout,
  PrimaryButton,
} from "@/components/onboarding";
import {
  isStrongPassword,
  isValidEmail,
  isValidName,
  validateEmail,
  validateName,
  validateSignUpPassword,
} from "@/lib/validation";

const isIOS = Platform.OS === "ios";

export default function SignUpScreen() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);

  const [nameErr,     setNameErr]     = useState("");
  const [emailErr,    setEmailErr]    = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isFormValid = useMemo(
    () => isValidName(name) && isValidEmail(email) && isStrongPassword(password),
    [name, email, password],
  );

  const charsNeeded = useMemo(
    () => (!isStrongPassword(password) && password.length > 0 ? 8 - password.length : 0),
    [password],
  );

  const handleNameChange     = useCallback((v: string) => { setName(v);     if (nameErr)     setNameErr("");     }, [nameErr]);
  const handleEmailChange    = useCallback((v: string) => { setEmail(v);    if (emailErr)    setEmailErr("");    }, [emailErr]);
  const handlePasswordChange = useCallback((v: string) => { setPassword(v); if (passwordErr) setPasswordErr(""); }, [passwordErr]);

  const handleNameBlur     = useCallback(() => setNameErr(validateName(name)),                 [name]);
  const handleEmailBlur    = useCallback(() => setEmailErr(validateEmail(email)),              [email]);
  const handlePasswordBlur = useCallback(() => setPasswordErr(validateSignUpPassword(password)), [password]);

  const toggleShowPw = useCallback(() => setShowPw((v) => !v), []);

  const handleSignUp = useCallback(() => {
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validateSignUpPassword(password);
    setNameErr(nErr);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (nErr || eErr || pErr) return;
    Keyboard.dismiss();
    router.push("/phone-verify");
  }, [name, email, password]);

  return (
    <OnboardingLayout keyboard>
      <OnboardingHeader
        onClose={() => router.back()}
        title="Welcome to PayVora"
        subtitle={`Create a commitment-free profile to\nexplore financial products`}
      />

      {/* Full name */}
      <FormField
        label="Full name"
        value={name}
        onChangeText={handleNameChange}
        onBlur={handleNameBlur}
        error={nameErr}
        placeholder="John Doe"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        blurOnSubmit={false}
        accessibilityLabel="Full name"
        accessibilityHint="Enter your full name"
      />

      {/* Email */}
      <FormField
        ref={emailRef}
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
        topSpacing={20}
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
        hint={charsNeeded > 0 ? `${charsNeeded} more character${charsNeeded !== 1 ? "s" : ""} needed` : undefined}
        placeholder="Min. 8 characters"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleSignUp}
        topSpacing={20}
        accessibilityLabel="Password"
        accessibilityHint="Enter a password with at least 8 characters"
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
        label="Sign Up"
        onPress={handleSignUp}
        disabled={!isFormValid}
        style={s.cta}
      />

      <AuthDivider label="Or sign up with" />

      {isIOS && <AppleSignInButton variant="signup" />}
      <GoogleSignInButton variant="signup" horizontalPadding={24} />

      <TouchableOpacity
        style={s.switchRow}
        onPress={() => router.replace("/signin")}
        accessibilityRole="button"
        accessibilityLabel="Already have an account? Sign In"
      >
        <Text style={s.switchText}>
          Already have an account?{" "}
          <Text style={s.switchBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  eyeBtn: { paddingLeft: 8 },

  cta: { marginTop: 28, marginBottom: 18 },

  switchRow: { alignItems: "center", paddingVertical: 8, marginTop: 4 },
  switchText: { fontSize: 14, fontFamily: OF.regular, color: OC.muted },
  switchBold: { fontFamily: OF.semibold, color: OC.black },
});
