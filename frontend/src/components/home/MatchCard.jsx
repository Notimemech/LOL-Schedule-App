import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { formatDate } from "../../utils/format";
import LiveBadge from "../ui/LiveBadge";
import StatusBadge from "../ui/StatusBadge";

/**
 * Reusable match card used in HomeScreen (featured / popular / search results).
 * Odds are real values provided by the backend — never computed client-side
 * (agents/BETTING_RULES.md). When no market exists yet the odds row collapses
 * into a single "view match" action.
 * @param {object} game - The match object
 * @param {boolean} isFollowedMatch - User follows this match (star badge)
 * @param {number[]} followedTeamIds - Teams the user follows (bell next to code)
 */
const MatchCard = ({ game, isFollowedMatch = false, followedTeamIds = [] }) => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isFinished = game.state === "finished";
  const isLive = game.state === "happening";
  const hasOdds = game.team1Odd != null && game.team2Odd != null;

  const goToDetail = () => navigation.navigate("Detail", { match: game });

  const isTeamFollowed = (team) => followedTeamIds.includes(Number(team?.id));

  const renderFollowedTeamIcon = (team) =>
    isTeamFollowed(team) ? (
      <Ionicons name="notifications" size={12} color={COLORS.primary} />
    ) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.league} numberOfLines={1} ellipsizeMode="tail">
          {game.leagueName?.toUpperCase()}
        </Text>
        {isFollowedMatch && (
          <StatusBadge
            label="★ FOLLOWED"
            color={COLORS.primary}
            bg={COLORS.glowSoft}
            borderColor={COLORS.primary}
          />
        )}
        {isLive ? (
          <LiveBadge />
        ) : (
          <Text style={styles.time}>{formatDate(game.startTime)}</Text>
        )}
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <Image source={{ uri: game.team1.logoUrl }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.code}>{game.team1.code}</Text>
          {renderFollowedTeamIcon(game.team1)}
        </View>

        {isFinished ? (
          <Text style={[styles.vs, { color: COLORS.success }]}>
            {game.team1Score} - {game.team2Score}
          </Text>
        ) : (
          <Text style={styles.vs}>VS</Text>
        )}

        <View style={[styles.team, { justifyContent: "flex-end" }]}>
          {renderFollowedTeamIcon(game.team2)}
          <Text style={styles.code}>{game.team2.code}</Text>
          <Image source={{ uri: game.team2.logoUrl }} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      {/* Real odds row (backend values) / result button */}
      {isFinished ? (
        <TouchableOpacity
          style={styles.resultButton}
          onPress={goToDetail}
          accessibilityRole="button"
          accessibilityLabel="View match results"
        >
          <Text style={styles.resultText}>VIEW RESULTS</Text>
        </TouchableOpacity>
      ) : hasOdds ? (
        <View style={styles.oddsRow}>
          <TouchableOpacity
            style={styles.oddBox}
            onPress={goToDetail}
            accessibilityRole="button"
            accessibilityLabel={`Odds for ${game.team1.code}`}
          >
            <Text style={styles.oddLabel}>{game.team1.code}</Text>
            <Text style={styles.oddValue}>x{game.team1Odd.toFixed(2)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.oddBox}
            onPress={goToDetail}
            accessibilityRole="button"
            accessibilityLabel={`Odds for ${game.team2.code}`}
          >
            <Text style={styles.oddLabel}>{game.team2.code}</Text>
            <Text style={styles.oddValue}>x{game.team2Odd.toFixed(2)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={goToDetail}
            accessibilityRole="button"
            accessibilityLabel="Open match details"
          >
            <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.resultButton}
          onPress={goToDetail}
          accessibilityRole="button"
          accessibilityLabel="Open match details"
        >
          <Text style={styles.resultText}>VIEW MATCH</Text>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 10,
  },
  league: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
    marginRight: 8,
  },
  time: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  team: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
  },
  code: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
  },
  vs: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    marginHorizontal: 10,
  },
  oddsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  oddBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  oddLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  oddValue: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  detailBtn: {
    width: 44,
    backgroundColor: COLORS.glowSoft,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resultButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  resultText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

export default MatchCard;
