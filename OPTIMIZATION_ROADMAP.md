# SkillSoft Frontend Optimization Roadmap

## Overview

This roadmap outlines the implementation plan for optimizing the psychometrics/competencies system from UX and frontend logic perspectives.

**Created:** 2025-12-27
**Status:** In Progress

---

## Phase 1: Quick Wins & Foundation (Current)

**Status:** In Progress
**Files Modified:** 5-8 files

### Tasks

| Task | Status | File(s) |
|------|--------|---------|
| Enable PPR (Partial Prerendering) | Pending | `next.config.ts` |
| Add parallel data fetching | Pending | `psychometrics/page.tsx`, `flagged/page.tsx` |
| Optimize package imports | Pending | `next.config.ts` |
| Create structured logger utility | Pending | `src/lib/logger.ts` (new) |
| Increase touch targets to 44px | Pending | `ui/checkbox.tsx` |

### Expected Outcomes
- Faster initial page loads via PPR
- Reduced waterfall data fetching
- Smaller bundle sizes
- Better debugging with structured logs
- WCAG-compliant touch targets

---

## Phase 2: State Management & Workflow

**Status:** Planned

### Tasks

| Task | Priority | Effort |
|------|----------|--------|
| Create `psychometrics-review-store.ts` with full state machine | High | 3 days |
| Implement undo stack with 30-second window | High | 2 days |
| Add saga pattern for batch operations with compensation | High | 2 days |
| Add partial failure handling and retry queue | Medium | 2 days |

### Key Files
- `src/store/psychometrics-review-store.ts` (new)
- `src/hooks/useSagaOperations.ts` (new)
- `src/hooks/useUndoableAction.ts` (new)

---

## Phase 3: UX Improvements

**Status:** Planned

### Tasks

| Task | Priority | Effort |
|------|----------|--------|
| Progressive disclosure for Flagged Items | High | 3 days |
| Progressive disclosure for Answer Summary | High | 2 days |
| Inline validation with contextual guidance | High | 2 days |
| Chart quadrant zones for psychometric scatter | Medium | 1 day |
| Smart suggestions for review decisions | Medium | 2 days |
| Real-time alert system | Medium | 3 days |

### Key Components
- `FlaggedItemsClient.tsx` - Add progressive disclosure
- `ItemQualityScatter.tsx` - Add quadrant zones
- `ValidationFeedback.tsx` (new)

---

## Phase 4: Component Refactoring

**Status:** Planned

### Tasks

| Task | Priority | Effort |
|------|----------|--------|
| Extract ImmersivePlayer.tsx into smaller components | High | 3 days |
| Migrate forms to useActionState (React 19) | Medium | 2 days |
| Remove redundant manual memoization | Low | 1 day |

### ImmersivePlayer Refactoring Plan
```
ImmersivePlayer/
  index.tsx              # Main orchestrator (~200 lines)
  hooks/
    usePlayerState.ts    # State management
    useAnswerSubmission.ts
    useKeyboardNavigation.ts
  components/
    QuestionView.tsx
    NavigationFooter.tsx
    TimeoutDialog.tsx
    AbandonDialog.tsx
```

---

## Phase 5: Mobile & Accessibility

**Status:** Planned

### Tasks

| Task | Priority | Effort |
|------|----------|--------|
| Implement swipe gestures for quick actions | Medium | 2 days |
| Create bottom sheet workflow for batch operations | Medium | 2 days |
| Add skip links for keyboard navigation | High | 1 day |
| Screen reader announcements for dynamic content | High | 1 day |
| Chart accessibility (data table alternatives) | Medium | 2 days |

### Accessibility Fixes
- Color-only status indication → Add icons + sr-only text
- Missing skip links → Add "Skip to main content"
- Chart accessibility → Add data table alternatives
- Timeout warnings → Add extension option

---

## Phase 6: Advanced Features

**Status:** Planned

### Tasks

| Task | Priority | Effort |
|------|----------|--------|
| Real-time threshold monitoring | Medium | 3 days |
| Actionable insights dashboard enhancement | Medium | 2 days |
| Offline batch queue with sync | Low | 3 days |
| Trend sparklines on dashboards | Low | 2 days |

---

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Task completion rate (flagged review) | ~80% | > 90% |
| Time to first action (dashboard) | ~30s | < 10s |
| Batch operation success rate | ~95% | > 99% |
| Mobile task completion rate | Unknown | > 80% |
| Lighthouse Performance Score | Unknown | > 90 |

---

## Dependencies

### Phase 1 (No dependencies)
- Can start immediately

### Phase 2 (Depends on Phase 1)
- Logger utility for debugging state transitions

### Phase 3 (Depends on Phase 2)
- Review store for progressive disclosure state

### Phase 4 (Independent)
- Can run in parallel with Phase 3

### Phase 5 (Depends on Phase 3)
- UX improvements needed before accessibility polish

### Phase 6 (Depends on Phases 2, 3)
- State management and UX foundations required

---

## Changelog

### 2025-12-27
- Initial roadmap created
- Phase 1 implementation started
