import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeContentHeaderStyles } from "../../styles/common.styles";
import { getWalletBalance } from "../../services/bettingService";

const formatVND = (amount) => {
  return new Intl.NumberFormat("en-US").format(amount) + " VND";
};

const ContentHeader = ({ title, showBack = false, refreshTrigger = 0, rightComponent }) => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeContentHeaderStyles);
  const [walletBalance, setWalletBalance] = useState(0);

  useFocusEffect(
    useCallback(() => {
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
    }, [refreshTrigger])
  );

  return (
    <View style={styles.header}>
      <View style={styles.leftPart}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {title?.toUpperCase()}
        </Text>
      </View>
      <View style={styles.rightPart}>
        {rightComponent !== undefined ? (
          rightComponent
        ) : (
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
        )}
      </View>
    </View>
  );
};

export default ContentHeader;
