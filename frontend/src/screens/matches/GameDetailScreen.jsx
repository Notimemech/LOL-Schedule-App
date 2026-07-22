import React, { useState, useCallback } from "react";
import { View, Text, Image, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import LiveBadge from "../../components/ui/LiveBadge";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeGameDetailStyles } from "../../styles/game.styles";
import { getGameDetail } from "../../services/matchService";
import { getRoleIcon, getEventIcon } from "../../config/gameIcons";
import { formatMoney } from "../../utils/format";

// Renders an icon from a gameIcons config entry: an <Image> if a `uri` is set,
// otherwise the Ionicons fallback glyph.
const IconAsset = ({ entry, size = 18, color }) => {
  if (entry?.uri) {
    return <Image source={{ uri: entry.uri }} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <Ionicons name={entry?.icon || "ellipse-outline"} size={size} color={color} />;
};

export default function GameDetailScreen() {
  const route = useRoute();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeGameDetailStyles);
  const gameId = route.params?.gameId;

  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [gameId])
  );

  const loadDetail = async () => {
    if (!gameId) return;
    setLoadError(false);
    try {
      const data = await getGameDetail(gameId);
      setDetail(data);
    } catch (error) {
      console.log("Failed to load game detail:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDetail();
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={{ gap: 12 }}>
          <Skeleton height={150} radius={8} />
          <Skeleton height={70} radius={8} />
          <Skeleton height={280} radius={8} />
          <Skeleton height={220} radius={8} />
        </View>
      );
    }
    if (loadError || !detail) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          message="Could not load game details"
          actionLabel="Retry"
          onAction={loadDetail}
        />
      );
    }

    const { game, team1Players, team2Players, mvp, events } = detail;
    const isLive = game.state === "happening";
    const t1Won = Number(game.winner_team_id) === Number(game.team1_id);
    const t2Won = Number(game.winner_team_id) === Number(game.team2_id);
    const totalGold = Number(game.team1_gold) + Number(game.team2_gold);
    const goldRatio = totalGold > 0 ? Number(game.team1_gold) / totalGold : 0.5;

    const isLeftTeam = (teamId) => Number(teamId) === Number(game.team1_id);

    // Pair players by row index (backend sorts both teams by role, so row N
    // lines up the same role on each side).
    const rowCount = Math.max(team1Players.length, team2Players.length);
    const lineupRows = [];
    for (let i = 0; i < rowCount; i++) {
      lineupRows.push({ left: team1Players[i], right: team2Players[i] });
    }

    // Drop the leading team code from an event description — the side already
    // tells you which team it was ("T1 destroyed…" -> "destroyed…").
    const stripCode = (desc, code) => {
      if (!desc) return "";
      const clean = desc.startsWith(code + " ") ? desc.slice(code.length + 1) : desc;
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    };

    return (
      <>
        {/* SCORE HEADER */}
        <View style={styles.scoreCard}>
          <Text style={styles.gameTag}>
            {game.tournament_name?.toUpperCase()} · GAME {game.game_number}
          </Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreTeamCol}>
              <Image source={{ uri: game.team1_logo }} style={styles.scoreLogo} resizeMode="contain" />
              <Text style={styles.scoreTeamCode}>{game.team1_code}</Text>
              {t1Won ? <Text style={styles.winTag}>WINNER</Text> : null}
            </View>
            <View style={{ alignItems: "center" }}>
              {isLive ? <LiveBadge /> : null}
              <Text style={styles.killScore}>
                {game.team1_kill}
                <Text style={{ color: COLORS.textMuted }}> : </Text>
                {game.team2_kill}
              </Text>
              <Text style={styles.killLabel}>TOTAL KILLS</Text>
            </View>
            <View style={styles.scoreTeamCol}>
              <Image source={{ uri: game.team2_logo }} style={styles.scoreLogo} resizeMode="contain" />
              <Text style={styles.scoreTeamCode}>{game.team2_code}</Text>
              {t2Won ? <Text style={styles.winTag}>WINNER</Text> : null}
            </View>
          </View>

          {/* GOLD BAR */}
          {totalGold > 0 ? (
            <View style={styles.statBlock}>
              <View style={styles.statLabelRow}>
                <Text style={[styles.statValueText, { color: COLORS.primary }]}>
                  {formatMoney(game.team1_gold)}
                </Text>
                <Text style={styles.statCenterLabel}>TEAM GOLD</Text>
                <Text style={[styles.statValueText, { color: COLORS.secondary }]}>
                  {formatMoney(game.team2_gold)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { flex: goldRatio, backgroundColor: COLORS.primary }]} />
                <View style={[styles.barFill, { flex: 1 - goldRatio, backgroundColor: COLORS.secondary }]} />
              </View>
            </View>
          ) : null}
        </View>

        {/* MVP */}
        {mvp ? (
          <View style={styles.mvpCard}>
            <View style={styles.mvpIconBox}>
              <Ionicons name="trophy" size={22} color={COLORS.vipGold} />
            </View>
            <View>
              <Text style={styles.mvpLabel}>MVP OF THE GAME</Text>
              <Text style={styles.mvpName}>{mvp.in_game_name}</Text>
              <Text style={styles.mvpMeta}>{mvp.role} · {mvp.champion}</Text>
            </View>
            <View style={styles.mvpKda}>
              <Text style={styles.mvpKdaText}>
                {mvp.kills} / {mvp.deaths} / {mvp.assists}
              </Text>
              <Text style={styles.mvpKdaLabel}>K / D / A</Text>
            </View>
          </View>
        ) : null}

        {/* LINEUPS — symmetric comparison */}
        {rowCount > 0 && (
          <>
            <Text style={styles.sectionLabel}>LINEUPS</Text>
            <View style={styles.compareCard}>
              <View style={styles.compareHeader}>
                <View style={styles.compareHeaderTeam}>
                  <Image source={{ uri: game.team1_logo }} style={styles.compareHeaderLogo} resizeMode="contain" />
                  <Text style={styles.compareHeaderCode}>{game.team1_code}</Text>
                </View>
                <View style={styles.compareHeaderCenter}>
                  <Text style={styles.compareHeaderCenterText}>ROLE</Text>
                </View>
                <View style={[styles.compareHeaderTeam, { justifyContent: "flex-end" }]}>
                  <Text style={styles.compareHeaderCode}>{game.team2_code}</Text>
                  <Image source={{ uri: game.team2_logo }} style={styles.compareHeaderLogo} resizeMode="contain" />
                </View>
              </View>

              {lineupRows.map((row, idx) => {
                const role = row.left?.role || row.right?.role || "DEFAULT";
                return (
                  <View key={idx} style={styles.lineupRow}>
                    {/* Left player */}
                    <View style={[styles.lpCell, row.left?.is_mvp && styles.lpCellMvp]}>
                      <View style={styles.lpNameWrap}>
                        <Text style={styles.lpName} numberOfLines={1}>
                          {row.left?.in_game_name || "-"}{row.left?.is_mvp ? "  👑" : ""}
                        </Text>
                        <Text style={styles.lpChamp} numberOfLines={1}>{row.left?.champion || ""}</Text>
                      </View>
                      <Text style={styles.lpKda}>
                        {row.left ? `${row.left.kills}/${row.left.deaths}/${row.left.assists}` : ""}
                      </Text>
                    </View>

                    {/* Role icon (center) */}
                    <View style={styles.lpRoleCol}>
                      <IconAsset entry={getRoleIcon(role)} size={18} color={COLORS.textSecondary} />
                    </View>

                    {/* Right player (mirrored) */}
                    <View style={[styles.lpCell, row.right?.is_mvp && styles.lpCellMvp]}>
                      <Text style={styles.lpKda}>
                        {row.right ? `${row.right.kills}/${row.right.deaths}/${row.right.assists}` : ""}
                      </Text>
                      <View style={styles.lpNameWrap}>
                        <Text style={[styles.lpName, { textAlign: "right" }]} numberOfLines={1}>
                          {row.right?.in_game_name || "-"}{row.right?.is_mvp ? "  👑" : ""}
                        </Text>
                        <Text style={[styles.lpChamp, { textAlign: "right" }]} numberOfLines={1}>
                          {row.right?.champion || ""}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* KEY EVENTS — symmetric timeline */}
        {events.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>KEY EVENTS</Text>
            <View style={styles.compareCard}>
              <View style={styles.compareHeader}>
                <View style={styles.compareHeaderTeam}>
                  <Text style={[styles.compareHeaderCode, { color: COLORS.primary }]}>{game.team1_code}</Text>
                </View>
                <View style={styles.compareHeaderCenter}>
                  <Text style={styles.compareHeaderCenterText}>MIN</Text>
                </View>
                <View style={[styles.compareHeaderTeam, { justifyContent: "flex-end" }]}>
                  <Text style={[styles.compareHeaderCode, { color: COLORS.secondary }]}>{game.team2_code}</Text>
                </View>
              </View>

              {events.map((e, idx) => {
                // Neutral / game-end -> centered full-width row.
                if (e.event_type === "GAME_END" || !e.team_id) {
                  return (
                    <View key={idx} style={styles.evEndRow}>
                      <Ionicons name="trophy" size={16} color={COLORS.vipGold} />
                      <Text style={styles.evEndText}>{e.description}</Text>
                    </View>
                  );
                }

                const left = isLeftTeam(e.team_id);
                const sideColor = left ? COLORS.primary : COLORS.secondary;
                const code = left ? game.team1_code : game.team2_code;
                const text = stripCode(e.description, code);

                return (
                  <View key={idx} style={styles.eventRow}>
                    {/* Left side */}
                    <View style={styles.evSide}>
                      {left ? (
                        <View style={styles.evContentLeft}>
                          <Text style={[styles.evDesc, styles.evDescLeft]} numberOfLines={2}>{text}</Text>
                          <View style={[styles.evIcon, { backgroundColor: `${sideColor}22` }]}>
                            <IconAsset entry={getEventIcon(e.event_type)} size={15} color={sideColor} />
                          </View>
                        </View>
                      ) : null}
                    </View>

                    {/* Center minute + timeline line */}
                    <View style={styles.evCenter}>
                      <View style={styles.evLine} />
                      <View style={styles.evMinuteBadge}>
                        <Text style={styles.evMinuteText}>{e.game_minute}'</Text>
                      </View>
                    </View>

                    {/* Right side */}
                    <View style={styles.evSide}>
                      {!left ? (
                        <View style={styles.evContentRight}>
                          <View style={[styles.evIcon, { backgroundColor: `${sideColor}22` }]}>
                            <IconAsset entry={getEventIcon(e.event_type)} size={15} color={sideColor} />
                          </View>
                          <Text style={[styles.evDesc, styles.evDescRight]} numberOfLines={2}>{text}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader
        title={detail ? `GAME ${detail.game.game_number}` : "GAME DETAIL"}
        showBack={true}
      />
      <ScrollView
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
}
