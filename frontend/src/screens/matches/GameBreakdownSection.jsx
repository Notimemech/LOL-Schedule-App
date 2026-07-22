import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import SectionHeader from "../../components/ui/SectionHeader";

/**
 * Companion Hub: per-game scoreboard for a match (kills, first blood, winner).
 * Each row opens the full GameDetail screen (lineups, MVP, events, gold).
 */
const GameBreakdownSection = ({ games, match }) => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (!games || games.length === 0) return null;

  const codeFor = (teamId) => {
    if (teamId === match?.team1?.id) return match?.team1?.code;
    if (teamId === match?.team2?.id) return match?.team2?.code;
    return null;
  };

  return (
    <View style={styles.section}>
      <SectionHeader title="GAME BREAKDOWN" />
      {games.map((game) => {
        const isLive = game.state === "happening";
        const winnerCode = codeFor(game.winner_team_id);
        const fbCode = codeFor(game.first_blood_team_id);
        const t1Won = game.winner_team_id === match?.team1?.id;
        const t2Won = game.winner_team_id === match?.team2?.id;

        return (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameRow, isLive && styles.gameRowLive]}
            onPress={() => navigation.navigate("GameDetail", { gameId: game.id })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View game ${game.game_number} details`}
          >
            <View style={styles.gameNumBox}>
              <Text style={styles.gameNumText}>G{game.game_number}</Text>
            </View>

            <View style={styles.killsRow}>
              <Text style={[styles.killText, t1Won && styles.killTextWinner]}>
                {match?.team1?.code} {game.team1_kill}
              </Text>
              <Text style={styles.killDivider}>—</Text>
              <Text style={[styles.killText, t2Won && styles.killTextWinner]}>
                {game.team2_kill} {match?.team2?.code}
              </Text>
            </View>

            <View style={styles.metaCol}>
              {fbCode ? (
                <View style={styles.fbBadge}>
                  <Ionicons name="water" size={10} color={COLORS.secondary} />
                  <Text style={styles.fbText}>FB {fbCode}</Text>
                </View>
              ) : null}
              {isLive ? (
                <Text style={styles.liveText}>LIVE</Text>
              ) : winnerCode ? (
                <View style={styles.winBadge}>
                  <Ionicons name="trophy" size={10} color={COLORS.success} />
                  <Text style={styles.winText}>{winnerCode}</Text>
                </View>
              ) : (
                <Text style={styles.pendingText}>—</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  gameRowLive: {
    borderColor: COLORS.live,
  },
  gameNumBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: COLORS.backgroundTertiary,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  gameNumText: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  killsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  killText: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  killTextWinner: {
    color: COLORS.success,
  },
  killDivider: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  metaCol: {
    alignItems: "flex-end",
    gap: 4,
    minWidth: 64,
  },
  fbBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.glowSecondary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fbText: {
    color: COLORS.secondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 10,
  },
  winBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.badgeSuccessBg,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  winText: {
    color: COLORS.success,
    fontFamily: "SpaceGroteskBold",
    fontSize: 10,
  },
  liveText: {
    color: COLORS.live,
    fontFamily: "SpaceGroteskBold",
    fontSize: 10,
    letterSpacing: 1,
  },
  pendingText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
});

export default GameBreakdownSection;
