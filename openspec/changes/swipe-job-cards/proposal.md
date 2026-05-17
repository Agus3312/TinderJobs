# Proposal: Swipe Job Cards UI

## Intent

Implement the core swipe UI component that allows users to browse job postings using Tinder-style gestures. This is the primary interaction mechanism for the app - users swipe right to express interest (like/apply) and left to pass on jobs. Without this, users cannot interact with the job feed.

## Scope

### In Scope
- Swipe card component with Tinder-style gesture detection
- Job card design displaying: title, company name, salary range, location/remote badge, tech stack tags
- Swipe right gesture → mark as liked (store in state/local storage)
- Swipe left gesture → mark as passed (store in state/local storage)
- Basic card animations during swipe (rotation, opacity)
- Swipe threshold detection (not just tap)
- Mock data set (10-15 realistic job postings for testing)

### Out of Scope
- Backend integration (future change)
- Real job data from API (future change)
- Match notification system (future change)
- Application tracker (future change)
- Profile editor (future change)
- AI Apply functionality (future change)

## Capabilities

### New Capabilities
- `job-card-display`: Display job information in a swipeable card format
- `swipe-gesture-detection`: Detect and interpret horizontal swipe gestures
- `job-swipe-action`: Track swipe decisions (like/pass) for each job
- `job-feed-mock-data`: Provide realistic mock job data for UI testing

### Modified Capabilities
- None (first change - no existing specs to modify)

## Approach

Implement as a React Native (Expo) component with:
- **Gesture handling**: Use `react-native-gesture-handler` for pan gestures
- **Animation**: Use `react-native-reanimated` for smooth 60fps swipe animations
- **State management**: React useState/useReducer for swipe state
- **Card design**: FlatList-style vertical card stack with top card interactive

Mock data structure:
```typescript
interface JobCard {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  isRemote: boolean;
  tags: string[]; // tech stack
  postedAt: Date;
  description: string;
}
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/JobCard.tsx` | New | Card component displaying job info |
| `src/components/SwipeCard.tsx` | New | Wrapper handling swipe gestures and animations |
| `src/screens/JobFeedScreen.tsx` | New | Main screen with card stack |
| `src/data/mockJobs.ts` | New | Mock job data (10-15 jobs) |
| `src/types/job.ts` | New | Job interface definitions |
| `src/hooks/useSwipe.ts` | New | Custom hook for swipe logic |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Gesture conflicts with native navigation | Medium | Wrap in GestureHandlerRootView, test on both platforms |
| Animation performance on older devices | Low | Use reanimated worklets, keep animations simple |
| Card stack depth handling | Low | Only render top 2-3 cards, virtualize if needed |

## Rollback Plan

1. Remove the created component files (`JobCard.tsx`, `SwipeCard.tsx`, `JobFeedScreen.tsx`)
2. Remove mock data file (`mockJobs.ts`)
3. Remove types file (`job.ts`)
4. Remove hook (`useSwipe.ts`)
5. Remove any dependencies added to `package.json` (gesture-handler, reanimated)
6. Revert any changes to navigation or entry point

## Dependencies

- `react-native-gesture-handler` - Gesture detection
- `react-native-reanimated@^4.0.0` - Smooth animations
- `react-native-worklets` - Required for reanimated v4
- Expo SDK 53+ (project uses Expo)

## Success Criteria

- [ ] Cards display all required job information (title, company, salary, remote, tags)
- [ ] Swipe right triggers "like" state change with visual feedback
- [ ] Swipe left triggers "pass" state change with visual feedback
- [ ] Swipe threshold prevents accidental swipes (~100px minimum)
- [ ] Smooth 60fps animations during swipe gesture
- [ ] Mock data displays 10+ realistic job postings
- [ ] UI works on both iOS and Android simulators
- [ ] No console errors or warnings during interaction