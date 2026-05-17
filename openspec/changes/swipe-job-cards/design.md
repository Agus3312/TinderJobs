# Design: Swipe Job Cards UI

## Technical Approach

Implement the Tinder-style swipe UI for job browsing using **React with Framer Motion** (existing stack). The approach leverages the current prototype's foundation while structuring the code for maintainability and future backend integration.

**Key adaptation from proposal**: Original proposal specified React Native with `react-native-gesture-handler` + `react-native-reanimated`, but the project is a Next.js web app already using Framer Motion. The design reflects this reality.

## Architecture Decisions

### Decision: Animation Library

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Framer Motion (current) | Works out-of-box with React, good performance | ✅ Keep — already installed and working |
| React Spring | More physics-based, steeper learning curve | Rejected — framer-motion is simpler |
| Custom CSS/JS | Full control, more code to maintain | Rejected — unnecessary overhead |

**Rationale**: The prototype already uses Framer Motion successfully. No reason to switch.

### Decision: State Management

| Option | Tradeoff | Decision |
|--------|----------|----------|
| useState in parent (current) | Simple, works for MVP | ✅ Keep for now |
| useReducer | Better for complex swipe logic | Consider later if needed |
| Zustand/Context | Overkill for single-screen state | Deferred — future change |

**Rationale**: Current state in `page.tsx` is sufficient. As the app grows (matches, chat, profile), consider extracting to a store.

### Decision: Component Structure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single JobCard (current) | Simple, but mixes swipe logic + display | Refactor into separate layers |
| Presentational + Container | Clear separation, more files | ✅ Adopt — better maintainability |

**Rationale**: Current `JobCard.tsx` mixes UI + gesture handling. Refactor to:
- `SwipeContainer`: handles gestures + animations
- `JobCard`: pure presentational component

### Decision: Mock Data Storage

| Option | Tradeoff | Decision |
|--------|----------|----------|
| TypeScript file (current) | Simple, easy to edit | ✅ Keep |
| JSON file | More portable, type checking | Later — when API ready |
| API endpoint | Realistic, requires backend | Future change |

**Rationale**: TypeScript file with type definitions provides IDE support and early error detection.

## Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   mockJobs.ts   │────▶│   JobFeedPage    │────▶│  SwipeContainer │
│   (data source) │     │   (parent state) │     │ (gesture logic) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                        │
                                │ callbacks             │
                                ▼                        ▼
                         ┌──────────────────┐     ┌─────────────────┐
                         │ likedJobs[]      │     │    JobCard      │
                         │ passedJobs[]     │     │   (display)     │
                         └──────────────────┘     └─────────────────┘
```

**Flow**:
1. `mockJobs.ts` provides initial job data (currently 8 jobs)
2. `JobFeedPage` (page.tsx) manages swipe state and job index
3. On swipe action → updates liked/passed arrays, advances index
4. Future: API will replace mockJobs.ts

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/job.ts` | Create | Job interface definitions (extract from current inline) |
| `src/components/JobCard.tsx` | Modify | Make presentational only (remove swipe logic) |
| `src/components/SwipeContainer.tsx` | Create | Swipe gesture handling + animations |
| `src/components/JobCardDisplay.tsx` | Create | Pure UI component for job info |
| `src/hooks/useSwipeGesture.ts` | Create | Custom hook for swipe threshold + callbacks |
| `src/data/mockJobs.ts` | Modify | Add proper TypeScript types, expand to 10+ jobs |
| `src/app/page.tsx` | Modify | Refactor to use SwipeContainer, keep state logic |

## Interfaces / Contracts

```typescript
// src/types/job.ts
export interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  remote: boolean;
  stack: string[];
  description: string;
  posted: string;
}
```

```typescript
// src/hooks/useSwipeGesture.ts
interface UseSwipeGestureProps {
  threshold?: number;  // default: 100px
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeState {
  x: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
}
```

```typescript
// SwipeContainer props interface
interface SwipeContainerProps {
  children: React.ReactNode;  // JobCard content
  onSwipe: (direction: "left" | "right") => void;
  threshold?: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useSwipeGesture` threshold logic | Vitest/Jest with @testing-library/react |
| Unit | Job type validation | Type checking (already covered) |
| Integration | Swipe callback triggers correctly | @testing-library/user-event |
| Integration | State updates in parent | React component testing |
| E2E | Full swipe flow works in browser | Playwright (when test infra added) |

**Current state**: No test infrastructure detected. Will add in future change.

## Migration / Rollout

No migration required — this is the first implementation of swipe functionality.

**Rollout**:
1. Create types and hooks
2. Create SwipeContainer (gesture layer)
3. Create JobCardDisplay (presentational)
4. Update JobCard to use new structure
5. Update page.tsx to use SwipeContainer

## Open Questions

- [ ] Should swipe decisions persist to localStorage? (MVP scope says no, but good for UX)
- [ ] What happens when all jobs are swiped? (currently shows "no more jobs" - should this fetch more from API?)
- [ ] Should we add undo functionality? (common in Tinder apps)
- [ ] Need to decide on animation feel: springy vs smooth vs instant

## Next Step

Ready for tasks (sdd-tasks) to break down implementation into actionable items.