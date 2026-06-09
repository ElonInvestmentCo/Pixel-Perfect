import React from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

export type AppleButtonVariant = "signup" | "signin" | "continue";

interface AppleSignInButtonProps {
  variant?:  AppleButtonVariant;
  onPress?:  () => void;
  disabled?: boolean;
  style?:    StyleProp<ViewStyle>;
}

function AppleLogo() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.029 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.402-2.376-2-.156-3.675 1.09-4.6 1.09zm3.378-3.066c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"
        fill="#000000"
      />
    </Svg>
  );
}

export function AppleSignInButton({
  onPress,
  disabled = false,
  style,
}: AppleSignInButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Apple"
      accessibilityState={{ disabled }}
      style={[s.btn, disabled && s.btnDisabled, style]}
    >
      <View style={s.inner}>
        <AppleLogo />
        <Text style={s.label}>Sign in with Apple</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    alignSelf:       "center",
    height:          32,
    borderRadius:    16,
    backgroundColor: "#ffffff",
    borderWidth:     1,
    borderColor:     "#000000",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
    paddingLeft:     14,
    paddingRight:    16,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  inner: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           6,
  },
  label: {
    fontSize:      13,
    fontFamily:    "Inter_600SemiBold",
    color:         "#000000",
    letterSpacing: -0.32,
  },
});
