import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { getActivePromotion, getAllPromotions } from "../../services/promotionService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MatchCard from "../../components/home/MatchCard";

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
  const [activePromo, setActivePromo] = useState(null);

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

  const [carouselData, setCarouselData] = useState(carouselItems);
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
      
      const userDataStr = await AsyncStorage.getItem("userData") || await AsyncStorage.getItem("userInfo");
      let userId = null;
      if (userDataStr) {
        try {
          userId = JSON.parse(userDataStr).id;
        } catch (e) {
          console.log("Error parsing user data:", e);
        }
      }

      // Fetch dynamic promotion
      const promoResp = await getActivePromotion(userId);
      if (promoResp && promoResp.success && promoResp.data && !promoResp.data.is_used) {
        setActivePromo(promoResp.data);
        // Show promotions popup modal if not disabled in current session
        if (!hidePromoModalGlobal) {
          setPromoModalVisible(true);
        }
      }

      // Fetch all promotions for carousel
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
        setCarouselData([...carouselItems, ...promoItems]);
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
        isPromo={item.isPromo}
        promoIndex={item.promoIndex}
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
        visible={promoModalVisible && activePromo !== null}
        onRequestClose={() => setPromoModalVisible(false)}
      >
        {activePromo && (
        <View style={style.promoModalOverlay}>
          <View style={style.promoModalContent}>
            
            {/* Exciting Quote Box */}
            <View style={[style.promoQuoteBox, { marginBottom: 12 }]}>
              <Text style={style.promoQuoteText}>
                {activePromo.quote_text}
              </Text>
            </View>

            {/* Promotions Card */}
            <View style={[style.promoCard, { marginVertical: 0 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
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
                  setPromoModalVisible(false);
                  if (dontShowAgainChecked) {
                    hidePromoModalGlobal = true;
                  }
                  navigation.navigate(activePromo.button_link === "Deposit" ? "WalletScreen" : (activePromo.button_link || "WalletScreen"), { promotion: activePromo });
                }}
                activeOpacity={0.8}
              >
                <Text style={[style.promoButtonText, { fontSize: 14 }]}>{activePromo.button_text}</Text>
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
        )}
      </Modal>

      <View style={style.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {searchQuery ? (
            /* SEARCH RESULTS */
            <View style={style.bannerList}>
              {filteredSearchMatches.length > 0 ? (
                filteredSearchMatches.map(game => (
                  <MatchCard key={game.matchId} game={game} />
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
                  ref={flatListRef}
                  data={carouselData}
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
                    <MatchCard key={game.matchId} game={game} />
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
