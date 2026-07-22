import { StyleSheet } from "react-native";

export const makeProfileStyles = (COLORS) =>
  StyleSheet.create({
    // ── Layout ─────────────────────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    body: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 48,
    },

    // ── Hero Banner ─────────────────────────────────────────────────
    heroBanner: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 20,
    },

    // ── Avatar Row ──────────────────────────────────────────────────
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 18,
    },
    avatarWrap: {
      position: "relative",
    },
    onlineDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      position: "absolute",
      bottom: 2,
      right: 2,
      borderWidth: 2,
      borderColor: COLORS.background,
    },
    avatarInfo: {
      flex: 1,
    },
    usernameLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    usernameText: {
      color: COLORS.text,
      fontSize: 22,
      fontFamily: "ManropeBold",
    },

    // ── VIP Pill ────────────────────────────────────────────────────
    vipPill: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    vipPillText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "ManropeBold",
    },
    vipUpsellSmall: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 4,
    },
    vipUpsellSmallText: {
      color: "#F59E0B",
      fontSize: 13,
      fontFamily: "ManropeBold",
    },

    // ── Balance Card ────────────────────────────────────────────────
    balanceCard: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 18,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    balanceLabel: {
      color: COLORS.textMuted,
      fontSize: 12,
      fontFamily: "ManropeBold",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    balanceValue: {
      color: COLORS.text,
      fontSize: 20,
      fontFamily: "ManropeBold",
    },
    topUpBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
    },
    topUpBtnText: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "ManropeBold",
    },

    // ── Section ──────────────────────────────────────────────────────
    section: {
      paddingHorizontal: 20,
      marginTop: 22,
    },
    sectionTitle: {
      color: COLORS.text,
      fontSize: 15,
      fontFamily: "ManropeBold",
      marginBottom: 12,
    },

    // ── Quick Actions Grid ───────────────────────────────────────────
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    quickActionCard: {
      width: "46%",
      backgroundColor: COLORS.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 16,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    quickActionLabel: {
      color: COLORS.text,
      fontSize: 13,
      fontFamily: "ManropeBold",
      flexShrink: 1,
    },

    // ── Menu Card ────────────────────────────────────────────────────
    menuCard: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    settingLabelWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    settingIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    settingText: {
      color: COLORS.text,
      fontSize: 14,
      fontFamily: "ManropeMedium",
    },

    // ── Sign Out ─────────────────────────────────────────────────────
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginHorizontal: 20,
      marginTop: 24,
      paddingVertical: 15,
      borderRadius: 14,
      backgroundColor: COLORS.buttonDanger,
      elevation: 3,
      shadowColor: COLORS.buttonDanger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    signOutText: {
      color: COLORS.buttonDangerText,
      fontSize: 15,
      fontFamily: "ManropeBold",
    },

    // ── App version ──────────────────────────────────────────────────
    versionLabel: {
      color: COLORS.textMuted,
      fontSize: 12,
      fontFamily: "Manrope",
      textAlign: "center",
      marginTop: 16,
    },

    // ─── FollowingSection (reused styles) ────────────────────────────
    followSubLabel: {
      color: COLORS.textMuted,
      fontSize: 11,
      fontFamily: "ManropeBold",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginLeft: 6,
      marginTop: 8,
      marginBottom: 8,
    },
    followedTeamsRow: {
      gap: 8,
      paddingHorizontal: 6,
      paddingBottom: 4,
    },
    followedTeamChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: COLORS.surface,
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    followedTeamLogo: {
      width: 20,
      height: 20,
    },
    followedTeamCode: {
      color: COLORS.text,
      fontSize: 13,
      fontFamily: "ManropeBold",
    },
    followedMatchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 6,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    followedMatchTitle: {
      color: COLORS.text,
      fontSize: 14,
      fontFamily: "ManropeBold",
    },
    followedMatchMeta: {
      color: COLORS.textMuted,
      fontSize: 12,
      fontFamily: "Manrope",
      marginTop: 2,
    },
    followedMatchState: {
      fontSize: 11,
      fontFamily: "ManropeBold",
      letterSpacing: 1,
    },
    followEmptyText: {
      color: COLORS.textMuted,
      fontSize: 13,
      fontFamily: "Manrope",
      paddingHorizontal: 6,
      paddingVertical: 8,
    },

    // ── FollowingSection card wrapper ────────────────────────────────
    sectionCard: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
  });
