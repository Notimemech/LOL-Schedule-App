import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Bar height (70) + its bottom offset + breathing room. Screens shown inside
// the bottom tab navigator must end their scroll content with this spacer so
// the floating tab bar never covers the last rows.
const TAB_BAR_CLEARANCE = 96;

const TabBarSpacer = () => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: TAB_BAR_CLEARANCE + Math.max(insets.bottom, 10) }} />;
};

export default TabBarSpacer;
