import { Feather } from "@expo/vector-icons";
import React from "react";
import { GRAY_INACTIVE, LIME, type PayvoraIconName } from "./tabBarStyles";

interface TabIconProps {
  name:         PayvoraIconName;
  focused:      boolean;
  size?:        number;
  activeColor?: string;
}

export function TabIcon({
  name,
  focused,
  size = 26,
  activeColor = LIME,
}: TabIconProps) {
  return (
    <Feather
      name={name as React.ComponentProps<typeof Feather>["name"]}
      size={size}
      color={focused ? activeColor : GRAY_INACTIVE}
    />
  );
}
