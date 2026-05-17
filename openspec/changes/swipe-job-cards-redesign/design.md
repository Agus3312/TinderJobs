# Technical Design Document: Swipe Job Cards Redesign

## 1. Architecture Overview

### 1.1 Component Hierarchy

```
app/
├── layout.tsx (unchanged - loads Inter font)
├── page.tsx (modified - orchestrates swipe logic)
└── globals.css (modified - design tokens)

components/
├── Header.tsx (NEW - premium top bar with glassmorphism)
├── BackgroundGlow.tsx (NEW - ambient radial gradient)
├── JobCardDisplay.tsx (modified - complete visual redesign)
├── JobCardHeader.tsx (NEW - company logo + AI match badge)
├── TechPill.tsx (NEW - colored technology pills)
├── MatchReason.tsx (NEW - "Why matches you" section)
├── ActionButtons.tsx (NEW - reject/save/apply buttons)
├── SwipeOverlay.tsx (NEW - LIKE/NOPE indicators)
├── CardStack.tsx (NEW - background card visualization)
└── GlassNavbar.tsx (NEW - floating bottom navigation)

hooks/
└── useSwipeGesture.ts (modified - enhanced spring config)

types/
└── job.ts (modified - extended Job interface)

data/
└── mockJobs.ts (modified - add new fields)
```

### 1.2 Data Flow

```
User Interaction Flow:

1. User drags card → useMotionValue(x) updates
2. SwipeOverlay shows LIKE/NOPE based on x position
3. Card rotates/tilts based on drag distance
4. On dragEnd: if threshold met → animate exit → update state
5. Next card enters from CardStack visualization

State Structure:
- jobs: Job[] (immutable data)
- currentIndex: number (tracks position in deck)
- likedJobs: number[] (persisted to localStorage)
- passedJobs: number[] (persisted to localStorage)
- isAnimating: boolean (prevents double-swipe)
```

### 1.3 State Management Approach

**Local State (React useState):**
- `currentIndex`: Card position in deck
- `likedJobs`: Array of liked job IDs
- `passedJobs`: Array of passed job IDs
- `isAnimating`: Animation lock
- `cardKey`: Force re-render on card change

**Motion Values (Framer Motion):**
- `x`: Horizontal drag position
- `rotate`: Computed rotation from x
- `opacity`: Computed opacity from x
- `scale`: For hover states
- `backgroundColor`: For swipe overlays

**Persistence:**
- localStorage for likedJobs, passedJobs, currentIndex
- Load on mount, save on change

---

## 2. File Changes Required

### 2.1 New Files to Create

| File | Purpose |
|------|---------|
| `src/components/Header.tsx` | Premium top bar with logo, streak, AI insights |
| `src/components/BackgroundGlow.tsx` | Ambient radial gradient + card glow |
| `src/components/JobCardHeader.tsx` | Company logo + AI match percentage badge |
| `src/components/TechPill.tsx` | Colored tech stack pills with category colors |
| `src/components/MatchReason.tsx` | "Why this matches you" section |
| `src/components/ActionButtons.tsx` | Enhanced reject/save/apply buttons |
| `src/components/SwipeOverlay.tsx` | LIKE/NOPE visual indicators |
| `src/components/CardStack.tsx` | Background card visualization (2 behind) |
| `src/components/GlassNavbar.tsx` | Floating glass bottom navigation |

### 2.2 Existing Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add design tokens, Inter font import, dark theme |
| `src/types/job.ts` | Extend with matchScore, matchReasons, experienceLevel, jobType |
| `src/data/mockJobs.ts` | Add new fields to mock data |
| `src/app/page.tsx` | Replace header/navbar, integrate new components, update animations |
| `src/components/JobCardDisplay.tsx` | Complete redesign per spec |
| `src/components/SwipeContainer.tsx` | Optional - may not be needed with new architecture |

### 2.3 Files to Delete

| File | Reason |
|------|--------|
| None | All existing files remain, only modified |

---

