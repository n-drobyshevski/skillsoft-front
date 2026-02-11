# TestDriveInsights Tab Navigation Improvements

**Date:** 2025-12-14
**Component:** `D:\projects\diplom\skillsoft\frontend-app\src\components\test-player\insights\TestDriveInsights.tsx`
**Status:** Design Complete, Ready for Implementation

---

## Executive Summary

This document outlines comprehensive improvements to the TestDriveInsights drawer tab navigation system, focusing on mobile usability, visual design, animations, and accessibility.

### Key Improvements
1. **Enhanced Mobile Tab Design** - Icon-only mode for very small screens, improved touch targets
2. **Smooth Tab Transitions** - Slide animations with framer-motion for content switching
3. **Swipe Gesture Navigation** - Native mobile swipe support between tabs
4. **Improved Visual States** - Amber-themed active states with underline indicators
5. **Keyboard Navigation** - Arrow key support for tab switching
6. **Accessibility Enhancements** - ARIA live regions, focus management, screen reader support

---

## Current State Analysis

### Existing Implementation
- **4 tabs:** Психометрика, Скоринг, Маппинг, Метаданные
- **Short labels on mobile:** "Психо", "Баллы", "Связи", "Мета"
- **Icons:** Gauge, Calculator, GitBranch, Tag
- **Mobile breakpoint:** 768px (from `useIsMobile` hook)
- **Current styling:** Basic Radix UI tabs with minimal customization

### Identified Issues

#### 1. Mobile Tab Display Issues
- **Short labels still cramped** on very small screens (320px-375px)
- **Touch targets** could be larger (currently ~72px min-width on mobile)
- **No visual feedback** during tab switching
- **Horizontal scroll** risk with 4 tabs on small screens

#### 2. Visual Design Issues
- **Active state** not prominent enough (subtle amber background)
- **Inactive tabs** lack contrast
- **No transition animation** when switching tabs (jarring UX)
- **Missing underline indicator** for active tab (common pattern)

#### 3. Interaction Issues
- **No swipe gestures** on mobile (expected behavior for horizontal tabs)
- **No keyboard navigation** beyond default Tab key
- **No visual feedback** when swiping or switching

#### 4. Accessibility Gaps
- **No ARIA live region** announcing tab changes
- **Focus management** could be improved after tab switch
- **Screen reader** doesn't announce tab content changes

---

## Recommended Solution

### Design Pattern: **Adaptive Tabs with Swipe Support**

**Rationale:**
- Keep traditional tabs (familiar pattern)
- Enhance with modern mobile interactions (swipe)
- Progressive enhancement (icon-only on very small screens)
- Maintain accessibility (ARIA, keyboard nav)

**Alternative patterns considered (and rejected):**
- ❌ **Segmented Control** - Too iOS-specific, less web-native
- ❌ **Bottom Tab Bar** - Conflicts with navigation footer
- ❌ **Accordion** - Breaks mental model of parallel content
- ❌ **Carousel** - Reduces discoverability of all options

---

## Detailed Implementation Specifications

### 1. Responsive Tab Layout

#### Breakpoint Strategy
```typescript
// Very small phones (320px-480px): Icon only
// Small phones (481px-767px): Icon + short label
// Tablets+ (768px+): Icon + full label

const TAB_LAYOUTS = {
  iconOnly: 'max-width: 480px',      // Show only icons
  iconShort: '481px-767px',           // Show icon + short label
  iconFull: 'min-width: 768px',       // Show icon + full label
} as const;
```

#### Icon-Only Mode Implementation
```tsx
// For screens < 480px
<TabsTrigger className="px-3 py-2.5 min-w-[56px]">
  <Icon className="h-5 w-5" />
  <span className="sr-only">{tab.label}</span>
</TabsTrigger>

// For screens 481px-767px (current mobile)
<TabsTrigger className="px-2.5 py-2 min-w-[72px]">
  <Icon className="h-4 w-4" />
  <span className="text-[11px]">{tab.shortLabel}</span>
</TabsTrigger>

// For screens 768px+ (current desktop)
<TabsTrigger className="px-3 py-2">
  <Icon className="h-3.5 w-3.5" />
  <span className="text-xs">{tab.label}</span>
</TabsTrigger>
```

