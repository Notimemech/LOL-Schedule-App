import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeDetailStyles } from "../../styles/matches.styles";
import { getMatchMarketsAndOdds, getAllBetsForMatch, autoCloseMarkets } from "../../services/bettingService";
import { getMatchGames, followMatch, unfollowMatch, getFollowedMatchIds } from "../../services/matchService";
import { getHeadToHead } from "../../services/teamService";
import { getStoredUserId } from "../../utils/user";
import MarketSection from "./MarketSection";
import BetHistorySection from "./BetHistorySection";
import GameBreakdownSection from "./GameBreakdownSection";
import HeadToHeadSection from "./HeadToHeadSection";
import EmptyState from "../../components/ui/EmptyState";
import LiveBadge from "../../components/ui/LiveBadge";

export default function DetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeDetailStyles);
  const match = route.params?.match;

  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [userBets, setUserBets] = useState([]);
  const [games, setGames] = useState([]);
  const [h2h, setH2h] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (match?.matchId) {
        autoCloseMarkets(); // Trigger auto-close of expired markets on enter
        loadAll();
      }
    }, [match?.matchId])
  );

  const loadAll = async () => {
    setLoadError(false);
    try {
      const data = await getMatchMarketsAndOdds(match.matchId);
      setMarkets(data);
    } catch (error) {
      console.log("Failed to load markets:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }

    // Companion content — each loads independently and fails silently
    // so betting UI never breaks because of side content.
    getAllBetsForMatch(match.matchId)
      .then(setUserBets)
      .catch(() => { });
    getMatchGames(match.matchId)
      .then(setGames)
      .catch(() => { });
    if (match?.team1?.id && match?.team2?.id) {
      getHeadToHead(match.team1.id, match.team2.id)
        .then(setH2h)
        .catch(() => { });
    }
    loadFollowState();
  };

  const loadFollowState = async () => {
    // Follow state is companion content — fails silently like the rest.
    try {
      const uid = await getStoredUserId();
      setUserId(uid);
      if (!uid) return;
      const followedIds = await getFollowedMatchIds(uid);
      setIsFollowing(followedIds.includes(Number(match.matchId)));
    } catch (error) {
      // keep default (not following)
    }
  };

  const toggleFollow = async () => {
    if (!userId || followBusy) return;
    setFollowBusy(true);
    // Optimistic UI, reverted on failure (same pattern as TeamScreen).
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) {
        await followMatch(match.matchId, userId);
      } else {
        await unfollowMatch(match.matchId, userId);
      }
    } catch (error) {
      setIsFollowing(!next);
      console.log("Failed to toggle match follow:", error);
    } finally {
      setFollowBusy(false);
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

  const openTeam = (team) => {
    if (team?.slug) {
      navigation.navigate("Team", { slug: team.slug });
    }
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
  const isLive = match.state === "happening";
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
            <View style={styles.leagueRow}>
              <Text style={styles.leagueText}>{match.leagueName?.toUpperCase()}</Text>
              {isLive && <LiveBadge />}
              {userId ? (
                <TouchableOpacity
                  style={[styles.followMatchBtn, isFollowing && styles.followMatchBtnActive]}
                  onPress={toggleFollow}
                  disabled={followBusy}
                  accessibilityRole="button"
                  accessibilityLabel={isFollowing ? "Unfollow match" : "Follow match"}
                >
                  <Ionicons
                    name={isFollowing ? "star" : "star-outline"}
                    size={14}
                    color={isFollowing ? COLORS.buttonPrimaryText : COLORS.primary}
                  />
                  <Text style={[styles.followMatchBtnText, isFollowing && styles.followMatchBtnTextActive]}>
                    {isFollowing ? "FOLLOWING" : "FOLLOW"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.teamsRow}>
              <TouchableOpacity
                style={styles.teamCol}
                onPress={() => openTeam(match.team1)}
                accessibilityRole="button"
                accessibilityLabel={`View ${match.team1.name} profile`}
              >
                <Image source={{ uri: match.team1.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{match.team1.code}</Text>
                <Text style={styles.teamHint}>VIEW TEAM</Text>
              </TouchableOpacity>
              <View style={[styles.vsBox, isFinished && { borderColor: COLORS.success }]}>
                <Text style={[styles.vsText, isFinished && { color: COLORS.success }]}>
                  {isFinished ? `${match.team1Score} - ${match.team2Score}` : "VS"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.teamCol}
                onPress={() => openTeam(match.team2)}
                accessibilityRole="button"
                accessibilityLabel={`View ${match.team2.name} profile`}
              >
                <Image source={{ uri: match.team2.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{match.team2.code}</Text>
                <Text style={styles.teamHint}>VIEW TEAM</Text>
              </TouchableOpacity>
            </View>
            {match.tournamentId ? (
              <TouchableOpacity
                style={styles.standingsLink}
                onPress={() => navigation.navigate("Standings", {
                  tournamentId: match.tournamentId,
                  tournamentName: match.tournamentName,
                })}
                accessibilityRole="button"
                accessibilityLabel="View tournament standings"
              >
                <Text style={styles.standingsLinkText}>
                  {match.tournamentName?.toUpperCase()} · STANDINGS ▸
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : loadError ? (
            <EmptyState
              icon="cloud-offline-outline"
              message="Could not load betting markets"
              actionLabel="Retry"
              onAction={loadAll}
            />
          ) : (
            <>
              {/* LIVE / FINISHED GAME BREAKDOWN (Companion Hub) */}
              <GameBreakdownSection games={games} match={match} />

              {/* MARKET SECTION */}
              <MarketSection match={match} markets={markets} />

              {/* HEAD TO HEAD (Companion Hub) */}
              <HeadToHeadSection h2h={h2h} match={match} />

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
            accessibilityRole="button"
            accessibilityLabel="Place a bet"
          >
            <Text style={styles.submitButtonText}>
              {isFinished
                ? "MATCH FINISHED"
                : allMarketsClosed
                  ? "MARKET CLOSED"
                  : hasStarted
                    ? "LIVE NOW"
                    : "LEAVE A PREDICTION"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
