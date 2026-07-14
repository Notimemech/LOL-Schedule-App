import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "../../styles/colors";

/**
 * Reusable status badge pill used in match cards and market headers.
 * @param {string} label - Badge text (e.g. "OPEN", "CLOSED", "SETTLED")
 * @param {string} color - Text color token from COLORS
 * @param {string} bg - Background color
 * @param {string} borderColor - Border color
 */
const StatusBadge = ({ label, color = COLORS.textMuted, bg = COLORS.surface, borderColor = COLORS.border }) => (
  <View style={[styles.badge, { backgroundColor: bg, borderColor }]}>
    <Text style={[styles.text, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
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