## 3. Dependencies

### 3.1 New NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | ^0.400+ | Icon library (Linear/Stripe standard) |

**Installation:**
```bash
npm install lucide-react
```

### 3.2 Already Installed (No Changes)

| Package | Purpose |
|---------|---------|
| `framer-motion` | Animations, gestures, spring physics |
| `next` | Framework |
| `react` | UI library |
| `tailwindcss` | Styling (v4) |

### 3.3 Configuration Changes

**tailwind.config (if needed):**
- Ensure v4 is configured properly for CSS variables
- No explicit config needed with Tailwind v4 + CSS variables

**next.config:**
- No changes required

---

## 4. Component Breakdown

### 4.1 Header Component

**File:** `src/components/Header.tsx`

**Props Interface:**
```typescript
interface HeaderProps {
  likedCount: number;
  passedCount: number;
  streak: number;
  aiInsight?: string; // e.g., "92% match"
}
```

**Implementation Details:**
- Fixed position, height 64px
- Glassmorphism: `backdrop-blur-xl`, `bg-white/5`
- Border: `border-white/10`
- Logo: Gradient text "JobSwipe" using Inter font
- Stats: Flex container with pill-style badges
- Icon: Flame for streak, Sparkles for AI insight
- Background: Transparent with subtle gradient fade at bottom

**Integration Points:**
- Receives props from page.tsx
- No children components needed

---

### 4.2 BackgroundGlow Component

**File:** `src/components/BackgroundGlow.tsx`

**Props Interface:**
```typescript
interface BackgroundGlowProps {
  children?: React.ReactNode;
}
```

