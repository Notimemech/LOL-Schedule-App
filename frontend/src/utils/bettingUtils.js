/**
 * Betting utility functions for calculations to ensure business logic is kept out of UI.
 */

export const formatMoney = (amount) => {
  if (amount == null || isNaN(amount)) return "0";
  // Format as VND: 100000 -> 100.000
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const calculatePayout = (wagerAmount, decimalOdds) => {
  if (!wagerAmount || isNaN(wagerAmount) || wagerAmount <= 0) return 0;
  return Math.floor(wagerAmount * decimalOdds);
};

export const parseWagerInput = (inputString) => {
  if (!inputString) return 0;
  // Remove all non-digit characters (e.g. dots or commas)
  const numericString = inputString.replace(/[^\d]/g, "");
  const parsed = parseInt(numericString, 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return parsed;
};
