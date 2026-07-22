import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import CenterTabButton from "./CenterTabButton";
import { useNotifications } from "../../context/NotificationContext";

// [activeIcon, inactiveIcon] per route.
const ICONS = {
  Home: ["home", "home-outline"],
  Explore: ["trophy", "trophy-outline"],
  Notifications: ["notifications", "notifications-outline"],
  AIChat: ["sparkles", "sparkles-outline"],
  Profile: ["person-circle-outline", "person-outline"],
};

const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  return (
    <View
      style={[styles.wrapper, { bottom: 10 }]}
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

          if (route.name === "ScheduleStack") {
            return (
              <CenterTabButton
                key={route.key}
                onPress={onPress}
                accessibilityState={{ selected: focused }}
              />
            );
          }

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
                  size={28}
                  color={focused ? COLORS.tabActive : COLORS.tabInactive}
                />
                {/* Red dot badge */}
                {showBadge && <View style={styles.badge} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

<<<<<<< HEAD
const makeStyles = (COLORS) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      width: "90%",
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
      backgroundColor: "#EF4444",
      borderWidth: 1.5,
      borderColor: "#000",
    },
  });
=======
const makeStyles = (COLORS) => StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 70,
    borderRadius: 32,
    backgroundColor: COLORS.tabBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.overlayHeavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
>>>>>>> origin/pthao

export default FloatingTabBar;
