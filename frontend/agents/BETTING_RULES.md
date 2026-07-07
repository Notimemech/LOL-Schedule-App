# BETTING_RULES.md

# Purpose

This document defines all business rules related to betting.

Every AI agent must follow these rules when generating or modifying betting-related code.

Never violate these rules even if they are not explicitly mentioned in the prompt.

---

# Core Principles

Business logic must never live inside UI components.

All betting logic belongs inside:

- src/services/
- src/utils/

Screens and components should only display betting information.

---

# Bet Flow

Standard betting flow:

1. User selects a match.
2. User selects a market.
3. User selects an outcome.
4. User enters wager amount.
5. Client validates input.
6. Server validates betting rules.
7. Bet is placed.
8. Wallet balance updates.
9. Bet history refreshes.

---

# Odds

Never calculate odds inside UI.

Odds come from backend.

Frontend only displays them.

If temporary calculations are needed (potential payout), create helper functions.

---

# Money

Never use floating point calculations for money.

Bad

0.1 + 0.2

Good

10000 // cents

Always use the smallest currency unit.

---

# Payout Calculation

Payout calculations belong inside services.

Never duplicate payout formulas across components.

Always reuse existing helper functions.

---

# Wallet

Wallet balance is the source of truth.

Never manually update wallet values inside components.

Always refresh wallet from API after:

- placing a bet
- cancelling a bet
- cashing out

---

# Validation

Always validate:

- minimum stake
- maximum stake
- wallet balance
- betting market availability
- odds availability

Never rely solely on frontend validation.

---

# Betting Status

Possible statuses:

Pending

Accepted

Rejected

Won

Lost

Cancelled

Void

Settled

Always use enums or constants.

Never use magic strings.

---

# Match Status

Possible statuses:

Upcoming

Live

Finished

Cancelled

Suspended

Do not allow betting on invalid match states.

---

# Live Betting

Live odds may change frequently.

Always assume odds can become outdated.

Handle:

- odds changed
- market suspended
- event finished

Gracefully.

---

# Bet Slip

Only one source of truth.

Never duplicate bet slip state.

Persist only if required.

---

# Cash Out

Cash out availability is controlled by backend.

Frontend only displays:

- available
- unavailable

Never calculate eligibility locally.

---

# History

Bet history must come from backend.

Never reconstruct history locally.

---

# Security

Never trust client-side values.

Backend is always authoritative.

Do not expose internal calculations.

---

# Error Handling

Handle:

- insufficient balance
- odds changed
- market suspended
- duplicate request
- timeout
- server validation failure

Always show user-friendly messages.

---

# AI Instructions

When generating betting code:

- reuse existing services
- never duplicate betting calculations
- never place business logic inside UI
- always preserve financial accuracy
- keep calculations deterministic