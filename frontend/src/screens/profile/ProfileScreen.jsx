import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  DeviceEventEmitter,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FloatBox from "../../components/common/FloatBox";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import style from "../../styles/profile.styles";
import { formatMoney } from "../../utils/format";

const ProfileScreen = () => {
  const navigation = useNavigation();

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

  // Logic Đăng xuất
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userInfo");
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("accessToken");

              navigation.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              });
            } catch (err) {
              console.error("Logout failed:", err);
              Alert.alert("Error", "Unable to log out right now.");
            }
          },
        },
      ]
    );
  };

  const [username, setUsername] = useState('User');
  const [balance, setBalance] = useState(0);

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

          <TouchableOpacity style={style.settingRow} onPress={() => Alert.alert('Info', 'Edit Profile will be available soon.')}>
            <View style={style.settingLabelWrap}>
              <Icon name="user-pen" size={18} color={COLORS.primary} />
              <Text style={style.settingText}>Edit profile</Text>
            </View>
            <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={style.settingRow} onPress={() => Alert.alert('Info', 'Themes will be available soon.')}>
            <View style={style.settingLabelWrap}>
              <Icon name="palette" size={18} color={COLORS.primary} />
              <Text style={style.settingText}>Themes</Text>
            </View>
            <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={style.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="right-from-bracket" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={style.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;