import { StyleSheet } from "react-native";

export const makeHistoryStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    padding: 20,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  balanceBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceAmount: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 28,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: 10,
  },
  tabBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glowSoft,
  },
  tabText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
    marginTop: 16,
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGrotesk",
    fontSize: 13,
    marginTop: 8,
  },
});