### 2. Enhanced Visual Design

#### Active Tab State (Amber Theme)
```tsx
// Active tab - prominent amber theme
className={cn(
  'relative flex items-center gap-1.5 rounded-lg font-medium transition-all duration-300',
  'data-[state=active]:bg-amber-500/25',           // Brighter background
  'data-[state=active]:text-amber-200',            // Lighter text
  'data-[state=active]:shadow-lg',                 // Depth
  'data-[state=active]:shadow-amber-500/20',       // Glow
  'data-[state=active]:scale-105',                 // Subtle scale
  // Underline indicator
  'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
  'data-[state=active]:after:bg-amber-400',
  'data-[state=active]:after:shadow-[0_0_8px_rgba(251,191,36,0.6)]',
)}
```

#### Inactive Tab State
```tsx
className={cn(
  'data-[state=inactive]:text-neutral-400',
  'data-[state=inactive]:hover:text-neutral-200',
  'data-[state=inactive]:hover:bg-neutral-800/50',
  'data-[state=inactive]:active:bg-neutral-800/70',   // Touch feedback
  'transition-all duration-200',
)}
```

#### Underline Animation
```css
/* In globals.css */
@keyframes tab-underline-slide {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.tab-underline-enter {
  animation: tab-underline-slide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. Tab Content Transitions

#### Framer Motion Integration

**Install (already available):** `framer-motion` is in package.json

**Implementation:**
```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Tab content wrapper
<TabsContent value="psychometrics" asChild>
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    className={cn("m-0", isMobile ? "p-3" : "p-4")}
  >
    <PsychometricsTab />
  </motion.div>
</TabsContent>
```

**Animation Variants:**
```tsx
const tabContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
};

const transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};
```

### 4. Swipe Gesture Support

#### Using Existing Hook
```tsx
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';

// In component
const tabOrder = ['psychometrics', 'scoring', 'mapping', 'metadata'] as const;
const currentIndex = tabOrder.indexOf(activeTab);

const { swipeState, handlers } = useSwipeNavigation({
  enabled: isMobile,
  minSwipeDistance: 60,
  onSwipeLeft: () => {
    // Go to next tab
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  },
  onSwipeRight: () => {
    // Go to previous tab
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  },
});

// Apply to tab content container
<div
  {...handlers}
  className="flex-1 overflow-y-auto swipe-container"
>
  {/* TabsContent components */}
</div>
```

#### Swipe Visual Feedback
```tsx
// Swipe indicator overlay
{swipeState.isSwiping && (
  <div
    className="absolute inset-y-0 pointer-events-none z-10 flex items-center"
    style={{
      left: swipeState.direction === 1 ? 0 : undefined,
      right: swipeState.direction === -1 ? 0 : undefined,
      opacity: Math.min(Math.abs(swipeState.offsetX) / 100, 0.6),
    }}
  >
    <div className="bg-amber-500/20 px-4 py-2 rounded-full">
      {swipeState.direction === 1 ? (
        <ChevronLeft className="w-6 h-6 text-amber-400" />
      ) : (
        <ChevronRight className="w-6 h-6 text-amber-400" />
      )}
    </div>
  </div>
)}
```

### 5. Keyboard Navigation

#### Arrow Key Support
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const tabOrder = ['psychometrics', 'scoring', 'mapping', 'metadata'] as const;
    const currentIndex = tabOrder.indexOf(activeTab);

    // Arrow Left - Previous tab
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      setActiveTab(tabOrder[currentIndex - 1]);
    }

    // Arrow Right - Next tab
    if (e.key === 'ArrowRight' && currentIndex < tabOrder.length - 1) {
      e.preventDefault();
      setActiveTab(tabOrder[currentIndex + 1]);
    }

    // Home - First tab
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(tabOrder[0]);
    }

    // End - Last tab
    if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(tabOrder[tabOrder.length - 1]);
    }
  };

  // Only attach when panel is open and has focus
  if (isPanelOpen) {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }
}, [activeTab, isPanelOpen, setActiveTab]);
```

