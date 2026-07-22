import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
  Animated,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FloatBox from "../../components/common/FloatBox";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { getVipColors } from "../../styles/themes";
import { makeProfileStyles } from "../../styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import { formatMoney } from "../../utils/format";
import CustomAlert from "../../components/common/CustomAlert";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const style = useThemedStyles(makeProfileStyles);

  // Định nghĩa các nút chức năng và màn hình tương ứng
  const mainActivities = [
    {
      iconName: "wallet",
      activityName: "Top Up",
      route: "WalletScreen",
    },
    {
      iconName: "money-bill-transfer",
      activityName: "Withdraw",
      route: "WithdrawScreen",
    },
    {
      iconName: "clock-rotate-left",
      activityName: "Transaction History",
      route: "HistoryScreen",
    },
  ];

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    isError: false,
    onConfirm: () => { },
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'CANCEL'
  });

  const showAlert = (title, message, isError = false, onConfirm = null, onCancel = null, confirmText = 'OK', cancelText = 'CANCEL') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      isError,
      onConfirm: onConfirm || (() => hideAlert()),
      onCancel,
      confirmText,
      cancelText
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Logic Đăng xuất
  const handleLogout = () => {
    showAlert(
      "Logout",
      "Are you sure you want to logout from your account?",
      false,
      async () => {
        try {
          await AsyncStorage.removeItem("userInfo");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("accessToken");

          hideAlert();
          navigation.reset({
            index: 0,
            routes: [{ name: "SignIn" }],
          });
        } catch (err) {
          console.error("Logout failed:", err);
          showAlert("Error", "Unable to log out right now.", true);
        }
      },
      () => hideAlert(),
      "LOGOUT",
      "CANCEL"
    );
  };

  const [username, setUsername] = useState('User');
  const [balance, setBalance] = useState(0);
  const [vipStatus, setVipStatus] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem('userInfo');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsername(parsed.username || parsed.name || parsed.email || 'User');
      }

      const { getWalletBalance } = await import('../../services/bettingService');
      const b = await getWalletBalance();
      setBalance(b);

      const api = (await import('../../services/api')).default;
      try {
        const raw = await AsyncStorage.getItem('userInfo');
        if (raw) {
          const parsed = JSON.parse(raw);
          const userId = parsed.id;
          const statusRes = await api.get(`/vip/status/${userId}`);
          if (statusRes && statusRes.data) {
            setVipStatus(statusRes.data);
          }
        }
      } catch (err) {
        // ignore if not logged in or error
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const safeLoadProfile = async () => {
        if (!isMounted) return;
        await loadProfile();
      };

      safeLoadProfile();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  useEffect(() => {
    let isMounted = true;
    const subscription = DeviceEventEmitter.addListener('wallet:transactions-updated', () => {
      if (isMounted) {
        loadProfile();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const handleActivityPress = (activity) => {
    if (activity?.route) {
      navigation.navigate(activity.route);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView style={style.body} showsVerticalScrollIndicator={false}>
        {/* Phần Thông tin Profile */}
        <FloatBox style={style.bodyContent}
          children={
            <View style={style.profileInfo}>
              <Ionicons
                name={"person-circle-outline"}
                color={COLORS.primary}
                style={{ fontSize: 80 }}
              />
              <View>
                <Text style={style.text}>{username}</Text>

                {vipStatus && vipStatus.vip_tier_id && (
                  <Animated.View style={{ transform: [{ scale: scaleAnim }], alignSelf: 'flex-start', marginTop: 5 }}>
                    <LinearGradient
                      colors={getVipColors(vipStatus.vip_name)}
                      start={[0, 0]} end={[1, 1]}
                      style={style.vipPill}
                    >
                      <Icon name="crown" size={14} color={COLORS.buttonDangerText} />
                      <Text style={style.vipPillText}>
                        {vipStatus.vip_name}
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                <Text
                  style={[
                    style.text,
                    { fontSize: 20, fontFamily: "ManropeBold", marginTop: 5 },
                  ]}
                >
                  BALANCE: {formatMoney(balance)} VNĐ
                </Text>
              </View>
            </View>
          }
        />

        {(!vipStatus || !vipStatus.vip_tier_id) && (
          <TouchableOpacity onPress={() => navigation.navigate("VipScreen")} activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], marginHorizontal: 20, marginTop: 15 }}>
              <LinearGradient
                colors={getVipColors('VIP 4')}
                start={[0, 0]} end={[1, 1]}
                style={style.vipUpsell}
              >
                <Icon name="crown" size={20} color={COLORS.buttonDangerText} style={{ marginRight: 10 }} />
                <Text style={style.vipUpsellText}>Up to VIP</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Lưới các chức năng chính (Grid Layout) */}
        <View style={style.gridContainer}>
          {mainActivities.map((act) => (
            <TouchableOpacity
              key={act.activityName}
              style={style.activityItem}
              onPress={() => handleActivityPress(act)}
              activeOpacity={0.6}
            >
              <FloatBox style={style.floatBoxWrapper}
                children={
                  <View style={style.itemContent}>
                    <Icon
                      name={act.iconName}
                      style={[style.text, { color: COLORS.primary, fontSize: 32, marginBottom: 10 }]}
                    />
                    <Text style={[style.text, { fontSize: 14, fontFamily: "ManropeBold", textAlign: "center" }]}>
                      {act.activityName}
                    </Text>
                  </View>
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={style.sectionCard}>
          <Text style={style.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={style.settingRow} onPress={() => showAlert('Info', 'Edit Profile will be available soon.', false)}>
            <View style={style.settingLabelWrap}>
              <Icon name="user-pen" size={18} color={COLORS.primary} />
              <Text style={style.settingText}>Edit profile</Text>
            </View>
            <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={style.settingRow} onPress={() => navigation.navigate("ThemeSettingScreen")}>
            <View style={style.settingLabelWrap}>
              <Icon name="palette" size={18} color={COLORS.primary} />
              <Text style={style.settingText}>Themes</Text>
            </View>
            <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          {vipStatus && vipStatus.vip_tier_id && (
            <TouchableOpacity style={style.settingRow} onPress={() => navigation.navigate("VipScreen")}>
              <View style={style.settingLabelWrap}>
                <Icon name="crown" size={18} color={COLORS.secondary} />
                <Text style={style.settingText}>VIP Management</Text>
              </View>
              <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={style.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="right-from-bracket" size={20} color={COLORS.buttonDangerText} style={{ marginRight: 10 }} />
          <Text style={style.logoutText}>Logout</Text>
        </TouchableOpacity>

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