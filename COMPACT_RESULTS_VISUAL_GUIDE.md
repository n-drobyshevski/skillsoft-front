# Compact Test Results - Visual Design Guide

## ASCII Mockups (Pixel-Perfect Layouts)

### Desktop Layout (1920x1080, 900px viewport)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  HEADER SECTION (120px height)                                                 ┃
┃                                                                                 ┃
┃   ┌────────┐   ┌─────────────────┐          ┌───────────────────────────┐     ┃
┃   │   🏆   │   │     85%         │  Test    │  ⏱ 12:45  ✓ 45/50  📊 92% │     ┃
┃   │        │   │   PASSED        │  Title   │                            │     ┃
┃   └────────┘   └─────────────────┘   Here   └───────────────────────────┘     ┃
┃   (80x80)      (Score + Status)     (Truncate)         (Meta Stats)            ┃
┃                                                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  COMPETENCY LIST (600px height, scrollable if >8 items)                        ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Communication              ████████████░░░░░░  78%  🎯                 │   ┃
┃   │                            (200px progress)                            │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃   (75px height)                                                                 ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Leadership                 █████████████████░  92%  🎯                 │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Problem Solving            ██████████░░░░░░░░  54%  →                  │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Teamwork                   █████████████░░░░░  72%  ✓                  │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Adaptability               ██████████████░░░░  81%  🎯                 │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Critical Thinking          ███████████░░░░░░░  63%  ✓                  │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Time Management            █████████░░░░░░░░░  51%  →                  │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃                                                                                 ┃
┃   ┌────────────────────────────────────────────────────────────────────────┐   ┃
┃   │ Emotional Intelligence     ████████████████░░  87%  🎯                 │   ┃
┃   └────────────────────────────────────────────────────────────────────────┘   ┃
┃   (8 items = 600px, perfect fit)                                                ┃
┃                                                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  FOOTER SECTION (80px height)                                                  ┃
┃                                                                                 ┃
┃   ┌──────────────────┐                  ┌───────────────┐  ┌─────────────────┐ ┃
┃   │ ← Back to Tests  │                  │ ↻ Retry Test  │  │ More Details → │ ┃
┃   └──────────────────┘                  └───────────────┘  └─────────────────┘ ┃
┃   (140px)                               (120px)            (180px)             ┃
┃                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    TOTAL HEIGHT: 120 + 24 + 600 + 24 + 80 + 48 (padding) = 896px ✓
```

---

### Mobile Layout (390x844, 600px viewport)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  HEADER SECTION (100px)          ┃
┃                                  ┃
┃   ┌─────┐  ┌────────────┐        ┃
┃   │ 🏆  │  │    85%     │        ┃
┃   │     │  │  PASSED    │        ┃
┃   └─────┘  └────────────┘        ┃
┃   (56px)   (Score+Status)        ┃
┃                                  ┃
┃   Test Name Here                 ┃
┃   ⏱12:45  ✓45/50  📊92%          ┃
┃   (44px - title + meta)          ┃
┃                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  COMPETENCY LIST (400px scroll)  ┃
┃                                  ┃
┃  ┌──────────────────────────────┐┃
┃  │ Communication       78% 🎯   │┃
┃  │ ████████░░░                  │┃
┃  └──────────────────────────────┘┃
┃  (90px)                          ┃
┃                                  ┃
┃  ┌──────────────────────────────┐┃
┃  │ Leadership          92% 🎯   │┃
┃  │ █████████░░                  │┃
┃  └──────────────────────────────┘┃
┃                                  ┃
┃  ┌──────────────────────────────┐┃
┃  │ Problem Solving     54% →    │┃
┃  │ █████░░░░░                   │┃
┃  └──────────────────────────────┘┃
┃                                  ┃
┃  ┌──────────────────────────────┐┃
┃  │ Teamwork            72% ✓    │┃
┃  │ ███████░░░                   │┃
┃  └──────────────────────────────┘┃
┃                                  ┃
┃  ┌──────────────────────────────┐┃
┃  │ Adaptability        81% 🎯   │┃
┃  │ ████████░░                   │┃
┃  └──────────────────────────────┘┃
┃  (Scroll for more...)            ┃
┃                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  FOOTER SECTION (60px)           ┃
┃                                  ┃
┃  ┌──────────┐  ┌──────────┐     ┃
┃  │ ← Back   │  │ ↻ Retry  │     ┃
┃  └──────────┘  └──────────┘     ┃
┃  (44px height each)              ┃
┃                                  ┃
┃  ┌──────────────────────────┐   ┃
┃  │   More Details →         │   ┃
┃  └──────────────────────────┘   ┃
┃  (44px height, full width)       ┃
┃                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    TOTAL: 100+12+400+12+60+32 = 616px
    (Slightly exceeds 600px, footer may need scroll on small devices)
```

