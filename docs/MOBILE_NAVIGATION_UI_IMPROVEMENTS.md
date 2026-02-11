# Mobile Navigation System UI Improvements

**Document Version:** 1.0
**Date:** 2025-12-28
**Scope:** Bottom Navigation Bar, Bottom Sheet, Mobile Headers
**Design References:** Linear, Notion, Instagram, iOS Human Interface Guidelines, Material Design 3

---

## Executive Summary

This document proposes concrete UI improvements for the SkillSoft mobile navigation system, focusing on:
1. Vertical space optimization (reclaiming ~12-16px)
2. Navigation efficiency improvements (fewer taps, better affordances)
3. Enhanced micro-interactions and visual feedback
4. Thumb-zone ergonomics optimization

---

## 1. Bottom Navigation Bar Redesign

### Current State Analysis
```
Height: 56px (h-14)
Touch Targets: 48px min-height (WCAG AAA)
Background: bg-background/95 backdrop-blur-lg
Items: 4-5 icons with labels + "More" overflow
Active State: bg-primary/10, text-primary
```

### Proposed Changes

#### 1.1 Height Optimization: 56px to 48px

**Rationale:**
- iOS Tab Bar: 49pt (approximately 49px)
- Material Design 3: 80dp but recommends 64dp for compact
- Instagram/Linear: 44-48px range
- Current 56px wastes 8-12px that could display content

**New Specification:**
```css
/* Container */
.mobile-bottom-nav {
  height: 48px;                    /* Reduced from 56px */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Touch Targets (maintain WCAG AAA) */
.nav-item {
  min-height: 44px;               /* Apple HIG minimum */
  min-width: 64px;                /* Wider for thumb precision */
  padding: 6px 12px;              /* Tighter vertical padding */
}
```

**Visual:**
```
Before: |----56px----|
After:  |---48px---|
Saved:  8px of vertical space
```

#### 1.2 Icon-Only vs Icon+Label Approach

**Recommendation: Adaptive Layout**

| Screen Width | Approach | Rationale |
|--------------|----------|-----------|
| < 360px | Icons only | Space critical, labels truncate |
| 360-414px | Icon + Label | Standard mobile, balanced |
| > 414px | Icon + Label (expanded) | Tablets, generous space |

**Implementation:**
```tsx
// Responsive labels with container queries
<nav className="@container">
  <Link className="flex flex-col items-center gap-0.5">
    <Icon className="size-5" />
    <span className="text-[10px] @[360px]:block hidden">
      {label}
    </span>
  </Link>
</nav>
```

**Icon Sizing:**
```css
/* Current */
.nav-icon { width: 20px; height: 20px; }

/* Proposed: Slight increase for icon-only mode */
.nav-icon {
  width: 22px;
  height: 22px;
  stroke-width: 1.75; /* Slightly thinner for elegance */
}

/* When label hidden, icon is hero */
@container (max-width: 360px) {
  .nav-icon {
    width: 24px;
    height: 24px;
  }
}
```

#### 1.3 Active State Indicators

**Current:** Background highlight (bg-primary/10)

**Proposed Options (Ranked by Preference):**

1. **Pill Indicator (Recommended for SkillSoft)**
```css
.nav-item-active {
  position: relative;
}

.nav-item-active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: var(--primary);
  animation: indicator-appear 200ms ease-out;
}

@keyframes indicator-appear {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}
```

2. **Top Line Indicator (iOS Style)**
```css
.nav-item-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: var(--primary);
  border-radius: 0 0 2px 2px;
}
```

3. **Glow Effect (Modern/Premium)**
```css
.nav-item-active .nav-icon {
  filter: drop-shadow(0 0 4px var(--primary));
  color: var(--primary);
}
```

**Recommended Combination:**
- Active icon color: `text-primary`
- Active label: `font-semibold`
- Dot indicator below: 4px pill
- Subtle scale on active: `scale-[1.02]`

#### 1.4 Gesture Affordances

**Swipe-Up Indicator for Bottom Sheet:**
```tsx
// Visual hint above "More" button
<button className="relative">
  <MoreHorizontal />
  <span className="absolute -top-1 left-1/2 -translate-x-1/2">
    <ChevronUp className="size-3 text-muted-foreground/50 animate-bounce-subtle" />
  </span>
</button>
```

**Swipe-Up Animation:**
```css
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-2px); opacity: 0.8; }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}
```

