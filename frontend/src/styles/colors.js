import { allThemes } from "./themes";

// Provide a way to synchronously set the theme during app initialization.
let currentThemeKey = "dark_default";

// Create a copy of the default theme to act as the mutable COLORS object.
const COLORS = { ...allThemes[currentThemeKey] };

export const setThemeSync = (key) => {
  if (allThemes[key]) {
    currentThemeKey = key;
    // Mutate the COLORS object so that any subsequent stylesheet creations
    // use the newly assigned theme values.
    Object.assign(COLORS, allThemes[key]);
  }
};

export const getCurrentThemeKey = () => currentThemeKey;

export default COLORS;
