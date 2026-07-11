import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ContentHeader from "../../components/common/ContentHeader";
import COLORS from "../../styles/colors";
import { getMatchMarketsAndOdds } from "../../services/bettingService";
import { detailStyles as styles } from "../../styles/matches.styles";

export default function DetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const match = route.params?.match;
  
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (match?.matchId) {
      loadMarkets();
    }
  }, [match]);

  const loadMarkets = async () => {
    try {
      const data = await getMatchMarketsAndOdds(match.matchId);
      setMarkets(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ContentHeader title="ERROR" />
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>No match data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlaceABetPress = () => {
    navigation.navigate("PlaceBet", { match, markets });
  };

  // Determine if match has started or already passed (disable betting)
  const hasStarted = (() => {
    try {
      if (!match || !match.startTime) return false;
      const start = new Date(match.startTime).getTime();
      return Date.now() >= start;
    } catch (e) {
      return false;
    }
  })();

  // Helper to format market type string nicely
  const formatMarketName = (marketType) => {
    return marketType.replace(/_/g, " ").toUpperCase();
  };

  const mainMarket = markets.find(m => m.market_type === 'winner_team');
  const secondaryMarkets = markets.filter(m => m.market_type !== 'winner_team');

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="MATCH TERMINAL" showBack={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* MATCH HEADER */}
          <View style={styles.matchHeaderBox}>
            <Text style={styles.leagueText}>{match.leagueName?.toUpperCase()}</Text>
            <View style={styles.teamsRow}>
              <View style={styles.teamCol}>
                <Image source={{ uri: match.team1.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{match.team1.code}</Text>
              </View>
              <View style={styles.vsBox}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.teamCol}>
                <Image source={{ uri: match.team2.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{match.team2.code}</Text>
              </View>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* MARKET SECTION */}
              {mainMarket && (
                <>
                  <Text style={styles.sectionTitle}>MATCH WINNER</Text>
                  <View style={styles.marketRow}>
                    {mainMarket.odds.map(odd => {
                      // odd.option_key is the slug
                      const teamCode = odd.option_key === match.team1.slug ? match.team1.code : match.team2.code;
                      return (
                        <View key={odd.id} style={styles.oddBox}>
                          <Text style={styles.oddTeamCode}>{teamCode}</Text>
                          <Text style={styles.oddValue}>{parseFloat(odd.odd_value).toFixed(2)}</Text>
                        </View>
                      )
                    })}
                  </View>
                </>
              )}

              {secondaryMarkets.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 16 }]}>SECONDARY MARKETS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {secondaryMarkets.map(market => (
                      <View key={market.id} style={{ width: '48%', backgroundColor: COLORS.card, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border }}>
                        <Text style={{ fontFamily: "SpaceGroteskBold", fontSize: 12, color: COLORS.textMuted, marginBottom: 8, textAlign: 'center' }}>
                          {formatMarketName(market.market_type)}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          {market.odds.map(odd => {
                            const teamCode = odd.option_key === match.team1.slug ? match.team1.code : match.team2.code;
                            return (
                              <View key={odd.id} style={{ alignItems: 'center' }}>
                                <Text style={{ fontFamily: "ManropeBold", fontSize: 10, color: COLORS.textMuted }}>{teamCode}</Text>
                                <Text style={{ fontFamily: "SpaceGroteskBold", fontSize: 14, color: COLORS.text }}>{parseFloat(odd.odd_value).toFixed(2)}</Text>
                              </View>
                            )
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (markets.length === 0 || hasStarted) && { opacity: 0.5 }
            ]}
            onPress={() => {
              if (markets.length === 0) return;
              if (hasStarted) {
                Alert.alert('Unavailable', 'This match has already started or finished. Placing bets is disabled.');
                return;
              }
              handlePlaceABetPress();
            }}
            disabled={markets.length === 0 || hasStarted}
          >
            <Text style={styles.submitButtonText}>PLACE A BET</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
