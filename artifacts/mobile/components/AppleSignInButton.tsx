/**
 * AppleSignInButton — pill-shaped social auth button matching PrimaryButton dimensions.
 *
 * Height:        58 px  (OS.ctaH — was 56, corrected to match)
 * BorderRadius:  28 px  (OS.ctaR — true pill, was 14)
 * Background:    #000000 (Apple brand requirement)
 */

import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mirror token values without importing them, keeping this component self-contained.
const CTA_H = 58;  // matches OS.ctaH
const CTA_R = 28;  // matches OS.ctaR (pill)

export type AppleButtonVariant = "signup" | "signin" | "continue";

interface AppleSignInButtonProps {
  variant?:  AppleButtonVariant;
  onPress?:  () => void;
  disabled?: boolean;
  loading?:  boolean;
}

const LABEL: Record<AppleButtonVariant, string> = {
  signup:   "Sign up with Apple",
  signin:   "Sign in with Apple",
  continue: "Continue with Apple",
};

export function AppleSignInButton({
  variant  = "signin",
  onPress,
  disabled = false,
  loading  = false,
}: AppleSignInButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={LABEL[variant]}
      accessibilityState={{ disabled: isDisabled }}
      style={[s.btn, isDisabled && s.btnDisabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={s.inner}>
          <FontAwesome name="apple" size={20} color="#FFFFFF" />
          <Text style={s.label}>{LABEL[variant]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width:           "100%",
    height:          CTA_H,
    borderRadius:    CTA_R,
    backgroundColor: "#000000",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  inner: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           10,
  },
  label: {
    fontSize:      16,
    fontFamily:    "Inter_600SemiBold",
    color:         "#FFFFFF",
    letterSpacing: 0.1,
  },
});