**Implementation Details:**
- Full viewport background: `bg-[#0A0A0F]`
- Radial gradient center-bottom: `radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
- Card glow: Animated, positioned behind card area
- Glow animation: Opacity 0.3 → 0.5 → 0.3, 4s infinite

**Integration Points:**
- Wraps main content area in page.tsx

---

### 4.3 JobCardDisplay Component

**File:** `src/components/JobCardDisplay.tsx`

**Props Interface:**
```typescript
interface JobCardDisplayProps {
  job: Job;
  isDragging?: boolean;
  dragProgress?: number; // -1 to 1 for overlay intensity
}
```

**Implementation Details:**
- Dimensions: 360px × 520px (mobile), 400px × 560px (desktop)
- Border radius: 28px
- Background: Glass effect `bg-white/5`, `backdrop-blur-xl`
- Border: `border-white/10`
- Shadow: Layered shadows with glow color
- Sections:
  1. JobCardHeader: Logo + company + AI match badge
  2. Job title: 28px, bold, max 2 lines
  3. Location: MapPin icon + text
  4. Salary: Green tint background, 20px semibold
  5. Job meta: Remote + Full-time pills
  6. TechPill array: Horizontal scroll if overflow
  7. Description: 2 line clamp
  8. MatchReason: "Why matches you" section

**Integration Points:**
- Used in page.tsx motion.div
- Receives Job type with new fields

---

### 4.4 JobCardHeader Component

**File:** `src/components/JobCardHeader.tsx`

**Props Interface:**
```typescript
interface JobCardHeaderProps {
  company: string;
  logo: string;
  matchScore: number;
  posted: string;
}
```

**Implementation Details:**
- Layout: Flex row, logo left, text center-right
- Logo: 48px × 48px, rounded 12px, gradient placeholder if none
- Company: 16px, medium weight
- AI Match badge: Pill shape, gradient background (#8B5CF6 → #6366F1), percentage text
- Posted: 12px, muted color

**Integration Points:**
- Child of JobCardDisplay

---

### 4.5 TechPill Component

**File:** `src/components/TechPill.tsx`

**Props Interface:**
```typescript
interface TechPillProps {
  tech: string;
  category?: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
}
```

**Implementation Details:**
- Background: Category-based tint (see spec for colors)
- Border: Category-based border color
- Text: 12px, medium, category accent color
- Padding: 6px 12px
- Border radius: 20px
- Categories map:
  - Frontend (React, Vue, etc.): Purple tint
  - Backend (Node, Python, etc.): Blue tint
  - Database: Green tint
  - DevOps/Cloud: Orange tint

**Integration Points:**
- Used in JobCardDisplay map loop

---

### 4.6 MatchReason Component

**File:** `src/components/MatchReason.tsx`

**Props Interface:**
```typescript
interface MatchReasonProps {
  reasons: string[]; // Array of match explanations
  maxVisible?: number;
}
```

**Implementation Details:**
- Title: "WHY IT MATCHES YOU", 12px, semibold, uppercase, letter-spacing 0.5px
- Items: Check icon (green) + text, 13px
- Max visible: 3 items
- Layout: Vertical stack

**Integration Points:**
- Child of JobCardDisplay
- Uses job.matchReasons

---

### 4.7 ActionButtons Component

**File:** `src/components/ActionButtons.tsx`

**Props Interface:**
```typescript
interface ActionButtonsProps {
  onReject: () => void;
  onSave: () => void;
  onApply: () => void;
  isDisabled?: boolean;
}
```

**Implementation Details:**
- Layout: Flex row, centered, gap 16px
- Button dimensions: 56px circle
- Reject (X):
  - Background: `rgba(239, 68, 68, 0.1)`
  - Border: `rgba(239, 68, 68, 0.2)`
  - Icon: X, 24px, red
- Save (Bookmark):
  - Background: `rgba(245, 158, 11, 0.1)`
  - Border: `rgba(245, 158, 11, 0.2)`
  - Icon: Bookmark, 24px, amber
- Apply (Rocket):
  - Background: Linear gradient (violet to indigo)
  - Icon: Rocket, 24px, white
- Hover: scale 1.1, background opacity increase

**Integration Points:**
- Child of JobCardDisplay (bottom of card)

---

### 4.8 SwipeOverlay Component

**File:** `src/components/SwipeOverlay.tsx`

**Props Interface:**
```typescript
interface SwipeOverlayProps {
  progress: number; // -1 (left) to 1 (right)
}
```

**Implementation Details:**
- Rendered inside card, above content
- Left overlay: Red tint, "NOPE" text (opacity 0 at center, 0.3 at ±50px)
- Right overlay: Green tint, "LIKE" text
- Threshold: >50px drag to show
- Rotation: Apply 3deg max tilt on hover

**Integration Points:**
- Child of JobCardDisplay
- Receives motion value or progress prop

---

### 4.9 CardStack Component

**File:** `src/components/CardStack.tsx`

**Props Interface:**
```typescript
interface CardStackProps {
  jobs: Job[];
  currentIndex: number;
}
```

**Implementation Details:**
- Render 2 cards behind current
- Card 2: scale 0.95, y offset 8px, opacity 0.7
- Card 3: scale 0.90, y offset 16px, opacity 0.4
- Non-draggable (pointer-events-none)
- Animate in: slight slide up on card exit

**Integration Points:**
- Placed behind current card in page.tsx

---

### 4.10 GlassNavbar Component

**File:** `src/components/GlassNavbar.tsx`

**Props Interface:**
```typescript
interface GlassNavbarProps {
  activeTab: 'feed' | 'search' | 'saved' | 'profile';
  onTabChange: (tab: string) => void;
}
```

**Implementation Details:**
- Fixed bottom, floating (not edge-to-edge)
- Width: max 400px, centered, rounded-full 24px
- Height: 72px + safe area bottom
- Glass effect: `bg-[#1A1A24]/80`, `backdrop-blur-xl`
- Border: `border-t border-white/8`
- Tabs: Feed, Search, Saved, Profile
- Icons: Home, Search, Bookmark, User (Lucide)
- Active: Gradient text + icon glow
- Inactive: Muted text

**Integration Points:**
- Placed at bottom of page.tsx

---

## 5. Animation Implementation

### 5.1 Framer Motion Configuration

**Spring Physics (Swipe):**
```typescript
const springConfig = {
  stiffness: 400,  // Higher = more snap (Linear uses ~300-400)
  damping: 30,     // Lower = more bounce (30 gives premium feel)
  mass: 0.8,       // Slightly lighter for responsiveness
};

// Usage in motion.div:
// transition: springConfig
```

**Rotation Mapping:**
```typescript
const rotate = useTransform(x, [-200, 200], [-15, 15]);
// or: x.get() * (15 / 200)
```

**Opacity Curve:**
```typescript
const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.6, 0.8, 1, 0.8, 0.6]);
// Simplified: 1 - (Math.abs(x.get()) / 500)
```

### 5.2 Exit Animation

```typescript
const exitAnimation = {
  x: direction === 'right' ? 500 : -500,
  rotate: direction === 'right' ? 30 : -30,
  opacity: 0,
  scale: 0.9,
  transition: {
    duration: 0.3,
    ease: "easeOut"
  }
};
```

### 5.3 Microinteractions

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Button Hover | scale 1.05 → 1.1 | 150ms | ease-out |
| Button Press | scale 0.95 | 100ms | ease-out |
| Card Hover (desktop) | scale 1.02, rotate ±3deg | 200ms | ease-out |
| Tab Switch | color transition + underline slide | 200ms | ease-out |
| Score Counter | count 0 → 92% | 800ms | ease-out |
| Glow Pulse | opacity 0.3 → 0.5 → 0.3 | 4000ms | ease-in-out, infinite |

### 5.4 Card Stack Animation

```typescript
// Behind cards entrance
const stackAnimation = {
  initial: { scale: 0.9, y: 20, opacity: 0 },
  animate: { scale: 0.95, y: 8, opacity: 0.7 },
  exit: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.3 } }
};
```

### 5.5 Reduced Motion Support

```typescript
// Respect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// If true, disable animations:
// - Instant transitions
// - No spring physics
// - No hover effects
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Day 1)

**Goal:** Set up design tokens and base components

**Tasks:**
1. [ ] Install `lucide-react`
2. [ ] Update `globals.css` with design tokens
3. [ ] Extend Job type in `types/job.ts`
4. [ ] Update `mockJobs.ts` with new fields
5. [ ] Create `BackgroundGlow.tsx` component

**Dependencies:** None (base layer)

---

### Phase 2: Card Core (Day 2)

**Goal:** Build main JobCardDisplay with all sections

**Tasks:**
1. [ ] Create `TechPill.tsx` component
2. [ ] Create `JobCardHeader.tsx` component
3. [ ] Create `MatchReason.tsx` component
4. [ ] Redesign `JobCardDisplay.tsx` with all sections
5. [ ] Integrate Lucide icons throughout

**Dependencies:** Phase 1 complete

---

### Phase 3: Actions & Overlays (Day 3)

**Goal:** Action buttons and swipe feedback

**Tasks:**
1. [ ] Create `ActionButtons.tsx` component
2. [ ] Create `SwipeOverlay.tsx` component
3. [ ] Add LIKE/NOPE indicator logic
4. [ ] Update swipe gestures in page.tsx
5. [ ] Add hover tilt effect (desktop)

**Dependencies:** Phase 2 complete

---

### Phase 4: Navigation & Layout (Day 4)

**Goal:** Header and navbar components

**Tasks:**
1. [ ] Create `Header.tsx` component
2. [ ] Create `GlassNavbar.tsx` component
3. [ ] Create `CardStack.tsx` component
4. [ ] Update `page.tsx` with new layout
5. [ ] Add glow animation

**Dependencies:** Phases 2-3 complete

---

### Phase 5: Polish & Integration (Day 5)

**Goal:** Final integration and edge cases

**Tasks:**
1. [ ] Update animation configs in page.tsx
2. [ ] Add spring physics to swipe
3. [ ] Test responsive breakpoints
4. [ ] Verify reduced motion support
5. [ ] Add fallback for glassmorphism (Safari)

**Dependencies:** All phases complete

---

## 7. Testing Considerations

### 7.1 Visual Regression Testing

| Check | Method |
|-------|--------|
| Design tokens match spec | Compare hex values in dev tools |
| Typography sizes | Chrome DevTools computed |
| Glassmorphism renders | Visual check in Chrome/Safari/Firefox |
| Shadows render correctly | Visual check, verify layer shadows |
| Colors match palette | Color picker verification |

**Tools:** Chrome DevTools, browser dev tools

---

### 7.2 Animation Testing

| Check | Method |
|-------|--------|
| Swipe physics feels premium | Manual test, adjust spring config |
| No jank or frame drops | Chrome DevTools Performance tab |
| Card tilt follows mouse | Desktop test |
| Glow pulse smooth | Visual check, verify 4s loop |
| Exit animation smooth | Manual swipe test |
| Reduced motion works | Toggle "Reduce motion" in OS settings |

**Tools:** Chrome DevTools Performance, manual testing

---

### 7.3 Responsive Testing

| Breakpoint | Width | Check |
|------------|-------|-------|
| Mobile | 375px | Card fits, buttons tappable |
| Mobile | 414px | Card fits, buttons tappable |
| Tablet | 768px | Card centered, proper sizing |
| Desktop | 1280px | Card centered, glow visible |
| Desktop | 1920px | Card centered, proper sizing |

**Tools:** Chrome DevTools device toolbar, actual devices

---

### 7.4 Browser Compatibility

| Browser | Version | Glassmorphism | Animations |
|---------|---------|---------------|-------------|
| Chrome | 76+ | Yes | Yes |
| Firefox | 103+ | Yes | Yes |
| Safari | 14+ | Yes (fallback needed) | Yes |
| Edge | 79+ | Yes | Yes |

**Fallback for Safari < 14:**
```css
/* Instead of backdrop-filter */
.glass-fallback {
  background: rgba(26, 26, 36, 0.95);
}
```

---

### 7.5 Edge Cases to Test

| Scenario | Expected |
|----------|----------|
| No company logo | Gradient placeholder shows |
| Long company name | Truncates with ellipsis |
| Many tech tags (>5) | Horizontal scroll |
| No match reasons | Section hidden |
| Swipe while animating | Blocked by isAnimating |
| Undo action | Card reappears smoothly |
| End of deck | Premium empty state |
| High DPI display | Shadows crisp |

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Frame rate (swipe) | 60fps |
| Memory usage | < 100MB |
| Bundle size increase | < 20KB (lucide-react) |

---

## 9. Rollback Plan

If issues arise:

1. Revert `globals.css` — remove design tokens
2. Restore `JobCardDisplay.tsx` — use previous version
3. Remove new components — Header, GlassNavbar, etc.
4. Keep `lucide-react` — valuable dependency
5. Restore `page.tsx` — previous animation config
6. No data migration needed — state unchanged

---

## Appendix: File Structure Summary

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx ← MODIFY
│   │   └── globals.css ← MODIFY
│   ├── components/
│   │   ├── Header.tsx ← NEW
│   │   ├── BackgroundGlow.tsx ← NEW
│   │   ├── JobCardDisplay.tsx ← MODIFY
│   │   ├── JobCardHeader.tsx ← NEW
│   │   ├── TechPill.tsx ← NEW
│   │   ├── MatchReason.tsx ← NEW
│   │   ├── ActionButtons.tsx ← NEW
│   │   ├── SwipeOverlay.tsx ← NEW
│   │   ├── CardStack.tsx ← NEW
│   │   └── GlassNavbar.tsx ← NEW
│   ├── types/
│   │   └── job.ts ← MODIFY
│   ├── data/
│   │   └── mockJobs.ts ← MODIFY
│   └── hooks/
│       └── useSwipeGesture.ts ← MODIFY (if needed)
└── package.json ← MODIFY (add lucide-react)
```