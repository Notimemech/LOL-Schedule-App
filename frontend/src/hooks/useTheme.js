import { useContext, useMemo } from "react";
import { ThemeContext } from "../context/ThemeContext";

export const useTheme = () => useContext(ThemeContext);

// Usage: const styles = useThemedStyles(makeHomeStyles);
// Factories are memoized per theme so styles rebuild only on theme change.
export const useThemedStyles = (factory) => {
  const { colors, themeKey } = useTheme();
  return useMemo(() => factory(colors), [factory, themeKey, colors]);
};
