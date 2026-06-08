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
  label: string;
  onPress: () => void;
  /** Renders dimmed style and disables press. Also applied when loading. */
  disabled?: boolean;
  /** Shows an ActivityIndicator in place of the label. */
  loading?: boolean;
  /** Additional styles for the button container. */
  style?: ViewStyle;
};

/**
 * PrimaryButton — the lime call-to-action used on every auth / KYC screen.
 *
 * States:
 *  • Enabled  — lime (#C8FF00) background + soft lime glow shadow
 *  • Disabled — neutral gray (#E8E8E8), no shadow
 *  • Loading  — lime background + spinner (keeps button stable width)
 */
export function PrimaryButton({
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
        isDisabled
          ? s.btnDisabled
          : [s.btnEnabled, OShadow.ctaGlow],
        style,
      ]}
      activeOpacity={0.82}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={OC.black} size="small" />
      ) : (
        <Text style={[s.label, isDisabled && s.labelDisabled]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    height: OS.ctaH,
    borderRadius: OS.ctaR,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEnabled: {
    backgroundColor: OC.lime,
  },
  btnDisabled: {
    backgroundColor: "#E8E8E8",
  },
  label: {
    fontSize: 17,
    fontFamily: OF.bold,
    color: OC.black,
  },
  labelDisabled: {
    color: OC.faint,
  },
});
