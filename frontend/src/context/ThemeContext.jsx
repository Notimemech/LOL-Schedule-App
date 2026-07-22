import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { allThemes, DEFAULT_THEME_KEY } from "../styles/themes";
import { setThemeSync } from "../styles/colors";

const THEME_STORAGE_KEY = "appTheme";

export const ThemeContext = createContext({
  themeKey: DEFAULT_THEME_KEY,
  colors: allThemes[DEFAULT_THEME_KEY],
  isDark: true,
  setTheme: () => {},
});

// Provides live theme switching: setTheme updates context (re-rendering every
// consumer immediately — no app restart) and persists the choice.
export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY);

  useEffect(() => {
    const restoreTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && allThemes[saved]) {
          setThemeSync(saved);
          setThemeKey(saved);
        }
      } catch (e) {
        // Fall back to default theme silently — theming must never block startup.
      }
    };
    restoreTheme();
  }, []);

  const setTheme = useCallback(async (key) => {
    if (!allThemes[key]) return;
    setThemeSync(key); // keep legacy static COLORS imports in sync
    setThemeKey(key);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, key);
    } catch (e) {
      // Persist failure only affects next launch; ignore.
    }
  }, []);

  const value = useMemo(
    () => ({
      themeKey,
      colors: allThemes[themeKey],
      isDark: themeKey.startsWith("dark"),
      setTheme,
    }),
    [themeKey, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