**Haptic Feedback Integration:**
```tsx
// Add haptic on nav switch
const handleNavigation = (href: string) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // Subtle tap feedback
  }
  router.push(href);
};
```

#### 1.5 Scroll-Based Dynamic Behavior

**Hide on Scroll Down, Show on Scroll Up (Instagram Pattern):**

```tsx
// Hook implementation
function useHideOnScroll() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          // Only trigger if scroll delta > threshold (prevents jitter)
          if (Math.abs(delta) > 10) {
            setIsVisible(delta < 0 || currentScrollY < 100);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isVisible;
}
```

**CSS Transition:**
```css
.mobile-bottom-nav {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-bottom-nav.hidden {
  transform: translateY(100%);
}
```

**Configuration:**
- Scroll threshold: 10px (prevents false triggers)
- Show immediately when scrolling up
- Hide after 50px scroll down
- Always visible at page top (< 100px)

---

## 2. Bottom Sheet Enhancement

### Current State Analysis
```
Component: Radix Dialog-based Sheet
Side: bottom
Max Height: 85dvh
Border Radius: rounded-t-xl (12px)
Drag Handle: w-10 h-1 (40x4px)
Animation: slide-in/slide-out
```

### Proposed Improvements

#### 2.1 Multi-Snap Point System

**Snap Point Configuration:**
```typescript
type SnapPoint = 'peek' | 'half' | 'full' | 'closed';

const SNAP_POINTS = {
  peek: 25,     // 25% - Quick actions, minimal info
  half: 55,     // 55% - Standard content view
  full: 92,     // 92% - Full sheet (leaves status bar visible)
  closed: 0
} as const;
```

**Implementation with Framer Motion:**
```tsx
const [snapPoint, setSnapPoint] = useState<SnapPoint>('half');

const snapPointY = useMemo(() => {
  const vh = window.innerHeight;
  return vh - (vh * SNAP_POINTS[snapPoint] / 100);
}, [snapPoint]);

<motion.div
  drag="y"
  dragConstraints={{
    top: window.innerHeight * 0.08, // 92% open
    bottom: window.innerHeight * 0.75 // 25% peek
  }}
  dragElastic={0.1}
  onDragEnd={(_, info) => {
    const velocity = info.velocity.y;
    const position = info.point.y / window.innerHeight;

    // Velocity-based snap
    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        // Swiping down - go smaller or close
        if (snapPoint === 'peek') onClose();
        else setSnapPoint(snapPoint === 'full' ? 'half' : 'peek');
      } else {
        // Swiping up - go larger
        setSnapPoint(snapPoint === 'peek' ? 'half' : 'full');
      }
      return;
    }

    // Position-based snap (find nearest)
    if (position < 0.3) setSnapPoint('full');
    else if (position < 0.6) setSnapPoint('half');
    else if (position < 0.85) setSnapPoint('peek');
    else onClose();
  }}
  animate={{ y: snapPointY }}
  transition={{
    type: 'spring',
    damping: 30,
    stiffness: 400
  }}
/>
```

#### 2.2 Enhanced Drag Handle

**Current:** 40x4px rounded bar

**Proposed: Interactive, Semantic Handle**
```tsx
<div
  className={cn(
    "relative w-full py-3 cursor-grab active:cursor-grabbing",
    "touch-manipulation select-none"
  )}
  onPointerDown={(e) => dragControls.start(e)}
>
  {/* Visual Handle */}
  <div className={cn(
    "mx-auto w-12 h-1.5 rounded-full",
    "bg-muted-foreground/30",
    "transition-all duration-150",
    // Visual feedback on grab
    "active:bg-muted-foreground/50 active:w-16"
  )} />

  {/* Invisible tap target (larger than visual) */}
  <div className="absolute inset-x-0 -top-2 -bottom-2" />
</div>
```

**Handle Styling by State:**
```css
/* Default */
.drag-handle {
  width: 48px;
  height: 6px;
  background: oklch(0.6 0 0 / 0.3);
  border-radius: 3px;
  transition: all 150ms ease-out;
}

/* Active/Dragging */
.drag-handle:active {
  width: 64px;
  background: oklch(0.6 0 0 / 0.5);
}

/* At full height - hint to pull down */
.sheet-full .drag-handle {
  background: oklch(0.6 0 0 / 0.4);
}
```

#### 2.3 Content Layout for Menu Items

**Current:** List with icon + label + description

