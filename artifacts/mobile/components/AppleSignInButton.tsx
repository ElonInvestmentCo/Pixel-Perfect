import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CTA_H = 58;
const CTA_R = 100;

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
        <ActivityIndicator color="#000000" size="small" />
      ) : (
        <View style={s.inner}>
          <FontAwesome name="apple" size={20} color="#000000" />
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
    backgroundColor: "#FFFFFF",
    borderWidth:     1,
    borderColor:     "#000000",
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
    fontSize:      17,
    fontFamily:    "Inter_600SemiBold",
    color:         "#000000",
    letterSpacing: -0.408,
  },
});
