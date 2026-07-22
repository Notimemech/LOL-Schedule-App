import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";

/**
 * Empty/error state with optional retry action.
 * @param {string} [icon] - Ionicons name
 * @param {string} message - Main message
 * @param {string} [hint] - Secondary line
 * @param {string} [actionLabel] - Retry/action button label
 * @param {() => void} [onAction] - Action handler; button hidden when omitted
 */
const EmptyState = ({ icon = "cloud-offline-outline", message, hint, actionLabel, onAction }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={COLORS.textMuted} />
      <Text style={styles.message}>{message}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {onAction ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || "Retry"}
        >
          <Ionicons name="refresh-outline" size={14} color={COLORS.primary} />
          <Text style={styles.buttonText}>{(actionLabel || "RETRY").toUpperCase()}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 8,
  },
  message: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
  hint: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glowSoft,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

export default EmptyState;
