import { Feather } from "@expo/vector-icons";
import React from "react";
import { GRAY_INACTIVE, LIME, type PayvoraIconName } from "./tabBarStyles";

interface TabIconProps {
  name:         PayvoraIconName;
  focused:      boolean;
  size?:        number;
  activeColor?: string;
}

// Default size 24 matches reference AnimatedTab which passes size:24 to tabBarIcon callback
export function TabIcon({
  name,
  focused,
  size = 24,
  activeColor = LIME,
}: TabIconProps) {
  return (
    <Feather
      name={name}
      size={size}
      color={focused ? activeColor : GRAY_INACTIVE}
    />
  );
}
