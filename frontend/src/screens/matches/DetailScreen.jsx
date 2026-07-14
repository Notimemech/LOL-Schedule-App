import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContentHeader from "../../components/common/ContentHeader";
import COLORS from "../../styles/colors";
import { getMatchMarketsAndOdds, getAllBetsForMatch, autoCloseMarkets } from "../../services/bettingService";
import { detailStyles as styles } from "../../styles/matches.styles";
import MarketSection from "./MarketSection";
import BetHistorySection from "./BetHistorySection";

export default function DetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const match = route.params?.match;

  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userBets, setUserBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (match?.matchId) {
        autoCloseMarkets(); // Trigger auto-close of expired markets on enter
        loadMarkets();
        loadUserBets();
      }
    }, [match?.matchId])
  );

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

  const loadUserBets = async () => {
    setLoadingBets(true);
    try {
      const bets = await getAllBetsForMatch(match.matchId);
      setUserBets(bets);
    } catch (error) {
      console.log('Failed to load user bets:', error);
    } finally {
      setLoadingBets(false);
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

  // Determine if market is closed or settled (no more betting)
  const allMarketsClosed = markets.length > 0 && markets.every(
    m => m.status === 'closed' || m.status === 'settled' || m.status === 'cancelled'
  );
  const hasStarted = (() => {
    try {
      if (!match || !match.startTime) return false;
      const start = new Date(match.startTime).getTime();
      return Date.now() >= start;
    } catch (e) {
      return false;
    }
  })();

  const isFinished = match.state === "finished";
  const bettingDisabled = markets.length === 0 || isFinished || allMarketsClosed || hasStarted;


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
              <View style={[styles.vsBox, isFinished && { borderColor: COLORS.success }]}>
                <Text style={[styles.vsText, isFinished && { color: COLORS.success }]}>
                  {isFinished ? `${match.team1Score} - ${match.team2Score}` : "VS"}
                </Text>
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
              <MarketSection match={match} markets={markets} />

              {/* USER BET HISTORY SECTION */}
              <BetHistorySection bets={userBets} match={match} markets={markets} />
            </>
          )}

        </ScrollView>
        {/* PLACE BET BUTTON (Pinned to bottom) */}
        <View style={styles.bottomFixedBox}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              bettingDisabled && { opacity: 0.5 }
            ]}
            onPress={handlePlaceABetPress}
            disabled={bettingDisabled}
          >
            <Text style={styles.submitButtonText}>
              {isFinished
                ? "MATCH FINISHED"
                : allMarketsClosed
                  ? "MARKET CLOSED"
                  : hasStarted
                    ? "LIVE NOW"
                    : "PLACE A BET"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