**Proposed: Grid-Based Quick Actions**
```tsx
// For "More" menu - max 6 items visible
<div className="grid grid-cols-3 gap-3 p-4">
  {moreMenuItems.slice(0, 6).map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-2 p-3",
        "rounded-xl bg-muted/50",
        "min-h-[80px]", // Touch-friendly height
        "active:scale-95 active:bg-muted",
        "transition-all duration-150"
      )}
    >
      <div className={cn(
        "size-10 rounded-full",
        "flex items-center justify-center",
        "bg-primary/10"
      )}>
        <item.icon className="size-5 text-primary" />
      </div>
      <span className="text-xs font-medium text-center line-clamp-2">
        {item.label}
      </span>
    </Link>
  ))}
</div>
```

**List Layout for Deeper Navigation:**
```tsx
// When more than 6 items or settings-type content
<div className="divide-y divide-border">
  {items.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "min-h-[52px]", // 52px for comfortable touch
        "active:bg-muted/50"
      )}
    >
      <item.icon className="size-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.label}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>
      <ChevronRight className="size-4 text-muted-foreground/50" />
    </Link>
  ))}
</div>
```

#### 2.4 Sheet-Behind-Sheet Depth Effect

**Stacked Sheet Visual Treatment:**
```tsx
// When opening a nested sheet
<motion.div
  className="absolute inset-0"
  initial={{ scale: 1, y: 0 }}
  animate={{
    scale: isNested ? 0.95 : 1,
    y: isNested ? -16 : 0,
    borderRadius: isNested ? '16px' : '0px'
  }}
  transition={{ duration: 0.3 }}
/>
```

**Backdrop Depth:**
```css
/* Parent sheet when child is open */
.sheet-parent-nested {
  transform: scale(0.95) translateY(-16px);
  border-radius: 16px;
  opacity: 0.8;
  pointer-events: none;
}

/* Backdrop layers */
.backdrop-depth-1 { background: rgba(0, 0, 0, 0.5); }
.backdrop-depth-2 { background: rgba(0, 0, 0, 0.65); }
```

---

## 3. Mobile Header Optimization

### Current State Analysis

**SiteHeader:**
- Height: 56px (h-14)
- Contains: Sidebar trigger, title, breadcrumbs (desktop), actions
- Mobile: Condensed with truncated title

**SessionHeader:**
- Sticky at top
- Contains: Exit, progress bar, timer, test-drive badge
- Uses dark theme (neutral-950)

**EnhancedSessionHeader:**
- Two-row layout on mobile
- Color-segmented progress
- Optional navigation dots

### Proposed Improvements

#### 3.1 Minimum Viable Height

**SiteHeader: 48px to 44px**
```css
.site-header {
  height: 44px;  /* Reduced from 56px */
  min-height: 44px;
}

/* Compact elements */
.site-header-title {
  font-size: 14px;
  font-weight: 600;
}

.site-header-action {
  width: 36px;
  height: 36px;
}
```

**SessionHeader: Single Row Optimization**
```css
.session-header {
  padding: 8px 12px;  /* Tighter padding */
}

/* Compact timer */
.timer-compact {
  font-size: 11px;
  padding: 4px 8px;
  gap: 4px;
}

/* Progress bar inline */
.progress-inline {
  height: 3px;  /* Thinner bar */
  flex: 1;
  max-width: 120px;
}
```

**Height Comparison:**
| Header | Current | Proposed | Saved |
|--------|---------|----------|-------|
| SiteHeader | 56px | 44px | 12px |
| SessionHeader | ~56px | 44px | 12px |
| EnhancedSessionHeader | ~72px | 52px | 20px |

#### 3.2 Collapse on Scroll Pattern

**Implementation:**
```tsx
function useHeaderCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Collapse after scrolling 100px down
      if (currentY > 100 && currentY > lastScrollY.current) {
        setIsCollapsed(true);
      }

      // Expand when scrolling up or near top
      if (currentY < lastScrollY.current || currentY < 50) {
        setIsCollapsed(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isCollapsed;
}
```

**Collapsed Header State:**
```tsx
<header
  className={cn(
    "sticky top-0 z-50 transition-all duration-300",
    isCollapsed ? "h-0 overflow-hidden opacity-0" : "h-11"
  )}
>
  {/* Full header content */}
</header>

{/* Floating minimal header when collapsed */}
{isCollapsed && (
  <div className="fixed top-2 right-2 z-50 flex gap-2">
    <Badge className="bg-background/80 backdrop-blur-sm">
      {currentQuestion}/{totalQuestions}
    </Badge>
    {timeRemaining && (
      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
        {formatTime(timeRemaining)}
      </Badge>
    )}
  </div>
)}
```

