import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { allThemes } from "../../styles/themes";
import { makeProfileStyles } from "../../styles/profile.styles";
import ContentHeader from "../../components/common/ContentHeader";

const THEMES_LIST = [
  { key: "dark_cyberpunk", name: "Cyberpunk Dark" },
  { key: "light_cyberpunk", name: "Cyberpunk Light" },
  { key: "dark_default", name: "Classic Teal Dark" },
  { key: "light_default", name: "Classic Teal Light" },
  { key: "dark_purple", name: "Neon Purple Dark" },
  { key: "light_purple", name: "Neon Purple Light" },
  { key: "dark_yellow", name: "Cyber Yellow Dark" },
  { key: "light_yellow", name: "Cyber Yellow Light" },
];

const ThemeSettingScreen = () => {
  // Theme applies live through ThemeContext — no app restart needed.
  const { colors: COLORS, themeKey, setTheme } = useTheme();
  const style = useThemedStyles(makeProfileStyles);
  const [selectedTheme, setSelectedTheme] = useState(themeKey);

  const handleSelect = (key) => {
    setSelectedTheme(key);
    setTheme(key); // instant preview + persisted
  };

  return (
    <SafeAreaView style={style.container}>
      <ContentHeader title="Theme Settings" showBack={true} />
      <ScrollView style={style.body} showsVerticalScrollIndicator={false}>
        <Text style={[style.sectionTitle, { marginTop: 20 }]}>Available Themes</Text>
        <Text style={[style.settingHint, { paddingHorizontal: 6, marginBottom: 15 }]}>
          Tap a theme to apply it instantly.
        </Text>

        <View style={style.sectionCard}>
          {THEMES_LIST.map((t) => {
            const isSelected = selectedTheme === t.key;
            const preview = allThemes[t.key];
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  style.settingRow,
                  isSelected && { backgroundColor: COLORS.glowSoft, borderColor: COLORS.primary, borderWidth: 1 },
                ]}
                onPress={() => handleSelect(t.key)}
                accessibilityRole="button"
                accessibilityLabel={`Apply ${t.name} theme`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={style.settingLabelWrap}>
                  <View
                    style={{
                      flexDirection: "row",
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: COLORS.surface,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <View style={{ width: 12, height: 24, backgroundColor: preview.primary }} />
                    <View style={{ width: 12, height: 24, backgroundColor: preview.secondary }} />
                  </View>
                  <Text style={[style.settingText, isSelected && { color: COLORS.primary, fontFamily: "ManropeBold" }]}>
                    {t.name}
                  </Text>
                </View>
                {isSelected && <Icon name="check" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThemeSettingScreen;