---

## Color Palette (Light Mode)

```
┌─────────────────────────────────────────────────────────────┐
│ BACKGROUND                                                  │
│ oklch(0.98 0.003 90) - Soft warm white                      │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CARD                                                        │
│ oklch(0.985 0.002 85) - Subtle elevated white               │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BORDER                                                      │
│ oklch(0.9 0.006 70) - Very soft gray                        │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASSED - Emerald (oklch-based)                              │
│ Text: oklch(0.488 0.243 143)  - Emerald 600                 │
│ ████████████████████████████████████████████████████████    │
│ BG: oklch(0.488 0.243 143 / 0.1) - Emerald 600/10%          │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FAILED - Red (oklch-based)                                  │
│ Text: oklch(0.627 0.265 29)  - Red 600                      │
│ ████████████████████████████████████████████████████████    │
│ BG: oklch(0.627 0.265 29 / 0.1) - Red 600/10%               │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EXCELLENT (≥80%) - Emerald Progress Bar                     │
│ bg-emerald-500                                              │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ GOOD (60-79%) - Blue Progress Bar                           │
│ bg-blue-500                                                 │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ REVIEW (<60%) - Amber Progress Bar                          │
│ bg-amber-500                                                │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MUTED (Progress track)                                      │
│ bg-muted                                                    │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Palette (Dark Mode)

```
┌─────────────────────────────────────────────────────────────┐
│ BACKGROUND                                                  │
│ oklch(0.145 0 0) - Deep charcoal                            │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CARD                                                        │
│ oklch(0.205 0 0) - Elevated dark gray                       │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BORDER                                                      │
│ oklch(1 0 0 / 10%) - Subtle white overlay                   │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASSED - Emerald (lighter for dark bg)                      │
│ Text: oklch(0.696 0.17 143)  - Emerald 400                  │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FAILED - Red (lighter for dark bg)                          │
│ Text: oklch(0.704 0.191 29)  - Red 400                      │
│ ████████████████████████████████████████████████████████    │
└─────────────────────────────────────────────────────────────┘
```

---

## Icon Usage Guide

### Performance Icons (Emoji)

```
🎯  Bullseye (Excellent, ≥80%)
    - Universal recognition
    - Positive emotional valence
    - High visibility

✓   Checkmark (Good, 60-79%)
    - Standard approval symbol
    - Neutral/positive sentiment
    - Clean and minimal

→   Arrow Right (Review, <60%)
    - Indicates "move forward" / "improvement needed"
    - Non-threatening (not ✗ or ⚠)
    - Action-oriented
```

### Status Icons (Lucide)

```tsx
// Passed state
<Trophy className="w-10 h-10 text-emerald-600" />
// Meaning: Achievement, success, victory

// Failed state (use emoji for neutrality)
<div className="text-4xl">📊</div>
// Meaning: Data/analysis, not failure
// Alternative: 📈 (trending up - improvement focus)
```

### Meta Stats Icons (Lucide)

```tsx
<Clock className="w-5 h-5" />        // Time spent
<CheckCircle className="w-5 h-5" />  // Questions answered
<TrendingUp className="w-5 h-5" />   // Percentile rank
```

### Action Icons (Lucide)

```tsx
<ArrowLeft className="w-4 h-4" />    // Back navigation
<RotateCcw className="w-4 h-4" />    // Retry/redo
<ChevronRight className="w-4 h-4" /> // Forward/more details
```

---

## Spacing System (Tailwind Scale)

### Desktop

```
Gap between header and list:        gap-6  (24px)
Gap between list and footer:        gap-6  (24px)
Container padding (x-axis):          px-6   (24px)
Container padding (y-axis):          py-6   (24px)
Competency item vertical gap:        space-y-4 (16px)
Icon + text gap (stats):             gap-2  (8px)
Button gap (horizontal):             gap-3  (12px)
```

### Mobile

```
Gap between header and list:        gap-3  (12px)
Gap between list and footer:        gap-3  (12px)
Container padding (x-axis):          px-4   (16px)
Container padding (y-axis):          py-4   (16px)
Competency item vertical gap:        space-y-3 (12px)
Icon + text gap (stats):             gap-1  (4px)
Button gap (horizontal):             gap-2  (8px)
Button gap (vertical, stacked):      space-y-2 (8px)
```

---

## Progress Bar Design

### Desktop (200px width)

```
┌──────────────────────────────────────────────────────┐
│ ████████████████████████████████░░░░░░░░░░░░░░░░░░  │  78%
└──────────────────────────────────────────────────────┘
    ▲                                  ▲
    Fill (emerald-500, 78% width)     Track (muted, 100%)
    Height: 8px (h-2)
    Border radius: 9999px (rounded-full)