#### Focus Management
```tsx
// Focus first focusable element in new tab content
useEffect(() => {
  if (activeTab) {
    const tabContent = document.querySelector(`[data-tab="${activeTab}"]`);
    const firstFocusable = tabContent?.querySelector<HTMLElement>(
      'button, a, input, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Small delay to allow transition to complete
    setTimeout(() => {
      firstFocusable?.focus();
    }, 100);
  }
}, [activeTab]);
```

### 6. Accessibility Enhancements

#### ARIA Live Region for Tab Changes
```tsx
// Screen reader announcements
const [announcement, setAnnouncement] = useState('');

useEffect(() => {
  const tabLabels = {
    psychometrics: 'Психометрика',
    scoring: 'Скоринг',
    mapping: 'Маппинг',
    metadata: 'Метаданные',
  };

  setAnnouncement(`Открыта вкладка: ${tabLabels[activeTab]}`);
}, [activeTab]);

return (
  <>
    {/* ARIA live region */}
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>

    {/* Rest of component */}
  </>
);
```

#### Enhanced ARIA Labels
```tsx
<TabsList
  aria-label="Вкладки анализа вопроса"
  role="tablist"
>
  {TAB_CONFIG.map((tab, index) => (
    <TabsTrigger
      key={tab.value}
      value={tab.value}
      role="tab"
      aria-selected={activeTab === tab.value}
      aria-controls={`tabpanel-${tab.value}`}
      id={`tab-${tab.value}`}
      aria-label={`${tab.label}, вкладка ${index + 1} из ${TAB_CONFIG.length}`}
    >
      {/* Tab content */}
    </TabsTrigger>
  ))}
</TabsList>

<TabsContent
  value={tab.value}
  role="tabpanel"
  id={`tabpanel-${tab.value}`}
  aria-labelledby={`tab-${tab.value}`}
  tabIndex={0}
>
  {/* Content */}
</TabsContent>
```

---

## Performance Considerations

### Animation Performance
```tsx
// Use GPU-accelerated transforms
className="will-change-transform gpu-accelerated"

// Disable animations for users who prefer reduced motion
const prefersReducedMotion = useReducedMotion();

const transition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.25, ease: 'easeInOut' };
```

### Swipe Performance
- Swipe hook already uses `passive: true` for touch events
- Visual feedback uses CSS transforms (GPU-accelerated)
- Debounced state updates during swipe

### Bundle Size Impact
- Framer Motion: Already installed (0 KB additional)
- Swipe Hook: Already implemented (0 KB additional)
- CSS animations: ~200 bytes (minified)
- **Total impact: ~200 bytes**

---

## Mobile-Specific Optimizations

### Touch Target Sizes
```tsx
// WCAG 2.2 AAA: 44x44px minimum touch target
className={cn(
  'touch-target-min',  // min-height: 44px; min-width: 44px
  isMobile ? 'px-3 py-2.5' : 'px-3 py-2',
)}
```

### Horizontal Scroll Prevention
```tsx
<TabsList className={cn(
  'overflow-x-auto scrollbar-hide',
  // Snap to tabs on mobile for better UX
  isMobile && 'snap-x snap-mandatory',
)}>
  <TabsTrigger className={isMobile ? 'snap-center' : ''}>
    {/* Tab content */}
  </TabsTrigger>
</TabsList>
```

### Safe Area Support
```tsx
// Account for notched devices
className="pb-safe"  // padding-bottom: max(1rem, env(safe-area-inset-bottom))
```

---

## Testing Checklist

### Visual Testing
- [ ] Tabs display correctly at 320px, 375px, 480px, 768px, 1024px
- [ ] Active tab has prominent amber styling
- [ ] Underline animation plays smoothly
- [ ] Content transitions slide in/out correctly
- [ ] Swipe indicators appear during swipe

### Interaction Testing
- [ ] Tap switches tabs instantly
- [ ] Swipe left goes to next tab
- [ ] Swipe right goes to previous tab
- [ ] Arrow keys navigate tabs
- [ ] Home/End keys go to first/last tab
- [ ] No swipe at first/last tab edges

### Accessibility Testing
- [ ] Screen reader announces tab changes
- [ ] Focus moves to tab content after switch
- [ ] All tabs keyboard accessible
- [ ] ARIA labels correct
- [ ] Reduced motion preference respected

### Performance Testing
- [ ] No layout shift during tab switch
- [ ] 60fps animations on mid-range devices
- [ ] No jank during swipe
- [ ] Memory stable after 20+ tab switches

---

## Implementation Phases

### Phase 1: Core Visual Improvements (1-2 hours)
1. Enhanced active/inactive tab styling
2. Underline indicator animation
3. Icon-only mode for very small screens
4. Improved touch targets

### Phase 2: Animations (1 hour)
1. Framer Motion content transitions
2. Tab switching direction awareness
3. Reduced motion support

### Phase 3: Swipe Gestures (1 hour)
1. Integrate swipe hook
2. Visual feedback indicators
3. Edge case handling (first/last tab)

### Phase 4: Keyboard Navigation (30 min)
1. Arrow key support
2. Home/End key support
3. Focus management

### Phase 5: Accessibility (1 hour)
1. ARIA live regions
2. Enhanced ARIA labels
3. Screen reader testing
4. Focus trap prevention

**Total estimated time: 4.5-5.5 hours**

---

## Code Structure

```
src/components/test-player/insights/
├── TestDriveInsights.tsx           # Main component (updated)
├── tabs/
│   ├── PsychometricsTab.tsx
│   ├── ScoringTab.tsx
│   ├── MappingTab.tsx
│   └── MetadataTab.tsx
├── TabSwipeIndicator.tsx           # NEW: Swipe feedback component
└── useTabKeyboardNav.ts            # NEW: Keyboard nav hook

app/globals.css                      # Add tab animations
```

---

## Browser Support

| Browser | Version | Tab Transitions | Swipe Gestures | Keyboard Nav |
|---------|---------|-----------------|----------------|--------------|
| Chrome  | 90+     | ✅              | ✅             | ✅           |
| Safari  | 14+     | ✅              | ✅             | ✅           |
| Firefox | 88+     | ✅              | ✅             | ✅           |
| Edge    | 90+     | ✅              | ✅             | ✅           |
| Mobile Safari | 14+ | ✅          | ✅             | N/A          |
| Chrome Android | 90+ | ✅         | ✅             | N/A          |

**Graceful degradation:**
- No swipe on desktop → keyboard/click still works
- No animations if reduced motion → instant tab switch
- No framer-motion → fallback to CSS transitions

---

## Related Documentation

- **Swipe Hook:** `D:\projects\diplom\skillsoft\frontend-app\src\hooks\use-swipe-navigation.ts`
- **Tabs UI Component:** `D:\projects\diplom\skillsoft\frontend-app\src\components\ui\tabs.tsx`
- **Drawer Component:** `D:\projects\diplom\skillsoft\frontend-app\src\components\ui\drawer.tsx`
- **Global CSS:** `D:\projects\diplom\skillsoft\frontend-app\app\globals.css`
- **Mobile Hook:** `D:\projects\diplom\skillsoft\frontend-app\src\hooks\use-mobile.ts`

---

## Next Steps

1. **Review this design document** with team/stakeholders
2. **Implement Phase 1** (visual improvements) first
3. **Test on real devices** (iPhone SE, Pixel, iPad)
4. **Gather user feedback** from test-drive mode users
5. **Iterate based on feedback**

---

## Questions for Consideration

1. **Should we add haptic feedback** on mobile devices during tab switches?
2. **Should tabs wrap to 2 rows** on very small screens instead of icon-only mode?
3. **Should we show tab count indicator** ("Tab 2 of 4")?
4. **Should we add tab history** (back/forward buttons in header)?
5. **Should tabs be scrollable** or always fit within viewport?

**Recommended answers:**
1. Yes (if supported by device)
2. No (wrapping reduces clarity)
3. Optional (screen reader only)
4. No (adds complexity)
5. Scrollable with snap (better UX)
