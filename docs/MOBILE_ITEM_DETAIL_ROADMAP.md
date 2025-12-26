# Mobile-First Redesign Roadmap: Psychometrics Item Detail Page

> **Target:** Transform desktop-first `psychometrics/items/[id]` page into mobile-optimized experience
> **Timeline:** 4 Phases
> **Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, vaul

---

## Executive Summary

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Time to Action (mobile) | 15+ seconds | < 4 seconds | 75% faster |
| Scroll Distance | 4+ screens | 1.5 screens | 62% reduction |
| Touch Target Compliance | ~60% | 100% | Full WCAG AAA |
| Redundant Data Display | 3x duplication | 1x single source | 66% reduction |
| Cognitive Load (sections) | 8 simultaneous | 3 + accordion | 62% reduction |

---

## Phase 1: Core Mobile UX (Critical Path)

**Goal:** Eliminate major UX friction points with minimal code changes

### 1.1 MobileItemHeader Component
**File:** `_components/MobileItemHeader.tsx`

Creates sticky compact header replacing the full-bleed hero:
- Back navigation with 44px touch target
- Centered status badge
- Actions FAB (triggers bottom sheet)
- Horizontal scrollable quick stats (p, rpb, n, date)

**Impact:** Immediate access to status + actions without scrolling

### 1.2 MobileActionSheet Component
**File:** `_components/MobileActionSheet.tsx`

Replaces buried action buttons with fixed bottom sheet:
- Primary action (Recalculate) always visible
- Secondary actions in vaul Drawer
- Status change form in sheet (not AlertDialog modal)

**Impact:** Actions accessible in < 2 taps from any scroll position

### 1.3 Remove Redundant Sections
**Changes to `page.tsx`:**

| Section | Action | Reason |
|---------|--------|--------|
| 4-column metrics grid (lines 269-329) | **DELETE** | Fully redundant with gauges |
| Threshold comparison card | **HIDE on mobile** | Redundant, show in accordion |
| Hero quick stats row | **MOVE to header** | Consolidate in sticky header |

**Impact:** 40% reduction in scroll distance

### 1.4 Responsive Layout Wrapper
**File:** `_components/ItemDetailLayout.tsx`

- Mobile-first padding (`p-4 md:p-6`)
- Bottom padding for fixed action bar (`pb-24 md:pb-6`)
- Conditional rendering based on `useIsMobile()`

**Deliverables:**
- [ ] `MobileItemHeader.tsx`
- [ ] `MobileActionSheet.tsx`
- [ ] `ItemDetailLayout.tsx`
- [ ] Updated `page.tsx` without redundant sections

---

## Phase 2: Progressive Disclosure

**Goal:** Reduce cognitive load through collapsible sections

### 2.1 MobileAccordionWrapper Component
**File:** `_components/MobileAccordionWrapper.tsx`

Wrapper that renders:
- **Mobile:** Collapsible accordion with badges showing item counts
- **Desktop:** Always-expanded cards (unchanged behavior)

### 2.2 Section Reorganization

| Section | Mobile State | Desktop State |
|---------|--------------|---------------|
| Question Text | Collapsed (tap to expand) | Always visible |
| Metrics Gauges | Visible (above fold) | Side-by-side cards |
| Threshold Comparison | Accordion | Card |
| Distractor Efficiency | Accordion with badge | Card |
| Recommendations | Accordion with count | Card |
| Status History | Accordion with count | Full timeline |

### 2.3 Issues Banner Priority
Move warning banner to immediately below header (before question):
- Critical visibility for flagged items
- Direct link to detailed analysis

**Deliverables:**
- [ ] `MobileAccordionWrapper.tsx`
- [ ] `QuestionSection.tsx` (collapsible)
- [ ] `IssuesBanner.tsx` (repositioned)
- [ ] Updated section ordering in `page.tsx`

---

## Phase 3: Gauge Optimization

**Goal:** Mobile-optimized metric visualization

### 3.1 LinearMetricGauge Component
**File:** `_components/LinearMetricGauge.tsx`

Horizontal gauge replacing semi-circular on mobile:
- Full-width track with zone colors
- Animated value indicator
- Inline label + value + badge

### 3.2 ResponsiveGauges Wrapper
**File:** `_components/ResponsiveGauges.tsx`

Conditional rendering:
- **Mobile:** `LinearMetricGauge` (stacked)
- **Desktop:** `SemiCircularGauge` size="lg" (side-by-side)

### 3.3 Compact Dual Metric Row
Alternative mobile layout showing both metrics in single row:
```
┌─────────────────────────────────────┐
│ p: 0.65 [====] │ rpb: 0.32 [====]  │
│ Optimal        │ Good              │
└─────────────────────────────────────┘
```

**Deliverables:**
- [ ] `LinearMetricGauge.tsx`
- [ ] `ResponsiveGauges.tsx`
- [ ] `CompactMetricRow.tsx` (optional)
- [ ] Zone color configurations matching existing

