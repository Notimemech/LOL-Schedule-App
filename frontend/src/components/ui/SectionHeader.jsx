import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "../../hooks/useTheme";

/**
 * Reusable section header with optional right slot.
 * @param {string} title - Section title
 * @param {React.ReactNode} [rightSlot] - Optional component to render on the right (e.g. a button or badge)
 * @param {object} [style] - Optional override styles for the container
 */
const SectionHeader = ({ title, rightSlot, style }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {rightSlot && <View>{rightSlot}</View>}
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

export default SectionHeader;
