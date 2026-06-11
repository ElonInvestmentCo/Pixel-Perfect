import { Dimensions, StyleSheet } from "react-native";

export const LIME            = "#C8FF00";
export const MATTE_BLACK     = "#0D0D0D";
export const GRAY_INACTIVE   = "#6B7280";
export const BORDER_COLOR    = "rgba(255,255,255,0.08)";
export const WIDTH           = Dimensions.get("window").width;
export const PILL_WIDTH      = WIDTH - 60;
export const ANIMATION_DURATION = 400;
export const EXPANDED_HEIGHT    = 360;

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 190,
  mass: 0.8,
};

export type PayvoraIconName =
  | "home"
  | "bar-chart-2"
  | "maximize"
  | "credit-card"
  | "user"
  | "settings";

export interface PayvoraMenuItem {
  iconName: PayvoraIconName;
  label: string;
  route: string;
}

export const PAYVORA_MENU_ITEMS: PayvoraMenuItem[] = [
  { iconName: "home",         label: "Home",     route: "index"    },
  { iconName: "bar-chart-2",  label: "Insights", route: "insights" },
  { iconName: "maximize",     label: "Scan",     route: "scan"     },
  { iconName: "credit-card",  label: "My Cards", route: "my-cards" },
  { iconName: "user",         label: "Profile",  route: "profile"  },
  { iconName: "settings",     label: "Settings", route: "settings" },
];

export const tabBarStyles = StyleSheet.create({
  gestureWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  pillWrapper: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 20,
  },
  blurView: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  floatingBar: {
    flexDirection: "row",
    height: 62,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
    borderRadius: 200,
    position: "relative",
  },
  tabFocusBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 200,
    backgroundColor: "rgba(200, 255, 0, 0.14)",
  },
  expandBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginVertical: 6,
    borderRadius: 200,
  },
  expandedMenu: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 8,
    justifyContent: "space-evenly",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 99,
    position: "relative",
  },
  menuRowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 99,
  },
  menuIconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
});
