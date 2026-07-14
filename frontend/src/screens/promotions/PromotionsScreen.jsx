import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import { getAllPromotions } from "../../services/promotionService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PromotionsScreen() {
  const navigation = useNavigation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchPromotions();
    }, [])
  );

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("userData") || await AsyncStorage.getItem("userInfo");
      let userId = null;
      if (userData) {
        try {
          userId = JSON.parse(userData).id;
        } catch (e) {
          console.log("Error parsing user data:", e);
        }
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

  const renderPromo = ({ item }) => {
    const isUsed = item.is_used;
    
    return (
      <View style={[styles.promoCard, isUsed && styles.promoCardUsed]}>
        <View style={styles.promoBadge}>
          <Text style={styles.promoBadgeText}>{item.badge_text}</Text>
        </View>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
        
        {item.quote_text ? (
          <View style={styles.promoQuoteBox}>
            <Text style={styles.promoQuoteText}>{item.quote_text}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.promoButton, isUsed && styles.promoButtonDisabled]}
          disabled={isUsed}
          onPress={() => {
            navigation.navigate(item.button_link === "Deposit" ? "WalletScreen" : (item.button_link || "WalletScreen"), { promotion: item });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.promoButtonText}>
            {isUsed ? "ALREADY CLAIMED" : item.button_text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROMOTIONS</Text>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPromo}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={{ color: COLORS.textMuted, fontFamily: "SpaceGrotesk" }}>No promotions available right now.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 20,
  },
  listContent: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  promoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promoCardUsed: {
    opacity: 0.6,
  },
  promoBadge: {
    backgroundColor: "rgba(255, 60, 60, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  promoBadgeText: {
    color: COLORS.danger,
    fontSize: 10,
    fontFamily: "SpaceGroteskBold",
  },
  promoTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "SpaceGroteskBold",
    marginBottom: 8,
  },
  promoSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: "Manrope",
    marginBottom: 16,
  },
  promoQuoteBox: {
    backgroundColor: "rgba(76, 209, 55, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    marginBottom: 16,
  },
  promoQuoteText: {
    color: COLORS.success,
    fontSize: 12,
    fontFamily: "Manrope",
    fontStyle: "italic",
  },
  promoButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  promoButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  promoButtonText: {
    color: "#000",
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  }
});
