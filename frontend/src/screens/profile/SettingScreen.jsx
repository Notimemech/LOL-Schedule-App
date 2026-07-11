import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import COLORS from "../../styles/colors";

const SettingScreen = () => {
  const navigation = useNavigation();
  
  // State quản lý các cài đặt dạng bật/tắt
  const [isDarkMode, setIsDarkMode] = useState(true); // Ứng dụng đang là dark mode
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // Component tái sử dụng cho từng mục cài đặt
  const SettingItem = ({ icon, label, onPress, rightComponent, color = "#fff" }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress} // Vô hiệu hóa click nếu không truyền onPress (dành cho các mục có Switch)
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.settingLabel, { color: color }]}>{label}</Text>
      </View>
      
      {rightComponent ? (
        rightComponent
      ) : (
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setting</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Nhóm Cài đặt Tài khoản */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="user-pen" 
            label="Edit Personal Information" 
            onPress={() => Alert.alert("Notification", "Navigate to edit information page")}
            color={COLORS.primary}
          />
          <SettingItem 
            icon="lock" 
            label="Change Password" 
            onPress={() => Alert.alert("Notification", "Navigate to change password page")}
          />
          <SettingItem 
            icon="shield-halved" 
            label="Two-Factor Authentication (2FA)" 
            onPress={() => Alert.alert("Notification", "Navigate to 2FA settings page")}
          />
        </View>

        {/* Nhóm Ứng dụng & Giao diện */}
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="moon" 
            label="Dark Mode" 
            rightComponent={
              <Switch
                trackColor={{ false: "#767577", true: "#00a8ff" }}
                thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsDarkMode(!isDarkMode)}
                value={isDarkMode}
              />
            }
          />
          <SettingItem 
            icon="bell" 
            label="Receive Match Notifications" 
            rightComponent={
              <Switch
                trackColor={{ false: "#767577", true: "#00a8ff" }}
                thumbColor={isNotificationEnabled ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)}
                value={isNotificationEnabled}
              />
            }
          />
          <SettingItem 
            icon="language" 
            label="Language" 
            rightComponent={
              <View style={styles.rightTextContainer}>
                <Text style={styles.rightText}>Tiếng Việt</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
              </View>
            }
            onPress={() => Alert.alert("Language", "Language change feature")}
          />
        </View>

        {/* Nhóm Hỗ trợ & Thông tin */}
        <Text style={styles.sectionTitle}>Help & Others</Text>
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="circle-question" 
            label="Help Center" 
            onPress={() => {}}
          />
          <SettingItem 
            icon="file-contract" 
            label="Terms of Service" 
            onPress={() => {}}
          />
          <SettingItem 
            icon="circle-info" 
            label="About LOL Schedule" 
            rightComponent={<Text style={styles.versionText}>Version 1.0.0</Text>}
          />
        </View>

        {/* Khoảng trống dưới cùng */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ManropeBold",
  },
  backBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    color: "#888",
    fontSize: 14,
    fontFamily: "ManropeBold",
    marginTop: 25,
    marginBottom: 10,
    marginLeft: 5,
    textTransform: "uppercase",
  },
  sectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: "ManropeMedium",
  },
  rightTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "ManropeMedium",
    marginRight: 5,
  },
  versionText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontFamily: "ManropeRegular",
  }
});

export default SettingScreen;