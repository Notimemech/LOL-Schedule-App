import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
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
import { predictMatchAI, summarizeMatchAI } from "../../services/aiService";

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

  // AI States
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  const matchId = match?.matchId || match?.id;

  useFocusEffect(
    useCallback(() => {
      if (matchId) {
        autoCloseMarkets();
        loadAll();
      }
    }, [matchId])
  );

  const loadAll = async () => {
    setLoadError(false);
    setIsLoading(true);
    try {
      const data = await getMatchMarketsAndOdds(matchId);
      setMarkets(data || []);
    } catch (error) {
      console.log("Failed to load markets:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }

    getAllBetsForMatch(matchId)
      .then(setUserBets)
      .catch(() => { });
    getMatchGames(matchId)
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
    try {
      const uid = await getStoredUserId();
      setUserId(uid);
      if (!uid) return;
      const followedIds = await getFollowedMatchIds(uid);
      setIsFollowing(followedIds.includes(Number(matchId)));
    } catch (error) {
      // keep default
    }
  };

  const toggleFollow = async () => {
    if (!userId || followBusy) return;
    setFollowBusy(true);
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) {
        await followMatch(matchId, userId);
      } else {
        await unfollowMatch(matchId, userId);
      }
    } catch (error) {
      setIsFollowing(!next);
      console.log("Failed to toggle match follow:", error);
    } finally {
      setFollowBusy(false);
    }
  };

  const fetchAIPrediction = async () => {
    if (aiPrediction || loadingPrediction) return;
    setLoadingPrediction(true);
    try {
      const result = await predictMatchAI(matchId);
      setAiPrediction(result?.prediction || result);
    } catch (e) {
      console.error("AI Predict Error:", e);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const fetchAISummary = async () => {
    if (aiSummary || loadingSummary) return;
    setLoadingSummary(true);
    try {
      const summaryText = await summarizeMatchAI(matchId);
      setAiSummary(summaryText);
    } catch (e) {
      console.error("AI Summary Error:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ContentHeader title="ERROR" showBack={true} />
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>No match data provided.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openTeam = (team) => {
    if (team?.slug) {
      navigation.navigate("Team", { slug: team.slug });
    }
  };

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

  const handlePlaceABetPress = () => {
    navigation.navigate("PlaceBet", { match, markets, aiPrediction });
  };

  const team1Code = match.team1?.code || match.team1_code || "T1";
  const team2Code = match.team2?.code || match.team2_code || "T2";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="MATCH TERMINAL" showBack={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

          {/* MATCH HEADER CARD */}
          <View style={styles.matchHeaderBox}>
            <View style={styles.leagueRow}>
              <Text style={styles.leagueText}>{match.leagueName?.toUpperCase() || match.league_name?.toUpperCase()}</Text>
              {isLive && <LiveBadge />}
              {userId ? (
                <TouchableOpacity
                  style={[styles.followMatchBtn, isFollowing && styles.followMatchBtnActive]}
                  onPress={toggleFollow}
                  disabled={followBusy}
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
              >
                <Image source={{ uri: match.team1?.logoUrl || match.team1_logo }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{team1Code}</Text>
                <Text style={styles.teamHint}>VIEW TEAM</Text>
              </TouchableOpacity>
              <View style={[styles.vsBox, isFinished && { borderColor: COLORS.success }]}>
                <Text style={[styles.vsText, isFinished && { color: COLORS.success }]}>
                  {isFinished ? `${match.team1Score || match.team1_score || 0} - ${match.team2Score || match.team2_score || 0}` : "VS"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.teamCol}
                onPress={() => openTeam(match.team2)}
              >
                <Image source={{ uri: match.team2?.logoUrl || match.team2_logo }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{team2Code}</Text>
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
              >
                <Text style={styles.standingsLinkText}>
                  {match.tournamentName?.toUpperCase()} · STANDINGS ▸
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* AI ANALYSIS TRIGGER BUTTON */}
          <TouchableOpacity
            style={localStyles.aiToggleBtn}
            onPress={() => {
              const nextState = !showAiAnalysis;
              setShowAiAnalysis(nextState);
              if (nextState) {
                fetchAIPrediction();
                if (isFinished) fetchAISummary();
              }
            }}
          >
            <Ionicons name="sparkles" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={localStyles.aiToggleText}>
              {showAiAnalysis ? "ẨN PHÂN TÍCH AI ⚡" : "XEM DỰ ĐOÁN & PHÂN TÍCH BẰNG AI ⚡"}
            </Text>
            <Ionicons name={showAiAnalysis ? "chevron-up" : "chevron-down"} size={16} color={COLORS.primary} />
          </TouchableOpacity>

          {/* AI ANALYSIS CARD */}
          {showAiAnalysis && (
            <View style={localStyles.aiCard}>
              <View style={localStyles.aiCardHeader}>
                <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                <Text style={localStyles.aiCardTitle}>DỰ ĐOÁN & PHÂN TÍCH AI ESPORT</Text>
              </View>

              {loadingPrediction ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator color={COLORS.primary} size="small" />
                  <Text style={localStyles.aiLoadingText}>AI đang phân tích dữ liệu...</Text>
                </View>
              ) : aiPrediction ? (
                <View>
                  <Text style={localStyles.winRateLabel}>TỶ LỆ THẮNG DỰ ĐOÁN (AI WIN-RATE)</Text>
                  <View style={localStyles.barContainer}>
                    <View style={[localStyles.barTeam1, { width: `${aiPrediction.team1_win_rate}%` }]}>
                      <Text style={localStyles.barText}>{team1Code} {aiPrediction.team1_win_rate}%</Text>
                    </View>
                    <View style={[localStyles.barTeam2, { width: `${aiPrediction.team2_win_rate}%` }]}>
                      <Text style={localStyles.barText}>{team2Code} {aiPrediction.team2_win_rate}%</Text>
                    </View>
                  </View>

                  {aiPrediction.predicted_score && (
                    <Text style={localStyles.predictedScoreText}>🎯 Dự đoán tỷ số: {aiPrediction.predicted_score}</Text>
                  )}

                  {aiPrediction.key_factors && aiPrediction.key_factors.length > 0 && (
                    <View style={localStyles.factorsBox}>
                      <Text style={localStyles.factorsTitle}>📌 Yếu tố quyết định:</Text>
                      {aiPrediction.key_factors.map((factor, idx) => (
                        <Text key={idx} style={localStyles.factorItem}>• {factor}</Text>
                      ))}
                    </View>
                  )}

                  <Text style={localStyles.analysisTitle}>📝 Phân tích chuyên sâu:</Text>
                  <Text style={localStyles.analysisBody}>{aiPrediction.analysis}</Text>

                  {aiPrediction.betting_tip && (
                    <View style={localStyles.tipBox}>
                      <Ionicons name="bulb" size={16} color={COLORS.warning} />
                      <Text style={localStyles.tipText}>💡 Gợi ý cược: {aiPrediction.betting_tip}</Text>
                    </View>
                  )}
                </View>
              ) : null}

              {/* Finished Match AI Summary */}
              {isFinished && (
                <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                  <Text style={localStyles.analysisTitle}>🔥 Tóm tắt trận đấu (AI Recap):</Text>
                  {loadingSummary ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 8 }} />
                  ) : aiSummary ? (
                    <Text style={localStyles.analysisBody}>{aiSummary}</Text>
                  ) : null}
                </View>
              )}
            </View>
          )}

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
              {/* LIVE / FINISHED GAME BREAKDOWN */}
              <GameBreakdownSection games={games} match={match} />

              {/* MARKET SECTION */}
              <MarketSection match={match} markets={markets} />

              {/* HEAD TO HEAD */}
              <HeadToHeadSection h2h={h2h} match={match} />

              {/* USER BET HISTORY SECTION */}
              <BetHistorySection bets={userBets} match={match} markets={markets} />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, bettingDisabled && { opacity: 0.5 }]}
            onPress={handlePlaceABetPress}
            disabled={bettingDisabled}
          >
            <Text style={styles.submitButtonText}>
              {isFinished ? "MATCH FINISHED" : hasStarted ? "MATCH IN PROGRESS" : allMarketsClosed ? "BETTING CLOSED" : "PLACE A BET"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  aiToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A1014",
    borderWidth: 1,
    borderColor: "#00F5E1",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  aiToggleText: {
    color: "#00F5E1",
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    marginRight: 6
  },
  aiCard: {
    backgroundColor: "#121A20",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00F5E1",
    marginBottom: 16
  },
  aiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  aiCardTitle: {
    color: "#00F5E1",
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
    marginLeft: 6
  },
  aiLoadingText: {
    color: "#8A98A6",
    fontFamily: "Manrope",
    fontSize: 12,
    marginTop: 8
  },
  winRateLabel: {
    color: "#8A98A6",
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
    marginBottom: 6
  },
  barContainer: {
    height: 24,
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#050708",
    marginBottom: 10
  },
  barTeam1: {
    backgroundColor: "#00F5E1",
    justifyContent: "center",
    alignItems: "center"
  },
  barTeam2: {
    backgroundColor: "#4CC9F0",
    justifyContent: "center",
    alignItems: "center"
  },
  barText: {
    color: "#050708",
    fontFamily: "SpaceGroteskBold",
    fontSize: 11
  },
  predictedScoreText: {
    color: "#FACC15",
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
    marginBottom: 10
  },
  factorsBox: {
    backgroundColor: "#0B1014",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  factorsTitle: {
    color: "#D8E0E8",
    fontFamily: "ManropeBold",
    fontSize: 12,
    marginBottom: 4
  },
  factorItem: {
    color: "#8A98A6",
    fontFamily: "Manrope",
    fontSize: 12,
    marginLeft: 4,
    lineHeight: 18
  },
  analysisTitle: {
    color: "#D8E0E8",
    fontFamily: "ManropeBold",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4
  },
  analysisBody: {
    color: "#D8E0E8",
    fontFamily: "Manrope",
    fontSize: 13,
    lineHeight: 20
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderWidth: 1,
    borderColor: "#FACC15",
    borderRadius: 8,
    padding: 10,
    marginTop: 12
  },
  tipText: {
    color: "#FACC15",
    fontFamily: "ManropeBold",
    fontSize: 12,
    marginLeft: 6,
    flex: 1
  }
});
