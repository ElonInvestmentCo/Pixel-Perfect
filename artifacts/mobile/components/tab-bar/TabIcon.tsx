import { Feather } from "@expo/vector-icons";
import React from "react";
import { GRAY_INACTIVE, LIME, type PayvoraIconName } from "./tabBarStyles";

interface TabIconProps {
  name: PayvoraIconName;
  focused: boolean;
  size?: number;
  activeColor?: string;
}

// Default size 24 matches the reference implementation exactly
export function TabIcon({ name, focused, size = 24, activeColor = LIME }: TabIconProps) {
  return (
    <Feather
      name={name}
      size={size}
      color={focused ? activeColor : GRAY_INACTIVE}
    />
  );
}
