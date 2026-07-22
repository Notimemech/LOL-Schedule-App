import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import HomeHeader from "../../components/common/HomeHeader";
import HomeBanner from "./HomeBanner";
import MatchCard from "../../components/home/MatchCard";
import { MatchCardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeHomeStyles } from "../../styles/home.styles";
import { getMatches } from "../../services/matchService";
import { getActivePromotion, getAllPromotions } from "../../services/promotionService";
import { getFollowedTeams } from "../../services/teamService";
import { getStoredUserId } from "../../utils/user";

const { width } = Dimensions.get("window");

const HIDE_PROMO_KEY = "hidePromoPopup";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const style = useThemedStyles(makeHomeStyles);

  const [allGames, setAllGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [followedTeams, setFollowedTeams] = useState([]);

  const [matchTab, setMatchTab] = useState("UPCOMING");
  const [activeSlide, setActiveSlide] = useState(0);

  // Promotions popup
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [dontShowAgainChecked, setDontShowAgainChecked] = useState(false);
  const [activePromo, setActivePromo] = useState(null);

  const staticCarouselItems = [
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

  const [carouselData, setCarouselData] = useState(staticCarouselItems);
  const flatListRef = useRef(null);

  // Auto-play carousel
  useEffect(() => {
    let intervalId;
    if (carouselData && carouselData.length > 0) {
      intervalId = setInterval(() => {
        setActiveSlide((prev) => {
          const nextIndex = (prev + 1) % carouselData.length;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, 3500);
    }
    return () => clearInterval(intervalId);
  }, [carouselData]);

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const fetchPromotions = async (userId) => {
    // Promotions are additive content — their failure must never hide matches.
    try {
      const hidePromo = (await AsyncStorage.getItem(HIDE_PROMO_KEY)) === "1";

      const promoResp = await getActivePromotion(userId);
      if (promoResp && promoResp.success && promoResp.data && !promoResp.data.is_used) {
        setActivePromo(promoResp.data);
        if (!hidePromo) {
          setPromoModalVisible(true);
        }
      }

      const allPromosResp = await getAllPromotions(userId);
      if (allPromosResp && allPromosResp.success && allPromosResp.data) {
        const promoItems = allPromosResp.data
          .filter(p => !p.is_used)
          .map((p, index) => ({
            id: `promo_${p.id}`,
            bannerInfo: p.title,
            buttonInfo: p.button_text,
            image: require("../../../assets/lol_background.jpg"),
            isPromo: true,
            promoIndex: index,
            onPress: () => navigation.navigate(p.button_link === "Deposit" ? "WalletScreen" : (p.button_link || "WalletScreen"), { promotion: p }),
          }));
        setCarouselData([...staticCarouselItems, ...promoItems]);
      }
    } catch (error) {
      console.log("Failed to load promotions:", error);
    }
  };

  const fetchFollowedTeams = async (userId) => {
    if (!userId) return;
    try {
      const teams = await getFollowedTeams(userId);
      setFollowedTeams(teams);
    } catch (error) {
      // Follow list is optional companion content; ignore failures.
      setFollowedTeams([]);
    }
  };

  const fetchMatches = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(allGames.length === 0);
    setLoadError(false);
    try {
      const data = await getMatches();
      setAllGames(data);

      const userId = await getStoredUserId();
      fetchPromotions(userId);
      fetchFollowedTeams(userId);
    } catch (error) {
      console.log("Failed to load matches:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches(true);
  };

  const dismissPromoModal = async () => {
    setPromoModalVisible(false);
    if (dontShowAgainChecked) {
      try {
        await AsyncStorage.setItem(HIDE_PROMO_KEY, "1");
      } catch (e) {
        // Non-critical; popup will just reappear next session.
      }
    }
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveSlide(Math.round(index));
  };

  const getFilteredMatches = () => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      return allGames.filter(game =>
        game.team1.name?.toLowerCase().includes(query) ||
        game.team1.code?.toLowerCase().includes(query) ||
        game.team2.name?.toLowerCase().includes(query) ||
        game.team2.code?.toLowerCase().includes(query) ||
        game.leagueName?.toLowerCase().includes(query) ||
        game.tournamentName?.toLowerCase().includes(query)
      );
    }
    const tabQuery = matchTab.toLowerCase();
    if (tabQuery === "live") return allGames.filter(g => g.state === "happening");
    if (tabQuery === "upcoming") return allGames.filter(g => g.state === "upcoming");
    if (tabQuery === "finished") return allGames.filter(g => g.state === "finished");
    return [];
  };

  const renderCarouselItem = ({ item }) => (
    <View style={{ width: width - 40, marginHorizontal: 20 }}>
      <HomeBanner
        bannerInfo={item.bannerInfo}
        buttonInfo={item.buttonInfo}
        image={item.image}
        onPress={item.onPress}
        isPromo={item.isPromo}
        promoIndex={item.promoIndex}
      />
    </View>
  );

  const renderListHeader = () => {
    if (searchQuery) return null;
    return (
      <>
        {/* TOP CAROUSEL BANNER */}
        <View style={style.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={carouselData}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToAlignment="center"
            decelerationRate="fast"
          />
        </View>
        <View style={style.carouselDotContainer}>
          {carouselData.map((_, index) => (
            <View
              key={index}
              style={[
                style.carouselDot,
                activeSlide === index && style.carouselDotActive,
              ]}
            />
          ))}
        </View>

        {/* FOLLOWED TEAMS (Companion Hub) */}
        {followedTeams.length > 0 && (
          <>
            <Text style={style.chooseSportTitle}>Your teams</Text>
            <FlatList
              data={followedTeams}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(team) => String(team.id)}
              contentContainerStyle={style.followedRow}
              renderItem={({ item: team }) => (
                <TouchableOpacity
                  style={style.followedChip}
                  onPress={() => navigation.navigate("Team", { slug: team.slug })}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${team.name} profile`}
                >
                  <Image source={{ uri: team.logo_url }} style={style.followedLogo} resizeMode="contain" />
                  <Text style={style.followedCode}>{team.code}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* CHOOSE YOUR SPORT */}
        <Text style={style.chooseSportTitle}>Choose your sport</Text>
        <View style={style.esportsContainer}>
          <TouchableOpacity
            style={style.esportShortcut}
            onPress={() => navigation.navigate("ScheduleStack", { screen: "Schedule", params: { gameFilter: "LOL" } })}
            accessibilityRole="button"
            accessibilityLabel="Browse League of Legends matches"
          >
            <Ionicons name="game-controller-outline" style={style.esportIcon} />
            <Text style={style.esportText}>LOL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={style.esportShortcut}
            onPress={() => navigation.navigate("ScheduleStack", { screen: "Schedule", params: { gameFilter: "DOTA 2" } })}
            accessibilityRole="button"
            accessibilityLabel="Browse Dota 2 matches"
          >
            <Ionicons name="flame-outline" style={style.esportIcon} />
            <Text style={style.esportText}>DOTA 2</Text>
          </TouchableOpacity>
        </View>

        {/* POPULAR MATCHES + TABS */}
        <Text style={style.chooseSportTitle}>Popular matches</Text>
        <View style={style.tabRow}>
          {["LIVE", "UPCOMING", "FINISHED"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[style.tabButton, matchTab === tab && style.tabButtonActive]}
              onPress={() => setMatchTab(tab)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${tab.toLowerCase()} matches`}
            >
              <Text style={[style.tabText, matchTab === tab && style.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  const renderListEmpty = () => {
    if (isLoading) {
      return (
        <View style={style.bannerList}>
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
          message="Could not load matches"
          hint="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => fetchMatches()}
        />
      );
    }
    if (searchQuery) {
      return (
        <EmptyState
          icon="search-outline"
          message={`No matches found for "${searchQuery}"`}
        />
      );
    }
    return (
      <EmptyState
        icon="calendar-clear-outline"
        message="No matches in this category"
        hint="Try another tab or pull to refresh."
      />
    );
  };

  return (
    <SafeAreaView style={style.container} edges={["top"]}>
      <HomeHeader searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* PROMOTIONS POPUP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={promoModalVisible && activePromo !== null}
        onRequestClose={dismissPromoModal}
      >
        {activePromo && (
        <View style={style.promoModalOverlay}>
          <View style={style.promoModalContent}>

            <View style={[style.promoQuoteBox, { marginBottom: 12 }]}>
              <Text style={style.promoQuoteText}>
                {activePromo.quote_text}
              </Text>
            </View>

            <View style={[style.promoCard, { marginVertical: 0 }]}>
              <View style={style.promoTitleRow}>
                <Text style={[style.promoTitle, { fontSize: 18, lineHeight: 22, marginBottom: 0, flex: 1 }]}>
                  {activePromo.title}
                </Text>
                <View style={[style.promoBadge, { position: 'relative', top: 0, right: 0 }]}>
                  <Text style={style.promoBadgeText}>{activePromo.badge_text}</Text>
                </View>
              </View>
              <Text style={[style.promoSubtitle, { fontSize: 12, marginBottom: 12 }]}>
                {activePromo.subtitle}
              </Text>

              <TouchableOpacity
                style={[style.promoButton, { paddingVertical: 12 }]}
                onPress={() => {
                  dismissPromoModal();
                  navigation.navigate(activePromo.button_link === "Deposit" ? "WalletScreen" : (activePromo.button_link || "WalletScreen"), { promotion: activePromo });
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={activePromo.button_text}
              >
                <Text style={[style.promoButtonText, { fontSize: 14 }]}>{activePromo.button_text}</Text>
              </TouchableOpacity>
            </View>

            <View style={style.promoModalFooter}>
              <TouchableOpacity
                style={style.promoModalOption}
                onPress={() => setDontShowAgainChecked(!dontShowAgainChecked)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: dontShowAgainChecked }}
                accessibilityLabel="Don't show this promotion again"
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
                onPress={dismissPromoModal}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close promotion popup"
              >
                <Ionicons name="close-circle-outline" size={16} color={COLORS.textMuted} />
                <Text style={style.promoModalCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
        )}
      </Modal>

      <FlatList
        style={style.body}
        data={isLoading || loadError ? [] : getFilteredMatches()}
        keyExtractor={(game) => String(game.matchId)}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <MatchCard game={item} />
          </View>
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={<View style={{ height: 110 }} />}
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
