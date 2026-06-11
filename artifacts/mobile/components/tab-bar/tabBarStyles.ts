import { Dimensions, StyleSheet } from "react-native";

export const LIME            = "#C8FF00";
export const MATTE_BLACK     = "#0D0D0D";
export const GRAY_INACTIVE   = "#6B7280";
export const BORDER_COLOR    = "rgba(255,255,255,0.08)";
export const WIDTH           = Dimensions.get("window").width;

// PayVora has 5 visible tabs + 1 expand button = 6 items.
// Reference uses WIDTH-150 for 3 tabs + DummyTab = 4 items (~240px).
// For 6 items we need ~330px to maintain comfortable 44pt touch targets.
export const PILL_WIDTH         = WIDTH - 60;
export const ANIMATION_DURATION = 400;
export const EXPANDED_HEIGHT    = 400;

export const SPRING_CONFIG = {
  damping:   15,
  stiffness: 190,
  mass:      0.8,
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
  label:    string;
  route:    string;
}

export const PAYVORA_MENU_ITEMS: PayvoraMenuItem[] = [
  { iconName: "home",        label: "Home",     route: "index"    },
  { iconName: "bar-chart-2", label: "Insights", route: "insights" },
  { iconName: "maximize",    label: "Scan",     route: "scan"     },
  { iconName: "credit-card", label: "My Cards", route: "my-cards" },
  { iconName: "user",        label: "Profile",  route: "profile"  },
  { iconName: "settings",    label: "Settings", route: "settings" },
];

export const tabBarStyles = StyleSheet.create({
  // Outer absolutely-positioned wrapper — keeps gesture area off-screen edges
  gestureWrapper: {
    position:   "absolute",
    left:       0,
    right:      0,
    alignItems: "center",
    zIndex:     999,
  },

  // The pill itself — reference has no border; PayVora adds a subtle one for dark-mode depth
  pillWrapper: {
    overflow:      "hidden",
    borderWidth:   1,
    borderColor:   BORDER_COLOR,
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius:  18,
    elevation:     16,
  },

  // BlurView fills the pill — background must be transparent so blur shows
  blurView: {
    flex:            1,
    width:           "100%",
    height:          "100%",
    justifyContent:  "flex-end",
    backgroundColor: "transparent",
  },

  // Collapsed tab bar row — height 50 matches reference exactly
  floatingBar: {
    flexDirection: "row",
    height:        50,
  },

  // Individual tab button — IDENTICAL to reference styles.tab
  // Also used for the expand/collapse toggle button (matches reference DummyTab using same style)
  tab: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    borderRadius:   200,
    margin:         5,
    position:       "relative",
  },

  // Active tab highlight — reference uses grey rgba(126,126,126,0.1);
  // PayVora substitutes lime tint for brand consistency
  tabFocusBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius:    200,
    backgroundColor: "rgba(200, 255, 0, 0.13)",
  },

  // Expanded menu container — identical to reference styles.expandedMenu
  expandedMenu: {
    flex:              1,
    paddingHorizontal: 16,
    paddingTop:        10,
    paddingBottom:     8,
    justifyContent:    "space-evenly",
  },

  // Expanded menu row — identical to reference styles.menuItem
  menuRow: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingVertical:   10,
    paddingHorizontal: 16,
    borderRadius:      99,
    position:          "relative",
  },

  // Selection highlight bg inside expanded row
  menuRowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
  },

  // Icon box inside expanded row — identical to reference styles.menuIconContainer
  menuIconBox: {
    width:          28,
    height:         28,
    alignItems:     "center",
    justifyContent: "center",
    marginRight:    12,
  },

  // Menu item label — identical to reference styles.menuLabel
  menuLabel: {
    fontSize:   15,
    fontWeight: "600",
    flex:       1,
  },

  // Expand/collapse chevron icon wrapper — same size as reference dummyIcon
  expandIconWrapper: {
    width:          24,
    height:         24,
    alignItems:     "center",
    justifyContent: "center",
  },
});
