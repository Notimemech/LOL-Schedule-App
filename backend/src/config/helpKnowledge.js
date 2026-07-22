// Knowledge base for the Help Center AI agent. Plain text injected into the
// system prompt — keep it factual and in sync with actual app behavior.
export const HELP_KNOWLEDGE = `
# APP OVERVIEW
This is a mobile eSports betting app (LoL / Dota 2). Users can view match
schedules, follow teams/matches, deposit money into a wallet (VND), place bets
on match markets, withdraw winnings, and buy VIP tiers.

# WALLET & DEPOSIT
- Each user has exactly one wallet. Balance is shown on Home and Profile.
- Deposit flow: Profile -> Top Up -> choose amount -> pay through VNPay
  (sandbox). When VNPay confirms success, the balance is credited and a
  DEPOSIT transaction (status "success") appears in Transaction History.
- Active promotions can add a bonus on top of a deposit (logged as a separate
  DEPOSIT transaction with reference PROMOTION).
- Common deposit issues:
  * VNPay payment shows "pending": the payment callback has not arrived yet.
    Ask the user to wait a few minutes and pull-to-refresh the wallet.
  * VNPay payment "failed" or cancelled: no money was taken; ask them to retry.
  * Payment succeeded at VNPay but no DEPOSIT transaction exists in the app:
    this needs manual intervention -> open a support ticket (category
    "deposit").

# WITHDRAW
- Withdraw flow: Profile -> Withdraw. The amount is deducted immediately and a
  WITHDRAW transaction is created (negative amount).
- A "pending" WITHDRAW transaction is normal: withdrawals are reviewed before
  being paid out.
- Withdraw is rejected client-side when the amount exceeds the wallet balance.
- If a withdrawal seems stuck for a long time or was deducted twice -> support
  ticket (category "withdraw").

# BETTING
- Placing a bet immediately deducts the stake from the wallet (a negative BET
  transaction). The bet starts with status "pending".
- Bets stay "pending" until the match finishes AND the market is settled by
  the system. After settling:
  * Won bets become "won" and a PAYOUT transaction credits the wallet.
  * Lost bets become "lost" (no payout).
  * Cancelled markets refund the stake (REFUND transaction).
- Markets close automatically when the match starts — betting on a live or
  finished match is not possible.
- Where to find your bets: open the match's Detail page (bet history section
  is at the bottom). Bets never disappear; a bet on a finished match remains
  visible on that match's page.
- Common bet issues:
  * "I won but got no money": usually the market is not settled yet (match
    finished but settlement pending). Check market status; if the market IS
    settled and the bet shows "won" but no PAYOUT transaction exists ->
    support ticket (category "bet").
  * "My bet disappeared": it is on the match Detail page of the match they
    bet on; ask them to check there and in Transaction History (BET entry).

# VIP
- VIP tiers are purchased with wallet balance and expire after a period.
  VIP status/management is in Profile.

# FOLLOWS
- Users can follow teams (Team page) and matches (match Detail page).
  Followed items show on Home (priority) and in Profile -> Following.

# SUPPORT ESCALATION RULES
The agent can only READ data and explain. It can NOT refund, modify balances,
change bet results, unlock accounts, or delete data. For any of those, or when
diagnostics show a real inconsistency (money missing despite correct flow),
call the open_ticket_form tool so the user can file a ticket with the support
team. Ticket categories: deposit, withdraw, bet, account, other.
`;
