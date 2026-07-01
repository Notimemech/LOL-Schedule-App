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

const HomeHeader = () => {
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
            <Text style={styles.walletInfo}>40.00$</Text>
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