```

### Mobile (full width)

```
┌─────────────────────────────────────────────┐
│ ████████████████████████░░░░░░░░░░░░░░░░░  │  78%
└─────────────────────────────────────────────┘
    Height: 6px (h-1.5)
    Border radius: 9999px (rounded-full)
```

### Animation Sequence

```
Frame 1 (0ms):    │                           │  0%
Frame 2 (200ms):  │ ████                      │  20%
Frame 3 (400ms):  │ ████████                  │  40%
Frame 4 (600ms):  │ ████████████              │  60%
Frame 5 (800ms):  │ ████████████████████      │  78% (final)

Easing: ease (smooth deceleration)
Duration: 800ms
Delay: index × 100ms (stagger)
```

---

## Button Design

### Desktop Variants

**Primary (View Details)**
```
┌─────────────────────────┐
│  View Detailed Analysis │  →
└─────────────────────────┘
Width: 180px
Height: 48px (size="lg")
Font: 16px, weight 500
Padding: 12px 24px
Background: hsl(var(--primary))
Hover: Subtle shadow + slight lift
```

**Secondary (Retry)**
```
┌────────────────┐
│  ↻ Retry Test  │
└────────────────┘
Width: 120px
Height: 48px
Font: 16px, weight 500
Border: 1px solid border
Background: transparent
Hover: bg-accent
```

**Tertiary (Back)**
```
┌─────────────────────┐
│  ← Back to Tests    │
└─────────────────────┘
Width: 140px
Height: 48px
Font: 16px, weight 500
Same styling as secondary
```

### Mobile Variants

**Primary (View Details)**
```
┌──────────────────────────┐
│    More Details  →       │
└──────────────────────────┘
Width: 100% (full)
Height: 44px (touch target)
Font: 12px, weight 500
```

**Secondary (Back, Retry) - Grid 2 columns**
```
┌───────────┐  ┌───────────┐
│  ← Back   │  │  ↻ Retry  │
└───────────┘  └───────────┘
Width: ~50% each (grid-cols-2)
Height: 44px
Font: 12px, weight 500
```

---

## Hover & Active States

### Desktop Hover Effects

**Competency Row:**
```css
/* Default */
border: 1px solid hsl(var(--border))

/* Hover */
border: 1px solid hsl(var(--primary) / 0.5)
transition: border-color 200ms ease
```

**Button (Primary):**
```css
/* Default */
background: hsl(var(--primary))

