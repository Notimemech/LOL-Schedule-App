import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Pressable,
} from "react-native";
import ScheduleScreen from "./src/pages/ScheduleScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./src/pages/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ScheduleNavigation from "./src/navigation/ScheduleNavigation";
import ProfileScreen from "./src/pages/ProfileScreen";
import COLORS from "./src/style/color";

const BottomTab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <BottomTab.Navigator
      screenOptions={({ route }) => ({
          headerShown: false,

          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused
                ? "home"
                : "home-outline";
            }

            else if (route.name === "Schedule") {
              iconName = focused
                ? "calendar"
                : "calendar-outline";
            }

            else if (route.name === "Profile"){
              iconName = focused ? "person-circle-outline" : "person-outline";
            }

            return (
              <Ionicons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },

          tabBarActiveTintColor: COLORS.tabActive,
          tabBarInactiveTintColor: COLORS.tabInactive,

          tabBarStyle: {
            backgroundColor: COLORS.tabBackground,
            height: 70,
          },
        })}>
        <BottomTab.Screen name="Home" component={HomeScreen} />
        <BottomTab.Screen name="Schedule" component={ScheduleNavigation} />
        <BottomTab.Screen name="Profile" component={ProfileScreen}/>
      </BottomTab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
