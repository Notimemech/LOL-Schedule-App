import { allThemes, DEFAULT_THEME_KEY } from "./themes";

// Legacy bridge: some code still imports a static COLORS object.
// ThemeContext keeps this object in sync (via setThemeSync) so stragglers
// render the right colors after the provider re-renders the tree.
// New code should use useTheme()/useThemedStyles() instead.
let currentThemeKey = DEFAULT_THEME_KEY;

const COLORS = { ...allThemes[currentThemeKey] };

export const setThemeSync = (key) => {
  if (allThemes[key]) {
    currentThemeKey = key;
    Object.assign(COLORS, allThemes[key]);
  }
};

export const getCurrentThemeKey = () => currentThemeKey;

export default COLORS;
