import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import COLORS from "../../styles/colors";
import { formatMoney } from "../../utils/format";

/**
 * Row of quick-select amount buttons.
 * @param {number[]} amounts - List of preset amounts
 * @param {string} selectedAmount - Currently selected formatted amount string
 * @param {(amount: number) => void} onSelect - Called with numeric amount when tapped
 * @param {string} [activeColor] - Color for selected state border/text (defaults to primary)
 */
const QuickAmountSelector = ({
  amounts,
  selectedAmount,
  onSelect,
  activeColor = COLORS.primary,
  maxAmount = Infinity,
}) => (
  <View style={styles.container}>
    {amounts.map((val) => {
      const formatted = formatMoney(val);
      const isActive = selectedAmount === formatted;
      const isDisabled = val > maxAmount;
      return (
        <TouchableOpacity
          key={val}
          style={[
            styles.btn, 
            isActive && { borderColor: activeColor, backgroundColor: `${activeColor}22` },
            isDisabled && { opacity: 0.3, borderColor: COLORS.border }
          ]}
          onPress={() => onSelect(val)}
          disabled={isDisabled}
          accessibilityLabel={`Select ${formatted} VNĐ`}
        >
          <Text style={[styles.text, isActive && { color: activeColor }]}>
            {formatted}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "ManropeBold",
  },
});

export default QuickAmountSelector;
