import { useEffect } from "react";
import {
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./src/screens/home/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ScheduleNavigation from "./src/navigation/ScheduleNavigation";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import DetailScreen from "./src/screens/matches/DetailScreen";
import PlaceBetScreen from "./src/screens/betting/PlaceBetScreen";
import PromotionScreen from "./src/screens/promotions/PromotionScreen";
import PromotionDetailScreen from "./src/screens/promotions/PromotionDetailScreen";
import SignIn from "./src/screens/auth/SignInScreen";
import SignUp from "./src/screens/auth/SignUpScreen";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import COLORS from "./src/styles/colors";
import { useFonts } from "expo-font";
import NotificationService from "./src/services/NotificationService";
import Icon from "react-native-vector-icons/FontAwesome";

const BottomTab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const PromoStack = createNativeStackNavigator();
const GuestPromoStack = createNativeStackNavigator();

// ─── Promotions stack (có PromotionDetail) ─────────────────────────────────────
function PromotionStackNav() {
  return (
    <PromoStack.Navigator screenOptions={{ headerShown: false }}>
      <PromoStack.Screen name="PromotionList" component={PromotionScreen} />
      <PromoStack.Screen name="PromotionDetail" component={PromotionDetailScreen} />
    </PromoStack.Navigator>
  );
}

function GuestPromotionStackNav() {
  return (
    <GuestPromoStack.Navigator screenOptions={{ headerShown: false }}>
      <GuestPromoStack.Screen name="PromotionList" component={PromotionScreen} />
      <GuestPromoStack.Screen name="PromotionDetail" component={PromotionDetailScreen} />
    </GuestPromoStack.Navigator>
  );
}

// ─── Tab navigator for AUTHENTICATED users ────────────────────────────────────
function AuthenticatedTabs() {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          } else if (route.name === "ScheduleStack") {
            return <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />;
          } else if (route.name === "Promotions") {
            return <Icon name="tags" size={size - 2} color={color} />;
          } else if (route.name === "Profile") {
            return <Ionicons name={focused ? "person-circle-outline" : "person-outline"} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.tabBackground,
          borderTopColor: COLORS.tabBorder,
          borderTopWidth: 1,
          height: 70,
        },
        tabBarLabelStyle: {
          fontFamily: "ManropeBold",
          fontSize: 10,
        },
      })}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Trang chủ" }} />
      <BottomTab.Screen
        name="ScheduleStack"
        component={ScheduleNavigation}
        options={{ tabBarLabel: "Lịch đấu" }}
      />
      <BottomTab.Screen
        name="Promotions"
        component={PromotionStackNav}
        options={{ tabBarLabel: "Ưu đãi" }}
      />
      <BottomTab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Cá nhân" }} />
    </BottomTab.Navigator>
  );
}

// ─── Tab navigator for GUEST users ────────────────────────────────────────────
function GuestTabs() {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          } else if (route.name === "GuestPromotions") {
            return <Icon name="tags" size={size - 2} color={color} />;
          } else if (route.name === "GuestLogin") {
            return <Ionicons name="log-in-outline" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.tabBackground,
          borderTopColor: COLORS.tabBorder,
          borderTopWidth: 1,
          height: 70,
        },
        tabBarLabelStyle: {
          fontFamily: "ManropeBold",
          fontSize: 10,
        },
      })}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Trang chủ" }} />
      <BottomTab.Screen
        name="GuestPromotions"
        component={GuestPromotionStackNav}
        options={{ tabBarLabel: "Ưu đãi" }}
      />
      <BottomTab.Screen
        name="GuestLogin"
        component={SignIn}
        options={{ tabBarLabel: "Đăng nhập" }}
      />
    </BottomTab.Navigator>
  );
}

// ─── Guest Root Stack ────────────────────────────────────────────────────────
function GuestRoot() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="GuestTabs" component={GuestTabs} />
      <RootStack.Screen name="Login" component={SignIn} />
      <RootStack.Screen name="SignUp" component={SignUp} />
    </RootStack.Navigator>
  );
}

// ─── Authenticated Root Stack ────────────────────────────────────────────────
function AuthenticatedRoot() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={AuthenticatedTabs} />
      <RootStack.Screen name="Detail" component={DetailScreen} />
      <RootStack.Screen name="PlaceBet" component={PlaceBetScreen} />
    </RootStack.Navigator>
  );
}

// ─── Root navigator – decides auth state ─────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      NotificationService.requestPermissions().then((granted) => {
        if (granted) {
          NotificationService.scheduleDailyPromoReminder();
          // Nhắc nhở promotion sau 3 giây
          setTimeout(() => {
            NotificationService.notifyActiveUser();
          }, 3000);
        }
      });
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return user ? <AuthenticatedRoot /> : <GuestRoot />;
}

// ─── App Entry ────────────────────────────────────────────────────────────────
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
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
