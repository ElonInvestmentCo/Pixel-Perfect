import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { OC, OF, OS } from "./tokens";

type Props = Omit<TextInputProps, "style"> & {
  label: string;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode;
  /**
   * "filled"   — gray background field (default, used on signup / signin)
   * "bordered" — outlined black-border field (used on reset-password)
   */
  variant?: "filled" | "bordered";
  topSpacing?: number;
  containerStyle?: ViewStyle;
};

/**
 * FormField — labelled input with inline error / hint used on every auth screen.
 *
 * Supports ref forwarding so screens can programmatically focus fields
 * (e.g. auto-advance from email to password on submit).
 *
 * Abstracts away:
 *  - Label typography
 *  - Field container styling (filled vs bordered)
 *  - Error border + background highlight
 *  - Error / hint text
 *  - Right-side element slot (password toggle, etc.)
 */
export const FormField = React.forwardRef<TextInput, Props>(function FormField(
  {
    label,
    error,
    hint,
    rightElement,
    variant = "filled",
    topSpacing,
    containerStyle,
    ...inputProps
  },
  ref,
) {
  const hasError   = Boolean(error);
  const isBordered = variant === "bordered";

  return (
    <View
      style={[
        topSpacing != null ? { marginTop: topSpacing } : null,
        containerStyle,
      ]}
    >
      {/* Label */}
      <Text style={s.label}>{label}</Text>

      {/* Input container */}
      <View
        style={[
          isBordered ? s.borderedWrap : s.filledWrap,
          hasError && (isBordered ? s.borderedError : s.filledError),
        ]}
      >
        <TextInput
          ref={ref}
          style={[s.input, rightElement != null && s.inputFlex]}
          placeholderTextColor={OC.placeholder}
          {...inputProps}
        />
        {rightElement}
      </View>

      {/* Error takes priority over hint */}
      {hasError ? (
        <Text style={s.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={s.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  label: {
    fontSize: 14,
    fontFamily: OF.regular,
    color: OC.muted,
    marginBottom: 10,
  },

  filledWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: OC.fieldBg,
    borderRadius: OS.fieldR,
    height: OS.fieldH,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  filledError: {
    borderColor: OC.error,
    backgroundColor: OC.errorBg,
  },

  borderedWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: OS.fieldH - 4,
    borderWidth: 1.5,
    borderColor: OC.black,
    borderRadius: OS.fieldR,
    paddingHorizontal: 16,
  },
  borderedError: {
    borderColor: OC.error,
  },

  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: OF.regular,
    color: OC.black,
    height: "100%",
    outlineStyle: "none",
  } as any,
  inputFlex: { flex: 1 },

  errorText: {
    fontSize: 12,
    fontFamily: OF.regular,
    color: OC.error,
    marginTop: 5,
    marginBottom: 2,
  },
  hintText: {
    fontSize: 12,
    fontFamily: OF.regular,
    color: OC.faint,
    marginTop: 5,
    marginBottom: 2,
  },
});
