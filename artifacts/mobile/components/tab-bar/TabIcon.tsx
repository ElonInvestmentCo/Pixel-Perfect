import { Feather } from "@expo/vector-icons";
import React from "react";
import { GRAY_INACTIVE, LIME, type PayvoraIconName } from "./tabBarStyles";

interface TabIconProps {
  name: PayvoraIconName;
  focused: boolean;
  size?: number;
  activeColor?: string;
}

export function TabIcon({ name, focused, size = 22, activeColor = LIME }: TabIconProps) {
  return (
    <Feather
      name={name}
      size={size}
      color={focused ? activeColor : GRAY_INACTIVE}
    />
  );
}
