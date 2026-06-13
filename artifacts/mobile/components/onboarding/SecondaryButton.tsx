import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { OC, OF, OS, OShadow } from "./tokens";

type Props = {
  label:     string;
  onPress:   () => void;
  disabled?: boolean;
  loading?:  boolean;
  style?:    ViewStyle;
};

/**
 * SecondaryButton — white background with a 1px #E5E7EB border.
 *
 * States:
 *  • Enabled  — white background + subtle lift shadow
 *  • Disabled — gray background, no shadow
 *  • Loading  — white background + spinner
 */
export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  loading  = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        s.btn,
        isDisabled ? s.btnDisabled : [s.btnEnabled, OShadow.secondary],
        style,
      ]}
      activeOpacity={0.80}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={OC.black} size="small" />
      ) : (
        <Text style={[s.label, isDisabled && s.labelDisabled]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    height:         OS.ctaH,
    borderRadius:   OS.ctaR,
    alignItems:     "center",
    justifyContent: "center",
    borderWidth:    1,
  },
  btnEnabled: {
    backgroundColor: OC.bg,
    borderColor:     OC.borderLight,
  },
  btnDisabled: {
    backgroundColor: OC.gray,
    borderColor:     OC.border,
    opacity:         0.65,
  },
  label: {
    fontSize:   17,
    fontFamily: OF.bold,
    color:      OC.black,
  },
  labelDisabled: {
    color: OC.faint,
  },
});
