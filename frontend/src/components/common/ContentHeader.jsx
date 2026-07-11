import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import COLORS from "../../styles/colors";
import { contentHeaderStyles as styles } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getWalletBalance } from "../../services/bettingService";

const ContentHeader = ({ title, showBack = false }) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const [walletBalance, setWalletBalance] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const loadBalance = async () => {
        const balance = await getWalletBalance();
        if (isMounted) {
          setWalletBalance(balance);
        }
      };

      loadBalance();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <View style={styles.header}>
      <View style={styles.leftPart}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title?.toUpperCase()}</Text>
      </View>
      <View style={styles.rightPart}>
        <View style={styles.wallet}>
          <Text style={styles.walletInfo}>{walletBalance.toFixed(2)}$</Text>
          <TouchableOpacity style={styles.walletAdd} onPress={() => { }}>
            <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};



export default ContentHeader;
