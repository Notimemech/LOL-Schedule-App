import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native"; // Import navigation
import FloatBox from "../../components/common/FloatBox";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import style from "../../styles/profile.styles";

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
      route: "WithdrawScreen", // Yêu cầu gửi OTP ở màn hình này
    },
    {
      iconName: "clock-rotate-left",
      activityName: "Transaction History",
      route: "HistoryScreen",
    },
    {
      iconName: "gear",
      activityName: "Settings",
      route: "SettingScreen",
    },
  ];

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
          onPress: () => {
            // TODO: Thêm logic xóa token, clear AsyncStorage, update Auth Context...
            console.log("Xử lý đăng xuất tại đây");
          } 
        }
      ]
    );
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
                <Text style={style.text}>quanganh0123</Text>
                <View style={style.vipBadge}>
                  <Text style={style.vipText}>VIP 10</Text>
                  <Icon name="gem" style={style.vipText} />
                </View>
                <Text
                  style={[
                    style.text,
                    { fontSize: 20, fontFamily: "ManropeBold", marginTop: 5 },
                  ]}
                >
                  BALANCE: 1.000.000 VNĐ
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
              style={localStyles.gridItem}
              onPress={() => navigation.navigate(act.route)} // Chuyển trang
              activeOpacity={0.7}
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

        {/* Nút Đăng Xuất */}
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
  logoutButton: {
    backgroundColor: "#ff4757", // Màu đỏ cảnh báo (có thể đổi sang COLORS.danger nếu có)
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 40,
    elevation: 3, // Bóng cho Android
    shadowColor: "#ff4757", // Bóng cho iOS
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