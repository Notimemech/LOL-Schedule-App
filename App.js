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

const BottomTab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <BottomTab.Navigator
      screenOptions={({ route }) => ({
          headerShown: true,

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

            return (
              <Ionicons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },

          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "gray",

          tabBarStyle: {
            height: 70,
          },
        })}>
        <BottomTab.Screen name="Home" component={HomeScreen} />
        <BottomTab.Screen name="Schedule" component={ScheduleScreen} />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
