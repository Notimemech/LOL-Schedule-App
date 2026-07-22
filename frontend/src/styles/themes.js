// Theme tokens for the whole app.
// Rules (agents/UI_GUIDELINE.md): components must ONLY consume these tokens,
// never hardcoded hex values. Semantic colors (success/danger/live/vip) are
// intentionally separate from brand colors so switching the brand accent
// never changes the meaning of "won bet" or "live match".

// Because RN needs rgba strings for translucent fills, glows are derived
// from their source color here instead of being hardcoded per theme.
export const hexToRgba = (hex, alpha) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Semantic colors shared by every dark theme. Kept out of createDarkTheme's
// arguments so a brand-accent change can never repaint win/loss states.
const DARK_SEMANTIC = {
  success: "#3DF58C",
  warning: "#FFB020",
  danger: "#FF3B5C",
  info: "#4D8DFF",

  // MATCH & BETTING
  live: "#FF2E88",
  upcoming: "#4D8DFF",
  finished: "#5B6680",
  suspended: "#FFB020",
  oddsUp: "#3DF58C",
  oddsDown: "#FF3B5C",
  payout: "#3DF58C",
  loss: "#FF3B5C",

  // BADGES
  badgeLiveBg: hexToRgba("#FF2E88", 0.15),
  badgeLiveText: "#FF2E88",
  badgeSuccessBg: hexToRgba("#3DF58C", 0.12),
  badgeSuccessText: "#3DF58C",
  badgeWarningBg: hexToRgba("#FFB020", 0.15),
  badgeWarningText: "#FFB020",
  badgeDangerBg: hexToRgba("#FF3B5C", 0.15),
  badgeDangerText: "#FF3B5C",
};

const LIGHT_SEMANTIC = {
  success: "#0E9F5D",
  warning: "#B87700",
  danger: "#D92645",
  info: "#2563EB",

  live: "#D91E70",
  upcoming: "#2563EB",
  finished: "#6B7280",
  suspended: "#B87700",
  oddsUp: "#0E9F5D",
  oddsDown: "#D92645",
  payout: "#0E9F5D",
  loss: "#D92645",

  badgeLiveBg: hexToRgba("#D91E70", 0.12),
  badgeLiveText: "#D91E70",
  badgeSuccessBg: hexToRgba("#0E9F5D", 0.12),
  badgeSuccessText: "#0E9F5D",
  badgeWarningBg: hexToRgba("#B87700", 0.12),
  badgeWarningText: "#B87700",
  badgeDangerBg: hexToRgba("#D92645", 0.12),
  badgeDangerText: "#D92645",
};

// VIP tier colors live here (not per-theme) so BetHistorySection and
// ProfileScreen share one source instead of duplicating gradient arrays.
const VIP_GRADIENTS = {
  "VIP 5": ["#FFD700", "#DAA520"],
  "VIP 4": ["#FF6B2C", "#F5AF19"],
  "VIP 3": ["#B44DFF", "#8B5CF6"],
  "VIP 2": ["#00C6FF", "#0072FF"],
  DEFAULT: ["#11998E", "#38EF7D"],
};

export const getVipColors = (vipName) =>
  VIP_GRADIENTS[vipName] || VIP_GRADIENTS.DEFAULT;

