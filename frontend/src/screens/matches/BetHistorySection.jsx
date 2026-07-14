import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "../../styles/colors";
import { formatMoney, formatMarketName, formatDate } from "../../utils/format";
import SectionHeader from "../../components/ui/SectionHeader";

/**
 * Section displaying the user's bet history for a specific match.
 * Extracted from DetailScreen.
 */
const BetHistorySection = ({ bets, match, markets }) => {
  if (!bets || bets.length === 0) return null;

  // Calculate totals
  const totalPotentialWin = bets.reduce((sum, bet) => {
    if (bet.status === "pending") {
      return sum + Number(bet.potential_win);
    }
    return sum;
  }, 0);

  const totalWon = bets.reduce((sum, bet) => bet.status === "won" ? sum + Number(bet.payout_amount || bet.potential_win) : sum, 0);
  const totalLost = bets.reduce((sum, bet) => bet.status === "lost" ? sum + Number(bet.amount) : sum, 0);
  const netResult = totalWon - totalLost;

  // Determine market status to see if it's settled or closed
  let isAnyMarketSettled = false;
  let isAnyMarketClosed = false;
  if (markets && markets.length > 0) {
    isAnyMarketSettled = markets.some(m => m.status === 'settled');
    isAnyMarketClosed = markets.some(m => m.status === 'closed' || m.status === 'settled');
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SectionHeader title="YOUR BETS" />

      {/* POTENTIAL WINNINGS MOVED TO TOP */}
      {(!isAnyMarketSettled && (isAnyMarketClosed || totalPotentialWin > 0)) ? (
        <View style={styles.potentialWinBox}>
          <View style={styles.potentialWinRow}>
            <Text style={styles.potentialWinLabel}>POTENTIAL WINNINGS</Text>
            <Text style={styles.potentialWinAmount}>{formatMoney(totalPotentialWin)}</Text>
          </View>
        </View>
      ) : null}

      {isAnyMarketSettled && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>SETTLEMENT SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Wagered:</Text>
            <Text style={styles.summaryValue}>{formatMoney(bets.reduce((sum, b) => sum + Number(b.amount), 0))}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Won:</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>+{formatMoney(totalWon)}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryLabel}>NET RESULT:</Text>
            <Text style={[styles.summaryValue, { color: netResult >= 0 ? COLORS.success : COLORS.danger, fontSize: 16 }]}>
              {netResult >= 0 ? "+" : ""}{formatMoney(netResult)}
            </Text>
          </View>
        </View>
      )}

      {bets.map(bet => {
        const payout = parseFloat(bet.payout_amount || bet.potential_win || 0);
        const isPending = bet.status === "pending";
        const isWon = bet.status === "won";
        const isLost = bet.status === "lost";

        let outcomeText = (bet.option_key || '').replace(/[-_]/g, ' ').toUpperCase();
        if (bet.option_key === match?.team1?.slug) outcomeText = match?.team1?.code;
        if (bet.option_key === match?.team2?.slug) outcomeText = match?.team2?.code;

        return (
          <View key={bet.id} style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.topLeft}>
                <Text style={styles.marketTitle}>
                  {formatMarketName(bet.market_type)} - {outcomeText}
                </Text>
                <Text style={styles.date}>{formatDate(bet.created_at)}</Text>
              </View>

              <View style={styles.topRight}>
                <Text style={[styles.statusText, { color: isPending ? COLORS.primary : (isWon ? COLORS.success : COLORS.danger) }]}>
                  {isPending ? 'ACCEPTED' : bet.status}
                </Text>
              </View>
            </View>

            <View style={styles.rowMiddle}>
              <View style={styles.wagerBlock}>
                <Text style={styles.label}>Wager:</Text>
                <Text style={styles.wagerAmount}>{formatMoney(bet.amount)} VND</Text>
              </View>

              <View style={styles.payoutBlock}>
                <Text style={styles.label}>{isWon ? 'Payout:' : (isLost ? 'Return:' : 'Potential Payout:')}</Text>
                <Text style={[styles.payoutAmount, (isLost ? { color: COLORS.textMuted } : {})]}>
                  {isLost ? '0' : formatMoney(isWon ? payout : bet.potential_win)} VND
                </Text>
              </View>
            </View>
          </View>
        );
      })}

    </View>
  );
};

const styles = StyleSheet.create({
  potentialWinBox: {
    marginBottom: 20,
    marginTop: 10,
  },
  potentialWinLabel: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  potentialWinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potentialWinText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: COLORS.text,
  },
  potentialWinAmount: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 20,
    color: COLORS.primary,
  },
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
  summaryBox: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  summaryLabel: {
    color: COLORS.text,
    fontFamily: "ManropeMedium",
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
});

export default BetHistorySection;
