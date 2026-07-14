export const dark_default = {
  // BACKGROUND
  background: "#050708",
  backgroundSecondary: "#0B1014",
  backgroundTertiary: "#10171D",

  // SURFACE
  surface: "#0E1418",
  card: "#121A20",
  cardElevated: "#172128",
  modal: "#1A242D",

  // PRIMARY
  primary: "#00F5E1",
  primaryLight: "#37FFF0",
  primaryDark: "#00C7B8",

  // SECONDARY
  secondary: "#4CC9F0",
  secondaryDark: "#2B8DB1",

  // HEADER & TAB
  header: "#050708",
  headerBorder: "#172128",
  tabBackground: "#0A1014",
  tabBorder: "#172128",
  tabActive: "#00F5E1",
  tabInactive: "#6E7A85",

  // DRAWER
  drawerBackground: "#0A1014",
  drawerItem: "#D8E0E8",
  drawerItemActive: "#00F5E1",
  drawerItemBackground: "#121A20",

  // BORDER
  border: "#1C2B33",
  borderActive: "#00F5E1",
  divider: "#172128",

  // TEXT
  text: "#FFFFFF",
  textSecondary: "#D8E0E8",
  textMuted: "#8A98A6",
  textDisabled: "#5B6670",

  // INPUT
  inputBackground: "#121A20",
  inputBorder: "#1C2B33",
  inputBorderFocus: "#00F5E1",
  inputPlaceholder: "#6E7A85",

  // BUTTON
  buttonPrimary: "#00F5E1",
  buttonPrimaryText: "#050708",
  buttonSecondary: "#172128",
  buttonSecondaryText: "#FFFFFF",
  buttonDanger: "#FF4D67",
  buttonDangerText: "#FFFFFF",

  // STATUS
  success: "#00F5E1",
  warning: "#FACC15",
  danger: "#FF4D67",
  info: "#3B82F6",

  // MATCH & BETTING
  live: "#00F5E1",
  upcoming: "#3B82F6",
  finished: "#6B7280",
  suspended: "#FACC15",
  oddsUp: "#00F5E1",
  oddsDown: "#FF4D67",
  payout: "#00F5E1",
  loss: "#FF4D67",

  // BADGES
  badgeLiveBg: "rgba(0,245,225,0.15)",
  badgeLiveText: "#00F5E1",
  badgeWarningBg: "rgba(250,204,21,0.15)",
  badgeWarningText: "#FACC15",
  badgeDangerBg: "rgba(255,77,103,0.15)",
  badgeDangerText: "#FF4D67",

  // EFFECTS
  overlay: "rgba(0,0,0,0.7)",
  overlayHeavy: "rgba(0,0,0,0.8)",
  glow: "rgba(0,245,225,0.25)",
  glowSoft: "rgba(0,245,225,0.15)",
  gradientStart: "#050708",
  gradientMiddle: "#0B1014",
  gradientEnd: "#172128",

  // SKELETON
  skeletonBase: "#121A20",
  skeletonHighlight: "#1C2B33",

  // VIP
  vipGold: "#D4AF37",
  vipGoldLight: "#F6D878",
  vipGoldDark: "#A67C00",
  vipGoldBg: "rgba(212,175,55,0.15)",
  vipSilver: "#C0C0C0",
  vipSilverLight: "#E5E7EB",
  vipSilverDark: "#8A8F98",
  vipSilverBg: "rgba(192,192,192,0.12)",
};

