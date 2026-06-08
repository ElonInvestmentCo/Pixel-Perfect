/**
 * GoogleSignInButton — pill-shaped social auth button matching PrimaryButton dimensions.
 *
 * Height:        58 px  (OS.ctaH)
 * BorderRadius:  28 px  (OS.ctaR — true pill)
 * Background:    #FFFFFF with 1.5px #E8E8E8 border (standard Google button spec)
 *
 * Uses the google-logo.png static asset (Google "G" mark) rather than the
 * full-width SVG approach, which scaled proportionally and produced an
 * oversized button (~85–95 px tall) inconsistent with all other CTAs.
 */

import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mirror token values without importing them, keeping this component self-contained.
const CTA_H = 58;  // matches OS.ctaH
const CTA_R = 28;  // matches OS.ctaR (pill)

export type GoogleButtonVariant = "signup" | "signin" | "continue";

interface GoogleSignInButtonProps {
  variant:  GoogleButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * @deprecated No longer used — kept for call-site compatibility only.
   * The button is always full-width; horizontal padding is the parent's concern.
   */
  horizontalPadding?: number;
}

const LABEL: Record<GoogleButtonVariant, string> = {
  signup:   "Sign up with Google",
  signin:   "Sign in with Google",
  continue: "Continue with Google",
};

export function GoogleSignInButton({
  variant,
  onPress,
  disabled = false,
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={LABEL[variant]}
      accessibilityState={{ disabled }}
      style={[s.btn, disabled && s.btnDisabled]}
    >
      <View style={s.inner}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require("../assets/images/google-logo.png")}
          style={s.logo}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={s.label}>{LABEL[variant]}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width:           "100%",
    height:          CTA_H,
    borderRadius:    CTA_R,
    backgroundColor: "#FFFFFF",
    borderWidth:     1.5,
    borderColor:     "#E8E8E8",
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
  logo: {
    width:  22,
    height: 22,
  },
  label: {
    fontSize:      16,
    fontFamily:    "Inter_600SemiBold",
    color:         "#1A1A1A",
    letterSpacing: 0.1,
  },
});
