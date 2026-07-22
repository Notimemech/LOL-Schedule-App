import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";

/**
 * Reusable status badge pill used in match cards and market headers.
 * @param {string} label - Badge text (e.g. "OPEN", "CLOSED", "SETTLED")
 * @param {string} color - Text color token from theme
 * @param {string} bg - Background color
 * @param {string} borderColor - Border color
 */
const StatusBadge = ({ label, color, bg, borderColor }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg || COLORS.surface, borderColor: borderColor || COLORS.border },
      ]}
    >
      <Text style={[styles.text, { color: color || COLORS.textMuted }]}>{label}</Text>
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 10,
    letterSpacing: 1,
  },
});

export default StatusBadge;
