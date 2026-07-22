import React, { useEffect, useRef } from "react";
import { View, Pressable, StyleSheet, Animated, DeviceEventEmitter } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { TABBAR_VISIBILITY_EVENT } from "../../hooks/useTabBarAutoHide";
import { useNotifications } from "../../context/NotificationContext";

// [activeIcon, inactiveIcon] per route.
const ICONS = {
  Home: ["home", "home-outline"],
  Explore: ["trophy", "trophy-outline"],
  ScheduleStack: ["calendar", "calendar-outline"],
  Notifications: ["notifications", "notifications-outline"],
  Profile: ["person-circle-outline", "person-outline"],
};

// Far enough to clear bar height + bottom inset on any device.
const HIDDEN_OFFSET = 140;

const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  const translateY = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  // Screens broadcast scroll direction; slide the whole bar in/out.
  // Showing is slightly slower than hiding so the bar feels calm, not jumpy.
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(TABBAR_VISIBILITY_EVENT, (visible) => {
      Animated.timing(translateY, {
        toValue: visible ? 0 : HIDDEN_OFFSET,
        duration: visible ? 340 : 240,
        useNativeDriver: true,
      }).start();
    });
    return () => sub.remove();
  }, [translateY]);

  // Switching tabs always brings the bar back.
  useEffect(() => {
    Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  }, [state.index, translateY]);

  // Endless twinkle loop for the AI button sparkles.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [twinkle]);

  const sparkleA = {
    opacity: twinkle,
    transform: [{ scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.1] }) }],
  };
  const sparkleB = {
    opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.15] }),
    transform: [
      { scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) },
    ],
  };
  const aiPulse = {
    transform: [
      { scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, 10), transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const [activeIcon, inactiveIcon] = ICONS[route.name] || [
            "ellipse",
            "ellipse-outline",
          ];

          const showBadge = route.name === "Notifications" && unreadCount > 0;

          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={route.name}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={focused ? activeIcon : inactiveIcon}
                  size={26}
                  color={focused ? COLORS.tabActive : COLORS.tabInactive}
                />
                {/* Red dot badge */}
                {showBadge && <View style={styles.badge} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* AI assistant — full-screen stack page, deliberately NOT a tab so the
          tab bar disappears while chatting. */}
      <Animated.View style={aiPulse}>
        <Pressable
          style={styles.aiButton}
          onPress={() => navigation.navigate("AIChat")}
          accessibilityRole="button"
          accessibilityLabel="AI assistant"
        >
          <Ionicons name="sparkles" size={30} color={COLORS.primary} />
          <Animated.View style={[styles.sparkle, styles.sparkleTopRight, sparkleA]}>
            <Ionicons name="sparkles" size={12} color={COLORS.secondary} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkleBottomLeft, sparkleB]}>
            <Ionicons name="star" size={9} color={COLORS.primary} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const makeStyles = (COLORS) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      gap: 12,
    },
    pill: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: 70,
      borderRadius: 32,
      backgroundColor: COLORS.tabBackground,
      borderWidth: 1,
      borderColor: COLORS.primary,
      shadowColor: COLORS.overlayHeavy,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
    },
    item: {
      flex: 1,
      height: 64,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrap: {
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -4,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: COLORS.danger,
      borderWidth: 1.5,
      borderColor: COLORS.background,
    },
    aiButton: {
      width: 78,
      height: 78,
      borderRadius: 39,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.tabBackground,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.55,
      shadowRadius: 14,
      elevation: 14,
    },
    sparkle: {
      position: "absolute",
    },
    sparkleTopRight: {
      top: 12,
      right: 13,
    },
    sparkleBottomLeft: {
      bottom: 14,
      left: 15,
    },
  });

export default FloatingTabBar;
