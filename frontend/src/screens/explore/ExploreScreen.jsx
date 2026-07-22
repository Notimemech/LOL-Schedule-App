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
import { getExploreTournaments, getExploreTeams } from "../../services/teamService";

// View modes and game-type filters shown as chips.
const VIEW_MODES = [
  { key: "tournaments", label: "TOURNAMENTS", icon: "trophy-outline" },
  { key: "teams", label: "TEAMS", icon: "people-outline" },
];
const GAME_FILTERS = [
  { key: null, label: "ALL" },
  { key: "LOL", label: "LOL" },
  { key: "Dota 2", label: "DOTA 2" },
];

const sameGame = (a, b) => (a || "").toLowerCase() === (b || "").toLowerCase();

export default function ExploreScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeExploreStyles);

  const [viewMode, setViewMode] = useState("tournaments");
  const [gameFilter, setGameFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoadError(false);
    try {
      const [tData, teamData] = await Promise.all([
        getExploreTournaments(),
        getExploreTeams(),
      ]);
      setTournaments(tData);
      setTeams(teamData);
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

  // ===== TOURNAMENTS view: Year -> Tournament -> teams =====
  const buildTournamentSections = () => {
    const visible = [];
    for (const t of tournaments) {
      if (gameFilter && !sameGame(t.game_type, gameFilter)) continue;
      const allTeams = Array.isArray(t.teams) ? t.teams : [];
      const tournamentMatches =
        !query ||
        t.name?.toLowerCase().includes(query) ||
        t.league_name?.toLowerCase().includes(query);
      const matchingTeams = query
        ? allTeams.filter(
            (tm) =>
              tm.name?.toLowerCase().includes(query) ||
              tm.code?.toLowerCase().includes(query)
          )
        : allTeams;

      if (tournamentMatches) visible.push({ ...t, teams: allTeams });
      else if (matchingTeams.length > 0) visible.push({ ...t, teams: matchingTeams });
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

  // ===== TEAMS view: grouped by game type =====
  const buildTeamSections = () => {
    const filtered = teams.filter((t) => {
      if (gameFilter && !sameGame(t.game_type, gameFilter)) return false;
      if (!query) return true;
      return (
        t.name?.toLowerCase().includes(query) || t.code?.toLowerCase().includes(query)
      );
    });
    const byGame = new Map();
    for (const t of filtered) {
      const g = t.game_type || "OTHER";
      if (!byGame.has(g)) byGame.set(g, []);
      byGame.get(g).push(t);
    }
    return Array.from(byGame.entries()).map(([g, data]) => ({
      title: g.toUpperCase(),
      data,
    }));
  };

  // ===== Renderers =====
  const renderTournament = ({ item }) => (
    <View style={styles.tournamentCard}>
      <TouchableOpacity
        style={styles.tournamentHeader}
        onPress={() =>
          navigation.navigate("Standings", { tournamentId: item.id, tournamentName: item.name })
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
            <Text style={styles.rowSubtitle} numberOfLines={1}>
              {item.league_name}{item.game_type ? ` · ${item.game_type}` : ""}
            </Text>
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

  const renderTeamRow = ({ item }) => (
    <TouchableOpacity
      style={styles.teamRow}
      onPress={() => navigation.navigate("Team", { slug: item.slug })}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name} profile`}
    >
      <Image source={{ uri: item.logo_url }} style={styles.teamRowLogo} resizeMode="contain" />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSubtitle}>{item.code}{item.game_type ? ` · ${item.game_type}` : ""}</Text>
      </View>
      <Text style={styles.rowAction}>PROFILE ▸</Text>
    </TouchableOpacity>
  );

  const sectionHeader = ({ section }) => (
    <View style={styles.yearHeader}>
      <Text style={styles.yearText}>{section.title}</Text>
      <View style={styles.yearLine} />
    </View>
  );

  const renderEmpty = (icon, message, hint) => {
    if (isLoading) {
      return (
        <View style={{ gap: 8, paddingTop: 8 }}>
          <Skeleton height={100} radius={6} />
          <Skeleton height={100} radius={6} />
          <Skeleton height={100} radius={6} />
        </View>
      );
    }
    if (loadError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load data"
          hint="Check your connection and try again."
          actionLabel="Retry"
          onAction={loadData}
        />
      );
    }
    return <EmptyState icon={icon} message={message} hint={hint} />;
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={COLORS.primary}
      colors={[COLORS.primary]}
    />
  );

  const renderList = () => {
    const emptyMsg = query ? `No results for "${searchQuery}"` : "Nothing to explore yet";

    if (viewMode === "teams") {
      return (
        <SectionList
          sections={isLoading || loadError ? [] : buildTeamSections()}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTeamRow}
          renderSectionHeader={sectionHeader}
          contentContainerStyle={styles.bodyContent}
          ListEmptyComponent={renderEmpty("people-outline", emptyMsg)}
          ListFooterComponent={<View style={{ height: 110 }} />}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        />
      );
    }

    // tournaments (default)
    return (
      <SectionList
        sections={isLoading || loadError ? [] : buildTournamentSections()}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTournament}
        renderSectionHeader={sectionHeader}
        contentContainerStyle={styles.bodyContent}
        ListEmptyComponent={renderEmpty("search-outline", emptyMsg)}
        ListFooterComponent={<View style={{ height: 110 }} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="EXPLORE" />

      {/* View-mode chips — fixed View row (no ScrollView: stable height) */}
      <View style={styles.chipRow}>
        {VIEW_MODES.map((mode) => {
          const active = viewMode === mode.key;
          return (
            <TouchableOpacity
              key={mode.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setViewMode(mode.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={mode.label}
            >
              <Ionicons
                name={mode.icon}
                size={14}
                color={active ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{mode.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Game-type chips */}
      <View style={styles.chipRow}>
        {GAME_FILTERS.map((g) => {
          const active = gameFilter === g.key;
          return (
            <TouchableOpacity
              key={g.label}
              style={[styles.gameChip, active && styles.gameChipActive]}
              onPress={() => setGameFilter(g.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={g.label}
            >
              <Text style={[styles.gameChipText, active && styles.gameChipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH TOURNAMENT, TEAM OR MATCH..."
          placeholderTextColor={COLORS.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search"
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

      {renderList()}
    </SafeAreaView>
  );
}
