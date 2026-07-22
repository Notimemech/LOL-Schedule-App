import { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContentHeader from "../../components/common/ContentHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeScheduleStyles } from "../../styles/matches.styles";
import { getMatchesPage, getFollowedMatchIds } from "../../services/matchService";
import { getFollowedTeams } from "../../services/teamService";
import { getStoredUserId } from "../../utils/user";
import { isMatchFollowed } from "../../utils/matchPriority";
import { useTabBarScrollHandler } from "../../hooks/useTabBarAutoHide";
import MatchListItem from "../../components/matches/MatchListItem";
import { MatchCardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import TabBarSpacer from "../../components/ui/TabBarSpacer";

// Server-side pagination: each scroll to the end fetches the next PAGE_SIZE
// matches from the API (filters included), so the client never holds more
// than what the user has scrolled through.
const PAGE_SIZE = 10;
// Wait for the user to stop typing before hitting the API.
const SEARCH_DEBOUNCE_MS = 400;

export default function ScheduleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeScheduleStyles);

  const [games, setGames] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL STATUS");
  const [dateFilter, setDateFilter] = useState("ALL DATES");
  const [followedMatchIds, setFollowedMatchIds] = useState([]);
  const [followedTeamIds, setFollowedTeamIds] = useState([]);

  // Modal filters states
  const [modalVisible, setModalVisible] = useState(false);
  const [tempActiveFilter, setTempActiveFilter] = useState("ALL");
  const [tempStatusFilter, setTempStatusFilter] = useState("ALL STATUS");
  const [tempDateFilter, setTempDateFilter] = useState("ALL DATES");

  useEffect(() => {
    if (route.params?.gameFilter) {
      setActiveFilter(route.params.gameFilter);
      setTempActiveFilter(route.params.gameFilter);
    }
    if (route.params?.statusFilter) {
      setStatusFilter(route.params.statusFilter);
      setTempStatusFilter(route.params.statusFilter);
    }
  }, [route.params?.gameFilter, route.params?.statusFilter]);

  // Debounce the search box so each keystroke doesn't hit the API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const FILTERS = ["ALL", "LOL", "DOTA 2"];
  const STATUS_FILTERS = ["ALL STATUS", "UPCOMING", "FINISHED"];

  // Date chips come from the pages loaded so far; each carries a [from, to)
  // ISO range so the server-side day filter respects the local timezone.
  const dateOptions = (() => {
    const seen = new Map();
    games.forEach(game => {
      if (!game.startTime) return;
      const d = new Date(game.startTime);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!seen.has(label)) {
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        seen.set(label, {
          label,
          from: start.toISOString(),
          to: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    });
    return [{ label: "ALL DATES", from: null, to: null }, ...seen.values()];
  })();

  const buildQueryFilters = () => {
    const filters = {};
    if (activeFilter !== "ALL") filters.matchType = activeFilter;
    if (statusFilter === "UPCOMING") filters.state = "upcoming";
    if (statusFilter === "FINISHED") filters.state = "finished";
    if (dateFilter !== "ALL DATES") {
      const option = dateOptions.find((opt) => opt.label === dateFilter);
      if (option?.from) {
        filters.dateFrom = option.from;
        filters.dateTo = option.to;
      }
    }
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    return filters;
  };

  const fetchPage = async ({ reset = false } = {}) => {
    if (reset) setLoadError(false);
    try {
      const offset = reset ? 0 : games.length;
      const { items, total: totalCount } = await getMatchesPage({
        limit: PAGE_SIZE,
        offset,
        ...buildQueryFilters(),
      });
      setTotal(totalCount);
      setGames((prev) => {
        if (reset) return items;
        // Dedupe in case rows shifted between page requests.
        const seen = new Set(prev.map((g) => g.matchId));
        return [...prev, ...items.filter((g) => !seen.has(g.matchId))];
      });
      if (reset) fetchFollowData();
    } catch (error) {
      console.log("Failed to load schedule:", error);
      if (reset) setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // First page — refetched whenever any filter or the search text changes.
  useEffect(() => {
    setIsLoading(true);
    setGames([]);
    userScrolledRef.current = false;
    fetchPage({ reset: true });
  }, [activeFilter, statusFilter, dateFilter, debouncedSearch]);

  const fetchFollowData = async () => {
    // Follow indicators are companion content; failures never break the list.
    try {
      const userId = await getStoredUserId();
      if (!userId) return;
      const [matchIds, teams] = await Promise.all([
        getFollowedMatchIds(userId),
        getFollowedTeams(userId),
      ]);
      setFollowedMatchIds(matchIds);
      setFollowedTeamIds(teams.map((team) => Number(team.id)));
    } catch (error) {
      // keep empty follow lists
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPage({ reset: true });
  }, [activeFilter, statusFilter, dateFilter, debouncedSearch]);

  const hasMore = games.length < total;

  // FlatList can fire onEndReached during initial layout (before any user
  // interaction) — only honor it after a real scroll happened.
  const userScrolledRef = useRef(false);

  const tabBarScroll = useTabBarScrollHandler();

  const handleScroll = (event) => {
    if (event.nativeEvent.contentOffset.y > 0) {
      userScrolledRef.current = true;
    }
    tabBarScroll(event);
  };

  const loadMore = () => {
    if (!userScrolledRef.current) return;
    if (loadingMore || isLoading || loadError || refreshing || !hasMore) return;
    setLoadingMore(true);
    fetchPage();
  };

  const renderListFooter = () => (
    <View>
      {loadingMore && (
        <View style={{ paddingVertical: 16 }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      )}
      <TabBarSpacer />
    </View>
  );

  const renderListEmpty = () => {
    if (isLoading) {
      return (
        <View>
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </View>
      );
    }
    if (loadError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load the schedule"
          hint="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => fetchPage({ reset: true })}
        />
      );
    }
    return (
      <EmptyState
        icon="filter-outline"
        message="No matches found matching these criteria"
        hint="Try changing or resetting the filters."
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="SCHEDULE" />

      {/* Search & Filters Row */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="SEARCH MATCH OR TEAM..."
            placeholderTextColor={COLORS.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search match or team"
          />
          <TouchableOpacity
            style={styles.filtersButton}
            onPress={() => {
              setTempActiveFilter(activeFilter);
              setTempStatusFilter(statusFilter);
              setTempDateFilter(dateFilter);
              setModalVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <Ionicons name="options-outline" size={16} color={COLORS.primary} />
            <Text style={styles.filtersButtonText}>FILTERS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Unified Bottom Sheet Filters Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>FILTERS</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close filters"
                >
                  <Text style={styles.modalCloseText}>CLOSE</Text>
                </TouchableOpacity>
              </View>

              {/* Game Type Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>GAME TYPE</Text>
                <View style={styles.filterChipsRow}>
                  {FILTERS.map(filter => (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterChip, tempActiveFilter === filter && styles.filterChipActive]}
                      onPress={() => setTempActiveFilter(filter)}
                    >
                      <Text style={[styles.filterChipText, tempActiveFilter === filter && styles.filterChipTextActive]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Match Status Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>MATCH STATUS</Text>
                <View style={styles.filterChipsRow}>
                  {STATUS_FILTERS.map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.filterChip, tempStatusFilter === status && styles.filterChipActive]}
                      onPress={() => setTempStatusFilter(status)}
                    >
                      <Text style={[styles.filterChipText, tempStatusFilter === status && styles.filterChipTextActive]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Match Date Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>MATCH DATE</Text>
                <View style={styles.filterChipsRow}>
                  {dateOptions.map(({ label }) => (
                    <TouchableOpacity
                      key={label}
                      style={[styles.filterChip, tempDateFilter === label && styles.filterChipActive]}
                      onPress={() => setTempDateFilter(label)}
                    >
                      <Text style={[styles.filterChipText, tempDateFilter === label && styles.filterChipTextActive]}>
                        {label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setTempActiveFilter("ALL");
                    setTempStatusFilter("ALL STATUS");
                    setTempDateFilter("ALL DATES");
                  }}
                >
                  <Text style={styles.resetButtonText}>RESET</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => {
                    setActiveFilter(tempActiveFilter);
                    setStatusFilter(tempStatusFilter);
                    setDateFilter(tempDateFilter);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <FlatList
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        data={isLoading || loadError ? [] : games}
        keyExtractor={(game) => String(game.matchId)}
        renderItem={({ item }) => (
          <MatchListItem
            game={item}
            isFollowedMatch={isMatchFollowed(item, followedMatchIds)}
            followedTeamIds={followedTeamIds}
          />
        )}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
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
