# Implementation Task Breakdown: Swipe Job Cards Redesign

## Overview

This document provides a comprehensive task breakdown for implementing the premium SaaS redesign (Linear, Stripe, Raycast aesthetic) for the Tinder de Trabajo application.

**Project Stack:** Next.js + TypeScript + Tailwind CSS + Framer Motion
**Total Estimated Duration:** 5 days (Phase 1-5)

---

## Phase 1: Foundation (Day 1)

**Goal:** Set up design tokens, install dependencies, and prepare data types.

### T1: Install lucide-react Dependency

- **Description:** Install the Lucide React icon library which provides the consistent, premium icon set used by Linear, Stripe, and other modern SaaS products.
- **Files:** `frontend/package.json` (update), `frontend/node_modules` (new)
- **Dependencies:** None (base layer)
- **Estimated Effort:** Small
- **Commands:**
  ```bash
  cd frontend && npm install lucide-react
  ```
- **Status:** ✅ COMPLETE

### T2: Add Inter Font to layout.tsx

- **Description:** Configure Inter font from Google Fonts in the Next.js layout. Inter is the standard font for premium startups (Linear, Stripe, GitHub).
- **Files:** `frontend/src/app/layout.tsx`
- **Dependencies:** T1 (package installed)
- **Estimated Effort:** Small
- **Implementation:**
  - Import `Inter` from `next/font/google`
  - Add to `layout.tsx` with `subset: ['latin']` and variable `--font-inter`
  - Apply to `body` className
- **Status:** ✅ COMPLETE

### T3: Add Design Tokens to globals.css

- **Description:** Define the complete design system as CSS variables including colors, spacing, shadows, and glassmorphism effects.
- **Files:** `frontend/src/app/globals.css`
- **Dependencies:** T2
- **Estimated Effort:** Medium
- **Implementation:**
  - Color tokens: `--gradient-start`, `--gradient-mid`, `--gradient-end`, `--bg-dark`, `--bg-card`, `--text-primary`, etc.
  - Spacing tokens: `--spacing-xs` through `--spacing-2xl`
  - Card dimensions: width, height, border-radius, padding
  - Shadow tokens: `--shadow-card`, `--shadow-glow`
  - Glassmorphism token: backdrop blur, border colors
  - Import Inter font via `@import`
- **Status:** ✅ COMPLETE

### T4: Update Job Type in types/job.ts

- **Description:** Extend the existing Job interface with new fields required for the redesign: matchScore, matchReasons, experienceLevel, jobType, benefits.
- **Files:** `frontend/src/types/job.ts`
- **Dependencies:** T3
- **Estimated Effort:** Small
- **Implementation:**
  - Add `matchScore?: number` (0-100)
  - Add `matchReasons?: string[]`
  - Add `experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'principal'`
  - Add `jobType?: 'full-time' | 'part-time' | 'contract' | 'internship'`
  - Add `benefits?: string[]`
- **Status:** ✅ COMPLETE

### T5: Update mockJobs.ts with New Fields

- **Description:** Populate the mock data with realistic values for the new Job type fields to enable testing during implementation.
- **Files:** `frontend/src/data/mockJobs.ts`
- **Dependencies:** T4
- **Estimated Effort:** Small
- **Implementation:**
  - Add `matchScore` values (e.g., 75, 88, 92, 65)
  - Add `matchReasons` arrays (e.g., "Your React + TypeScript stack", "Remote-friendly", "$120k+ salary")
  - Add `experienceLevel` for each job
  - Add `jobType` for each job
  - Add `benefits` arrays (e.g., ["Health insurance", "401k", "Remote"])
- **Status:** ✅ COMPLETE

---

## Phase 2: Core Card Components (Day 2)

**Goal:** Build the main visual components for the job card display.

### T6: Create TechPill Component

- **Description:** Create a reusable component for displaying technology stack tags with category-based color coding (frontend=purple, backend=blue, database=green, devops=orange).
- **Files:** `frontend/src/components/TechPill.tsx` (NEW)
- **Dependencies:** T3, T4
- **Estimated Effort:** Medium
- **Implementation:**
  - Props: `tech: string`, `category?: 'frontend' | 'backend' | 'database' | 'devops' | 'other'`
  - Background: `rgba(category-color, 0.15)`
  - Border: `1px solid rgba(category-color, 0.3)`
  - Text: 12px, medium weight
  - Padding: 6px 12px, border-radius: 20px
  - Category detection helper for auto-categorization
- **Status:** ✅ COMPLETE

### T7: Create JobCardHeader Component