#### 3.3 Essential vs Hideable Elements

**Priority Matrix:**

| Element | Priority | Collapsed Behavior |
|---------|----------|-------------------|
| Exit Button | P0 | Always visible (floating) |
| Timer | P0 | Badge overlay |
| Progress % | P1 | Badge overlay |
| Test Name | P2 | Hidden |
| Progress Bar | P2 | Hidden |
| Question Counter | P1 | Badge overlay |
| Navigation Dots | P3 | Hidden |
| Test-Drive Badge | P3 | Hidden |

**Collapsed View:**
```
[ Full Header - 52px ]
|  X  |  Test Name...  |  TD  |  12/30  |  4:32  |
|=========== Progress Bar ===========| 45% |

[ Collapsed - Floating Badges ]
                             [ 12/30 ] [ 4:32 ]
```

#### 3.4 Transparent/Blur Overlapping Content

**Glassmorphism Header:**
```css
.header-glass {
  background: oklch(0.145 0 0 / 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid oklch(1 0 0 / 0.08);
}

/* Light mode */
.header-glass-light {
  background: oklch(0.98 0.003 90 / 0.85);
  backdrop-filter: blur(12px) saturate(120%);
  border-bottom: 1px solid oklch(0 0 0 / 0.05);
}
```

**Content Peek Through:**
```tsx
<header className="relative">
  {/* Gradient fade for content visibility */}
  <div className="absolute inset-x-0 bottom-0 h-2
    bg-gradient-to-b from-transparent to-transparent
    pointer-events-none"
  />
</header>
```

---

## 4. Visual System Specifications

### 4.1 Elevation/Shadow System

**Mobile Shadow Scale:**
```css
:root {
  /* Level 0: Flush with surface */
  --shadow-0: none;

  /* Level 1: Slight lift (cards, inputs) */
  --shadow-1: 0 1px 2px oklch(0 0 0 / 0.05);

  /* Level 2: Interactive elements (buttons, dropdowns) */
  --shadow-2:
    0 1px 2px oklch(0 0 0 / 0.06),
    0 2px 4px oklch(0 0 0 / 0.04);

  /* Level 3: Floating UI (sheets, modals) */
  --shadow-3:
    0 4px 8px oklch(0 0 0 / 0.08),
    0 8px 16px oklch(0 0 0 / 0.06);

  /* Level 4: High emphasis (bottom nav, alerts) */
  --shadow-4:
    0 8px 16px oklch(0 0 0 / 0.10),
    0 16px 32px oklch(0 0 0 / 0.08);
}

/* Dark mode adjustments */
.dark {
  --shadow-1: 0 1px 2px oklch(0 0 0 / 0.2);
  --shadow-2: 0 2px 4px oklch(0 0 0 / 0.3);
  --shadow-3: 0 4px 12px oklch(0 0 0 / 0.4);
  --shadow-4: 0 8px 24px oklch(0 0 0 / 0.5);
}
```

**Component Shadow Mapping:**
| Component | Level | Notes |
|-----------|-------|-------|
| Bottom Nav | 4 | Inverse (shadow-up) |
| Bottom Sheet | 3 | Top shadow |
| Cards | 1 | Subtle lift |
| Active Button | 2 | Pressed: 1 |
| Dropdown | 3 | On open |

### 4.2 Animation Timing and Easing

**Core Easing Functions:**
```css
:root {
  /* Standard (most UI transitions) */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

  /* Decelerate (entering elements) */
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);

  /* Accelerate (exiting elements) */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);

  /* Spring (bouncy, playful) */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Smooth (subtle, refined) */
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

**Duration Scale:**
```css
:root {
  --duration-instant: 50ms;   /* Micro-feedback */
  --duration-fast: 100ms;     /* Button press */
  --duration-normal: 200ms;   /* Most transitions */
  --duration-slow: 300ms;     /* Modal/sheet open */
  --duration-slower: 500ms;   /* Complex animations */
}
```

**Animation Patterns:**
```css
/* Tap feedback */
.tap-feedback {
  transition:
    transform var(--duration-fast) var(--ease-standard),
    opacity var(--duration-fast) var(--ease-standard);
}
.tap-feedback:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* Sheet slide */
.sheet-enter {
  animation: sheet-slide-up var(--duration-slow) var(--ease-decelerate);
}
.sheet-exit {
  animation: sheet-slide-down var(--duration-normal) var(--ease-accelerate);
}

