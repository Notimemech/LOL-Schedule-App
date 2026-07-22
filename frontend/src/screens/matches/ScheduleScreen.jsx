import { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContentHeader from "../../components/common/ContentHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeScheduleStyles } from "../../styles/matches.styles";
import { getMatches } from "../../services/matchService";
import MatchListItem from "../../components/matches/MatchListItem";
import { MatchCardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function ScheduleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeScheduleStyles);

  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL STATUS");
  const [dateFilter, setDateFilter] = useState("ALL DATES");

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

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoadError(false);
    try {
      const data = await getMatches();
      setGames(data);
    } catch (error) {
      console.log("Failed to load schedule:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, []);

  const getUniqueMatchDates = () => {
    const dates = new Set();
    games.forEach(game => {
      if (game.startTime) {
        const date = new Date(game.startTime);
        const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dates.add(formatted);
      }
    });
    return ["ALL DATES", ...Array.from(dates)];
  };

  const FILTERS = ["ALL", "LOL", "DOTA 2"];
  const STATUS_FILTERS = ["ALL STATUS", "UPCOMING", "FINISHED"];
  const dateOptions = getUniqueMatchDates();

  const filteredGames = games.filter(game => {
    if (activeFilter !== "ALL") {
      if (!game.matchType || game.matchType.toUpperCase() !== activeFilter) return false;
    }

    if (statusFilter !== "ALL STATUS") {
      const stateQuery = statusFilter.toLowerCase();
      if (stateQuery === "upcoming" && game.state !== "upcoming") return false;
      if (stateQuery === "finished" && game.state !== "finished") return false;
    }

    if (dateFilter !== "ALL DATES") {
      const gameDateFormatted = new Date(game.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (gameDateFormatted !== dateFilter) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        game.team1.name?.toLowerCase().includes(query) ||
        game.team1.code?.toLowerCase().includes(query) ||
        game.team2.name?.toLowerCase().includes(query) ||
        game.team2.code?.toLowerCase().includes(query) ||
        game.leagueName?.toLowerCase().includes(query) ||
        game.tournamentName?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });

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
          onAction={fetchSchedule}
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
                  {dateOptions.map(date => (
                    <TouchableOpacity
                      key={date}
                      style={[styles.filterChip, tempDateFilter === date && styles.filterChipActive]}
                      onPress={() => setTempDateFilter(date)}
                    >
                      <Text style={[styles.filterChipText, tempDateFilter === date && styles.filterChipTextActive]}>
                        {date.toUpperCase()}
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
        data={isLoading || loadError ? [] : filteredGames}
        keyExtractor={(game) => String(game.matchId)}
        renderItem={({ item }) => <MatchListItem game={item} />}
        ListEmptyComponent={renderListEmpty}
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
