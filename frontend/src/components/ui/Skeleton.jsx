import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useThemedStyles } from "../../hooks/useTheme";

/**
 * Pulsing placeholder block shown while API data loads.
 * @param {number|string} width - Block width
 * @param {number} height - Block height
 * @param {number} [radius] - Border radius
 * @param {object} [style] - Extra container styles
 */
const Skeleton = ({ width = "100%", height = 16, radius = 6, style }) => {
  const styles = useThemedStyles(makeStyles);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
};

/** Pre-composed skeleton mimicking a match card while lists load. */
export const MatchCardSkeleton = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width={120} height={12} />
        <Skeleton width={60} height={12} />
      </View>
      <View style={[styles.row, { marginVertical: 16 }]}>
        <Skeleton width={90} height={24} />
        <Skeleton width={40} height={16} />
        <Skeleton width={90} height={24} />
      </View>
      <View style={styles.row}>
        <Skeleton width="30%" height={36} />
        <Skeleton width="30%" height={36} />
        <Skeleton width="20%" height={36} />
      </View>
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  base: {
    backgroundColor: COLORS.skeletonBase,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default Skeleton;
