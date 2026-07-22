import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SectionList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeExploreStyles } from "../../styles/explore.styles";
import { getExploreTournaments } from "../../services/teamService";

// Explore is grouped Year -> Tournament -> participating teams.
export default function ExploreScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeExploreStyles);

  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoadError(false);
    try {
      const data = await getExploreTournaments();
      setTournaments(data);
    } catch (error) {
      console.log("Failed to load explore data:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const query = searchQuery.toLowerCase().trim();

  // A tournament stays visible when its own name/league matches, or when at
  // least one of its teams matches (then only matching teams are shown).
  const buildSections = () => {
    const visible = [];
    for (const t of tournaments) {
      const teams = Array.isArray(t.teams) ? t.teams : [];
      const tournamentMatches =
        !query ||
        t.name?.toLowerCase().includes(query) ||
        t.league_name?.toLowerCase().includes(query);

      const matchingTeams = query
        ? teams.filter(
            (tm) =>
              tm.name?.toLowerCase().includes(query) ||
              tm.code?.toLowerCase().includes(query)
          )
        : teams;

      if (tournamentMatches) {
        visible.push({ ...t, teams });
      } else if (matchingTeams.length > 0) {
        visible.push({ ...t, teams: matchingTeams });
      }
    }

    const byYear = new Map();
    for (const t of visible) {
      const year = t.start_date ? String(new Date(t.start_date).getFullYear()) : "OTHER";
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year).push(t);
    }

    return Array.from(byYear.entries())
      .sort((a, b) => (b[0] === "OTHER" ? -1 : b[0].localeCompare(a[0])))
      .map(([year, data]) => ({ title: year, data }));
  };

  const sections = isLoading || loadError ? [] : buildSections();

  const renderTournament = ({ item }) => (
    <View style={styles.tournamentCard}>
      <TouchableOpacity
        style={styles.tournamentHeader}
        onPress={() =>
          navigation.navigate("Standings", {
            tournamentId: item.id,
            tournamentName: item.name,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name} standings`}
      >
        <View style={styles.tournamentIcon}>
          <Ionicons name="trophy-outline" size={18} color={COLORS.accent} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
          {item.league_name ? (
            <Text style={styles.rowSubtitle} numberOfLines={1}>{item.league_name}</Text>
          ) : null}
        </View>
        <Text style={styles.rowAction}>STANDINGS ▸</Text>
      </TouchableOpacity>

      {item.teams.length > 0 ? (
        <View style={styles.teamsWrap}>
          {item.teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={styles.teamChip}
              onPress={() => navigation.navigate("Team", { slug: team.slug })}
              accessibilityRole="button"
              accessibilityLabel={`View ${team.name} profile`}
            >
              <Image source={{ uri: team.logo_url }} style={styles.teamChipLogo} resizeMode="contain" />
              <Text style={styles.teamChipCode}>{team.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.noTeamsText}>No teams scheduled yet.</Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ gap: 8, paddingTop: 8 }}>
          <Skeleton height={110} radius={6} />
          <Skeleton height={110} radius={6} />
          <Skeleton height={110} radius={6} />
        </View>
      );
    }
    if (loadError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load tournaments"
          hint="Check your connection and try again."
          actionLabel="Retry"
          onAction={loadData}
        />
      );
    }
    return (
      <EmptyState
        icon="search-outline"
        message={query ? `No results for "${searchQuery}"` : "Nothing to explore yet"}
        hint={query ? "Try a different team or tournament name." : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="EXPLORE" />

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH TOURNAMENT OR TEAM..."
          placeholderTextColor={COLORS.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search tournament or team"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTournament}
        renderSectionHeader={({ section }) => (
          <View style={styles.yearHeader}>
            <Text style={styles.yearText}>{section.title}</Text>
            <View style={styles.yearLine} />
          </View>
        )}
        contentContainerStyle={styles.bodyContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={<View style={{ height: 110 }} />}
        stickySectionHeadersEnabled={false}
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
