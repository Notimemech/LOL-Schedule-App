import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatBox from "../components/FloatBox";
import COLORS from "../style/color";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  return (
    <SafeAreaView style={style.container}>
      <FloatBox
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
              </View>
              <Text style={style.text}>
                BALANCE: 1.000.000,00 VNĐ
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
  },
  vipBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.vipGoldBg,
    borderColor: COLORS.vipGold,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vipText:{
    color: COLORS.vipGoldDark,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily:"Manrope"
  },
});

export default ProfileScreen;
