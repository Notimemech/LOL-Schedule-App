import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";
import COLORS from "../style/color";

const Header = () => {
  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.header}>
          <Image source={require("../../assets/favicon.png")} />
          <TextInput style={styles.searchBox} placeholder="Search..." />
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
    zIndex:100,
    backgroundColor: COLORS.card,
    height: 150,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 50,
    alignItems: "center",
    gap: 10,
    borderBottomColor: COLORS.border,
    borderStyle: "solid",
    borderWidth: 1
  },
  searchBox: {
    backgroundColor: COLORS.backgroundTertiary,
    color: "white",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    width: 230,
    height: 40,
    borderRadius: 10,
  },
});

export default Header;