---

## Phase 4: Enhanced Interactions

**Goal:** Native mobile feel with gestures and offline support

### 4.1 SwipeNavigator Component
**File:** `_components/SwipeNavigator.tsx`

Swipe between items in the list:
- Edge swipe detection (20px from edge)
- Peek preview of next/prev item (10% visible)
- Haptic feedback on successful swipe
- Item position indicator dots

### 4.2 Prefetch & Cache Strategy
**File:** `stores/item-detail-cache.ts`

Zustand store for:
- Prefetch next 2 items when viewing current
- LRU cache (20 items max)
- Stale-while-revalidate pattern
- Pending action queue for offline

### 4.3 Pull-to-Refresh
Replace explicit Recalculate button with pull-to-refresh gesture on mobile

### 4.4 Toast Notifications
**File:** `_components/ActionToast.tsx`

Enhanced feedback:
- Undo capability (4 second window)
- Swipe to dismiss
- Offline queue indicator

**Deliverables:**
- [ ] `SwipeNavigator.tsx`
- [ ] `item-detail-cache.ts`
- [ ] `ActionToast.tsx`
- [ ] Integration tests for gestures

---

## Phase 5: Performance & Polish

**Goal:** Core Web Vitals optimization and accessibility

### 5.1 Suspense Boundaries
Add streaming for non-critical sections:
```tsx
<Suspense fallback={<GaugesSkeleton />}>
  <ResponsiveGauges {...} />
</Suspense>
```

### 5.2 Skeleton Components
**File:** `_components/Skeletons.tsx`

Matching skeletons for:
- Header
- Gauges
- Accordion sections
- Action bar

### 5.3 Server Actions
**File:** `app/actions/psychometrics.ts`

Convert client API calls to Server Actions:
- `recalculateItemAction`
- `updateItemStatusAction`
- Proper `revalidatePath` calls

### 5.4 Accessibility Audit
- All touch targets 44px+
- Focus management in sheets
- `aria-live` for status updates
- Reduced motion support

### 5.5 Visual Regression Tests
Playwright tests for:
- iPhone SE (375x667)
- iPhone 14 Pro (393x852)
- iPad Mini (768x1024)

**Deliverables:**
- [ ] `Skeletons.tsx`
- [ ] `app/actions/psychometrics.ts`
- [ ] Accessibility fixes
- [ ] Visual regression test suite
- [ ] Lighthouse mobile score > 90

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking desktop layout | Conditional rendering with `useIsMobile()`, feature flag |
| Animation performance | `will-change`, reduced motion media query |
| Touch target overlaps | 12px minimum gap between targets |
| Sheet blocking interaction | Backdrop click to dismiss, escape key |

---

## Success Metrics

### Phase 1 Complete
- [ ] Actions accessible in < 2 taps
- [ ] No horizontal overflow at 320px
- [ ] Scroll distance < 2.5 screens

### Phase 2 Complete
- [ ] Above-fold content shows key metrics + issues
- [ ] Accordion sections load progressively
- [ ] Desktop layout unchanged

### Phase 3 Complete
- [ ] Gauges readable at 320px width
- [ ] Animation smooth at 60fps
- [ ] Zone colors accessible (4.5:1 contrast)

### Phase 4 Complete
- [ ] Swipe navigation functional
- [ ] Offline actions queue properly
- [ ] Pull-to-refresh works

### Phase 5 Complete
- [ ] Lighthouse mobile > 90
- [ ] LCP < 2.5s on 3G
- [ ] All WCAG AAA touch targets

---

## File Manifest

### New Files (Phase 1-5)
```
app/(workspace)/psychometrics/items/[questionId]/
  _components/
    MobileItemHeader.tsx        # Phase 1
    MobileActionSheet.tsx       # Phase 1
    ItemDetailLayout.tsx        # Phase 1
    MobileAccordionWrapper.tsx  # Phase 2
    QuestionSection.tsx         # Phase 2
    IssuesBanner.tsx            # Phase 2
    LinearMetricGauge.tsx       # Phase 3
    ResponsiveGauges.tsx        # Phase 3
    SwipeNavigator.tsx          # Phase 4
    ActionToast.tsx             # Phase 4
    Skeletons.tsx               # Phase 5
    index.ts                    # Barrel exports

app/(workspace)/psychometrics/_components/
  LinearMetricGauge.tsx         # Phase 3 (shared)

app/actions/
  psychometrics.ts              # Phase 5

stores/
  item-detail-cache.ts          # Phase 4

__tests__/
  item-detail-mobile.spec.ts    # Phase 5
```

### Modified Files
```
app/(workspace)/psychometrics/items/[questionId]/
  page.tsx                      # All phases
  _components/ItemDetailClient.tsx  # Phase 1, 2

src/hooks/
  use-mobile.ts                 # Verify breakpoint (768px)
```

---

**Last Updated:** 2025-12-28
**Author:** Claude Code
**Version:** 1.0