- **Description:** Create the card header with company logo, company name, AI match percentage badge, and posted date.
- **Files:** `frontend/src/components/JobCardHeader.tsx` (NEW)
- **Dependencies:** T3, T4
- **Estimated Effort:** Medium
- **Implementation:**
  - Props: `company`, `logo`, `matchScore`, `posted`
  - Logo: 48x48px, rounded 12px, gradient placeholder if no logo
  - Company name: 16px, medium weight, secondary text
  - AI Match badge: Pill shape, gradient background, percentage text
  - Posted: 12px, muted color
- **Status:** ✅ COMPLETE

### T8: Create MatchReason Component

- **Description:** Create the "Why it matches you" section displaying match justifications with checkmark icons.
- **Files:** `frontend/src/components/MatchReason.tsx` (NEW)
- **Dependencies:** T3, T4
- **Estimated Effort:** Small
- **Implementation:**
  - Props: `reasons: string[]`, `maxVisible?: number` (default 3)
  - Title: 12px, semibold, uppercase, letter-spacing 0.5px, muted color
  - Items: Check icon (green) + text, 13px
  - Layout: Vertical stack with gap
- **Status:** ✅ COMPLETE

### T9: Create ActionButtons Component

- **Description:** Create the bottom action buttons: Reject (X), Save (Bookmark), Apply (Rocket) with proper styling and hover effects.
- **Files:** `frontend/src/components/ActionButtons.tsx` (NEW)
- **Dependencies:** T3, T4, T1
- **Estimated Effort:** Medium
- **Implementation:**
  - Props: `onReject`, `onSave`, `onApply`, `isDisabled?`
  - Layout: Flex row, centered, gap 16px
  - Button size: 56px circle
  - Reject: Red background/border, X icon
  - Save: Amber background/border, Bookmark icon
  - Apply: Gradient background (violet to indigo), Rocket icon
  - Hover: scale 1.1 with Framer Motion
- **Status:** ✅ COMPLETE

### T10: Redesign JobCardDisplay Component

- **Description:** Complete redesign of the main card component integrating all new sections per spec: header, title, location, salary, meta, tech pills, description, match reasons, and action buttons.
- **Files:** `frontend/src/components/JobCardDisplay.tsx` (MODIFY)
- **Dependencies:** T6, T7, T8, T9
- **Estimated Effort:** Large
- **Implementation:**
  - Dimensions: 360x520px (mobile), 400x560px (desktop)
  - Border radius: 28px
  - Glassmorphism: bg-white/5, backdrop-blur-xl, border-white/10
  - Shadow: layered with glow color
  - All sections from spec layout
  - Proper spacing and typography per design tokens
- **Status:** ✅ COMPLETE

---

## Phase 3: Animation & Feedback (Day 3)

**Goal:** Implement swipe physics, indicators, and visual feedback.

### T11: Update SwipeContainer with Spring Physics

- **Description:** Enhance the swipe gesture handling with the premium spring configuration (stiffness 400, damping 30) for that snappy, premium feel.
- **Files:** `frontend/src/components/SwipeContainer.tsx` (MODIFY)
- **Dependencies:** T10
- **Estimated Effort:** Medium
- **Implementation:**
  - Update Framer Motion spring config:
    ```typescript
    const springConfig = {
      stiffness: 400,
      damping: 30,
      mass: 0.8
    };
    ```
  - Rotation mapping: -200px to 200px → -15deg to 15deg
  - Opacity curve: 1 at center, 0.6 at edges
- **Status:** ✅ COMPLETE

### T12: Create SwipeOverlay Component

- **Description:** Create the LIKE/NOPE visual indicators that appear during drag with proper opacity thresholds.
- **Files:** `frontend/src/components/SwipeOverlay.tsx` (NEW)
- **Dependencies:** T10, T11
- **Estimated Effort:** Medium
- **Implementation:**
  - Props: `progress: number` (-1 to 1)
  - Left overlay: Red tint, "NOPE" text, opacity 0 at center, 0.3 at threshold
  - Right overlay: Green tint, "LIKE" text
  - Threshold: >50px drag to show
  - Text: 24px, bold, respective color
- **Status:** ✅ COMPLETE

### T13: Add Exit Animation Logic

- **Description:** Implement the card exit animation when swipe threshold is exceeded: 500px movement, ±30deg rotation, fade out, 0.9 scale.
- **Files:** `frontend/src/components/SwipeContainer.tsx` (MODIFY)
- **Dependencies:** T11, T12
- **Estimated Effort:** Medium
- **Implementation:**
  - Trigger: x position > 150px (right) or < -150px (left)
  - Duration: 300ms
  - Movement: 500px in swipe direction
  - Rotation: ±30deg
  - Scale: 0.9
  - Easing: ease-out
- **Status:** ✅ COMPLETE

### T14: Add Card Hover Tilt Effect

