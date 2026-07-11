import {
  View,
  Text,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../styles/colors";
import { homeHeaderStyles as styles } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { getWalletBalance } from "../../services/bettingService";

const HomeHeader = ({ searchQuery, onSearch }) => {
  // 1. Khai báo Hooks và State
  const navigation = useNavigation();
  const [walletBalance, setWalletBalance] = useState(0);

  // 2. Logic lấy số dư ví (từ bản của bạn)
  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      try {
        const balance = await getWalletBalance();
        if (isMounted) {
          // Đảm bảo balance trả về là số trước khi set
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
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        {/* Phần bên trái: Logo và Thanh tìm kiếm */}
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

        {/* Phần bên phải: Thông tin ví và Nút nạp tiền */}
        <View style={styles.rightPart}>
          <View style={styles.wallet}>
            {/* Hiển thị số dư thực tế lấy từ API */}
            <Text style={styles.walletInfo}>{walletBalance.toFixed(2)}$</Text>
            
            <TouchableOpacity 
              style={styles.wallet} 
              onPress={() => navigation.navigate("Deposit")}
            >
              {/* Lưu ý: Tôi đã bỏ số 40.00$ cứng để dùng biến walletBalance của bạn cho đồng nhất */}
              <View style={styles.walletAdd}>
                <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeHeader;