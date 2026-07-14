import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import { getAllPromotions } from "../../services/promotionService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────
// Animated promo card with entrance animation
// ─────────────────────────────────────────────────────────────
function PromoCard({ item, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const isUsed = !!item.is_used;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 120,
        useNativeDriver: true,
        damping: 14,
        stiffness: 100,
      }),
    ]).start();
  }, []);

  const CARD_GRADIENTS = [
    ["#0f3460", "#16213e", "#1a1a2e"],
    ["#1a0533", "#2d1b69", "#1a1a2e"],
    ["#002d3d", "#004d6e", "#1a1a2e"],
    ["#1a2e00", "#2d4d00", "#1a1a2e"],
  ];

  const ACCENT_COLORS = [
    ["#00d4aa", "#00a8ff"],
    ["#a855f7", "#ec4899"],
    ["#f97316", "#facc15"],
    ["#22d3ee", "#6366f1"],
  ];

  const gradientColors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const accentColors = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const bonusPercent = Number(item.bonus_percentage) || 0;
  const maxBonus = Number(item.max_bonus) || 0;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
        isUsed && styles.cardWrapperUsed,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative glowing orb */}
        <View
          style={[
            styles.glowOrb,
            { backgroundColor: accentColors[0], opacity: isUsed ? 0.06 : 0.15 },
          ]}
        />

        {/* Top row: badge + status */}
        <View style={styles.cardTopRow}>
          <LinearGradient
            colors={isUsed ? ["#374151", "#4b5563"] : accentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>
              {isUsed ? "CLAIMED" : item.badge_text || "OFFER"}
            </Text>
          </LinearGradient>

          {isUsed && (
            <View style={styles.usedChip}>
              <Ionicons name="checkmark-circle" size={14} color="#6b7280" />
              <Text style={styles.usedChipText}>Used</Text>
            </View>
          )}
        </View>

        {/* Bonus highlight */}
        {bonusPercent > 0 && (
          <View style={styles.bonusHighlight}>
            <Text style={[styles.bonusPercent, { color: accentColors[0] }]}>
              +{bonusPercent}%
            </Text>
            <Text style={styles.bonusLabel}>BONUS</Text>
          </View>
        )}

        {/* Title & subtitle */}
        <Text style={[styles.cardTitle, isUsed && { opacity: 0.5 }]}>
          {item.title}
        </Text>
        <Text style={[styles.cardSubtitle, isUsed && { opacity: 0.4 }]}>
          {item.subtitle}
        </Text>

        {/* Quote/highlight box */}
        {item.quote_text ? (
          <View
            style={[
              styles.quoteBox,
              {
                borderLeftColor: accentColors[0],
                backgroundColor: `${accentColors[0]}15`,
              },
            ]}
          >
            <Text style={[styles.quoteText, { color: accentColors[0] }]}>
              {item.quote_text}
            </Text>
          </View>
        ) : null}

        {/* Stats row */}
        {(item.result_label_1 || item.result_val_1) && (
          <View style={styles.statsRow}>
            {[
              [item.result_label_1, item.result_val_1],
              [item.result_label_2, item.result_val_2],
              [item.result_label_3, item.result_val_3],
            ]
              .filter(([l]) => l)
              .map(([label, val], i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text style={[styles.statVal, { color: accentColors[0] }]}>
                    {val}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Max bonus info */}
        {maxBonus > 0 && !isUsed && (
          <View style={styles.maxBonusRow}>
            <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
            <Text style={styles.maxBonusText}>
              Max bonus: {Number(maxBonus).toLocaleString("vi-VN")}đ
            </Text>
          </View>
        )}

        {/* CTA button */}
        <TouchableOpacity
          style={[styles.ctaBtn, isUsed && styles.ctaBtnDisabled]}
          onPress={onPress}
          disabled={isUsed}
          activeOpacity={0.8}
        >
          {!isUsed ? (
            <LinearGradient
              colors={accentColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Ionicons name="flash" size={18} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.ctaBtnText}>{item.button_text || "CLAIM NOW"}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.ctaBtnGradient}>
              <Ionicons name="checkmark-done" size={18} color="#6b7280" style={{ marginRight: 6 }} />
              <Text style={[styles.ctaBtnText, { color: "#6b7280" }]}>ALREADY CLAIMED</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function PromotionsScreen() {
  const navigation = useNavigation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerAnim = useRef(new Animated.Value(-40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchPromotions();
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const userData =
        (await AsyncStorage.getItem("userData")) ||
        (await AsyncStorage.getItem("userInfo"));
      let userId = null;
      if (userData) {
        try {
          userId = JSON.parse(userData).id;
        } catch (e) {}
      }

      const response = await getAllPromotions(userId);
      if (response && response.success) {
        setPromotions(response.data);
      }
    } catch (error) {
      console.log("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoPress = (item) => {
    const screen =
      item.button_link === "Deposit"
        ? "WalletScreen"
        : item.button_link || "WalletScreen";
    navigation.navigate(screen, { promotion: item });
  };

  const activeCount = promotions.filter((p) => !p.is_used).length;
  const claimedCount = promotions.filter((p) => p.is_used).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerAnim }], opacity: headerOpacity },
        ]}
      >
        <LinearGradient
          colors={["#1e1b4b", "#0f172a"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>BetGG Exclusive</Text>
              <Text style={styles.headerTitle}>PROMOTIONS</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="gift" size={28} color={COLORS.primary} />
            </View>
          </View>

          {/* Stats chips */}
          <View style={styles.statsChips}>
            <View style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: "#22d3ee" }]} />
              <Text style={styles.chipText}>{activeCount} Active</Text>
            </View>
            <View style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: "#6b7280" }]} />
              <Text style={styles.chipText}>{claimedCount} Claimed</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading promotions...</Text>
        </View>
      ) : promotions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyTitle}>No promotions right now</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for exclusive offers!
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner note */}
          <View style={styles.bannerNote}>
            <Ionicons name="time-outline" size={14} color="#facc15" />
            <Text style={styles.bannerNoteText}>
              Limited-time offers — claim before they expire!
            </Text>
          </View>

          {/* Promo cards */}
          {promotions.map((item, index) => (
            <PromoCard
              key={item.id.toString()}
              item={item}
              index={index}
              onPress={() => handlePromoPress(item)}
            />
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },

  // ── Header ──
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#f1f5f9",
    fontFamily: "SpaceGroteskBold",
    fontSize: 28,
    letterSpacing: 1,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 212, 170, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 170, 0.25)",
  },
  statsChips: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "SpaceGrotesk",
  },

  // ── Loader / Empty ──
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loaderText: {
    color: "#475569",
    fontFamily: "SpaceGrotesk",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#e2e8f0",
    fontFamily: "SpaceGroteskBold",
    fontSize: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#475569",
    fontFamily: "SpaceGrotesk",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Scroll content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(250, 204, 21, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 18,
  },
  bannerNoteText: {
    color: "#facc15",
    fontSize: 12,
    fontFamily: "SpaceGrotesk",
    flex: 1,
  },

  // ── Card ──
  cardWrapper: {
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardWrapperUsed: {
    opacity: 0.6,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  glowOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -60,
    right: -40,
  },

  // Card inner elements
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 1,
  },
  usedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(107, 114, 128, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  usedChipText: {
    color: "#6b7280",
    fontSize: 11,
    fontFamily: "SpaceGrotesk",
  },

  bonusHighlight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 10,
  },
  bonusPercent: {
    fontSize: 44,
    fontFamily: "SpaceGroteskBold",
    lineHeight: 48,
  },
  bonusLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 2,
  },

  cardTitle: {
    color: "#f1f5f9",
    fontSize: 20,
    fontFamily: "SpaceGroteskBold",
    marginBottom: 6,
    lineHeight: 26,
  },
  cardSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "Manrope",
    marginBottom: 16,
    lineHeight: 20,
  },

  quoteBox: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 10,
    paddingRight: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 12,
    fontFamily: "Manrope",
    fontStyle: "italic",
    lineHeight: 18,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 70,
  },
  statLabel: {
    color: "#475569",
    fontSize: 10,
    fontFamily: "SpaceGrotesk",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 4,
  },
  statVal: {
    fontSize: 13,
    fontFamily: "SpaceGroteskBold",
    textAlign: "center",
  },

  maxBonusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
  },
  maxBonusText: {
    color: "#475569",
    fontSize: 11,
    fontFamily: "SpaceGrotesk",
  },

  ctaBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  ctaBtnDisabled: {
    backgroundColor: "rgba(107, 114, 128, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.2)",
  },
  ctaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  ctaBtnText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 0.5,
  },
});
