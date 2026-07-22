import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { getTeamProfile, followTeam, unfollowTeam } from "../../services/teamService";
import { getStoredUserId } from "../../utils/user";
import { formatDate } from "../../utils/format";

export default function TeamScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const slug = route.params?.slug;

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [slug])
  );

  const loadProfile = async () => {
    if (!slug) return;
    setLoadError(false);
    try {
      const uid = await getStoredUserId();
      setUserId(uid);
      const data = await getTeamProfile(slug, uid);
      setProfile(data);
      setIsFollowing(!!data?.isFollowing);
    } catch (error) {
      console.log("Failed to load team profile:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const toggleFollow = async () => {
    if (!userId || !profile?.team?.id || followBusy) return;
    setFollowBusy(true);
    // Optimistic UI, reverted on failure.
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) {
        await followTeam(profile.team.id, userId);
      } else {
        await unfollowTeam(profile.team.id, userId);
      }
    } catch (error) {
      setIsFollowing(!next);
      console.log("Failed to toggle follow:", error);
    } finally {
      setFollowBusy(false);
    }
  };

  // Map a team-profile match row into the shape DetailScreen expects, so
  // tapping a past/upcoming match opens that match's detail page.
  const toMatchParam = (m) => ({
    matchId: m.id,
    leagueName: m.league_name,
    tournamentName: m.tournament_name,
    tournamentId: m.tournament_id,
    startTime: m.scheduled_at,
    state: m.state,
    team1Score: m.team1_score,
    team2Score: m.team2_score,
    team1: {
      id: m.team1_id,
      name: m.team1_name || m.team1_code,
      code: m.team1_code,
      slug: m.team1_slug,
      logoUrl: m.team1_logo,
    },
    team2: {
      id: m.team2_id,
      name: m.team2_name || m.team2_code,
      code: m.team2_code,
      slug: m.team2_slug,
      logoUrl: m.team2_logo,
    },
  });

  const renderMatchRow = ({ item: m }) => {
    const teamId = profile?.team?.id;
    const isFinished = m.state === "finished";
    const won = isFinished && Number(m.winner_team_id) === Number(teamId);
    return (
      <TouchableOpacity
        style={styles.matchRow}
        onPress={() => navigation.push("Detail", { match: toMatchParam(m) })}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`View ${m.team1_code} vs ${m.team2_code} match details`}
      >
        <View style={styles.matchTeams}>
          <Image source={{ uri: m.team1_logo }} style={styles.matchLogo} resizeMode="contain" />
          <Text style={styles.matchCode}>{m.team1_code}</Text>
          <Text style={styles.matchScore}>
            {isFinished ? `${m.team1_score} - ${m.team2_score}` : "vs"}
          </Text>
          <Text style={styles.matchCode}>{m.team2_code}</Text>
          <Image source={{ uri: m.team2_logo }} style={styles.matchLogo} resizeMode="contain" />
        </View>
        <View style={styles.matchMeta}>
          <Text style={styles.matchDate}>{formatDate(m.scheduled_at)}</Text>
          {isFinished ? (
            <Text style={[styles.resultTag, { color: won ? COLORS.success : COLORS.danger }]}>
              {won ? "WIN" : "LOSS"}
            </Text>
          ) : (
            <Text style={[styles.resultTag, { color: COLORS.upcoming }]}>
              {m.state === "happening" ? "LIVE" : "UPCOMING"}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!profile) return null;
    const { team, stats, form, upcomingMatches } = profile;
    return (
      <View>
        {/* TEAM IDENTITY */}
        <View style={styles.identityBox}>
          <Image source={{ uri: team.logo_url }} style={styles.teamLogo} resizeMode="contain" />
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamCode}>{team.code}</Text>

          {userId ? (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={toggleFollow}
              disabled={followBusy}
              accessibilityRole="button"
              accessibilityLabel={isFollowing ? "Unfollow team" : "Follow team"}
            >
              <Ionicons
                name={isFollowing ? "notifications" : "notifications-outline"}
                size={16}
                color={isFollowing ? COLORS.buttonPrimaryText : COLORS.primary}
              />
              <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                {isFollowing ? "FOLLOWING" : "FOLLOW"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* FORM (last 5) */}
        {form.length > 0 && (
          <View style={styles.formRow}>
            <Text style={styles.sectionLabel}>FORM</Text>
            <View style={styles.formChips}>
              {form.map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.formChip,
                    { backgroundColor: r === "W" ? COLORS.badgeSuccessBg : COLORS.badgeDangerBg },
                  ]}
                >
                  <Text style={{
                    color: r === "W" ? COLORS.success : COLORS.danger,
                    fontFamily: "SpaceGroteskBold",
                    fontSize: 12,
                  }}>
                    {r}
                  </Text>
                </View>
              ))}
            </View>
            {stats.streakType && stats.streakCount > 1 && (
              <Text style={[
                styles.streakText,
                { color: stats.streakType === "W" ? COLORS.success : COLORS.danger },
              ]}>
                {stats.streakCount} {stats.streakType === "W" ? "WIN" : "LOSS"} STREAK
              </Text>
            )}
          </View>
        )}

        {/* STATS GRID */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats.winrate != null ? `${stats.winrate}%` : "—"}
            </Text>
            <Text style={styles.statLabel}>WINRATE</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.wins}-{stats.losses}</Text>
            <Text style={styles.statLabel}>W-L</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.avgKills ?? "—"}</Text>
            <Text style={styles.statLabel}>AVG KILLS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.firstBloods}</Text>
            <Text style={styles.statLabel}>FIRST BLOODS</Text>
          </View>
        </View>

        {/* UPCOMING */}
        {upcomingMatches.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>UPCOMING MATCHES</Text>
            {upcomingMatches.map((m) => (
              <View key={m.id}>{renderMatchRow({ item: m })}</View>
            ))}
          </>
        )}

        <Text style={styles.sectionLabel}>RECENT RESULTS</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ gap: 12 }}>
          <Skeleton height={120} radius={8} />
          <Skeleton height={60} radius={8} />
          <Skeleton height={60} radius={8} />
        </View>
      );
    }
    if (loadError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load team profile"
          actionLabel="Retry"
          onAction={loadProfile}
        />
      );
    }
    return (
      <EmptyState
        icon="stats-chart-outline"
        message="No finished matches yet"
        hint="Stats will appear once this team plays."
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title={profile?.team?.code || "TEAM"} showBack={true} />
      <FlatList
        contentContainerStyle={styles.bodyContent}
        data={isLoading || loadError ? [] : profile?.recentMatches || []}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderMatchRow}
        ListHeaderComponent={!isLoading && !loadError ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={<View style={{ height: 40 }} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bodyContent: {
    padding: 16,
  },
  identityBox: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  teamLogo: {
    width: 88,
    height: 88,
    marginBottom: 10,
  },
  teamName: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 22,
    letterSpacing: 1,
  },
  teamCode: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 2,
  },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glowSoft,
  },
  followBtnActive: {
    backgroundColor: COLORS.primary,
  },
  followBtnText: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  followBtnTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 10,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  formChips: {
    flexDirection: "row",
    gap: 6,
  },
  formChip: {
    width: 26,
    height: 26,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  streakText: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
    letterSpacing: 1,
    marginLeft: "auto",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 4,
  },
  matchRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  matchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  matchLogo: {
    width: 22,
    height: 22,
  },
  matchCode: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
  },
  matchScore: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    marginHorizontal: 8,
  },
  matchMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 8,
  },
  matchDate: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 11,
  },
  resultTag: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
    letterSpacing: 1,
  },
});
