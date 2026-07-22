import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { formatDate } from "../../utils/format";
import StatusBadge from "../ui/StatusBadge";
import LiveBadge from "../ui/LiveBadge";

/**
 * Reusable match banner item used in ScheduleScreen.
 * Displays match info and market status (OPEN, CLOSED, SETTLED).
 * @param {boolean} isFollowedMatch - User follows this match (star badge)
 * @param {number[]} followedTeamIds - Teams the user follows (bell next to code)
 */
const MatchListItem = ({ game, isFollowedMatch = false, followedTeamIds = [] }) => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const isTeamFollowed = (team) => followedTeamIds.includes(Number(team?.id));

  // Determine market status if available from backend, otherwise fallback to match state logic
  let marketStatus = game.marketStatus; // Should be 'open', 'closed', or 'settled'
  if (!marketStatus) {
    marketStatus = game.state === 'finished' ? 'settled' : (game.state === 'happening' ? 'closed' : 'open');
  }

  const getMarketBadge = (status) => {
    switch (status) {
      case 'settled':
        return { label: 'SETTLED', color: COLORS.textMuted, bg: COLORS.surface, border: COLORS.border };
      case 'closed':
        return { label: 'CLOSED', color: COLORS.warning, bg: COLORS.badgeWarningBg, border: COLORS.warning };
      case 'open':
      default:
        return { label: 'OPEN', color: COLORS.success, bg: COLORS.badgeSuccessBg, border: COLORS.success };
    }
  };

  const badgeProps = getMarketBadge(marketStatus);

  return (
    <View style={styles.matchContainer}>
      <View style={styles.matchHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.leagueText}>{game.leagueName?.toUpperCase()}</Text>
          <Text style={styles.tournamentText}>{game.tournamentName}</Text>
        </View>
        <View style={styles.badgeCol}>
          <StatusBadge
            label={badgeProps.label}
            color={badgeProps.color}
            bg={badgeProps.bg}
            borderColor={badgeProps.border}
          />
          {isFollowedMatch && (
            <StatusBadge
              label="★ FOLLOWED"
              color={COLORS.primary}
              bg={COLORS.glowSoft}
              borderColor={COLORS.primary}
            />
          )}
        </View>
      </View>

      {game.state === "happening" ? (
        <View style={{ alignSelf: "flex-start", marginBottom: 16 }}>
          <LiveBadge label="LIVE NOW" />
        </View>
      ) : (
        <View style={[styles.timeBadge, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[styles.timeText, { color: COLORS.text }]}>{formatDate(game.startTime)}</Text>
        </View>
      )}

      <View style={styles.gameCard}>
        <View style={styles.teamCard}>
          <Image source={{ uri: game.team1.logoUrl }} style={styles.teamLogo} resizeMode="contain" />
          <View style={styles.teamCodeRow}>
            {isTeamFollowed(game.team1) && (
              <Ionicons name="notifications" size={13} color={COLORS.primary} />
            )}
            <Text style={styles.teamCode}>{game.team1.code}</Text>
          </View>
        </View>

        {game.state === "finished" ? (
          <View style={[styles.vsContainer, { borderColor: COLORS.success, shadowColor: COLORS.success }]}>
            <Text style={[styles.vsText, { color: COLORS.success }]}>
              {game.team1Score} - {game.team2Score}
            </Text>
          </View>
        ) : (
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
        )}

        <View style={styles.teamCard}>
          <Image source={{ uri: game.team2.logoUrl }} style={styles.teamLogo} resizeMode="contain" />
          <View style={styles.teamCodeRow}>
            {isTeamFollowed(game.team2) && (
              <Ionicons name="notifications" size={13} color={COLORS.primary} />
            )}
            <Text style={styles.teamCode}>{game.team2.code}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate("Detail", { match: game })}
        activeOpacity={0.7}
      >
        <Text style={styles.detailButtonText}>
          {game.state === "finished" ? "VIEW RESULTS" : "VIEW DETAILS"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  matchContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 8,
    marginBottom: 12,
  },
  leagueText: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tournamentText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  timeBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.badgeLiveBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.glowSoft,
  },
  timeText: {
    color: COLORS.badgeLiveText,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 16,
  },
  teamCard: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  teamCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  teamLogo: {
    width: 60,
    height: 60,
  },
  teamCode: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 18,
    letterSpacing: 1,
  },
  vsContainer: {
    padding: 8,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  vsText: {
    color: COLORS.secondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  detailButton: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  detailButtonText: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    letterSpacing: 2,
  },
});

export default MatchListItem;