// Chassis = everything that is NOT the brand accent.
// Navy-tinted blacks instead of neutral blacks: the blue undertone is what
// reads as "tech/cyberpunk" instead of "generic dark mode".
const DARK_CHASSIS = {
  // Constant colors for content sitting on gradients (VIP cards, CTA buttons)
  // — identical in every theme by design.
  staticWhite: "#FFFFFF",
  staticBlack: "#0A0A12",

  // BACKGROUND
  background: "#05060E",
  backgroundSecondary: "#090C18",
  backgroundTertiary: "#0E1322",

  // SURFACE
  surface: "#0B0F1E",
  card: "#121A30",
  cardElevated: "#182240",
  modal: "#1A2545",

  // HEADER & TAB
  header: "#05060E",
  headerBorder: "#182240",
  tabBackground: "#090C18",
  tabBorder: "#182240",
  tabInactive: "#6B7694",

  // DRAWER
  drawerBackground: "#090C18",
  drawerItem: "#B8C4E0",
  drawerItemBackground: "#121A30",

  // BORDER
  border: "#1E2A4A",
  divider: "#161F38",

  // TEXT — ice-white with a blue tint to match the chassis
  text: "#EAF0FF",
  textSecondary: "#B8C4E0",
  textMuted: "#8A93B2",
  textDisabled: "#525C78",

  // INPUT
  inputBackground: "#121A30",
  inputBorder: "#1E2A4A",
  inputPlaceholder: "#6B7694",

  // BUTTON (non-brand)
  buttonSecondary: "#182240",
  buttonSecondaryText: "#EAF0FF",
  buttonDanger: "#FF3B5C",
  buttonDangerText: "#FFFFFF",

  // EFFECTS
  overlay: "rgba(2,4,12,0.7)",
  overlayHeavy: "rgba(2,4,12,0.85)",
  gradientStart: "#05060E",
  gradientMiddle: "#090C18",
  gradientEnd: "#182240",

  // SKELETON
  skeletonBase: "#121A30",
  skeletonHighlight: "#1E2A4A",

  // VIP (legacy flat tokens still referenced by older styles)
  vipGold: "#D4AF37",
  vipGoldLight: "#F6D878",
  vipGoldDark: "#A67C00",
  vipGoldBg: hexToRgba("#D4AF37", 0.15),
  vipSilver: "#C0C0C0",
  vipSilverLight: "#E5E7EB",
  vipSilverDark: "#8A8F98",
  vipSilverBg: hexToRgba("#C0C0C0", 0.12),
};

const LIGHT_CHASSIS = {
  staticWhite: "#FFFFFF",
  staticBlack: "#0A0A12",

  background: "#F7F8FC",
  backgroundSecondary: "#FFFFFF",
  backgroundTertiary: "#EEF1F8",

  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",
  modal: "#FFFFFF",

  header: "#FFFFFF",
  headerBorder: "#E2E6F0",
  tabBackground: "#FFFFFF",
  tabBorder: "#E2E6F0",
  tabInactive: "#9AA3B8",

  drawerBackground: "#FFFFFF",
  drawerItem: "#4B5563",
  drawerItemBackground: "#EEF1F8",

  border: "#E2E6F0",
  divider: "#E2E6F0",

  text: "#101528",
  textSecondary: "#3A4258",
  textMuted: "#6B7490",
  textDisabled: "#9AA3B8",

  inputBackground: "#F7F8FC",
  inputBorder: "#D3D9E8",
  inputPlaceholder: "#9AA3B8",

  buttonSecondary: "#EEF1F8",
  buttonSecondaryText: "#101528",
  buttonDanger: "#D92645",
  buttonDangerText: "#FFFFFF",

  overlay: "rgba(16,21,40,0.5)",
  overlayHeavy: "rgba(16,21,40,0.65)",
  gradientStart: "#FFFFFF",
  gradientMiddle: "#F7F8FC",
  gradientEnd: "#EEF1F8",

  skeletonBase: "#E2E6F0",
  skeletonHighlight: "#EEF1F8",

  vipGold: "#B8860B",
  vipGoldLight: "#D4AF37",
  vipGoldDark: "#8B6508",
  vipGoldBg: hexToRgba("#B8860B", 0.12),
  vipSilver: "#8A8F98",
  vipSilverLight: "#C0C0C0",
  vipSilverDark: "#6B7280",
  vipSilverBg: hexToRgba("#8A8F98", 0.12),
};

// Accent = { primary triplet, secondary (hot counterpoint), violet depth }.
// Glows are computed from their own source color — never hardcoded — which
// fixes the old bug where every theme glowed purple.
const buildAccent = ({ primary, primaryLight, primaryDark, secondary, secondaryDark, accent, accentDark, onPrimary }) => ({
  primary,
  primaryLight,
  primaryDark,
  secondary,
  secondaryDark,
  accent,
  accentDark,

  tabActive: primary,
  drawerItemActive: primary,
  borderActive: primary,
  inputBorderFocus: primary,
  buttonPrimary: primary,
  buttonPrimaryText: onPrimary,

  glow: hexToRgba(primary, 0.25),
  glowSoft: hexToRgba(primary, 0.1),
  glowSecondary: hexToRgba(secondary, 0.18),
  glowAccent: hexToRgba(accent, 0.18),
});

const createDarkTheme = (accentConfig, bannerGradients) => ({
  ...DARK_CHASSIS,
  ...DARK_SEMANTIC,
  ...buildAccent(accentConfig),
  bannerGradients,
});

