import { View, Text, StyleSheet } from "react-native";
import React from "react";
import COLORS from "../style/color";

const FloatBox = ({children}) => {
  return (
    <View style={style.box}>
      <View>
        {children}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  box: {
    backgroundColor: COLORS.backgroundTertiary,
    width: "100%",
    borderColor: COLORS.glow,
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 15,

    padding: 10,

    elevation: 10,
  },
});

export default FloatBox;
