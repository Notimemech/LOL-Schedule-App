import { View } from "react-native";
import React from "react";
import { useThemedStyles } from "../../hooks/useTheme";
import { makeFloatBoxStyles } from "../../styles/common.styles";

const FloatBox = ({ children, style }) => {
  const styles = useThemedStyles(makeFloatBoxStyles);
  return <View style={[styles.box, style]}>{children}</View>;
};

export default FloatBox;