- **Description:** Implement the desktop card hover effect with subtle rotation following mouse position (±3deg max).
- **Files:** `frontend/src/components/JobCardDisplay.tsx` (MODIFY)
- **Dependencies:** T10
- **Estimated Effort:** Small
- **Implementation:**
  - On mouse move: calculate X position relative to card center
  - Max rotation: ±3 degrees
  - Duration: 200ms, ease-out
  - Scale: 1.02 on hover
- **Status:** ✅ COMPLETE

---

## Phase 4: Layout & Navigation (Day 4)

**Goal:** Build the header, background effects, and bottom navigation.

### T15: Create BackgroundGlow Component

- **Description:** Create the ambient background with radial gradient and animated card glow effect.
- **Files:** `frontend/src/components/BackgroundGlow.tsx` (NEW)
- **Dependencies:** T3
- **Estimated Effort:** Medium
- **Implementation:**
  - Base background: `#0A0A0F`
  - Radial gradient: center-bottom, purple tint to transparent
  - Card glow: positioned behind card area
  - Glow animation: opacity 0.3 → 0.5 → 0.3, 4s infinite, ease-in-out
- **Status:** ✅ COMPLETE

### T16: Create Header Component

- **Description:** Create the premium top bar with glassmorphism, logo with gradient, streak counter, and AI insights badge.
- **Files:** `frontend/src/components/Header.tsx` (NEW)
- **Dependencies:** T3, T15
- **Estimated Effort:** Medium
- **Implementation:**
  - Fixed position, height 64px
  - Glassmorphism: backdrop-blur-xl, bg-white/5, border-white/10
  - Logo: "JobSwipe" text, gradient text, 18px, bold
  - Streak: Flame icon + number + "day streak" label
  - AI Insights: Sparkles icon + match percentage or "Hot job" badge
- **Status:** ✅ COMPLETE

### T17: Create GlassNavbar Component

