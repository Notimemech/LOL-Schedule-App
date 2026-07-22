import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "../../hooks/useTheme";

/**
 * Pulsing LIVE indicator. Uses the semantic `live` token (hot magenta in the
 * cyberpunk theme) so it stays distinct from the brand accent.
 */
const LiveBadge = ({ label = "LIVE" }) => {
  const styles = useThemedStyles(makeStyles);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={styles.badge} accessibilityLabel="Match is live">
      <Animated.View style={[styles.dot, { opacity }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.badgeLiveBg,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.live,
  },
  text: {
    color: COLORS.badgeLiveText,
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default LiveBadge;
