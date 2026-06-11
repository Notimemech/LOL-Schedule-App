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
import COLORS from "../style/color";
import Icon from "react-native-vector-icons/FontAwesome";

const Header = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        <View style={styles.leftPart}>
          <Image source={require("../../assets/favicon.png")} />
          <TextInput style={styles.searchBox} placeholder="Search..." />
        </View>
        <View style={styles.rightPart}>
          <View style={styles.wallet}>
            <Text style={styles.walletInfo}>40.00$</Text>
            <TouchableOpacity style={styles.walletAdd} onPress={() => {}}>
              <Icon name={"plus"} style={{fontSize: 18, color: COLORS.buttonSecondaryText}}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
    backgroundColor: COLORS.header,
    height: 150,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: COLORS.headerBorder,
    borderStyle: "solid",
    borderWidth: 1,
  },
  leftPart: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  rightPart: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  wallet: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 10
  },
  walletInfo:{
    color: COLORS.primary,
    textAlign: "center",
    padding: 8,
    borderRightWidth: 2,
    borderStyle: "solid",
    borderColor: COLORS.border,
    fontSize: 18,
  },
  walletAdd:{
    padding: 8,
    backgroundColor: COLORS.background,
    borderTopRightRadius:10,
    borderBottomRightRadius:10
  },
  searchBox: {
    backgroundColor: COLORS.inputBackground,
    color: "white",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.inputBorder,
    flex: 1,
    height: 40,
    borderRadius: 10,
  },
});

export default Header;
