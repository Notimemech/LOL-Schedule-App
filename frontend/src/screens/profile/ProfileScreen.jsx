import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatBox from "../../components/common/FloatBox";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useAuth } from "../../auth/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (confirmLogout) {
        logout();
      }
    } else {
      Alert.alert(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng xuất", style: "destructive", onPress: logout }
        ]
      );
    }
  };


  const mainActivities = [
    {
      iconName: "wallet",
      activityName: "Wallet",
    },
    {
      iconName: "clock-rotate-left",
      activityName: "History",
    },
    {
      iconName: "gem",
      activityName: "Vip",
    },
  ];

  // Helper function to format money
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView style={style.body} showsVerticalScrollIndicator={false}>
        <FloatBox style={style.bodyContent}
          children={
            <View style={style.profileInfo}>
              <Ionicons
                name={"person-circle-outline"}
                color={COLORS.primary}
                style={{ fontSize: 80 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={style.text}>{user?.username || "Guest User"}</Text>
                <View style={style.vipBadge}>
                  <Text style={style.vipText}>VIP {user?.vip_level ?? 0}</Text>
                  <Icon name="gem" style={style.vipIcon} />
                </View>
                <Text
                  style={[
                    style.text,
                    { fontSize: 16, fontFamily: "ManropeBold", color: COLORS.primary },
                  ]}
                >
                  BALANCE: {formatCurrency(user?.balance)}
                </Text>
              </View>
            </View>
          }
        />
        <View style={style.activityList}>
          {mainActivities.map((act) => (
            <TouchableOpacity
              key={act.activityName}
              style={style.activityItem}
              onPress={() => {}}
              activeOpacity={0.6}
            >
              <FloatBox style={{justifyContent: "flex-end"}}
                children={
                  <View style={{paddingVertical: 5, paddingHorizontal: 3,}}>
                    <Icon name={act.iconName} style={[style.text, {color: COLORS.primary, fontSize: 25}]} />
                    <Text style={style.text}>{act.activityName}</Text>
                  </View>
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Logout Button */}
        <TouchableOpacity
          style={style.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.buttonDangerText || COLORS.danger} />
          <Text style={style.logoutText}>ĐĂNG XUẤT</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body:{
    paddingHorizontal: 20,
  },
  bodyContent:{
    marginTop: 20,
    height: 115,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 15,
    paddingHorizontal: 10,
  },
  vipBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.vipGoldBg || "#2C2205",
    borderColor: COLORS.vipGold || "#F5A623",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  vipText: {
    color: COLORS.vipGold || "#F5A623",
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  vipIcon: {
    color: COLORS.vipGold || "#F5A623",
    fontSize: 10,
  },
  activityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  activityItem: {
    width: "32%",
    height: 92,
    marginVertical: 10,
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Manrope",
    paddingVertical: 3,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 77, 103, 0.1)",
    borderColor: COLORS.buttonDanger || COLORS.danger,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
    marginBottom: 40,
    gap: 8,
  },
  logoutText: {
    color: COLORS.buttonDanger || COLORS.danger,
    fontSize: 15,
    fontFamily: "ManropeExtraBold",
    letterSpacing: 1.5,
  },
});

export default ProfileScreen;
