import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type AppleButtonVariant = "signup" | "signin" | "continue";

interface AppleSignInButtonProps {
  variant?: AppleButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const LABEL: Record<AppleButtonVariant, string> = {
  signup:   "Sign up with Apple",
  signin:   "Sign in with Apple",
  continue: "Continue with Apple",
};

export function AppleSignInButton({
  variant = "signin",
  onPress,
  disabled = false,
  loading = false,
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
      style={[styles.btn, isDisabled && styles.btnDisabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.inner}>
          <FontAwesome name="apple" size={20} color="#FFFFFF" />
          <Text style={styles.label}>{LABEL[variant]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appleIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },
});
