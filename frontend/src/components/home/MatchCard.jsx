import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../styles/colors";
import { formatDate } from "../../utils/format";

/**
 * Reusable match card used in HomeScreen (featured / popular / search results).
 * @param {object} game - The match object
 */
const MatchCard = ({ game }) => {
  const navigation = useNavigation();
  const isFinished = game.state === "finished";
  const isLive = game.state === "happening";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.league} numberOfLines={1} ellipsizeMode="tail">
          {game.leagueName?.toUpperCase()}
        </Text>
        {isLive ? (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>Live now</Text>
            <Ionicons name="radio-button-on" size={14} color={COLORS.danger} />
          </View>
        ) : (
          <Text style={styles.time}>{formatDate(game.startTime)}</Text>
        )}
      </View>
      
      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <Image source={{ uri: game.team1.logoUrl }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.code}>{game.team1.code}</Text>
        </View>
        
        {isFinished ? (
          <Text style={[styles.vs, { color: COLORS.success }]}>
            {game.team1Score} - {game.team2Score}
          </Text>
        ) : (
          <Text style={styles.vs}>VS</Text>
        )}

        <View style={[styles.team, { justifyContent: "flex-end" }]}>
          <Text style={styles.code}>{game.team2.code}</Text>
          <Image source={{ uri: game.team2.logoUrl }} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      
      {/* Compact Odds Buttons Row / Result Button */}
      {!isFinished ? (
        <View style={styles.oddsRow}>
          <TouchableOpacity 
            style={styles.oddBox} 
            onPress={() => navigation.navigate("Detail", { match: game })}
          >
            <Text style={styles.oddLabel}>{game.team1.code}</Text>
            <Text style={styles.oddValue}>x{(1.35 + (game.matchId % 3) * 0.25).toFixed(2)}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.oddBox} 
            onPress={() => navigation.navigate("Detail", { match: game })}
          >
            <Text style={styles.oddLabel}>{game.team2.code}</Text>
            <Text style={styles.oddValue}>x{(2.10 - (game.matchId % 3) * 0.15).toFixed(2)}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailBtn} 
            onPress={() => navigation.navigate("Detail", { match: game })}
          >
            <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.resultButton}
          onPress={() => navigation.navigate("Detail", { match: game })}
        >
          <Text style={styles.resultText}>VIEW RESULTS</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 10,
  },
  league: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
    marginRight: 8,
  },
  time: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveText: {
    color: COLORS.danger,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  team: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
  },
  code: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
  },
  vs: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    marginHorizontal: 10,
  },
  oddsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  oddBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  oddLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  oddValue: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  detailBtn: {
    width: 44,
    backgroundColor: COLORS.glowSoft,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resultButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  resultText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

export default MatchCard;
