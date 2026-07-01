/**
 * Mock betting service simulating API calls and backend validation.
 */

const MIN_STAKE_CENTS = 100; // $1.00
const MAX_STAKE_CENTS = 50000; // $500.00
let MOCK_WALLET_BALANCE_CENTS = 4000; // $40.00

export const placeBet = async (matchId, outcomeId, wagerCents) => {
  return new Promise((resolve, reject) => {
    // Simulate network latency
    setTimeout(() => {
      // Backend validation
      if (wagerCents < MIN_STAKE_CENTS) {
        return reject(new Error("Minimum stake is $1.00"));
      }
      if (wagerCents > MAX_STAKE_CENTS) {
        return reject(new Error("Maximum stake is $500.00"));
      }
      if (wagerCents > MOCK_WALLET_BALANCE_CENTS) {
        return reject(new Error("Insufficient balance"));
      }
      
      // Simulate successful bet placement
      MOCK_WALLET_BALANCE_CENTS -= wagerCents;
      
      resolve({
        success: true,
        newBalance: MOCK_WALLET_BALANCE_CENTS,
        betId: `BET-${Math.floor(Math.random() * 100000)}`,
        status: "Accepted",
        message: "Bet placed successfully!"
      });
    }, 1500); 
  });
};

export const getWalletBalance = () => {
  return MOCK_WALLET_BALANCE_CENTS;
};
