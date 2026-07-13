import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import COLORS from "../../styles/colors";
import { contentHeaderStyles as styles } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getWalletBalance } from "../../services/bettingService";

const formatVND = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount) + ' VND';
};

const ContentHeader = ({ title, showBack = false, refreshTrigger = 0 }) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadBalance = async () => {
      const balance = await getWalletBalance();
      if (isMounted) {
        setWalletBalance(Number(balance) || 0);
      }
    };

    loadBalance();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

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
    <View style={styles.header}>
      <View style={styles.leftPart}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {title?.toUpperCase()}
        </Text>
      </View>
      <View style={styles.rightPart}>
        <View style={styles.wallet}>
          <Text style={styles.walletInfo}>{formatVND(walletBalance)}</Text>
          <TouchableOpacity style={styles.walletAdd} onPress={handleDepositPress}>
            <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};



export default ContentHeader;