/* Hover */
background: hsl(var(--primary) / 0.9)
box-shadow: 0 2px 8px hsl(var(--foreground) / 0.1)
transform: translateY(-1px)
transition: all 200ms ease
```

### Mobile Touch States

**Competency Row (tap):**
```css
/* Active (pressed) */
background: hsl(var(--accent))
transform: scale(0.98)
transition: all 75ms ease-out
```

**Button (tap):**
```css
/* Active */
transform: scale(0.98)
opacity: 0.9
transition: all 75ms ease-out
```

---

## Responsive Images/Icons

### Icon Sizes

| Element | Desktop | Mobile | Lucide Class |
|---------|---------|--------|--------------|
| Trophy (header) | 40px | 28px | `w-10 h-10` / `w-7 h-7` |
| Meta stats | 20px | 12px | `w-5 h-5` / `w-3 h-3` |
| Button icons | 16px | 12px | `w-4 h-4` / `w-3 h-3` |
| Performance emoji | 20px | 18px | `text-xl` / `text-lg` |

### Emoji Rendering

Ensure consistent emoji rendering across platforms:
```css
.emoji {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  font-variant-emoji: emoji; /* CSS Fonts Module Level 4 */
}
```

---

## Print Stylesheet (Bonus)

```css
@media print {
  .CompactTestResults {
    /* Remove animations for print */
    * {
      animation: none !important;
      transition: none !important;
    }

    /* Ensure single page print */
    max-height: none;
    overflow: visible;

    /* Hide buttons (not useful in print) */
    footer {
      display: none;
    }

    /* Ensure progress bars print correctly */
    .progress-bar {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
}
```

---

## Loading State (Initial Render)

While test result is being fetched:

```tsx
<div className="flex items-center justify-center h-screen">
  <div className="text-center space-y-4">
    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
    <p className="text-muted-foreground">Calculating your results...</p>
  </div>
</div>
```

---

## Error State (Failed to Load Results)

```tsx
<div className="flex items-center justify-center h-screen p-6">
  <div className="text-center space-y-4 max-w-md">
    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
    <h2 className="text-xl font-bold">Unable to Load Results</h2>
    <p className="text-muted-foreground">
      We couldn't retrieve your test results. Please try again.
    </p>
    <Button onClick={() => window.location.reload()}>
      Retry
    </Button>
  </div>
</div>
```

---

## Accessibility Annotations

### Focus Order

```
1. [Skip to results] (optional, if navigation present)
2. Back button
3. Retry button (if present)
4. View Details button (if present)
5. (Tab traps at footer, doesn't enter competency list - not interactive)
```

### ARIA Labels

```tsx
// Header
<div role="status" aria-live="polite" aria-atomic="true">
  {passed ? 'Test passed with' : 'Test score:'} {overallPercentage}%
</div>

// Competency list
<div role="list" aria-label="Competency performance breakdown">
  {competencyScores.map(comp => (
    <div
      role="listitem"
      aria-label={`${comp.competencyName}: ${comp.percentage} percent, ${
        comp.percentage >= 80 ? 'excellent' :
        comp.percentage >= 60 ? 'good' : 'needs improvement'
      }`}
    >
      {/* Visual content */}
    </div>
  ))}
</div>

// Buttons
<Button aria-label="Return to test list">Back to Tests</Button>
<Button aria-label="Retake this test">Retry Test</Button>
<Button aria-label="View detailed competency analysis">
  View Detailed Analysis
</Button>
```

### Screen Reader Announcements

On mount:
```
"Test results loaded. You scored 85 percent and passed.
8 competencies evaluated. Use Tab to navigate actions."
```

---

## Performance Metrics Target

| Metric | Target | Reasoning |
|--------|--------|-----------|
| First Contentful Paint (FCP) | <1.0s | Instant feedback on results |
| Largest Contentful Paint (LCP) | <1.5s | Header + score visible quickly |
| Time to Interactive (TTI) | <2.0s | Buttons clickable within 2s |
| Cumulative Layout Shift (CLS) | <0.1 | No layout jumping during animations |

---

## Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14.1+ | Framer Motion may need polyfill |
| Edge | 90+ | Full support |
| Mobile Safari (iOS) | 14+ | Test on actual devices |
| Chrome Mobile (Android) | 90+ | Full support |

---

## Component File Size

**CompactTestResults.tsx:**
- TypeScript source: ~12KB
- Minified JS: ~5KB
- Gzipped: ~2KB

**Dependencies (already in project):**
- Framer Motion: Shared with test player
- Lucide React: Tree-shaken icons (~500 bytes per icon)
- shadcn/ui components: Button already used

**Total incremental bundle size:** ~3-4KB (negligible)

---

## Future A/B Test Ideas

1. **Trophy vs. Medal:** Which icon feels more rewarding?
2. **Emoji vs. Text labels:** "Excellent" vs. "🎯"
3. **Vertical vs. Horizontal layout:** Single column vs. dual column
4. **Detailed view:** Modal vs. separate page
5. **Celebration animation:** Confetti on pass vs. no animation

---

## Figma/Design Tool Export

If creating in Figma:
1. Create 2 artboards: Desktop (1920x1080), Mobile (390x844)
2. Use Auto Layout for responsive behavior
3. Components: Header, CompetencyRow, Footer
4. Variants: Passed/Failed, 3-8 items
5. Interactive prototype: Click "View Details" → detailed modal

Export settings:
- SVG for icons (Lucide)
- PNG @2x for mockups
- CSS variables for colors (oklch format)

---

**Visual Guide Complete** ✓

This document provides pixel-perfect ASCII mockups, color swatches, spacing values, and visual specifications to complement the production code in `CompactTestResults.tsx`.
