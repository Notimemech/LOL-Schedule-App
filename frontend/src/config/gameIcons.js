// =====================================================================
// GAME ICONS — single source of truth for role & key-event icons.
//
// Each entry currently uses a placeholder Ionicons name (`icon`).
// To swap in your own artwork later, just add a `uri` to the entry:
//
//     TOP: { uri: "https://cdn.yourapp.com/roles/top.png" },
//
// When `uri` is present the app renders an <Image>; otherwise it falls
// back to the Ionicons glyph. You don't need to touch any screen code —
// only edit this file.
// =====================================================================

// Player roles. LOL: TOP/JUNGLE/MID/ADC/SUPPORT.
// Dota 2: CARRY/MID/OFFLANE/SOFT SUPPORT/HARD SUPPORT.
export const ROLE_ICONS = {
  // League of Legends
  TOP: { icon: "shield-outline" },
  JUNGLE: { icon: "leaf-outline" },
  MID: { icon: "flash-outline" },
  ADC: { icon: "locate-outline" },
  SUPPORT: { icon: "heart-outline" },
  // Dota 2
  CARRY: { icon: "flame-outline" },
  OFFLANE: { icon: "shield-half-outline" },
  "SOFT SUPPORT": { icon: "people-outline" },
  "HARD SUPPORT": { icon: "heart-circle-outline" },
  // Fallback
  DEFAULT: { icon: "ellipse-outline" },
};

// Key in-game events (see backend gameevents.event_type).
export const EVENT_ICONS = {
  FIRST_BLOOD: { icon: "water" },
  TOWER: { icon: "business" },
  DRAGON: { icon: "flame" },
  ELDER: { icon: "flame" },
  HERALD: { icon: "eye" },
  BARON: { icon: "skull" },
  ROSHAN: { icon: "skull" },
  TORMENTOR: { icon: "cube" },
  GAME_END: { icon: "trophy" },
  DEFAULT: { icon: "ellipse" },
};

export const getRoleIcon = (role) => ROLE_ICONS[role] || ROLE_ICONS.DEFAULT;
export const getEventIcon = (type) => EVENT_ICONS[type] || EVENT_ICONS.DEFAULT;
