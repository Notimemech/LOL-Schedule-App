import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import { formatMoneyWithSign, formatShortDateTime } from "../../utils/format";

/**
 * Reusable transaction list item used in WalletScreen & HistoryScreen.
 * @param {object} tx - Transaction object (type, amount, created_at, status)
 */
const TransactionItem = ({ tx }) => {
  const isDeposit = tx.type === "DEPOSIT";
  const isWithdraw = tx.type === "WITHDRAW";
  const isBetPlace = tx.type === "BET_PLACE";
  const isBetWin = tx.type === "BET_WIN";
  const isRefund = tx.type === "REFUND";

  const isPositive = isDeposit || isBetWin || isRefund;

  const getIcon = () => {
    if (isDeposit) return "arrow-down-circle";
    if (isWithdraw) return "arrow-up-circle";
    if (isBetPlace) return "game-controller";
    if (isBetWin) return "trophy";
    if (isRefund) return "refresh";
    return "cash-outline";
  };

  const getColor = () => {
    if (isPositive) return COLORS.success;
    if (isWithdraw || isBetPlace) return COLORS.danger;
    return COLORS.primary;
  };

  const getBgColor = () => {
    if (isPositive) return COLORS.badgeLiveBg;
    if (isWithdraw || isBetPlace) return COLORS.badgeDangerBg;
    return COLORS.glowSoft;
  };

  const iconName = getIcon();
  const mainColor = getColor();
  const bgColor = getBgColor();

  const formattedAmount = formatMoneyWithSign(isPositive ? Math.abs(tx.amount) : -Math.abs(tx.amount));
  const formattedDate = formatShortDateTime(tx.created_at);

  const getStatusBadge = () => {
    if (tx.status === 'pending') {
      return (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>PENDING</Text>
        </View>
      );
    }
    return (
      <View style={styles.doneBadge}>
        <Ionicons name="checkmark" size={10} color={COLORS.success} />
        <Text style={styles.doneText}>DONE</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={24} color={mainColor} />
      </View>
      
      <View style={styles.infoCol}>
        <View style={styles.typeRow}>
          <Text style={styles.typeLabel}>{tx.type.replace('_', ' ')}</Text>
          {getStatusBadge()}
        </View>
        <Text style={styles.dateLabel}>{formattedDate}</Text>
      </View>

      <View style={styles.amountCol}>
        <Text style={[styles.amountLabel, { color: mainColor }]}>
          {formattedAmount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  typeLabel: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  dateLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  amountCol: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 15,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,245,225,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  doneText: {
    color: COLORS.success,
    fontSize: 9,
    fontFamily: "SpaceGroteskBold",
  },
  pendingBadge: {
    backgroundColor: COLORS.badgeWarningBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: {
    color: COLORS.warning,
    fontSize: 9,
    fontFamily: "SpaceGroteskBold",
  },
});

export default TransactionItem;
