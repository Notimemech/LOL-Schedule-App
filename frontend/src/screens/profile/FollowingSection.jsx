import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeProfileStyles } from "../../styles/profile.styles";
import { getFollowedTeams } from "../../services/teamService";
import { getMatches, getFollowedMatchIds } from "../../services/matchService";
import { getStoredUserId } from "../../utils/user";
import { isMatchFollowed } from "../../utils/matchPriority";
import { formatDate } from "../../utils/format";

/**
 * Profile sub-section (Companion Hub): the teams and matches the user follows.
 * Teams open their profile; matches open the match detail terminal.
 */
const FollowingSection = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const style = useThemedStyles(makeProfileStyles);

  const [followedTeams, setFollowedTeams] = useState([]);
  const [followedMatches, setFollowedMatches] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadFollows();
    }, [])
  );

  const loadFollows = async () => {
    // Companion content — fails silently so the profile never breaks.
    try {
      const userId = await getStoredUserId();
      if (!userId) return;
      const [teams, matchIds, allMatches] = await Promise.all([
        getFollowedTeams(userId),
        getFollowedMatchIds(userId),
        getMatches(),
      ]);
      setFollowedTeams(teams);
      setFollowedMatches(allMatches.filter((game) => isMatchFollowed(game, matchIds)));
    } catch (error) {
      // keep previous lists
    }
  };

  const stateTag = (game) => {
    if (game.state === "finished") {
      return { label: `${game.team1Score} - ${game.team2Score}`, color: COLORS.success };
    }
    if (game.state === "happening") {
      return { label: "LIVE", color: COLORS.danger };
    }
    return { label: "UPCOMING", color: COLORS.primary };
  };

  return (
    <View style={style.sectionCard}>
      <Text style={style.sectionTitle}>Following</Text>

      <Text style={style.followSubLabel}>Teams</Text>
      {followedTeams.length === 0 ? (
        <Text style={style.followEmptyText}>You are not following any teams yet.</Text>
      ) : (
        <FlatList
          data={followedTeams}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(team) => String(team.id)}
          contentContainerStyle={style.followedTeamsRow}
          renderItem={({ item: team }) => (
            <TouchableOpacity
              style={style.followedTeamChip}
              onPress={() => navigation.navigate("Team", { slug: team.slug })}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${team.name} profile`}
            >
              <Image source={{ uri: team.logo_url }} style={style.followedTeamLogo} resizeMode="contain" />
              <Text style={style.followedTeamCode}>{team.code}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={style.followSubLabel}>Matches</Text>
      {followedMatches.length === 0 ? (
        <Text style={style.followEmptyText}>You are not following any matches yet.</Text>
      ) : (
        followedMatches.map((game) => {
          const tag = stateTag(game);
          return (
            <TouchableOpacity
              key={game.matchId}
              style={style.followedMatchRow}
              onPress={() => navigation.navigate("Detail", { match: game })}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${game.team1.code} vs ${game.team2.code} match details`}
            >
              <View>
                <Text style={style.followedMatchTitle}>
                  {game.team1.code} vs {game.team2.code}
                </Text>
                <Text style={style.followedMatchMeta}>
                  {game.leagueName} · {formatDate(game.startTime)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[style.followedMatchState, { color: tag.color }]}>{tag.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

export default FollowingSection;
