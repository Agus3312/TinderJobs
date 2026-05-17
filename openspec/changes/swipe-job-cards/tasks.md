# Tasks: Swipe Job Cards UI

## Phase 1: Infrastructure

- [x] 1.1 Create `src/types/job.ts` with Job interface (id, title, company, logo, location, salary, remote, stack, description, posted)
- [x] 1.2 Export Job type from `src/types/job.ts`
- [x] 1.3 Update `src/data/mockJobs.ts` to import Job type instead of inline type

## Phase 2: Implementation

- [x] 2.1 Create `src/hooks/useSwipeGesture.ts` with threshold prop (default 100px), onSwipeLeft/onSwipeRight callbacks, return MotionValues (x, rotate, opacity)
- [x] 2.2 Create `src/components/JobCardDisplay.tsx` as pure presentational component (no swipe logic, only UI)
- [x] 2.3 Create `src/components/SwipeContainer.tsx` that wraps JobCardDisplay with gesture handling
- [x] 2.4 Refactor `src/components/JobCard.tsx` to use SwipeContainer internally (backward compatible)
- [x] 2.5 Update `src/app/page.tsx` to track likedJobs/passedJobs in localStorage

## Phase 3: Testing

- [ ] 3.1 Verify swipe right adds job ID to likedJobs array
- [ ] 3.2 Verify swipe left adds job ID to passedJobs array
- [ ] 3.3 Verify swipe threshold prevents accidental swipes (<100px)
- [ ] 3.4 Verify card rotates during drag (-30° to 30°)
- [ ] 3.5 Verify "no more jobs" state shows restart button
- [ ] 3.6 Verify button click triggers same action as swipe

## Phase 4: Optional Enhancements

- [x] 4.1 (Should) Add localStorage persistence for likedJobs/passedJobs on page reload
- [ ] 4.2 (Should) Add undo functionality - restore last swiped job
- [ ] 4.3 (Should) Add swipe left/right indicators during drag (LIKE/PASS overlay)
- [ ] 4.4 (Should) Add haptic feedback on swipe threshold reached