import {
  View,
  Text,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeHomeHeaderStyles } from "../../styles/common.styles";
import { getWalletBalance } from "../../services/bettingService";

const formatVND = (amount) => {
  return new Intl.NumberFormat("en-US").format(amount) + " VND";
};

const HomeHeader = ({ searchQuery, onSearch }) => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeHomeHeaderStyles);
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
          console.error("Failed to fetch wallet balance:", error);
        }
      };

      fetchBalance();

      return () => {
        isMounted = false;
      };
    }, [])
  );

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
            placeholderTextColor={COLORS.inputPlaceholder}
            value={searchQuery}
            onChangeText={onSearch}
            accessibilityLabel="Search team or league"
          />
        </View>

        <View style={styles.rightPart}>
          <View style={styles.wallet}>
            <Text style={styles.walletInfo}>{formatVND(walletBalance)}</Text>

            <TouchableOpacity
              style={styles.walletAdd}
              onPress={() => navigation.navigate("WalletScreen")}
              accessibilityLabel="Deposit funds"
              accessibilityRole="button"
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeHeader;
