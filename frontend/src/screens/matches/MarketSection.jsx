import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../styles/colors";
import { detailStyles as styles } from "../../styles/matches.styles";
import { formatMarketName } from "../../utils/format";
import SectionHeader from "../../components/ui/SectionHeader";
import StatusBadge from "../../components/ui/StatusBadge";

/**
 * Section displaying all markets and odds for a match.
 * Extracted from DetailScreen.
 */
const MarketSection = ({ match, markets }) => {
  const navigation = useNavigation();
  const isMatchFinished = match.state === "finished";

  const getOutcomeLabel = (odd, market) => {
    const team1Slug = match?.team1?.slug;
    const team2Slug = match?.team2?.slug;

    if (odd.option_key === team1Slug) {
      return match?.team1?.code || match?.team1?.name || "Team 1";
    }

    if (odd.option_key === team2Slug) {
      return match?.team2?.code || match?.team2?.name || "Team 2";
    }

    if (odd.option_key) {
      return odd.option_key.replace(/_/g, ' ').toUpperCase();
    }

    return "Outcome";
  };

  const mainMarket = markets.find(m => m.market_type === 'winner_team');
  const secondaryMarkets = markets.filter(m => m.market_type !== 'winner_team');

  const renderStatusBadge = (market) => {
    if (market.status === "settled") {
      return <StatusBadge label="SETTLED" color={COLORS.textMuted} bg={COLORS.surface} />;
    } else if (market.status === "closed") {
      return <StatusBadge label="CLOSED" color={COLORS.warning} bg={COLORS.badgeWarningBg} borderColor={COLORS.warning} />;
    }
    return null;
  };

  const renderOdds = (market, isMainMarket = false) => {
    const isClosed = market.status === "closed";
    const isSettled = market.status === "settled" || isMatchFinished;
    return market.odds.map(odd => {
      let isWinner = false;
      let isLoser = false;

      if (market.result_option) {
        isWinner = odd.option_key === market.result_option;
        isLoser = odd.option_key !== market.result_option;
      } else {
        isWinner = odd.is_winner === 1 || odd.is_winner === "1" || odd.is_winner === true || odd.is_winner === "true";
        isLoser = odd.is_winner === 0 || odd.is_winner === "0" || odd.is_winner === false || odd.is_winner === "false";
      }

      return (
        <TouchableOpacity 
          key={odd.id} 
          style={[
            styles.oddBox, 
            !isMainMarket && styles.oddBoxSecondary,
            isSettled && isWinner && { borderColor: COLORS.success, backgroundColor: 'rgba(0, 245, 225, 0.05)' },
            isSettled && isLoser && { opacity: 0.5 }
          ]}
          onPress={() => {
            if (!isSettled && !isClosed) {
              navigation.navigate("PlaceBetStack", { 
                screen: "PlaceBet", 
                params: { match, markets } 
              });
            }
          }}
          disabled={isSettled || isClosed}
          activeOpacity={isSettled || isClosed ? 1 : 0.7}
        >
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Text style={[
              styles.oddTeamCode, 
              !isMainMarket && styles.oddTeamCodeSecondary,
              isSettled && isWinner && { color: COLORS.success }
            ]}>
              {getOutcomeLabel(odd, market)}
            </Text>

          </View>
          <Text style={[
            styles.oddValue, 
            !isMainMarket && styles.oddValueSecondary,
            isSettled && isWinner && { color: COLORS.success }
          ]}>
            {parseFloat(odd.odd_value).toFixed(2)}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={{ marginBottom: 30 }}>
      <SectionHeader title="BETTING MARKETS" />

      {/* Main Market */}
      {mainMarket && (
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>{formatMarketName(mainMarket.market_type)}</Text>
            {renderStatusBadge(mainMarket)}
          </View>
          <View style={styles.marketRow}>
            {renderOdds(mainMarket, true)}
          </View>
        </View>
      )}

      {/* Secondary Markets Grid */}
      {secondaryMarkets.length > 0 && (
        <View style={styles.marketGrid}>
          {secondaryMarkets.map(market => (
            <View key={market.id} style={styles.secondaryMarketCard}>
              <View style={styles.secondaryMarketHeader}>
                <Text style={styles.secondaryMarketTitle}>{formatMarketName(market.market_type)}</Text>
                {renderStatusBadge(market)}
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {renderOdds(market, false)}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default MarketSection;
