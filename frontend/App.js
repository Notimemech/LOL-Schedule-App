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
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./src/screens/home/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ScheduleNavigation from "./src/navigation/ScheduleNavigation";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import DetailScreen from "./src/screens/matches/DetailScreen";
import PlaceBetScreen from "./src/screens/betting/PlaceBetScreen";
import PromotionsScreen from "./src/screens/promotions/PromotionsScreen";
import COLORS from "./src/styles/colors";
import { useFonts } from "expo-font";
import WalletScreen from "./src/screens/wallet/WalletScreen"; // Import file bạn vừa tạo
import WithdrawScreen from "./src/screens/wallet/WithdrawScreen";
import HistoryScreen from "./src/screens/profile/HistoryScreen";
import SettingScreen from "./src/screens/profile/SettingScreen";
import SignInScreen from "./src/screens/auth/SignInScreen";

const BottomTab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ScheduleStack") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Promotions") {
            iconName = focused ? "gift" : "gift-outline";
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
        options={{ tabBarLabel: "Schedule" }}
      />
      <BottomTab.Screen name="Promotions" component={PromotionsScreen} />
      <BottomTab.Screen name="Profile" component={ProfileScreen} />
    </BottomTab.Navigator>
  );
}

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
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="SignIn" component={SignInScreen} />
          <RootStack.Screen name="MainTabs" component={TabNavigator} />
          <RootStack.Screen name="Detail" component={DetailScreen} />
          <RootStack.Screen name="PlaceBet" component={PlaceBetScreen} />
          
          {/* Màn hình Profile */}
          <RootStack.Screen name="WalletScreen" component={WalletScreen} />
          <RootStack.Screen name="WithdrawScreen" component={WithdrawScreen} />
          <RootStack.Screen name="HistoryScreen" component={HistoryScreen} />
          <RootStack.Screen name="SettingScreen" component={SettingScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  );
}

