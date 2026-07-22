import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import CustomAlert from "../../components/common/CustomAlert";

const SettingScreen = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "" });

  const showInfo = (title, message) => setAlertConfig({ visible: true, title, message });
  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const SettingItem = ({ icon, label, onPress, rightComponent, color }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={label}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={18} color={color || COLORS.text} />
        </View>
        <Text style={[styles.settingLabel, { color: color || COLORS.text }]}>{label}</Text>
      </View>

      {rightComponent ? (
        rightComponent
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            icon="user-pen"
            label="Edit Personal Information"
            onPress={() => showInfo("Coming soon", "Profile editing will be available soon.")}
            color={COLORS.primary}
          />
          <SettingItem
            icon="lock"
            label="Change Password"
            onPress={() => showInfo("Coming soon", "Password change will be available soon.")}
          />
          <SettingItem
            icon="shield-halved"
            label="Two-Factor Authentication (2FA)"
            onPress={() => showInfo("Coming soon", "2FA settings will be available soon.")}
          />
        </View>

        {/* Application */}
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            icon="palette"
            label="Theme"
            onPress={() => navigation.navigate("ThemeSettingScreen")}
          />
          <SettingItem
            icon="bell"
            label="Receive Match Notifications"
            rightComponent={
              <Switch
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.text}
                ios_backgroundColor={COLORS.border}
                onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)}
                value={isNotificationEnabled}
              />
            }
          />
        </View>

        {/* Help & Others */}
        <Text style={styles.sectionTitle}>Help & Others</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            icon="circle-question"
            label="Help Center"
            onPress={() => showInfo("Coming soon", "The help center is under construction.")}
          />
          <SettingItem
            icon="file-contract"
            label="Terms of Service"
            onPress={() => showInfo("Coming soon", "Terms of service will be available soon.")}
          />
          <SettingItem
            icon="circle-info"
            label="About LOL Schedule"
            rightComponent={<Text style={styles.versionText}>Version 1.0.0</Text>}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={hideAlert}
      />
    </SafeAreaView>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTitle: {
    color: COLORS.text,
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
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: "ManropeBold",
    marginTop: 25,
    marginBottom: 10,
    marginLeft: 5,
    textTransform: "uppercase",
  },
  sectionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
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
    backgroundColor: COLORS.backgroundTertiary,
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
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: "ManropeMedium",
    marginRight: 5,
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: "Manrope",
  }
});

export default SettingScreen;
