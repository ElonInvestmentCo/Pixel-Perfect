import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
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
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { signInWithApple, signUpWithEmailPassword } from "@/lib/auth";
import {
  isStrongPassword,
  isValidEmail,
  isValidName,
  validateEmail,
  validateName,
  validateSignUpPassword,
} from "@/lib/validation";

const ERROR_C = "#DC2626";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { saveSession } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const [nameErr,     setNameErr]     = useState("");
  const [emailErr,    setEmailErr]    = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [submitErr,   setSubmitErr]   = useState("");

  const mountedRef  = useRef(true);
  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const navigateToApp = useCallback(() => {
    const rootNav = navigation.getParent() ?? navigation;
    rootNav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "(app)" }] }));
  }, [navigation]);

  const onSocialSuccess = useCallback(
    async (token: string, user: Parameters<typeof saveSession>[1]) => {
      await saveSession(token, user);
      navigateToApp();
    },
    [saveSession, navigateToApp],
  );

  const { promptAsync: googlePrompt, isLoading: googleLoading } = useGoogleSignIn(onSocialSuccess);

  const isFormValid = useMemo(
    () => isValidName(name) && isValidEmail(email) && isStrongPassword(password),
    [name, email, password],
  );

  const charsNeeded = useMemo(
    () => (!isStrongPassword(password) && password.length > 0 ? 8 - password.length : 0),
    [password],
  );

  const handleNameChange     = useCallback((v: string) => { setName(v);     setNameErr("");     setSubmitErr(""); }, []);
  const handleEmailChange    = useCallback((v: string) => { setEmail(v);    setEmailErr("");    setSubmitErr(""); }, []);
  const handlePasswordChange = useCallback((v: string) => { setPassword(v); setPasswordErr(""); setSubmitErr(""); }, []);

  const handleNameBlur     = useCallback(() => setNameErr(validateName(name)),                   [name]);
  const handleEmailBlur    = useCallback(() => setEmailErr(validateEmail(email)),                [email]);
  const handlePasswordBlur = useCallback(() => setPasswordErr(validateSignUpPassword(password)), [password]);

  const toggleShowPw = useCallback(() => setShowPw((v) => !v), []);

  const isAnyLoading = loading || googleLoading;

  const handleSignUp = useCallback(async () => {
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validateSignUpPassword(password);
    setNameErr(nErr);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (nErr || eErr || pErr || isAnyLoading) return;

    Keyboard.dismiss();
    setLoading(true);
    setSubmitErr("");
    try {
      const { token, user } = await signUpWithEmailPassword(email.trim(), password, name.trim());
      await saveSession(token, user);
      navigateToApp();
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      const msg = e instanceof Error ? e.message : "Sign up failed. Please try again.";
      setSubmitErr(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [name, email, password, isAnyLoading, saveSession, navigateToApp]);

  const handleAppleSignUp = useCallback(async () => {
    if (isAnyLoading) return;
    setLoading(true);
    try {
      const result = await signInWithApple();
      if (!result) return;
      await saveSession(result.token, result.user);
      navigateToApp();
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      const msg = e instanceof Error ? e.message : "Apple sign-in failed. Please try again.";
      Alert.alert("Sign Up Failed", msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAnyLoading, saveSession, navigateToApp]);

  return (
    <OnboardingLayout keyboard>
      <OnboardingHeader
        onClose={() => router.back()}
        title="Welcome to PayVora"
        subtitle={`Create a commitment-free profile to\nexplore financial products`}
        topSlot={
          <View style={s.logoWrap} accessibilityElementsHidden>
            <Image
              source={require("../../assets/images/icon.png")}
              style={s.logoImg}
              resizeMode="contain"
            />
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
        editable={!isAnyLoading}
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
        editable={!isAnyLoading}
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
        editable={!isAnyLoading}
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
        loading={isAnyLoading}
        style={s.cta}
      />

      <AuthDivider label="Or sign up with" />

      <View style={s.socialRow}>
        <AppleSignInButton
          variant="signup"
          onPress={handleAppleSignUp}
          disabled={isAnyLoading}
          style={s.socialBtn}
        />
        <GoogleSignInButton
          variant="signup"
          onPress={googlePrompt}
          disabled={isAnyLoading}
          style={s.socialBtn}
        />
      </View>

      <TouchableOpacity
        style={s.switchRow}
        onPress={() => router.replace("/signin")}
        disabled={isAnyLoading}
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
  logoWrap: {
    width:           120,
    height:          52,
    borderRadius:    14,
    backgroundColor: "#0A0A0A",
    overflow:        "hidden",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    4,
  },
  logoImg: { width: 120, height: 120 },

  eyeBtn: { paddingLeft: 8 },

  cta: { marginTop: 28, marginBottom: 20 },

  socialRow: {
    flexDirection: "row",
    gap:           12,
    marginBottom:  20,
  },
  socialBtn: {
    flex:        1,
    alignSelf:   "auto" as any,
    width:       undefined,
  },

  submitErrBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16, borderWidth: 1, borderColor: "#FECACA",
  },
  submitErrText: {
    fontSize: 13, fontFamily: OF.regular, color: ERROR_C, flex: 1,
  },

  switchRow: { alignItems: "center", paddingVertical: 8, marginTop: 4 },
  switchText: { fontSize: 14, fontFamily: OF.regular, color: OC.muted },
  switchBold: { fontFamily: OF.semibold, color: OC.black },
});
