# AGENTS.md

# Project Overview

This project is a mobile eSports betting application built with React Native.

Primary goals:

- Clean Architecture
- High maintainability
- Reusable components
- Feature-first structure
- Strong TypeScript typing
- Production-ready code
- Performance-focused
- Mobile-first UX

Always prioritize readability over clever code.

Never introduce unnecessary abstractions.

---

# Tech Stack

Frontend

- React Native
- JavaScript
- React Navigation
- Axios
- Formik
- Yup

Backend

REST API

Database

PostgreSQL

Authentication

JWT

---

# Architecture

Always follow Feature-Based Architecture.

Example:

src/

    app/

    screens/

        auth/

        home/

        matches/

        betting/

        wallet/

        profile/

        tournament/

        notification/

    components/

        ui/

        common/

    services/

        api/

    hooks/

    navigation/

    constants/

    types/

    utils/

    styles/

Never create business logic inside components.

Business logic belongs inside:

- hooks
- services

---

# Screen Structure

Create new folder in screens/ for each screen if not exist. 

For each sub screens of one main screens, create new .jsx files in screens/ of that feature. E.g.

screens/

    home/

        HomeScreen.jsx

        BannerList.jsx

        HomeBanner.jsx

Never import internal files from another feature.

Only expose public APIs through index.ts.

---

# Component Rules

Components must be small.

A component should ideally stay under 200 lines.

Split large components.

Presentational components should not perform API requests.

Avoid deeply nested JSX.

---

# UI Components

Always reuse existing UI components.

Prefer:

Button

Input

Modal

Card

Avatar

Badge

Chip

BottomSheet

Loading

Skeleton

EmptyState

Do NOT duplicate UI.

If an existing component can be extended,
extend it.

---

# Styling

Create new styles in styles/

Each screen should have its own style file.

Avoid inline styles.

Avoid StyleSheet unless necessary for performance.

Spacing should use predefined spacing values.

Never hardcode colors.

Use theme tokens only.

Example:

bg-primary

text-secondary

border-border

Do not use hex colors.

---

# Navigation

Use React Navigation.

Routes should be strongly typed.

Never navigate using hardcoded strings.

Always use navigation constants.

---

# API

Use Axios only.

Never use fetch.

Every endpoint belongs inside:

feature/api/

Never call Axios directly inside components.

Always create service functions.

Example:

login()

register()

getUpcomingMatches()

placeBet()

---

# Forms

Always use:

Formik and Yup

Never manually validate forms.

---

# Error Handling

Every API request must handle:

Loading

Error

Retry

Network failure

Unauthorized

Never swallow errors.

Always show user-friendly messages.

---

# Authentication

JWT Authentication.

Store access token securely.

Never store sensitive information inside AsyncStorage if secure storage is available.

Unauthorized responses should redirect to Login.

---

# Betting Rules

Bet calculations should never happen inside UI components.

Business calculations belong inside services.

Money calculations should avoid floating point precision issues.

Use integer smallest currency units where possible.

---

# Performance

Use:

memo

useMemo

useCallback

only when beneficial.

Avoid premature optimization.

Use FlatList.

Never use ScrollView for long lists.

Lazy load heavy screens.

Paginate API responses.

---

# Naming

Components

PascalCase

Example

MatchCard

WalletScreen

Functions

camelCase

Example

placeBet()

calculateOdds()

Constants

UPPER_SNAKE_CASE

Types

PascalCase

Hooks

useSomething()

Example

useWallet()

useLiveMatches()

---

# Imports

Prefer absolute imports.

Avoid long relative imports.

Bad

../../../../

Good

@/features/auth

---

# Code Quality

Functions should do one thing.

Prefer early return.

Avoid nested if statements.

Avoid duplicated code.

Keep files cohesive.

---

# Comments

Only explain WHY.

Never explain WHAT.

Bad

// increment i

Good

// Retry because sportsbook APIs may return temporary odds mismatch.

---

# Testing

Business logic should be testable.

Separate pure functions.

Avoid tightly coupling logic with UI.

---

# Accessibility

Buttons must have accessible labels.

Touch targets should be large enough.

Support dynamic font scaling.

---

# AI Instructions

Before generating code:

0. Read the related files in the /frontend/agents folder.

1. Search existing implementation.

2. Reuse existing components.

3. Reuse existing hooks.

4. Reuse existing API services.

5. Follow folder conventions.

6. Never introduce a new library unless requested.

7. Never rewrite working code unnecessarily.

8. Prefer consistency over novelty.

9. Ask for clarification if architecture is unclear.

10. Generate production-quality code.

---

# Pull Request Mindset

Whenever modifying code:

- Keep changes minimal.
- Preserve existing architecture.
- Avoid unrelated refactoring.
- Explain tradeoffs when introducing new patterns.
