import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../../hooks/useTheme';
import { formatMoney } from '../../utils/bettingUtils';

const HistoryBlock = ({ bet, onCancel }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isAccepted = bet.status === "Accepted";
  const isCancelled = bet.status === "Cancelled";

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <View style={styles.topLeft}>
          <Text style={styles.marketTitle}>
            {bet.market.replace(/_/g, " ").toUpperCase()} - {bet.outcomeId.toUpperCase()}
          </Text>
          <Text style={styles.date}>{new Date(bet.date).toLocaleString()}</Text>
        </View>

        <View style={styles.topRight}>
          <Text style={[styles.statusText, { color: isCancelled ? COLORS.textMuted : (isAccepted ? COLORS.primary : COLORS.success) }]}>
            {bet.status}
          </Text>
        </View>
      </View>

      <View style={styles.rowMiddle}>
        <View style={styles.wagerBlock}>
          <Text style={styles.label}>Wager:</Text>
          <Text style={styles.wagerAmount}>{formatMoney(bet.amount)} VND</Text>
        </View>

        <View style={styles.payoutBlock}>
          <Text style={styles.label}>Potential Payout:</Text>
          <Text style={styles.payoutAmount}>{formatMoney(bet.payout)} VND</Text>
        </View>
      </View>

      {isAccepted && onCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(bet.id)}>
          <Text style={styles.cancelButtonText}>CANCEL BET</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  topLeft: {
    flex: 1,
  },
  marketTitle: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  topRight: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
  },
  wagerBlock: {
    flex: 1,
  },
  payoutBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  wagerAmount: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 16,
    color: COLORS.text,
  },
  payoutAmount: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 20,
    color: COLORS.success,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 1,
  }
});

export default HistoryBlock;
