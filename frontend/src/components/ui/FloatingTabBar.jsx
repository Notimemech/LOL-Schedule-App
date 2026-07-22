import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import CenterTabButton from "./CenterTabButton";

// [activeIcon, inactiveIcon] per route.
const ICONS = {
  Home: ["home", "home-outline"],
  Explore: ["trophy", "trophy-outline"],
  Promotions: ["gift", "gift-outline"],
  Profile: ["person-circle-outline", "person-outline"],
};

// Custom tab bar so the pill width/position is fully under our control.
// React Navigation's built-in tabBarStyle ignores horizontal sizing on the
// floating bar, so we render our own centered pill instead.
const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

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

          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={route.name}
            >
              <Ionicons
                name={focused ? activeIcon : inactiveIcon}
                size={28}
                color={focused ? COLORS.tabActive : COLORS.tabInactive}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

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
    elevation: 12,
  },
  item: {
    flex: 1,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FloatingTabBar;