const createLightTheme = (accentConfig, bannerGradients) => ({
  ...LIGHT_CHASSIS,
  ...LIGHT_SEMANTIC,
  ...buildAccent(accentConfig),
  bannerGradients,
});

// ============ CYBERPUNK (default) ============
// Cold cyan brand × hot magenta counterpoint × violet depth.
export const dark_cyberpunk = createDarkTheme(
  {
    primary: "#00F0FF",
    primaryLight: "#5CF6FF",
    primaryDark: "#00B8CC",
    secondary: "#FF2E88",
    secondaryDark: "#C21D66",
    accent: "#8B5CF6",
    accentDark: "#6D3FD4",
    onPrimary: "#05060E",
  },
  [
    ["#0E1E45", "#131A38", "#05060E"],
    ["#2A1150", "#1C1440", "#05060E"],
    ["#04303F", "#0A2436", "#05060E"],
    ["#3A0F33", "#231238", "#05060E"],
  ]
);

export const light_cyberpunk = createLightTheme(
  {
    primary: "#0099A8",
    primaryLight: "#00C4D6",
    primaryDark: "#00707C",
    secondary: "#D91E70",
    secondaryDark: "#A8154F",
    accent: "#7C3AED",
    accentDark: "#5B21B6",
    onPrimary: "#FFFFFF",
  },
  [
    ["#DCE9FF", "#EAF0FF", "#F7F8FC"],
    ["#EBDFFF", "#F1EAFF", "#F7F8FC"],
    ["#D8F6FB", "#E8FAFD", "#F7F8FC"],
    ["#FBDCEC", "#FDECF4", "#F7F8FC"],
  ]
);

// ============ LEGACY TEAL ============
export const dark_default = createDarkTheme(
  {
    primary: "#00F5E1",
    primaryLight: "#37FFF0",
    primaryDark: "#00C7B8",
    secondary: "#FF2E88",
    secondaryDark: "#C21D66",
    accent: "#8B5CF6",
    accentDark: "#6D3FD4",
    onPrimary: "#05060E",
  },
  dark_cyberpunk.bannerGradients
);

export const light_default = createLightTheme(
  {
    primary: "#00B4A6",
    primaryLight: "#00F5E1",
    primaryDark: "#008C82",
    secondary: "#D91E70",
    secondaryDark: "#A8154F",
    accent: "#7C3AED",
    accentDark: "#5B21B6",
    onPrimary: "#FFFFFF",
  },
  light_cyberpunk.bannerGradients
);

// ============ PURPLE ============
export const dark_purple = createDarkTheme(
  {
    primary: "#BF00FF",
    primaryLight: "#D84DFF",
    primaryDark: "#8C00BC",
    secondary: "#00F0FF",
    secondaryDark: "#00B8CC",
    accent: "#FF2E88",
    accentDark: "#C21D66",
    onPrimary: "#FFFFFF",
  },
  dark_cyberpunk.bannerGradients
);

export const light_purple = createLightTheme(
  {
    primary: "#9B00FF",
    primaryLight: "#BF00FF",
    primaryDark: "#7100BC",
    secondary: "#0099A8",
    secondaryDark: "#00707C",
    accent: "#D91E70",
    accentDark: "#A8154F",
    onPrimary: "#FFFFFF",
  },
  light_cyberpunk.bannerGradients
);

// ============ YELLOW ============
export const dark_yellow = createDarkTheme(
  {
    primary: "#FFD300",
    primaryLight: "#FFE24D",
    primaryDark: "#CCAA00",
    secondary: "#FF2E88",
    secondaryDark: "#C21D66",
    accent: "#8B5CF6",
    accentDark: "#6D3FD4",
    onPrimary: "#05060E",
  },
  dark_cyberpunk.bannerGradients
);

export const light_yellow = createLightTheme(
  {
    primary: "#D4AF00",
    primaryLight: "#FFD300",
    primaryDark: "#997A00",
    secondary: "#D91E70",
    secondaryDark: "#A8154F",
    accent: "#7C3AED",
    accentDark: "#5B21B6",
    onPrimary: "#FFFFFF",
  },
  light_cyberpunk.bannerGradients
);

export const allThemes = {
  dark_cyberpunk,
  light_cyberpunk,
  dark_default,
  light_default,
  dark_purple,
  light_purple,
  dark_yellow,
  light_yellow,
};

export const DEFAULT_THEME_KEY = "dark_cyberpunk";
