/**
 * Shared formatting utilities.
 * All money/date/string formatting belongs here — never inline in components.
 */

/**
 * Format a number as Vietnamese Dong with comma separators.
 * e.g. 1500000 → "1,500,000"
 */
export const formatMoney = (num) => {
  const n = Math.abs(Number(num) || 0);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format amount with sign prefix (+ or -).
 * e.g. 150000 → "+150,000"  |  -50000 → "-50,000"
 */
export const formatMoneyWithSign = (num) => {
  const n = Number(num) || 0;
  const abs = formatMoney(Math.abs(n));
  return n >= 0 ? `+${abs}` : `-${abs}`;
};

/**
 * Format a date string to Vietnamese locale (Ho Chi Minh timezone).
 * e.g. "2026-07-20T10:00:00Z" → "20/07/2026 17:00"
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

/**
 * Format a date string to short date + time.
 * e.g. "2026-07-20T10:00:00Z" → "20/07/2026 17:00"
 */
export const formatShortDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
};

/**
 * Format a market_type snake_case string to readable label.
 * e.g. "winner_team" → "WINNER TEAM"
 */
export const formatMarketName = (marketType) => {
  if (!marketType) return "";
  return marketType.replace(/_/g, " ").toUpperCase();
};

/**
 * Parse a wager input string (may include commas) to a number.
 * e.g. "100,000" → 100000
 */
export const parseWagerInput = (input) => {
  if (!input) return 0;
  const cleaned = String(input).replace(/,/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};
