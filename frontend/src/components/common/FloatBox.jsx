import { View, Text } from "react-native";
import React from "react";
import COLORS from "../../styles/colors";
import { floatBoxStyles as styles } from "../../styles/common.styles";

const FloatBox = ({ children, style }) => {
  return <View style={[styles.box, style]}>{children}</View>;
};



export default FloatBox;
