import React, { useRef } from "react";
import { View, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";

/**
 * Floating circular center button for the bottom tab bar (Schedule tab).
 *
 * The outer ring is painted with the SCREEN background color so it "punches"
 * a visible gap between the button and the floating pill bar — faking the
 * notch cutout without needing react-native-svg.
 *
 * States:
 * - default: solid primary circle, white outline icon
 * - focused: white border ring + filled icon in dark ink
 * - pressing: springs down to 88% scale
 */
const CenterTabButton = ({ onPress, accessibilityState }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const focused = accessibilityState?.selected;
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();
  };

  return (
    <Pressable
      style={styles.wrapper}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityLabel="Match schedule"
      accessibilityState={{ selected: !!focused }}
    >
      {/* Gap ring — same color as the screen background */}
      <View style={styles.gapRing}>
        <Animated.View
          style={[
            styles.circle,
            focused && styles.circleFocused,
            { transform: [{ scale }] },
          ]}
        >
          <Ionicons
            name={focused ? "flash" : "flash-outline"}
            size={26}
            color={focused ? COLORS.staticBlack : COLORS.staticWhite}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
  },
  gapRing: {
    top: -30,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  circleFocused: {
    borderWidth: 3,
    borderColor: COLORS.staticWhite,
    backgroundColor: COLORS.primaryLight,
  },
});

export default CenterTabButton;
