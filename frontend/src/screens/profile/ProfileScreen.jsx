import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
  Animated,
  Image,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { getVipColors } from "../../styles/themes";
import { makeProfileStyles } from "../../styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import { formatMoney } from "../../utils/format";
import CustomAlert from "../../components/common/CustomAlert";
import FollowingSection from "./FollowingSection";

// ─── Setting Row ──────────────────────────────────────────────────
const SettingRow = ({ icon, iconColor, label, onPress, style, COLORS }) => (
  <TouchableOpacity
    style={style.settingRow}
    onPress={onPress}
    activeOpacity={0.65}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={style.settingLabelWrap}>
      <View style={[style.settingIconBox, iconColor && { borderColor: iconColor + "40", backgroundColor: iconColor + "18" }]}>
        <Icon name={icon} size={15} color={iconColor || COLORS.textMuted} />
      </View>
      <Text style={style.settingText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
  </TouchableOpacity>
);

// ─── Quick Action Card ─────────────────────────────────────────────
const QuickActionCard = ({ icon, iconColor, label, onPress, style, COLORS }) => (
  <TouchableOpacity
    style={style.quickActionCard}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={[style.quickActionIcon, { borderColor: iconColor + "40", backgroundColor: iconColor + "18" }]}>
      <Icon name={icon} size={22} color={iconColor} />
    </View>
    <Text style={style.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

// ─── Main Screen ───────────────────────────────────────────────────
const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const style = useThemedStyles(makeProfileStyles);

  const [username, setUsername] = useState("User");
  const [balance, setBalance] = useState(0);
  const [vipStatus, setVipStatus] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    isError: false,
    onConfirm: () => { },
    onCancel: null,
    confirmText: "OK",
    cancelText: "CANCEL",
  });

  const showAlert = (
    title,
    message,
    isError = false,
    onConfirm = null,
    onCancel = null,
    confirmText = "OK",
    cancelText = "CANCEL"
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      isError,
      onConfirm: onConfirm || (() => hideAlert()),
      onCancel,
      confirmText,
      cancelText,
    });
  };

  const hideAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  // ── VIP badge pulse ──────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ── Load profile ─────────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem("userInfo");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsername(parsed.username || parsed.name || parsed.email || "User");
      }

      const { getWalletBalance } = await import(
        "../../services/bettingService"
      );
      const b = await getWalletBalance();
      setBalance(b);

      const api = (await import("../../services/api")).default;
      try {
        const rawUser = await AsyncStorage.getItem("userInfo");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          const userId = parsed.id;
          const statusRes = await api.get(`/vip/status/${userId}`);
          if (statusRes && statusRes.data) setVipStatus(statusRes.data);
        }
      } catch (_) {
        // VIP status is optional
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (mounted) loadProfile();
      return () => {
        mounted = false;
      };
    }, [])
  );

  useEffect(() => {
    let mounted = true;
    const sub = DeviceEventEmitter.addListener(
      "wallet:transactions-updated",
      () => {
        if (mounted) loadProfile();
      }
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  // ── Logout ───────────────────────────────────────────────────────
  const handleLogout = () => {
    showAlert(
      "Sign Out",
      "Are you sure you want to sign out?",
      false,
      async () => {
        try {
          await AsyncStorage.multiRemove(["userInfo", "token", "accessToken"]);
          hideAlert();
          navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
        } catch (err) {
          console.error("Logout failed:", err);
          showAlert("Error", "Unable to sign out right now.", true);
        }
      },
      () => hideAlert(),
      "SIGN OUT",
      "CANCEL"
    );
  };

  // ── Data ─────────────────────────────────────────────────────────
  const quickActions = [
    { icon: "gift", iconColor: COLORS.primary, label: "Promotions", route: "Promotions" },
    { icon: "money-bill-transfer", iconColor: COLORS.secondary, label: "Withdraw", route: "WithdrawScreen" },
    { icon: "clock-rotate-left", iconColor: COLORS.accent || COLORS.primary, label: "History", route: "HistoryScreen" },
    { icon: "crown", iconColor: "#F59E0B", label: "VIP", route: "VipScreen" },
  ];

  const preferenceItems = [
    { icon: "user-pen", iconColor: COLORS.primary, label: "Edit Profile", onPress: () => navigation.navigate("EditProfile") },
    { icon: "palette", iconColor: COLORS.secondary, label: "Themes", onPress: () => navigation.navigate("ThemeSettingScreen") },
    { icon: "headset", iconColor: COLORS.primary, label: "Help Center", onPress: () => navigation.navigate("HelpCenter") },
    ...(vipStatus?.vip_tier_id
      ? [{ icon: "crown", iconColor: "#F59E0B", label: "VIP Management", onPress: () => navigation.navigate("VipScreen") }]
      : []),
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={style.container}>
      <ScrollView
        style={style.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.scrollContent}
      >
        {/* ── Header Banner ── */}
        <LinearGradient
          colors={[COLORS.primary + "22", COLORS.background]}
          style={style.heroBanner}
        >
          {/* Avatar Row */}
          <View style={style.avatarRow}>
            <View style={style.avatarWrap}>
              <Ionicons
                name="person-circle"
                size={72}
                color={COLORS.primary}
              />
              {/* Online dot */}
              <View style={[style.onlineDot, { backgroundColor: COLORS.success || "#22C55E" }]} />
            </View>

            <View style={style.avatarInfo}>
              <TouchableOpacity
                style={style.usernameLine}
                onPress={() => navigation.navigate("EditProfile")}
                activeOpacity={0.7}
              >
                <Text style={style.usernameText}>{username}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              {vipStatus?.vip_tier_id ? (
                <Animated.View style={{ transform: [{ scale: scaleAnim }], alignSelf: "flex-start", marginTop: 4 }}>
                  <LinearGradient
                    colors={getVipColors(vipStatus.vip_name)}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={style.vipPill}
                  >
                    <Icon name="crown" size={12} color="#fff" />
                    <Text style={style.vipPillText}>{vipStatus.vip_name}</Text>
                  </LinearGradient>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  style={style.vipUpsellSmall}
                  onPress={() => navigation.navigate("VipScreen")}
                  activeOpacity={0.8}
                >
                  <Icon name="crown" size={12} color="#F59E0B" />
                  <Text style={style.vipUpsellSmallText}>Upgrade to VIP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Balance Card */}
          <View style={style.balanceCard}>
            <View>
              <Text style={style.balanceLabel}>Wallet Balance</Text>
              <Text style={style.balanceValue}>{formatMoney(balance)} VNĐ</Text>
            </View>
            <TouchableOpacity
              style={style.topUpBtn}
              onPress={() => navigation.navigate("WalletScreen")}
              activeOpacity={0.8}
            >
              <Icon name="plus" size={13} color="#fff" />
              <Text style={style.topUpBtnText}>Top Up</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Quick Actions ── */}
        <View style={style.section}>
          <Text style={style.sectionTitle}>Quick Actions</Text>
          <View style={style.quickGrid}>
            {quickActions.map((a) => (
              <QuickActionCard
                key={a.label}
                icon={a.icon}
                iconColor={a.iconColor}
                label={a.label}
                onPress={() => navigation.navigate(a.route)}
                style={style}
                COLORS={COLORS}
              />
            ))}
          </View>
        </View>

        {/* ── Following ── */}
        <View style={style.section}>
          <FollowingSection />
        </View>

        {/* ── Preferences ── */}
        <View style={style.section}>
          <Text style={style.sectionTitle}>Preferences</Text>
          <View style={style.menuCard}>
            {preferenceItems.map((item, idx) => (
              <SettingRow
                key={item.label}
                icon={item.icon}
                iconColor={item.iconColor}
                label={item.label}
                onPress={item.onPress}
                style={style}
                COLORS={COLORS}
              />
            ))}
          </View>
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity
          style={style.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Icon name="right-from-bracket" size={17} color={COLORS.buttonDangerText} />
          <Text style={style.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={style.versionLabel}>LOL Schedule · v1.0.0</Text>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        isError={alertConfig.isError}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;