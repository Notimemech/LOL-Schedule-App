import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ContentHeader from "../../components/common/ContentHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { getTournamentStandings } from "../../services/teamService";

export default function StandingsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { tournamentId, tournamentName } = route.params || {};

  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStandings();
    }, [tournamentId])
  );

  const loadStandings = async () => {
    if (!tournamentId) return;
    setLoadError(false);
    try {
      const data = await getTournamentStandings(tournamentId);
      setStandings(data);
    } catch (error) {
      console.log("Failed to load standings:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStandings();
  };

  const renderRow = ({ item, index }) => {
    const winrate = item.played > 0 ? Math.round((item.wins / item.played) * 100) : 0;
    const isTop = index === 0 && item.played > 0;
    return (
      <TouchableOpacity
        style={[styles.row, isTop && styles.rowTop]}
        onPress={() => navigation.navigate("Team", { slug: item.slug })}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name} profile`}
      >
        <Text style={[styles.rank, isTop && { color: COLORS.primary }]}>{index + 1}</Text>
        <Image source={{ uri: item.logo_url }} style={styles.logo} resizeMode="contain" />
        <View style={styles.nameCol}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.record}>
          <Text style={{ color: COLORS.success }}>{item.wins}</Text>
          <Text style={{ color: COLORS.textMuted }}> - </Text>
          <Text style={{ color: COLORS.danger }}>{item.losses}</Text>
        </Text>
        <Text style={styles.winrate}>{winrate}%</Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ gap: 8 }}>
          <Skeleton height={56} radius={6} />
          <Skeleton height={56} radius={6} />
          <Skeleton height={56} radius={6} />
          <Skeleton height={56} radius={6} />
        </View>
      );
    }
    if (loadError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load standings"
          actionLabel="Retry"
          onAction={loadStandings}
        />
      );
    }
    return (
      <EmptyState
        icon="podium-outline"
        message="No standings yet"
        hint="Standings appear once matches are scheduled."
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title={tournamentName || "STANDINGS"} showBack={true} />
      <FlatList
        contentContainerStyle={styles.bodyContent}
        data={isLoading || loadError ? [] : standings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRow}
        ListHeaderComponent={
          !isLoading && !loadError && standings.length > 0 ? (
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { width: 26 }]}>#</Text>
              <Text style={[styles.headerText, { flex: 1, marginLeft: 34 }]}>TEAM</Text>
              <Text style={[styles.headerText, { width: 56, textAlign: "right" }]}>W-L</Text>
              <Text style={[styles.headerText, { width: 52, textAlign: "right" }]}>WIN%</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
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

const makeStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bodyContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  rowTop: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  rank: {
    width: 26,
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  nameCol: {
    flex: 1,
  },
  code: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
  },
  name: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 11,
  },
  record: {
    width: 56,
    textAlign: "right",
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
  },
  winrate: {
    width: 52,
    textAlign: "right",
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
  },
});
