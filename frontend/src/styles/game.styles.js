import { StyleSheet } from "react-native";

export const makeGameDetailStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ===== Score header =====
  scoreCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  gameTag: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreTeamCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  scoreLogo: {
    width: 48,
    height: 48,
  },
  scoreTeamCode: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 15,
  },
  winTag: {
    color: COLORS.success,
    fontFamily: "SpaceGroteskBold",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  killScore: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 30,
    color: COLORS.text,
    marginHorizontal: 12,
  },
  killLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 4,
  },

  // ===== Gold comparison =====
  statBlock: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
  },
  statLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statValueText: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  statCenterLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  barTrack: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: COLORS.backgroundTertiary,
  },
  barFill: {
    height: "100%",
  },

  // ===== MVP =====
  mvpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.vipGold,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  mvpIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.vipGoldBg,
    alignItems: "center",
    justifyContent: "center",
  },
  mvpLabel: {
    color: COLORS.vipGold,
    fontFamily: "SpaceGroteskBold",
    fontSize: 10,
    letterSpacing: 2,
  },
  mvpName: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 17,
  },
  mvpMeta: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  mvpKda: {
    marginLeft: "auto",
    alignItems: "flex-end",
  },
  mvpKdaText: {
    color: COLORS.vipGold,
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
  },
  mvpKdaLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 9,
    letterSpacing: 1,
  },

  // ===== Section label =====
  sectionLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 6,
  },

  // ===== Lineups — symmetric comparison =====
  compareCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.backgroundTertiary,
  },
  compareHeaderTeam: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compareHeaderLogo: {
    width: 24,
    height: 24,
  },
  compareHeaderCode: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    letterSpacing: 1,
  },
  compareHeaderCenter: {
    width: 48,
    alignItems: "center",
  },
  compareHeaderCenterText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 9,
    letterSpacing: 1,
  },

  lineupRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    minHeight: 52,
  },
  lpCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  lpCellMvp: {
    backgroundColor: COLORS.vipGoldBg,
  },
  lpNameWrap: {
    flex: 1,
    minWidth: 0,
  },
  lpName: {
    color: COLORS.text,
    fontFamily: "SpaceGroteskBold",
    fontSize: 13,
  },
  lpChamp: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGrotesk",
    fontSize: 11,
    marginTop: 1,
  },
  lpKda: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    marginHorizontal: 8,
  },
  lpRoleCol: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    backgroundColor: COLORS.backgroundTertiary,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.divider,
  },

  // ===== Key events — symmetric timeline =====
  eventRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 46,
  },
  evSide: {
    flex: 1,
    justifyContent: "center",
  },
  evContentLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingRight: 8,
  },
  evContentRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    paddingLeft: 8,
  },
  evDesc: {
    flexShrink: 1,
    color: COLORS.textSecondary,
    fontFamily: "SpaceGrotesk",
    fontSize: 12,
  },
  evDescRight: {
    textAlign: "left",
  },
  evDescLeft: {
    textAlign: "right",
  },
  evIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  evCenter: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  evLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.divider,
  },
  evMinuteBadge: {
    minWidth: 34,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  evMinuteText: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
  },
  // Neutral / game-end row (centered)
  evEndRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  evEndText: {
    color: COLORS.vipGold,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 1,
  },
});
