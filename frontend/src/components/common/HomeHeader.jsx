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
import React, { useEffect, useState } from "react";
import COLORS from "../../styles/colors";
import { homeHeaderStyles as styles } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { getWalletBalance } from "../../services/bettingService";

const HomeHeader = () => {
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      const balance = await getWalletBalance();
      if (isMounted) {
        setWalletBalance(balance);
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
          <View style={styles.wallet}>
            <Text style={styles.walletInfo}>{walletBalance.toFixed(2)}$</Text>
            <TouchableOpacity style={styles.walletAdd} onPress={() => { }}>
              <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};



export default HomeHeader;
