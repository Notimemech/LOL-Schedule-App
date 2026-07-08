import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContentHeader from "../../components/common/ContentHeader";
import { scheduleStyles as styles } from "../../styles/matches.styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getMatches } from "../../services/matchService";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";

export default function ScheduleScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const [games, setGames] = useState([]);
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
    try {
      const data = await getMatches();
      setGames(data);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (startDate) => {
    const date = new Date(startDate);
    return date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

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
    // 1. Game Type Filter
    if (activeFilter !== "ALL") {
      if (!game.matchType || game.matchType.toUpperCase() !== activeFilter) return false;
    }

    // 2. Status Filter
    if (statusFilter !== "ALL STATUS") {
      const stateQuery = statusFilter.toLowerCase();
      if (stateQuery === "upcoming" && game.state !== "upcoming") return false;
      if (stateQuery === "finished" && game.state !== "finished") return false;
    }

    // 3. Date Filter
    if (dateFilter !== "ALL DATES") {
      const gameDateFormatted = new Date(game.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (gameDateFormatted !== dateFilter) return false;
    }

    // 4. Search Query Filter
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="SCHEDULE" />
      
      {/* Search & Filters Row */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="SEARCH MATCH OR TEAM..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.filtersButton}
            onPress={() => {
              setTempActiveFilter(activeFilter);
              setTempStatusFilter(statusFilter);
              setTempDateFilter(dateFilter);
              setModalVisible(true);
            }}
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
                <TouchableOpacity onPress={() => setModalVisible(false)}>
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

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <View key={game.matchId} style={styles.matchContainer}>
              <View style={styles.matchHeader}>
                <Text style={styles.leagueText}>{game.leagueName?.toUpperCase()}</Text>
                <Text style={styles.tournamentText}>{game.tournamentName?.toUpperCase()}</Text>
              </View>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{formatDate(game.startTime)}</Text>
              </View>

              <View style={styles.gameCard}>
                <View style={styles.teamCard}>
                  <Image
                    source={{ uri: game.team1.logoUrl }}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamCode}>{game.team1.code}</Text>
                </View>

                {game.state === "finished" ? (
                  <View style={[styles.vsContainer, { borderColor: COLORS.success }]}>
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
                  <Image
                    source={{ uri: game.team2.logoUrl }}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamCode}>{game.team2.code}</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.detailButton,
                  pressed && styles.detailButtonPressed,
                  game.state === "finished" && { borderColor: COLORS.border }
                ]}
                onPress={() => navigation.navigate('Detail', { match: game })}
              >
                <Text style={[styles.detailButtonText, game.state === "finished" && { color: COLORS.textMuted }]}>
                  {game.state === "finished" ? "VIEW RESULTS" : "VIEW MATCH TERMINAL"}
                </Text>
              </Pressable>
            </View>
          ))
        ) : (
          <View style={{ paddingVertical: 50, alignItems: "center" }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 16, fontFamily: "SpaceGrotesk" }}>
              No matches found matching these criteria.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
