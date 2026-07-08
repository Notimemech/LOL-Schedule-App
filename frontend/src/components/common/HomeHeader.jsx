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

import { useNavigation } from "@react-navigation/native";

const HomeHeader = ({ searchQuery, onSearch }) => {
  const navigation = useNavigation();
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
          <TouchableOpacity style={styles.wallet} onPress={() => navigation.navigate("Deposit")}>
            <Text style={styles.walletInfo}>40.00$</Text>
            <View style={styles.walletAdd}>
              <Icon name={"plus"} style={{ fontSize: 14, color: COLORS.primary }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};



export default HomeHeader;