@keyframes sheet-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes sheet-slide-down {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

/* Nav item selection */
.nav-item-select {
  transition:
    color var(--duration-normal) var(--ease-smooth),
    background-color var(--duration-normal) var(--ease-smooth);
}
```

### 4.3 Color Contrast (Dark/Light)

**Bottom Navigation Colors:**
```css
/* Light Mode */
.light .bottom-nav {
  --nav-bg: oklch(0.98 0.003 90 / 0.95);
  --nav-border: oklch(0 0 0 / 0.06);
  --nav-item-default: oklch(0.45 0.01 264);
  --nav-item-active: oklch(0.35 0.15 264);
  --nav-indicator: oklch(0.35 0.15 264);
}

/* Dark Mode */
.dark .bottom-nav {
  --nav-bg: oklch(0.145 0 0 / 0.95);
  --nav-border: oklch(1 0 0 / 0.08);
  --nav-item-default: oklch(0.65 0.01 0);
  --nav-item-active: oklch(0.9 0 0);
  --nav-indicator: oklch(0.6 0.2 264);
}
```

**Contrast Ratios (WCAG AA Targets):**
| Element | Light Mode | Dark Mode | Target |
|---------|------------|-----------|--------|
| Active Icon | 7.2:1 | 12.1:1 | 4.5:1 |
| Inactive Icon | 4.8:1 | 5.2:1 | 4.5:1 |
| Labels | 7.2:1 | 12.1:1 | 4.5:1 |
| Muted Labels | 4.6:1 | 4.8:1 | 4.5:1 |

### 4.4 Focus States for Accessibility

**Keyboard Focus Ring:**
```css
.nav-item:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--background),
    0 0 0 4px oklch(0.6 0.15 264);
  border-radius: 8px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .nav-item:focus-visible {
    box-shadow:
      0 0 0 2px var(--background),
      0 0 0 4px currentColor;
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }
}
```

**Touch Focus (Ripple Effect):**
```tsx
// CSS-only ripple for touch
<button className="relative overflow-hidden">
  <span className="
    absolute inset-0
    bg-current opacity-0
    transition-opacity duration-300
    active:opacity-10
  " />
  {children}
</button>
```

---

## 5. Implementation Recommendations

### Phase 1: Quick Wins (1-2 days)
1. Reduce bottom nav height from 56px to 48px
2. Add pill indicator for active state
3. Implement tap feedback animations
4. Add focus-visible states

### Phase 2: Enhanced Interactions (3-5 days)
1. Scroll-based hide/show for bottom nav
2. Multi-snap point bottom sheet
3. Enhanced drag handle
4. Header collapse on scroll

### Phase 3: Polish (2-3 days)
1. Haptic feedback integration
2. Dark/light mode color refinement
3. Animation timing adjustments
4. Accessibility audit and fixes

### Phase 4: Advanced Features (Optional)
1. Sheet-behind-sheet depth effect
2. Gesture-based navigation hints
3. Adaptive icon-only mode
4. Performance optimization

---

## 6. Component Code Examples

### 6.1 Optimized Bottom Navigation

```tsx
// mobile-bottom-nav-v2.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLensStore } from '@/store/lens-store';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface MobileBottomNavV2Props {
  items: NavItem[];
  moreItems?: NavItem[];
  hidden?: boolean;
  className?: string;
}

export function MobileBottomNavV2({
  items,
  moreItems,
  hidden = false,
  className
}: MobileBottomNavV2Props) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  // Scroll-based visibility
  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) > 10) {
        setIsVisible(delta < 0 || currentY < 100);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile || hidden) return null;

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          y: isVisible ? 0 : 100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className={cn(
          // Positioning
          'fixed bottom-0 inset-x-0 z-50',
          // Reduced height: 48px
          'h-12',
          // Glassmorphism
          'bg-background/95 backdrop-blur-lg',
          'border-t border-border/50',
          // Safe area
          'pb-safe',
          // Shadow up
          'shadow-[0_-4px_12px_rgba(0,0,0,0.1)]',
          className
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-full px-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'min-w-[64px] min-h-[44px]',
                  'rounded-lg',
                  'transition-colors duration-200',
                  'touch-manipulation select-none',
                  // Tap feedback
                  'active:scale-[0.97] active:opacity-90',
                  // Colors
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'size-[22px]',
                    active && 'stroke-[2.5]'
                  )}
                />
                <span className={cn(
                  'text-[10px] mt-0.5',
                  active ? 'font-semibold' : 'font-medium'
                )}>
                  {item.label}
                </span>

                {/* Pill indicator */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Spacer */}
      <div className="h-12 pb-safe md:hidden" aria-hidden="true" />
    </>
  );
}
```

### 6.2 Enhanced Bottom Sheet

```tsx
// bottom-sheet-v2.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

