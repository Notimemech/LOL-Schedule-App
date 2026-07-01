import { View, Text, StyleSheet } from "react-native";
import React from "react";
import COLORS from "../../styles/colors";

const FloatBox = ({ children, style }) => {
  return <View style={[styles.box, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.backgroundTertiary,
    width: "100%",
    height: "100%",
    borderColor: COLORS.glow,
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,

    padding: 10,

    elevation: 10,
  },
});

export default FloatBox;
