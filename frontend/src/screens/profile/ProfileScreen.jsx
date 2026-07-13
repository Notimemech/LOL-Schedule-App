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

const formatVND = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount) + ' VND';
};

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
                    BALANCE: {formatVND(balance)}
                  </Text>
                </View>
              </View>
          }
        />

        {/* Lưới các chức năng chính (Grid Layout) */}
        <View style={localStyles.gridContainer}>
          {mainActivities.map((act) => (
            <TouchableOpacity
              key={act.activityName}
              style={style.activityItem}
              onPress={() => handleActivityPress(act)}
              activeOpacity={0.6}
            >
              <FloatBox style={localStyles.floatBoxWrapper}
                children={
                  <View style={localStyles.itemContent}>
                    <Icon 
                      name={act.iconName} 
                      style={[style.text, { color: COLORS.primary, fontSize: 32, marginBottom: 10 }]} 
                    />
                    <Text style={[style.text, { fontSize: 15, fontFamily: "ManropeBold" }]}>
                      {act.activityName}
                    </Text>
                  </View>
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Preferences</Text>

          <View style={localStyles.settingRow}>
            <View style={localStyles.settingLabelWrap}>
              <Icon name="moon" size={18} color={COLORS.primary} />
              <Text style={localStyles.settingText}>Dark mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={localStyles.settingRow}>
            <View style={localStyles.settingLabelWrap}>
              <Icon name="bell" size={18} color={COLORS.primary} />
              <Text style={localStyles.settingText}>Match notifications</Text>
            </View>
            <Switch
              value={isNotificationEnabled}
              onValueChange={setIsNotificationEnabled}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity style={localStyles.settingRow} onPress={() => Alert.alert('Info', 'Language options will be available soon.')}>
            <View style={localStyles.settingLabelWrap}>
              <Icon name="language" size={18} color={COLORS.primary} />
              <Text style={localStyles.settingText}>Language</Text>
            </View>
            <Text style={localStyles.settingHint}>Tiếng Việt</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={localStyles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="right-from-bracket" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={localStyles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// CSS nội bộ bổ sung cho layout Grid và nút Đăng xuất
const localStyles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 2, // Đệm nhẹ tránh sát viền
  },
  gridItem: {
    width: "48%", // Chia 2 cột
    marginBottom: 15,
  },
  floatBoxWrapper: {
    height: 110, // Cố định chiều cao cho hộp chức năng
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  itemContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "ManropeBold",
    marginBottom: 8,
    marginLeft: 6,
    textTransform: "uppercase",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "ManropeBold",
    marginLeft: 10,
  },
  settingHint: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: "#ff4757",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 40,
    elevation: 3,
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "ManropeBold",
  },
});

export default ProfileScreen;