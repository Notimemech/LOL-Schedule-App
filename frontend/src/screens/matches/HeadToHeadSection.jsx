import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { formatDate } from "../../utils/format";
import SectionHeader from "../../components/ui/SectionHeader";

/**
 * Companion Hub: head-to-head record between the two teams of a match.
 * Data shape from GET /teams/h2h/:team1Id/:team2Id:
 * { totalMeetings, team1Wins, team2Wins, recentMeetings: [...] }
 */
const HeadToHeadSection = ({ h2h, match }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (!h2h || h2h.totalMeetings === 0) return null;

  const t1 = match?.team1;
  const t2 = match?.team2;
  const total = h2h.team1Wins + h2h.team2Wins;
  const t1Ratio = total > 0 ? h2h.team1Wins / total : 0.5;

  return (
    <View style={styles.section}>
      <SectionHeader title="HEAD TO HEAD" />

      <View style={styles.card}>
        <View style={styles.scoreRow}>
          <Text style={[styles.winCount, { color: COLORS.primary }]}>{h2h.team1Wins}</Text>
          <Text style={styles.meetingsText}>{h2h.totalMeetings} MEETINGS</Text>
          <Text style={[styles.winCount, { color: COLORS.secondary }]}>{h2h.team2Wins}</Text>
        </View>

        {/* Win ratio bar */}
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { flex: t1Ratio, backgroundColor: COLORS.primary }]} />
          <View style={[styles.barFill, { flex: 1 - t1Ratio, backgroundColor: COLORS.secondary }]} />
        </View>
        <View style={styles.codesRow}>
          <Text style={[styles.codeText, { color: COLORS.primary }]}>{t1?.code}</Text>
          <Text style={[styles.codeText, { color: COLORS.secondary }]}>{t2?.code}</Text>
        </View>

        {/* Recent meetings */}
        {h2h.recentMeetings?.length > 0 && (
          <View style={styles.meetingsList}>
            {h2h.recentMeetings.map((m) => {
              const t1IsHome = m.team1_id === t1?.id;
              const leftScore = t1IsHome ? m.team1_score : m.team2_score;
              const rightScore = t1IsHome ? m.team2_score : m.team1_score;
              const t1WonThis = m.winner_team_id === t1?.id;
              return (
                <View key={m.id} style={styles.meetingRow}>
                  <Text style={styles.meetingDate}>{formatDate(m.scheduled_at)}</Text>
                  <Text style={styles.meetingTournament} numberOfLines={1}>
                    {m.tournament_name}
                  </Text>
                  <Text
                    style={[
                      styles.meetingScore,
                      { color: t1WonThis ? COLORS.primary : COLORS.secondary },
                    ]}
                  >
                    {leftScore} - {rightScore}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const makeStyles = (COLORS) => StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 16,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  winCount: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 28,
  },
  meetingsText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  barTrack: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: COLORS.backgroundTertiary,
    marginBottom: 6,
  },
  barFill: {
    height: "100%",
  },
  codesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  codeText: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1,
  },
  meetingsList: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 10,
    gap: 8,
  },
  meetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  meetingDate: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 11,
    width: 88,
  },
  meetingTournament: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: "SpaceGrotesk",
    fontSize: 11,
  },
  meetingScore: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
  },
});

export default HeadToHeadSection;
