import {
  View,
  Text,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import COLORS from "../../styles/colors";
import { homeHeaderStyles as styles } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { getWalletBalance } from "../../services/bettingService";

const formatVND = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount) + ' VND';
};

const HomeHeader = ({ searchQuery, onSearch }) => {
  const navigation = useNavigation();
  const [walletBalance, setWalletBalance] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const fetchBalance = async () => {
        try {
          const balance = await getWalletBalance();
          if (isMounted) {
            setWalletBalance(Number(balance) || 0);
          }
        } catch (error) {
          console.error("Lỗi khi lấy số dư ví:", error);
        }
      };

      fetchBalance();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleDepositPress = () => {
    Alert.alert(
      "Nạp tiền",
      "Bạn có muốn chuyển sang trang nạp tiền không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => navigation.navigate("Deposit") }
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        <View style={styles.leftPart}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchBox}
            placeholder="SEARCH TEAM / LEAGUE..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={onSearch}
          />
        </View>

        <View style={styles.rightPart}>
          <View style={styles.wallet}>
            <Text style={styles.walletInfo}>{formatVND(walletBalance)}</Text>

            <TouchableOpacity
              style={styles.walletAdd}
              onPress={handleDepositPress}
            >
              <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeHeader;