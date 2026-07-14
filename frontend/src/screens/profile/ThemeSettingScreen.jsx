import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  NativeModules,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome6";
import COLORS, { getCurrentThemeKey } from "../../styles/colors";
import { allThemes } from "../../styles/themes";
import ContentHeader from "../../components/common/ContentHeader";
import style from "../../styles/profile.styles";

const ThemeSettingScreen = () => {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState("dark_default");

  useEffect(() => {
    setSelectedTheme(getCurrentThemeKey());
  }, []);

  const themesList = [
    { key: "dark_default", name: "Dark Mode Default", previewColor: allThemes.dark_default.primary },
    { key: "light_default", name: "Light Mode Default", previewColor: allThemes.light_default.primary },
    { key: "dark_purple", name: "Dark Mode Purple", previewColor: allThemes.dark_purple.primary },
    { key: "light_purple", name: "Light Mode Purple", previewColor: allThemes.light_purple.primary },
    { key: "dark_yellow", name: "Dark Mode Yellow", previewColor: allThemes.dark_yellow.primary },
    { key: "light_yellow", name: "Light Mode Yellow", previewColor: allThemes.light_yellow.primary },
  ];

  const handleApplyTheme = async () => {
    try {
      await AsyncStorage.setItem("appTheme", selectedTheme);
      Alert.alert(
        "Theme Applied",
        "The theme has been saved. Please completely close and restart the application to apply changes.",
        [
          {
            text: "OK",
            onPress: () => {
              // Optionally trigger a reload in dev mode
              const DevSettings = NativeModules.DevSettings;
              if (DevSettings && DevSettings.reload) {
                DevSettings.reload();
              }
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save the theme.");
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <ContentHeader title="Theme Settings" />
      <ScrollView style={style.body} showsVerticalScrollIndicator={false}>
        <Text style={[style.sectionTitle, { marginTop: 20 }]}>Available Themes</Text>
        <Text style={[style.textMuted, { paddingHorizontal: 20, marginBottom: 15 }]}>
          Select a theme to change the appearance of the application.
        </Text>

        <View style={style.sectionCard}>
          {themesList.map((t) => {
            const isSelected = selectedTheme === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  style.settingRow,
                  isSelected && { backgroundColor: COLORS.glowSoft, borderColor: COLORS.primary, borderWidth: 1 },
                ]}
                onPress={() => setSelectedTheme(t.key)}
              >
                <View style={style.settingLabelWrap}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: t.previewColor,
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: COLORS.surface,
                    }}
                  />
                  <Text style={[style.settingText, isSelected && { color: COLORS.primary, fontFamily: "ManropeBold" }]}>
                    {t.name}
                  </Text>
                </View>
                {isSelected && <Icon name="check" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            style.logoutButton,
            { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
          ]}
          onPress={handleApplyTheme}
          activeOpacity={0.8}
        >
          <Text style={[style.logoutText, { color: COLORS.background }]}>Save & Apply</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThemeSettingScreen;