type SnapPoint = 'peek' | 'half' | 'full';

const SNAP_HEIGHTS: Record<SnapPoint, number> = {
  peek: 25,
  half: 55,
  full: 92,
};

interface BottomSheetV2Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialSnap?: SnapPoint;
  snapPoints?: SnapPoint[];
  title?: string;
}

export function BottomSheetV2({
  isOpen,
  onClose,
  children,
  initialSnap = 'half',
  snapPoints = ['peek', 'half', 'full'],
  title,
}: BottomSheetV2Props) {
  const [currentSnap, setCurrentSnap] = React.useState<SnapPoint>(initialSnap);
  const dragControls = useDragControls();
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const getSnapY = React.useCallback((snap: SnapPoint) => {
    if (typeof window === 'undefined') return 0;
    return window.innerHeight * (1 - SNAP_HEIGHTS[snap] / 100);
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = info.point.y;
    const vh = window.innerHeight;

    // Velocity-based
    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        // Down
        const idx = snapPoints.indexOf(currentSnap);
        if (idx === 0) onClose();
        else setCurrentSnap(snapPoints[idx - 1]);
      } else {
        // Up
        const idx = snapPoints.indexOf(currentSnap);
        if (idx < snapPoints.length - 1) {
          setCurrentSnap(snapPoints[idx + 1]);
        }
      }
      return;
    }

    // Position-based
    const position = currentY / vh;
    if (position > 0.85) {
      onClose();
    } else if (position > 0.6) {
      setCurrentSnap('peek');
    } else if (position > 0.35) {
      setCurrentSnap('half');
    } else {
      setCurrentSnap('full');
    }
  };

  React.useEffect(() => {
    if (isOpen) setCurrentSnap(initialSnap);
  }, [isOpen, initialSnap]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: getSnapY(currentSnap) }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{
              top: getSnapY('full'),
              bottom: window?.innerHeight || 0,
            }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50',
              'bg-background rounded-t-2xl',
              'shadow-[0_-4px_20px_rgba(0,0,0,0.15)]',
              'max-h-[92vh]',
              'touch-none'
            )}
            style={{ height: '92vh' }}
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className={cn(
                'w-12 h-1.5 rounded-full',
                'bg-muted-foreground/30',
                'transition-all duration-150',
                'active:w-16 active:bg-muted-foreground/50'
              )} />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 pb-3 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## 7. Testing Checklist

### Accessibility
- [ ] Touch targets >= 44px
- [ ] Focus visible states work
- [ ] Screen reader announces navigation
- [ ] Color contrast >= 4.5:1
- [ ] Reduced motion respected

### Performance
- [ ] Animations run at 60fps
- [ ] No layout shifts during navigation
- [ ] Sheet snap feels responsive
- [ ] Scroll hide/show is smooth

### Cross-Device
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone Plus/Max (428px)
- [ ] Android (360-412px range)
- [ ] Notched devices (safe areas)

### Interactions
- [ ] Tap feedback visible
- [ ] Active states clear
- [ ] Sheet snapping predictable
- [ ] Scroll behavior consistent

---

## Appendix: Reference Measurements

### Competitive Analysis

| App | Bottom Nav Height | Sheet Radius | Active Indicator |
|-----|-------------------|--------------|------------------|
| Instagram | 44px | 16px | Filled icon |
| Linear | 48px | 20px | Blue pill |
| Notion | 52px | 16px | Bold label |
| iOS Apps | 49pt | 12px | Tinted icon |
| Twitter/X | 48px | 16px | Blue dot |
| Figma | 44px | 12px | Purple line |

### Recommended Values for SkillSoft

| Property | Value | Notes |
|----------|-------|-------|
| Nav Height | 48px | Matches iOS, saves space |
| Touch Target | 44x64px | Width for precision |
| Sheet Radius | 16px | Modern, consistent |
| Icon Size | 22px | Visible without labels |
| Label Size | 10px | Readable, compact |
| Snap Points | 25/55/92% | Versatile |
| Shadow Level | 4 | Clear elevation |