- **Description:** Create the floating bottom navigation with glassmorphism effect and tab switching.
- **Files:** `frontend/src/components/GlassNavbar.tsx` (NEW)
- **Dependencies:** T3, T15
- **Estimated Effort:** Medium
- **Implementation:**
  - Fixed bottom, floating (not edge-to-edge)
  - Width: max 400px, centered, rounded 24px
  - Height: 72px + safe area
  - Glass effect: bg-[#1A1A24]/80, backdrop-blur-xl, border-white/8
  - Tabs: Feed (Home), Search, Saved (Bookmark), Profile (User)
  - Active: Gradient text + icon glow
  - Inactive: Muted text
- **Status:** ✅ COMPLETE

### T18: Create CardStack Component

- **Description:** Create the background card stack visualization showing 2 cards behind the current card with proper scale/opacity.
- **Files:** `frontend/src/components/CardStack.tsx` (NEW)
- **Dependencies:** T10
- **Estimated Effort:** Medium
- **Implementation:**
  - Props: `children: React.ReactNode`, `cardsBehind?: number` (default 2)
  - Card 2: scale 0.95, y offset 8px, opacity 0.7
  - Card 3: scale 0.90, y offset 16px, opacity 0.4
  - Non-draggable: pointer-events-none
  - Entrance animation on card exit
- **Status:** ✅ COMPLETE

---

## Phase 5: Integration & Polish (Day 5)

**Goal:** Final integration, testing, and edge case handling.

### T19: Update page.tsx with New Components

- **Description:** Integrate all new components into the main page: Header, BackgroundGlow, CardStack, updated JobCardDisplay, GlassNavbar.
- **Files:** `frontend/src/app/page.tsx` (MODIFY)
- **Dependencies:** T15, T16, T17, T18
- **Estimated Effort:** Large
- **Implementation:**
  - Replace existing header with new Header component
  - Wrap content in BackgroundGlow
  - Implement CardStack behind current card
  - Integrate SwipeOverlay in card
  - Add GlassNavbar at bottom
  - Wire up state management for all components
  - Update animation configurations

### T20: Add Score Counter Animation

- **Description:** Implement the count-up animation for the AI match percentage badge (0 to 92% over 800ms).
- **Files:** `frontend/src/components/JobCardHeader.tsx` (MODIFY)
- **Dependencies:** T7
- **Estimated Effort:** Small
- **Implementation:**
  - Use Framer Motion `animate` for count-up
  - Duration: 800ms, easing: ease-out
  - Format: percentage with "%" suffix

### T21: Implement Reduced Motion Support

- **Description:** Add support for users with `prefers-reduced-motion` setting by disabling spring physics and animations.
- **Files:** `frontend/src/components/SwipeContainer.tsx`, `frontend/src/components/JobCardDisplay.tsx`
- **Dependencies:** T11, T14
- **Estimated Effort:** Small
- **Implementation:**
  - Check `window.matchMedia('(prefers-reduced-motion: reduce)')`
  - If true: use instant transitions, no spring physics, no hover effects

### T22: Add Glassmorphism Fallback (Safari)

- **Description:** Add CSS fallback for Safari < 14 where backdrop-filter is not supported.
- **Files:** `frontend/src/app/globals.css` (MODIFY)
- **Dependencies:** T3
- **Estimated Effort:** Small
- **Implementation:**
  - Add `.glass-fallback` class with `background: rgba(26, 26, 36, 0.95)`
  - Use `@supports` to detect backdrop-filter support

### T23: Test Responsive Breakpoints

- **Description:** Verify the design works correctly across all breakpoints: mobile (340px), tablet (380px), desktop (400px).
- **Files:** All components (verify)
- **Dependencies:** All phases
- **Estimated Effort:** Medium
- **Implementation:**
  - Mobile < 640px: card 340x480, full width with margin
  - Tablet 640-1024px: card 380x520, centered
  - Desktop > 1024px: card 400x560, centered, larger glow

### T24: Add Edge Case Handling

- **Description:** Handle edge cases: no company logo, long company names, many tech tags, no match reasons, end of deck.
- **Files:** All components (verify)
- **Dependencies:** All phases
- **Estimated Effort:** Medium
- **Implementation:**
  - No logo: gradient placeholder
  - Long company: ellipsis truncation
  - Many tech: horizontal scroll
  - No match reasons: hide section
  - End of deck: premium empty state

---

## Task Summary

| Phase | Tasks | Total |
|-------|-------|-------|
| Phase 1: Foundation | T1-T5 | 5 tasks |
| Phase 2: Core Card Components | T6-T10 | 5 tasks |
| Phase 3: Animation & Feedback | T11-T14 | 4 tasks |
| Phase 4: Layout & Navigation | T15-T18 | 4 tasks |
| Phase 5: Integration & Polish | T19-T24 | 6 tasks |

**Total: 24 tasks**

---

## Effort Distribution

| Effort | Tasks |
|--------|-------|
| Small | T2, T4, T5, T8, T14, T20, T21, T22 | 8 |
| Medium | T3, T6, T7, T9, T11, T12, T13, T15, T16, T17, T18, T23, T24 | 13 |
| Large | T1, T10, T19 | 3 |

---

## File Summary

### New Files to Create (15 files)
1. `frontend/src/components/TechPill.tsx`
2. `frontend/src/components/JobCardHeader.tsx`
3. `frontend/src/components/MatchReason.tsx`
4. `frontend/src/components/ActionButtons.tsx`
5. `frontend/src/components/SwipeOverlay.tsx`
6. `frontend/src/components/BackgroundGlow.tsx`
7. `frontend/src/components/Header.tsx`
8. `frontend/src/components/GlassNavbar.tsx`
9. `frontend/src/components/CardStack.tsx`

### Files to Modify (6 files)
1. `frontend/src/app/globals.css`
2. `frontend/src/types/job.ts`
3. `frontend/src/data/mockJobs.ts`
4. `frontend/src/app/layout.tsx`
5. `frontend/src/components/JobCardDisplay.tsx`
6. `frontend/src/components/SwipeContainer.tsx`
7. `frontend/src/app/page.tsx`

### Dependencies to Install (1 package)
- `lucide-react`

---

## Dependency Graph

```
T1 (Install lucide-react)
  └─ T2 (layout.tsx font)
       └─ T3 (globals.css tokens)
            ├─ T4 (Job type)
            │    └─ T5 (mockJobs data)
            │
            ├─ T6 (TechPill)
            │    └─ T10 (JobCardDisplay)
            │         ├─ T11 (SwipeContainer physics)
            │         │    ├─ T12 (SwipeOverlay)
            │         │    │    └─ T13 (Exit animation)
            │         │    │
            │         │    └─ T14 (Hover tilt)
            │         │
            │         ├─ T7 (JobCardHeader)
            │         │    └─ T20 (Score animation)
            │         │
            │         ├─ T8 (MatchReason)
            │         │
            │         └─ T9 (ActionButtons)
            │
            ├─ T15 (BackgroundGlow)
            │    ├─ T16 (Header)
            │    └─ T17 (GlassNavbar)
            │
            └─ T18 (CardStack)

T19 (page.tsx integration) ← depends on all above

T21 (Reduced motion) ← T11, T14
T22 (Safari fallback) ← T3
T23 (Responsive) ← all phases
T24 (Edge cases) ← all phases
```

---

## Rollback Notes

If issues arise during implementation:
1. Revert `globals.css` — remove design tokens
2. Restore `JobCardDisplay.tsx` — use previous version
3. Remove new components — Header, GlassNavbar, etc.
4. Keep `lucide-react` — valuable dependency
5. Restore `page.tsx` — previous animation config
6. No data migration needed — state unchanged