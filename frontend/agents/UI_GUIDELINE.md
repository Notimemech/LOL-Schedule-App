# UI_GUIDELINES.md

# Purpose

This document defines UI and UX standards for the mobile application.

Every generated screen should follow these rules.

---

# Design Philosophy

The interface should be:

- Simple
- Fast
- Modern
- Mobile-first
- Consistent
- Accessible

Avoid visual clutter.

Prioritize readability.

---

# Component Reuse

Always reuse components from:

components/ui/

Never duplicate existing UI.

Extend existing components whenever possible.

Preferred components:

- Button
- Input
- Card
- Modal
- Badge
- Avatar
- Chip
- BottomSheet
- Loading
- Skeleton
- EmptyState

---

# Screen Layout

Each screen should contain:

Header

↓

Content

↓

Bottom Action (if required)

Avoid deeply nested layouts.

---

# Styling

Each screen should have its own style file.

Never create huge style files.

Avoid inline styles.

Only use theme colors.

Never use hardcoded hex values.

---

# Spacing

Use predefined spacing values.

Never use random spacing.

Example scale:

4

8

12

16

24

32

40

48

---

# Colors

Use theme tokens only.

Example:

Primary

Secondary

Background

Surface

Border

Error

Warning

Success

Do not hardcode colors.

---

# Typography

Keep typography consistent.

Heading

Subheading

Body

Caption

Button

Never invent new font sizes.

---

# Buttons

Buttons should have:

Loading state

Disabled state

Pressed feedback

Never create custom buttons if Button already exists.

---

# Forms

Forms should use:

Formik

Yup

Every form should display:

Validation

Loading

Submission errors

Success feedback

---

# Lists

Use FlatList.

Never use ScrollView for large datasets.

Always support:

- loading
- empty state
- refresh
- pagination

---

# Loading

Every API screen should display:

Loading

Skeleton

Retry

Empty state

---

# Navigation

Always use React Navigation.

Use typed routes.

Never navigate using raw strings.

---

# Icons

Use one icon library consistently.

Maintain consistent icon sizes.

---

# Images

Lazy load whenever possible.

Provide placeholders.

Handle loading failures.

---

# Accessibility

Buttons need accessibility labels.

Touch targets should be large enough.

Support font scaling.

Maintain sufficient color contrast.

---

# Performance

Avoid unnecessary re-rendering.

Memoize only when beneficial.

Avoid large component trees.

Split reusable sections.

---

# Responsive Design

Support:

Small phones

Large phones

Tablets (if applicable)

Respect safe areas.

---

# Animations

Keep animations subtle.

Avoid long animations.

Never block user interaction.

---

# Error UI

Show meaningful messages.

Never expose backend errors directly.

Provide recovery actions whenever possible.

---

# AI Instructions

When generating UI:

- reuse existing components
- follow design consistency
- avoid duplicated layouts
- keep screens simple
- prioritize mobile usability
- never introduce new UI patterns without necessity