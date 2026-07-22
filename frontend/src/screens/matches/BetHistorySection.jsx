import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { getVipColors } from "../../styles/themes";
import { formatMoney, formatMarketName, formatDate } from "../../utils/format";
import SectionHeader from "../../components/ui/SectionHeader";

/**
 * Section displaying the user's bet history for a specific match.
 * Extracted from DetailScreen.
 */
const BetHistorySection = ({ bets, match, markets }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (!bets || bets.length === 0) return null;

  return (
    <View style={{ marginTop: 10 }}>
      <SectionHeader title="ALL BETS" />

      {bets.map(bet => {
        const isPending = bet.status === "pending";
        const isWon = bet.status === "won";
        const isLost = bet.status === "lost";

        let outcomeText = (bet.option_key || '').replace(/[-_]/g, ' ').toUpperCase();
        if (bet.option_key === match?.team1?.slug) outcomeText = match?.team1?.code;
        if (bet.option_key === match?.team2?.slug) outcomeText = match?.team2?.code;

        const displayUsername = bet.username || bet.name || bet.email || 'Anonymous';

        return (
          <View key={bet.id} style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.topLeft}>
                <Text style={styles.marketTitle}>
                  {formatMarketName(bet.market_type)}
                </Text>
                <Text style={styles.date}>{formatDate(bet.placed_at || bet.created_at)}</Text>
              </View>
            </View>

            <View style={styles.rowMiddle}>
              <View style={styles.wagerBlock}>
                <Text style={styles.label}>User:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.wagerAmount}>{displayUsername}</Text>
                  {bet.vip_name && (
                    <LinearGradient
                      colors={getVipColors(bet.vip_name)}
                      start={[0, 0]} end={[1, 1]}
                      style={styles.vipBadge}
                    >
                      <Text style={styles.vipBadgeText}>{bet.vip_name}</Text>
                    </LinearGradient>
                  )}
                </View>
              </View>

              <View style={styles.payoutBlock}>
                <Text style={styles.label}>Choice:</Text>
                <Text style={[styles.payoutAmount, { fontSize: 16, color: COLORS.text }]}>
                  {outcomeText}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  vipBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vipBadgeText: {
    color: COLORS.staticWhite,
    fontSize: 10,
    fontFamily: "SpaceGroteskBold",
  },
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
