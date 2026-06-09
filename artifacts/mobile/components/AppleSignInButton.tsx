import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

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

function AppleLogo() {
  return (
    <Svg
      viewBox="0 0 814 1000"
      width={17}
      height={20}
      fill="#000000"
    >
      <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.7c-58.1-81.8-108.6-209.2-108.6-330.4 0-171.2 111.5-261.6 221-261.6 75.6 0 138.2 49.7 185.7 49.7 45.2 0 116.2-52.5 200.8-52.5zm-160-193.7c37.7-45.3 64.4-108.2 64.4-171.1 0-8.9-.6-17.9-2.1-26.2-61.1 2.3-134.1 41.5-178.5 93.2-34.1 38.2-66.5 101.7-66.5 165.3 0 9.5 1.6 19.1 2.3 22.1 3.8.6 10.2 1.3 16.5 1.3 55.3 0 122.4-37.2 164-84.6z" />
    </Svg>
  );
}

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
          <AppleLogo />
          <Text style={s.label}>{LABEL[variant]}</Text>
        </View>
      )}
      <View style={s.borderOverlay} pointerEvents="none" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width:           "100%",
    height:          50,
    borderRadius:    100,
    backgroundColor: "#FFFFFF",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
    overflow:        "hidden",
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
    fontWeight:    "600",
    color:         "#000000",
    letterSpacing: -0.408,
    lineHeight:    22,
  },
  borderOverlay: {
    position:     "absolute",
    top:           0,
    left:          0,
    right:         0,
    bottom:        0,
    borderRadius:  100,
    borderWidth:   1,
    borderColor:   "#000000",
  },
});