export const light_default = {
  ...dark_default,
  background: "#F9FAFB",
  backgroundSecondary: "#FFFFFF",
  backgroundTertiary: "#F3F4F6",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",
  modal: "#FFFFFF",
  header: "#FFFFFF",
  headerBorder: "#E5E7EB",
  tabBackground: "#FFFFFF",
  tabBorder: "#E5E7EB",
  tabInactive: "#9CA3AF",
  drawerBackground: "#FFFFFF",
  drawerItem: "#4B5563",
  drawerItemBackground: "#F3F4F6",
  border: "#E5E7EB",
  divider: "#E5E7EB",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textDisabled: "#9CA3AF",
  inputBackground: "#F9FAFB",
  inputBorder: "#D1D5DB",
  inputPlaceholder: "#9CA3AF",
  buttonPrimaryText: "#FFFFFF",
  buttonSecondary: "#F3F4F6",
  buttonSecondaryText: "#111827",
  gradientStart: "#FFFFFF",
  gradientMiddle: "#F9FAFB",
  gradientEnd: "#F3F4F6",
  skeletonBase: "#E5E7EB",
  skeletonHighlight: "#F3F4F6",
  primary: "#00B4A6",
  primaryLight: "#00F5E1",
  primaryDark: "#008C82",
  tabActive: "#00B4A6",
  drawerItemActive: "#00B4A6",
  borderActive: "#00B4A6",
  inputBorderFocus: "#00B4A6",
  buttonPrimary: "#00B4A6",
  success: "#00B4A6",
  live: "#00B4A6",
  oddsUp: "#00B4A6",
  payout: "#00B4A6",
  badgeLiveBg: "rgba(0,180,166,0.15)",
  badgeLiveText: "#00B4A6",
  glow: "rgba(0,180,166,0.25)",
  glowSoft: "rgba(0,180,166,0.15)",
};

const createDarkTheme = (primary, primaryLight, primaryDark) => ({
  ...dark_default,
  primary, primaryLight, primaryDark,
  tabActive: primary,
  drawerItemActive: primary,
  borderActive: primary,
  inputBorderFocus: primary,
  buttonPrimary: primary,
  success: primary,
  live: primary,
  oddsUp: primary,
  payout: primary,
  badgeLiveBg: `rgba(191,0,255,0.15)`, // We will replace these manually
  badgeLiveText: primary,
  glow: `rgba(191,0,255,0.25)`,
  glowSoft: `rgba(191,0,255,0.15)`,
});

const createLightTheme = (primary, primaryLight, primaryDark) => ({
  ...light_default,
  primary, primaryLight, primaryDark,
  tabActive: primary,
  drawerItemActive: primary,
  borderActive: primary,
  inputBorderFocus: primary,
  buttonPrimary: primary,
  success: primary,
  live: primary,
  oddsUp: primary,
  payout: primary,
  badgeLiveBg: `rgba(191,0,255,0.15)`,
  badgeLiveText: primary,
  glow: `rgba(191,0,255,0.25)`,
  glowSoft: `rgba(191,0,255,0.15)`,
});

// PURPLE THEME
export const dark_purple = createDarkTheme("#BF00FF", "#D84DFF", "#8C00BC");
dark_purple.badgeLiveBg = "rgba(191,0,255,0.15)";
dark_purple.glow = "rgba(191,0,255,0.25)";
dark_purple.glowSoft = "rgba(191,0,255,0.15)";

export const light_purple = createLightTheme("#9B00FF", "#BF00FF", "#7100BC");
light_purple.badgeLiveBg = "rgba(155,0,255,0.15)";
light_purple.glow = "rgba(155,0,255,0.25)";
light_purple.glowSoft = "rgba(155,0,255,0.15)";

// YELLOW THEME
export const dark_yellow = createDarkTheme("#FFD300", "#FFE24D", "#CCAA00");
dark_yellow.badgeLiveBg = "rgba(255,211,0,0.15)";
dark_yellow.glow = "rgba(255,211,0,0.25)";
dark_yellow.glowSoft = "rgba(255,211,0,0.15)";
dark_yellow.buttonPrimaryText = "#050708"; // keep dark text for yellow button

export const light_yellow = createLightTheme("#D4AF00", "#FFD300", "#997A00");
light_yellow.badgeLiveBg = "rgba(212,175,0,0.15)";
light_yellow.glow = "rgba(212,175,0,0.25)";
light_yellow.glowSoft = "rgba(212,175,0,0.15)";
light_yellow.buttonPrimaryText = "#FFFFFF";

export const allThemes = {
  dark_default,
  light_default,
  dark_purple,
  light_purple,
  dark_yellow,
  light_yellow,
};
