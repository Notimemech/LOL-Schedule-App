/**
 * Betting utility functions for calculations to ensure business logic is kept out of UI.
 */

export const formatMoney = (cents) => {
  return (cents / 100).toFixed(2);
};

export const calculatePayout = (wagerCents, decimalOdds) => {
  if (!wagerCents || isNaN(wagerCents) || wagerCents <= 0) return 0;
  return Math.floor(wagerCents * decimalOdds);
};

export const parseWagerInput = (dollarString) => {
  if (!dollarString) return 0;
  const parsed = parseFloat(dollarString);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.floor(parsed * 100);
};
