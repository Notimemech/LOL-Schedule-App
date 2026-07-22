import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const makeBettingStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 24,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  
  // Market Selection
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  oddBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  oddBoxSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glowSoft,
  },
  oddLabel: {
    fontFamily: "ManropeBold",
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    textAlign: "center",
  },
  oddValue: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
    color: COLORS.text,
  },
  oddValueSelected: {
    color: COLORS.primary,
  },
  
  // Wager Input Area
  inputContainer: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  wagerInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  wagerInputWrapperFocus: {
    borderColor: COLORS.inputBorderFocus,
  },
  currencySuffix: {
    fontFamily: "ManropeBold",
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  wagerInput: {
    flex: 1,
    fontFamily: "SpaceGroteskBold",
    fontSize: 18,
    color: COLORS.text,
    textAlign: "right",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.buttonSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Suggestions
  suggestionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  suggestionText: {
    fontFamily: "ManropeBold",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Payout Area
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  payoutLabel: {
    fontFamily: "ManropeBold",
    fontSize: 14,
    color: COLORS.textMuted,
  },
  payoutValue: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 18,
    color: COLORS.success,
  },
  
  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  submitButtonText: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
    color: COLORS.buttonPrimaryText,
    letterSpacing: 1,
  },
  submitButtonTextDisabled: {
    color: COLORS.textDisabled,
  },
  
  // History
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyMarket: {
    fontFamily: "ManropeBold",
    fontSize: 14,
    color: COLORS.text,
  },
  historyStatus: {
    fontFamily: "ManropeBold",
    fontSize: 12,
    color: COLORS.success,
  },
  historyRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyAmount: {
    fontFamily: "SpaceGroteskBold",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  historyDate: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyHistoryText: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 16,
  }
});
