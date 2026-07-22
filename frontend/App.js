import { StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";

import HomeScreen from "./src/screens/home/HomeScreen";
import ScheduleNavigation from "./src/navigation/ScheduleNavigation";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import DetailScreen from "./src/screens/matches/DetailScreen";
import GameDetailScreen from "./src/screens/matches/GameDetailScreen";
import PlaceBetScreen from "./src/screens/betting/PlaceBetScreen";
import PromotionsScreen from "./src/screens/promotions/PromotionsScreen";
import WalletScreen from "./src/screens/wallet/WalletScreen";
import WithdrawScreen from "./src/screens/wallet/WithdrawScreen";
import DepositScreen from "./src/screens/wallet/DepositScreen";
import HistoryScreen from "./src/screens/profile/HistoryScreen";
import SettingScreen from "./src/screens/profile/SettingScreen";
import ThemeSettingScreen from "./src/screens/profile/ThemeSettingScreen";
import SignInScreen from "./src/screens/auth/SignInScreen";
import VipScreen from "./src/screens/profile/VipScreen";
import HelpCenterScreen from "./src/screens/help/HelpCenterScreen";
import TeamScreen from "./src/screens/team/TeamScreen";
import StandingsScreen from "./src/screens/standings/StandingsScreen";
import ExploreScreen from "./src/screens/explore/ExploreScreen";
import FloatingTabBar from "./src/components/ui/FloatingTabBar";
import AIChatScreen from "./src/screens/ai/AIChatScreen";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useTheme } from "./src/hooks/useTheme";

const BottomTab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <BottomTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="Explore" component={ExploreScreen} />
      {/* Schedule sits in the center as a raised action button */}
      <BottomTab.Screen name="ScheduleStack" component={ScheduleNavigation} />
      <BottomTab.Screen name="AIChat" component={AIChatScreen} />
      <BottomTab.Screen name="Promotions" component={PromotionsScreen} />
      <BottomTab.Screen name="Profile" component={ProfileScreen} />
    </BottomTab.Navigator>
  );
}

function AppNavigator({ initialRouteName }) {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <NavigationContainer>
        <RootStack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="SignIn" component={SignInScreen} />
          <RootStack.Screen name="MainTabs" component={TabNavigator} />
          <RootStack.Screen name="Detail" component={DetailScreen} />
          <RootStack.Screen name="GameDetail" component={GameDetailScreen} />
          <RootStack.Screen name="PlaceBet" component={PlaceBetScreen} />

          {/* Companion Hub */}
          <RootStack.Screen name="Team" component={TeamScreen} />
          <RootStack.Screen name="Standings" component={StandingsScreen} />

          {/* Wallet & profile screens */}
          <RootStack.Screen name="WalletScreen" component={WalletScreen} />
          <RootStack.Screen name="Deposit" component={DepositScreen} />
          <RootStack.Screen name="WithdrawScreen" component={WithdrawScreen} />
          <RootStack.Screen name="HistoryScreen" component={HistoryScreen} />
          <RootStack.Screen name="SettingScreen" component={SettingScreen} />
          <RootStack.Screen name="ThemeSettingScreen" component={ThemeSettingScreen} />
          <RootStack.Screen name="VipScreen" component={VipScreen} />
          <RootStack.Screen name="HelpCenter" component={HelpCenterScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App({ initialRouteName = "SignIn" }) {
  const [loaded] = useFonts({
    Manrope: require("./assets/fonts/Manrope-Regular.ttf"),
    ManropeMedium: require("./assets/fonts/Manrope-Medium.ttf"),
    ManropeBold: require("./assets/fonts/Manrope-Bold.ttf"),
    ManropeExtraBold: require("./assets/fonts/Manrope-ExtraBold.ttf"),
    Inter: require("./assets/fonts/Inter_18pt-Regular.ttf"),
    SpaceGrotesk: require("./assets/fonts/SpaceGrotesk-Regular.ttf"),
    SpaceGroteskBold: require("./assets/fonts/SpaceGrotesk-Bold.ttf"),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AppNavigator initialRouteName={initialRouteName} />
    </ThemeProvider>
  );
}
