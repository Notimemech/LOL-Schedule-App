import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React from "react";
import COLORS from "../../styles/colors";
import { homeHeaderStyles as styles } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";

const HomeHeader = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        <View style={styles.leftPart}>
          <Image 
            source={require("../../../assets/favicon.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TextInput 
            style={styles.searchBox} 
            placeholder="SEARCH..." 
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <View style={styles.rightPart}>
          {user ? (
            <View style={styles.wallet}>
              <Text style={styles.walletInfo}>{formatCurrency(user.balance)}</Text>
              <TouchableOpacity style={styles.walletAdd} onPress={() => { }}>
                <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={customStyles.loginBtn}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <Icon name="sign-in" style={{ fontSize: 14, color: COLORS.buttonPrimaryText }} />
              <Text style={customStyles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const customStyles = StyleSheet.create({
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loginBtnText: {
    color: COLORS.buttonPrimaryText,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
});

export default HomeHeader;

