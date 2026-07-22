import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import EmptyState from "../../components/ui/EmptyState";
import { MatchCardSkeleton } from "../../components/ui/Skeleton";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeFriendsStyles } from "../../styles/friends.styles";
import { getFriendHeadToHead } from "../../services/friendService";
import { getStoredUserId } from "../../utils/user";
import { formatDate } from "../../utils/format";
import WrappedModal from "./WrappedModal";

export default function FriendH2HScreen() {
  const route = useRoute();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeFriendsStyles);
  const friend = route.params?.friend;

  const [userId, setUserId] = useState(null);
  const [bets, setBets] = useState([]);
  const [tally, setTally] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wrappedVisible, setWrappedVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [friend?.id])
  );

  const load = async () => {
    setLoadError(false);
    try {
      const uid = await getStoredUserId();
      setUserId(uid);
      if (!uid || !friend?.id) return;
      const data = await getFriendHeadToHead(uid, friend.id);
      setBets(data.bets);
      setTally(data.tally);
    } catch (error) {
      console.log("Failed to load head-to-head:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Which side of the wager is "me" flips per bet depending on who created it.
  const betView = (bet) => {
    const iAmCreator = Number(bet.creator_id) === Number(userId);
    return {
      myTeam: iAmCreator ? bet.creator_team_code : bet.opponent_team_code,
      theirTeam: iAmCreator ? bet.opponent_team_code : bet.creator_team_code,
    };
  };

  const resultTag = (bet) => {
    if (bet.status === "active") return { label: "ONGOING", color: COLORS.upcoming || COLORS.primary };
    if (bet.status === "void") return { label: "VOID", color: COLORS.textMuted };
    return Number(bet.winner_user_id) === Number(userId)
      ? { label: "YOU WON", color: COLORS.success }
      : { label: `${friend.username?.toUpperCase()} WON`, color: COLORS.danger };
  };

  const renderBet = ({ item: bet }) => {
    const { myTeam, theirTeam } = betView(bet);
    const tag = resultTag(bet);
    return (
      <View style={styles.betCard}>
        <View style={styles.betHeader}>
          <Text style={styles.betName} numberOfLines={1}>{bet.name}</Text>
          <Text style={styles.personTag}>{formatDate(bet.match_time)}</Text>
        </View>
        <View style={styles.betTeamsRow}>
          <Ionicons name="person" size={12} color={COLORS.primary} />
          <Text style={styles.betTeamText}>You: {myTeam}</Text>
          <Text style={styles.personTag}>vs</Text>
          <Text style={styles.betTeamText}>{friend.username}: {theirTeam}</Text>
        </View>
        <Text style={styles.personTag}>{bet.league_name}</Text>
        <View style={styles.betMetaRow}>
          <Text style={styles.betStake}>🏆 {bet.stake_label}</Text>
          <Text style={[styles.betResult, { color: tag.color }]}>{tag.label}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreName}>YOU</Text>
          <Text style={styles.scoreValue}>{tally?.myWins ?? 0}</Text>
        </View>
        <Text style={styles.scoreDivider}>—</Text>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreName}>{friend?.username?.toUpperCase()}</Text>
          <Text style={styles.scoreValue}>{tally?.friendWins ?? 0}</Text>
        </View>
      </View>

      {/* AI Wrapped */}
      <TouchableOpacity
        style={styles.wrappedButton}
        onPress={() => setWrappedVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Generate AI wrapped recap"
      >
        <Ionicons name="sparkles" size={16} color={COLORS.primary} />
        <Text style={styles.wrappedButtonText}>AI WRAPPED — YOUR RIVALRY RECAP</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>
        WAGERS ({bets.length}){tally?.active ? ` · ${tally.active} ongoing` : ""}
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </View>
      );
    }
    if (loadError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load your wagers"
          actionLabel="Retry"
          onAction={load}
        />
      );
    }
    return (
      <EmptyState
        icon="trophy-outline"
        message="No wagers yet"
        hint="Open a match and hit CHALLENGE A FRIEND to start the rivalry."
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title={`VS ${friend?.username?.toUpperCase() || "FRIEND"}`} showBack={true} />
      <FlatList
        contentContainerStyle={styles.bodyContent}
        data={isLoading || loadError ? [] : bets}
        keyExtractor={(bet) => String(bet.id)}
        renderItem={renderBet}
        ListHeaderComponent={!isLoading && !loadError ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />

      <WrappedModal
        visible={wrappedVisible}
        userId={userId}
        friend={friend}
        onClose={() => setWrappedVisible(false)}
      />
    </SafeAreaView>
  );
}
