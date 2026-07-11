import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import HomeHeader from "../../components/common/HomeHeader";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import HomeBanner from "./HomeBanner";
import { homeStyles as style } from "../../styles/home.styles";
import { getMatches } from "../../services/matchService";

const { width } = Dimensions.get("window");

// Module-level state to persist "Don't show again" option across mounts during active session
let hidePromoModalGlobal = false;

export default function HomeScreen() {
  const navigation = useNavigation();
  const [allGames, setAllGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom states
  const [matchTab, setMatchTab] = useState("UPCOMING");
  const [activeSlide, setActiveSlide] = useState(0);

  // Popup Modal states
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [dontShowAgainChecked, setDontShowAgainChecked] = useState(false);

  const carouselItems = [
    {
      id: "esport1",
      bannerInfo: "LCK REGULAR SEASON",
      buttonInfo: "BET NOW",
      image: require("../../../assets/lol_background.jpg"),
      onPress: () => navigation.navigate("ScheduleStack", { screen: "Schedule", params: { gameFilter: "LOL" } }),
    },
    {
      id: "esport2",
      bannerInfo: "THE INTERNATIONAL",
      buttonInfo: "VIEW ODDS",
      image: require("../../../assets/dota_2_background.jpg"),
      onPress: () => navigation.navigate("ScheduleStack", { screen: "Schedule", params: { gameFilter: "DOTA 2" } }),
    },
  ];

  // Trigger whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const fetchMatches = async () => {
    try {
      const data = await getMatches();
      setAllGames(data);
      // Show promotions popup modal if not disabled in current session
      if (!hidePromoModalGlobal) {
        setPromoModalVisible(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveSlide(Math.round(index));
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  const getFilteredMatches = () => {
    const tabQuery = matchTab.toLowerCase();
    if (tabQuery === "live") {
      return allGames.filter(g => g.state === "happening");
    } else if (tabQuery === "upcoming") {
      return allGames.filter(g => g.state === "upcoming");
    } else if (tabQuery === "finished") {
      return allGames.filter(g => g.state === "finished");
    }
    return [];
  };

  // Filter games based on search query
  const filteredSearchMatches = allGames.filter(game => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase().trim();
    return (
      game.team1.name?.toLowerCase().includes(query) ||
      game.team1.code?.toLowerCase().includes(query) ||
      game.team2.name?.toLowerCase().includes(query) ||
      game.team2.code?.toLowerCase().includes(query) ||
      game.leagueName?.toLowerCase().includes(query) ||
      game.tournamentName?.toLowerCase().includes(query)
    );
  });

  const renderCarouselItem = ({ item }) => (
    <View style={{ width: width - 40, marginHorizontal: 20 }}>
      <HomeBanner
        bannerInfo={item.bannerInfo}
        buttonInfo={item.buttonInfo}
        image={item.image}
        onPress={item.onPress}
      />
    </View>
  );

  return (
    <SafeAreaView style={style.container} edges={["top"]}>
      <HomeHeader searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* EXCITING PROMOTIONS POPUP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={promoModalVisible}
        onRequestClose={() => setPromoModalVisible(false)}
      >
        <View style={style.promoModalOverlay}>
          <View style={style.promoModalContent}>
            
            {/* Exciting Quote Box */}
            <View style={[style.promoQuoteBox, { marginBottom: 12 }]}>
              <Text style={style.promoQuoteText}>
                🔥 HOT PROMO: 92% of VIPs predicted T1's victory! Deposit now to unlock exclusive 2026 VCS Odds!
              </Text>
            </View>

            {/* Promotions Card */}
            <View style={[style.promoCard, { marginVertical: 0 }]}>
              <View style={style.promoBadge}>
                <Text style={style.promoBadgeText}>LIMITED OFFER</Text>
              </View>
              <Text style={[style.promoTitle, { fontSize: 18, lineHeight: 22, marginBottom: 4 }]}>DOUBLE YOUR DEPOSIT!</Text>
              <Text style={[style.promoSubtitle, { fontSize: 12, marginBottom: 12 }]}>
                Get +100% bonus on your first top-up up to 2.000.000đ!
              </Text>

              {/* Hot match info visualization */}
              <View style={[style.promoResultRow, { padding: 10, marginBottom: 12 }]}>
                <View style={style.promoResultCol}>
                  <Text style={style.promoResultLabel}>RECENT HOT WIN</Text>
                  <Text style={[style.promoResultVal, { fontSize: 11 }]}>T1 vs GEN (3 - 2)</Text>
                </View>
                <View style={style.promoResultCol}>
                  <Text style={style.promoResultLabel}>TOTAL POOL</Text>
                  <Text style={[style.promoResultVal, { fontSize: 11 }]}>100.000đ</Text>
                </View>
                <View style={style.promoResultCol}>
                  <Text style={style.promoResultLabel}>WINNING ODDS</Text>
                  <Text style={[style.promoResultWin, { fontSize: 11 }]}>T1 (1.65x)</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[style.promoButton, { paddingVertical: 12 }]}
                onPress={() => {
                  setPromoModalVisible(false);
                  if (dontShowAgainChecked) {
                    hidePromoModalGlobal = true;
                  }
                  navigation.navigate("Deposit");
                }}
                activeOpacity={0.8}
              >
                <Text style={[style.promoButtonText, { fontSize: 14 }]}>CLAIM 100% BONUS NOW</Text>
              </TouchableOpacity>
            </View>

            {/* Footer with Don't Show Again & Close */}
            <View style={style.promoModalFooter}>
              <TouchableOpacity 
                style={style.promoModalOption}
                onPress={() => setDontShowAgainChecked(!dontShowAgainChecked)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={dontShowAgainChecked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={dontShowAgainChecked ? COLORS.primary : COLORS.textMuted} 
                />
                <Text style={style.promoModalOptionText}>Don't show again</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={style.promoModalCloseBtn}
                onPress={() => {
                  setPromoModalVisible(false);
                  if (dontShowAgainChecked) {
                    hidePromoModalGlobal = true;
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={16} color={COLORS.textMuted} />
                <Text style={style.promoModalCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      <View style={style.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {searchQuery ? (
            /* SEARCH RESULTS */
            <View style={style.bannerList}>
              {filteredSearchMatches.length > 0 ? (
                filteredSearchMatches.map(game => (
                  <View key={game.matchId} style={style.featureCard}>
                    <View style={style.featureHeader}>
                      <Text style={style.featureLeague}>{game.leagueName?.toUpperCase()}</Text>
                      {game.state === "happening" ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={[style.featureTime, { color: COLORS.danger, fontFamily: "SpaceGroteskBold" }]}>Live now</Text>
                          <Ionicons name="radio-button-on" size={14} color={COLORS.danger} />
                        </View>
                      ) : (
                        <Text style={style.featureTime}>{formatDate(game.startTime)}</Text>
                      )}
                    </View>
                    <View style={style.featureTeamsRow}>
                      <View style={style.featureTeam}>
                        <Image source={{ uri: game.team1.logoUrl }} style={style.featureLogo} resizeMode="contain" />
                        <Text style={style.featureCode}>{game.team1.code}</Text>
                      </View>
                      
                      {game.state === "finished" ? (
                        <Text style={[style.featureVs, { color: COLORS.success }]}>
                          {game.team1Score} - {game.team2Score}
                        </Text>
                      ) : (
                        <Text style={style.featureVs}>VS</Text>
                      )}

                      <View style={[style.featureTeam, { justifyContent: 'flex-end' }]}>
                        <Text style={style.featureCode}>{game.team2.code}</Text>
                        <Image source={{ uri: game.team2.logoUrl }} style={style.featureLogo} resizeMode="contain" />
                      </View>
                    </View>
                    
                    {/* Compact Odds Buttons Row */}
                    {game.state !== "finished" ? (
                      <View style={style.oddsRow}>
                        <TouchableOpacity 
                          style={style.oddBoxCompact} 
                          onPress={() => navigation.navigate("Detail", { match: game })}
                        >
                          <Text style={style.oddBoxLabel}>{game.team1.code}</Text>
                          <Text style={style.oddBoxValue}>x{(1.35 + (game.matchId % 3) * 0.25).toFixed(2)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={style.oddBoxCompact} 
                          onPress={() => navigation.navigate("Detail", { match: game })}
                        >
                          <Text style={style.oddBoxLabel}>{game.team2.code}</Text>
                          <Text style={style.oddBoxValue}>x{(2.10 - (game.matchId % 3) * 0.15).toFixed(2)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={style.oddDetailBtn} 
                          onPress={() => navigation.navigate("Detail", { match: game })}
                        >
                          <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[style.featureBetButton, { borderColor: COLORS.border }]}
                        onPress={() => navigation.navigate("Detail", { match: game })}
                      >
                        <Text style={[style.featureBetText, { color: COLORS.textMuted }]}>VIEW RESULTS</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 16, fontFamily: "SpaceGrotesk" }}>
                    No matches found for "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* DEFAULT HOME CONTENT */
            <>
              {/* TOP CAROUSEL BANNER */}
              <View style={style.carouselContainer}>
                <FlatList
                  data={carouselItems}
                  renderItem={renderCarouselItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  snapToAlignment="center"
                  decelerationRate="fast"
                />
              </View>
              <View style={style.carouselDotContainer}>
                {carouselItems.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      style.carouselDot,
                      activeSlide === index && style.carouselDotActive,
                    ]}
                  />
                ))}
              </View>

              {/* CHOOSE YOUR SPORT (Esports Shortcuts) */}
              <Text style={style.chooseSportTitle}>Choose your sport</Text>
              <View style={style.esportsContainer}>
                <TouchableOpacity 
                  style={style.esportShortcut}
                  onPress={() => navigation.navigate("ScheduleStack", { screen: "Schedule", params: { gameFilter: "LOL" } })}
                >
                  <Ionicons name="game-controller-outline" style={style.esportIcon} />
                  <Text style={style.esportText}>LOL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={style.esportShortcut}
                  onPress={() => navigation.navigate("ScheduleStack", { screen: "Schedule", params: { gameFilter: "DOTA 2" } })}
                >
                  <Ionicons name="flame-outline" style={style.esportIcon} />
                  <Text style={style.esportText}>DOTA 2</Text>
                </TouchableOpacity>
              </View>

              {/* POPULAR MATCHES SECTION HEADER */}
              <Text style={style.chooseSportTitle}>Popular matches</Text>

              {/* MATCH STATUS TAB SELECTORS */}
              <View style={style.tabRow}>
                <TouchableOpacity
                  style={[style.tabButton, matchTab === "LIVE" && style.tabButtonActive]}
                  onPress={() => setMatchTab("LIVE")}
                >
                  <Text style={[style.tabText, matchTab === "LIVE" && style.tabTextActive]}>LIVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[style.tabButton, matchTab === "UPCOMING" && style.tabButtonActive]}
                  onPress={() => setMatchTab("UPCOMING")}
                >
                  <Text style={[style.tabText, matchTab === "UPCOMING" && style.tabTextActive]}>UPCOMING</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[style.tabButton, matchTab === "FINISHED" && style.tabButtonActive]}
                  onPress={() => setMatchTab("FINISHED")}
                >
                  <Text style={[style.tabText, matchTab === "FINISHED" && style.tabTextActive]}>FINISHED</Text>
                </TouchableOpacity>
              </View>

              {/* MATCHES LISTING SECTION */}
              <View style={style.bannerList}>
                {getFilteredMatches().length > 0 ? (
                  getFilteredMatches().map(game => (
                    <View key={game.matchId} style={style.featureCard}>
                      <View style={style.featureHeader}>
                        <Text style={style.featureLeague}>{game.leagueName?.toUpperCase()}</Text>
                        {game.state === "happening" ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={[style.featureTime, { color: COLORS.danger, fontFamily: "SpaceGroteskBold" }]}>Live now</Text>
                            <Ionicons name="radio-button-on" size={14} color={COLORS.danger} />
                          </View>
                        ) : (
                          <Text style={style.featureTime}>{formatDate(game.startTime)}</Text>
                        )}
                      </View>
                      <View style={style.featureTeamsRow}>
                        <View style={style.featureTeam}>
                          <Image source={{ uri: game.team1.logoUrl }} style={style.featureLogo} resizeMode="contain" />
                          <Text style={style.featureCode}>{game.team1.code}</Text>
                        </View>
                        
                        {game.state === "finished" ? (
                          <Text style={[style.featureVs, { color: COLORS.success }]}>
                            {game.team1Score} - {game.team2Score}
                          </Text>
                        ) : (
                          <Text style={style.featureVs}>VS</Text>
                        )}

                        <View style={[style.featureTeam, { justifyContent: 'flex-end' }]}>
                          <Text style={style.featureCode}>{game.team2.code}</Text>
                          <Image source={{ uri: game.team2.logoUrl }} style={style.featureLogo} resizeMode="contain" />
                        </View>
                      </View>

                      {/* Compact Odds Buttons Row */}
                      {game.state !== "finished" ? (
                        <View style={style.oddsRow}>
                          <TouchableOpacity 
                            style={style.oddBoxCompact} 
                            onPress={() => navigation.navigate("Detail", { match: game })}
                          >
                            <Text style={style.oddBoxLabel}>{game.team1.code}</Text>
                            <Text style={style.oddBoxValue}>x{(1.35 + (game.matchId % 3) * 0.25).toFixed(2)}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={style.oddBoxCompact} 
                            onPress={() => navigation.navigate("Detail", { match: game })}
                          >
                            <Text style={style.oddBoxLabel}>{game.team2.code}</Text>
                            <Text style={style.oddBoxValue}>x{(2.10 - (game.matchId % 3) * 0.15).toFixed(2)}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={style.oddDetailBtn} 
                            onPress={() => navigation.navigate("Detail", { match: game })}
                          >
                            <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          style={[style.featureBetButton, { borderColor: COLORS.border }]}
                          onPress={() => navigation.navigate("Detail", { match: game })}
                        >
                          <Text style={[style.featureBetText, { color: COLORS.textMuted }]}>VIEW RESULTS</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={{ paddingVertical: 30, alignItems: "center" }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 14, fontFamily: "SpaceGrotesk" }}>
                      No matches available in this category.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
