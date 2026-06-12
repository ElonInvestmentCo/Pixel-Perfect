import { Dimensions, StyleSheet } from "react-native";

export const LIME            = "#C8FF00";
export const MATTE_BLACK     = "#0D0D0D";
export const GRAY_INACTIVE   = "#9CA3AF";
export const BORDER_COLOR    = "rgba(255,255,255,0.10)";
export const WIDTH           = Dimensions.get("window").width;

// 5 visible tabs + 1 expand button = 6 items in collapsed pill
export const PILL_WIDTH         = WIDTH - 48;
export const ANIMATION_DURATION = 400;
// 10 menu items × ~56px per row = 560px + padding
export const EXPANDED_HEIGHT    = 620;

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
  | "help-circle"
  | "phone";

export interface PayvoraMenuItem {
  iconName: PayvoraIconName;
  label:    string;
  route:    string;
}

export const PAYVORA_MENU_ITEMS: PayvoraMenuItem[] = [
  { iconName: "phone",         label: "Airtime & Data",      route: "airtime"        },
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
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius:  22,
    elevation:     20,
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
    height:        72,
  },

  tab: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    flexDirection:  "column",
    gap:            4,
    borderRadius:   18,
    margin:         6,
    position:       "relative",
  },

  tabLabel: {
    fontSize:      10,
    fontWeight:    "700",
    letterSpacing: 0.2,
    lineHeight:    12,
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
    width:          30,
    height:         30,
    alignItems:     "center",
    justifyContent: "center",
    marginRight:    12,
  },

  menuLabel: {
    fontSize:   16,
    fontWeight: "700",
    flex:       1,
  },

  expandIconWrapper: {
    width:          28,
    height:         28,
    alignItems:     "center",
    justifyContent: "center",
  },
});
