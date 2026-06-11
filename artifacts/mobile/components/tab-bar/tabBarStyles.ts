import { Dimensions, StyleSheet } from "react-native";

export const LIME            = "#C8FF00";
export const MATTE_BLACK     = "#0D0D0D";
export const GRAY_INACTIVE   = "#6B7280";
export const BORDER_COLOR    = "rgba(255,255,255,0.08)";
export const WIDTH           = Dimensions.get("window").width;

// 5 visible tabs + 1 expand button = 6 items in collapsed pill
export const PILL_WIDTH         = WIDTH - 60;
export const ANIMATION_DURATION = 400;
// 9 menu items × ~56px per row = 504px + padding
export const EXPANDED_HEIGHT    = 560;

export const SPRING_CONFIG = {
  damping:   15,
  stiffness: 190,
  mass:      0.8,
};

export type PayvoraIconName =
  | "home"
  | "repeat"
  | "credit-card"
  | "clock"
  | "user"
  | "settings"
  | "gift"
  | "tag"
  | "trending-up"
  | "trending-down"
  | "file-text"
  | "wifi"
  | "users"
  | "help-circle";

export interface PayvoraMenuItem {
  iconName: PayvoraIconName;
  label:    string;
  route:    string;
}

export const PAYVORA_MENU_ITEMS: PayvoraMenuItem[] = [
  { iconName: "gift",          label: "Buy Gift Card",       route: "buy-gift-card"  },
  { iconName: "tag",           label: "Sell Gift Card",      route: "sell-gift-card" },
  { iconName: "trending-up",   label: "Buy Crypto",          route: "buy-crypto"     },
  { iconName: "trending-down", label: "Sell Crypto",         route: "sell-crypto"    },
  { iconName: "credit-card",   label: "Create Virtual Card", route: "virtual-card"   },
  { iconName: "file-text",     label: "Pay Bills",           route: "bills"          },
  { iconName: "wifi",          label: "eSIM",                route: "esim"           },
  { iconName: "users",         label: "Referral",            route: "referral"       },
  { iconName: "help-circle",   label: "Support",             route: "support"        },
];

export const tabBarStyles = StyleSheet.create({
  gestureWrapper: {
    position:   "absolute",
    left:       0,
    right:      0,
    alignItems: "center",
    zIndex:     999,
  },

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

  blurView: {
    flex:            1,
    width:           "100%",
    height:          "100%",
    justifyContent:  "flex-end",
    backgroundColor: "transparent",
  },

  floatingBar: {
    flexDirection: "row",
    height:        50,
  },

  tab: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    borderRadius:   200,
    margin:         5,
    position:       "relative",
  },

  tabFocusBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius:    200,
    backgroundColor: "rgba(200, 255, 0, 0.13)",
  },

  expandedMenu: {
    flex:              1,
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     8,
    justifyContent:    "space-evenly",
  },

  menuRow: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingVertical:   10,
    paddingHorizontal: 16,
    borderRadius:      99,
    position:          "relative",
    minHeight:         44,
  },

  menuRowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
  },

  menuIconBox: {
    width:          28,
    height:         28,
    alignItems:     "center",
    justifyContent: "center",
    marginRight:    12,
  },

  menuLabel: {
    fontSize:   15,
    fontWeight: "600",
    flex:       1,
  },

  expandIconWrapper: {
    width:          24,
    height:         24,
    alignItems:     "center",
    justifyContent: "center",
  },
});
