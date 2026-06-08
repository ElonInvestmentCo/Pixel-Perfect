import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { OC, OF } from "./tokens";

type Props = {
  /** E.g. "Or sign up with" / "Or sign in with" */
  label: string;
};

/** Horizontal rule with centred label used between the CTA and social buttons. */
export function AuthDivider({ label }: Props) {
  return (
    <View style={s.row} accessibilityElementsHidden>
      <View style={s.line} />
      <Text style={s.text}>{label}</Text>
      <View style={s.line} />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: OC.border,
  },
  text: {
    fontSize: 13,
    fontFamily: OF.regular,
    color: OC.faint,
    marginHorizontal: 12,
  },
});
