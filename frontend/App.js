import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Pressable,
  StatusBar,
} from "react-native";
import ScheduleScreen from "./src/screens/matches/ScheduleScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import HomeScreen from "./src/screens/home/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ScheduleNavigation from "./src/navigation/ScheduleNavigation";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import COLORS from "./src/styles/colors";
import { useFonts } from "expo-font";

const BottomTab = createBottomTabNavigator();

export default function App() {
  const [loaded] = useFonts({
    Manrope: require("./assets/fonts/Manrope-Regular.ttf"),
    ManropeBold: require("./assets/fonts/Manrope-Bold.ttf"),
    ManropeExtraBold: require("./assets/fonts/Manrope-ExtraBold.ttf"),
    Inter: require("./assets/fonts/Inter_18pt-Regular.ttf"),
    SpaceGrotesk: require("./assets/fonts/SpaceGrotesk-Regular.ttf"),
    SpaceGroteskBold: require("./assets/fonts/SpaceGrotesk-Bold.ttf"),
  });

  if (!loaded) return null;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <BottomTab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,

            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "ScheduleStack") {
                iconName = focused ? "calendar" : "calendar-outline";
              } else if (route.name === "Profile") {
                iconName = focused ? "person-circle-outline" : "person-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },

            tabBarActiveTintColor: COLORS.tabActive,
            tabBarInactiveTintColor: COLORS.tabInactive,

            tabBarStyle: {
              backgroundColor: COLORS.tabBackground,
              height: 70,
            },
          })}
        >
          <BottomTab.Screen name="Home" component={HomeScreen} />
          <BottomTab.Screen
            name="ScheduleStack"
            component={ScheduleNavigation}
            options={({ route }) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? 'Schedule';
              return {
                tabBarLabel: "Schedule",
                tabBarStyle: routeName === 'Detail' ? { display: 'none' } : { backgroundColor: COLORS.tabBackground, height: 70 },
              };
            }}
          />
          <BottomTab.Screen name="Profile" component={ProfileScreen} />
        </BottomTab.Navigator>
      </NavigationContainer>
    </>
  );
}

