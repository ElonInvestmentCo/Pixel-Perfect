import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { OC, OF, OS, OShadow } from "./tokens";

type Props = {
  label:      string;
  onPress:    () => void;
  disabled?:  boolean;
  loading?:   boolean;
  success?:   boolean;
  style?:     ViewStyle;
};

/**
 * PrimaryButton — the lime call-to-action used on every auth / KYC screen.
 *
 * Design tokens:
 *  • Background:  #E7F41C (OC.lime)
 *  • Text color:  #111827 (OC.limeText)
 *  • Height:      56px   (OS.ctaH)
 *  • Radius:      28px   (OS.ctaR — full pill)
 *  • Glow shadow: soft lime glow (OShadow.ctaGlow)
 *
 * States:
 *  • Enabled  — lime background + soft lime glow shadow
 *  • Disabled — neutral gray (#E8E8E8), no shadow
 *  • Loading  — lime background + ActivityIndicator
 *  • Success  — green background + animated scale-in checkmark
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading  = false,
  success  = false,
  style,
}: Props) {
  const isDisabled = disabled || loading || success;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (success) {
      Animated.spring(checkScale, {
        toValue:         1,
        useNativeDriver: true,
        tension:         160,
        friction:        6,
      }).start();
    } else {
      checkScale.setValue(0);
    }
  }, [success]);

  return (
    <TouchableOpacity
      style={[
        s.btn,
        success  ? s.btnSuccess :
        isDisabled ? s.btnDisabled :
                   [s.btnEnabled, OShadow.ctaGlow],
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
        <ActivityIndicator color={OC.limeText} size="small" />
      ) : success ? (
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <Feather name="check" size={22} color="#16A34A" />
        </Animated.View>
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
  },
  btnEnabled: {
    backgroundColor: OC.lime,
  },
  btnDisabled: {
    backgroundColor: "#E8E8E8",
  },
  btnSuccess: {
    backgroundColor: OC.successLight,
    borderWidth:     1,
    borderColor:     OC.successBorder,
  },
  label: {
    fontSize:   17,
    fontFamily: OF.bold,
    color:      OC.limeText,
  },
  labelDisabled: {
    color: OC.faint,
  },
});
