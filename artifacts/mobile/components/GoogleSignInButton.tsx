import React from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export type GoogleButtonVariant = "signup" | "signin" | "continue";

const A11Y_LABEL: Record<GoogleButtonVariant, string> = {
  signup:   "Sign up with Google",
  signin:   "Sign in with Google",
  continue: "Continue with Google",
};

interface GoogleSignInButtonProps {
  variant:   GoogleButtonVariant;
  onPress?:  () => void;
  disabled?: boolean;
  style?:    StyleProp<ViewStyle>;
  /** @deprecated kept for call-site compatibility */
  horizontalPadding?: number;
}

function GoogleGLogo() {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      style={{ flexShrink: 0 }}
    >
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function GoogleSignInButton({
  variant,
  onPress,
  disabled = false,
  style,
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={A11Y_LABEL[variant]}
      accessibilityState={{ disabled }}
      style={[s.btn, disabled && s.btnDisabled, style]}
    >
      <View style={s.inner}>
        <GoogleGLogo />
        <Text style={s.label} numberOfLines={1}>Google</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    backgroundColor:   "#ffffff",
    borderRadius:      10,
    paddingVertical:   10,
    paddingHorizontal: 18,
    alignItems:        "center",
    justifyContent:    "center",
    alignSelf:         "stretch",
    shadowColor:       "#3c4043",
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.18,
    shadowRadius:      3,
    elevation:         3,
  },
  btnDisabled: {
    opacity: 0.42,
  },
  inner: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
  },
  label: {
    fontSize:      17,
    fontFamily:    "Inter_600SemiBold",
    color:         "#3c4043",
    letterSpacing: 0.17,
    lineHeight:    17,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}),
  },
});
