# SkillSoft Dashboard Visual Design System

## Table of Contents

1. [Overview](#overview)
2. [Widget Component System](#widget-component-system)
3. [Color Semantics](#color-semantics)
4. [Data Visualization Guidelines](#data-visualization-guidelines)
5. [Animation Strategy](#animation-strategy)
6. [Responsive Grid System](#responsive-grid-system)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Component Specifications](#component-specifications)
9. [Code Examples](#code-examples)

---

## Overview

This document defines the visual design system for SkillSoft's dashboard interfaces. It ensures consistency across all dashboard widgets while maintaining flexibility for different content types and use cases.

### Design Principles

1. **Clarity First**: Information hierarchy should be immediately apparent
2. **Consistent Density**: Uniform spacing and visual weight across widgets
3. **Progressive Disclosure**: Show summary first, details on demand
4. **Responsive by Default**: Mobile-first approach with graceful scaling
5. **Accessible Always**: WCAG 2.1 AA compliance minimum

### Tech Stack Context

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

---

## Widget Component System

### Widget Types

The dashboard uses five primary widget types, each with consistent structure but specialized content areas.

#### 1. Stats Widget

Displays single metrics with optional trends, comparisons, and sparklines.

**Variants:**
- `single`: Single metric with icon
- `comparison`: Two metrics side-by-side
- `trend`: Metric with trend indicator and sparkline
- `progress`: Metric with progress bar

**Structure:**
```
+----------------------------------+
| [Icon]  Title         [Action]  |
|         Subtitle                 |
+----------------------------------+
|                                  |
|   [Primary Value]               |
|   [Trend Badge] [Description]   |
|                                  |
+----------------------------------+
```

**Tailwind Classes:**
```tsx
// Base container
"bg-card text-card-foreground rounded-xl border py-6 shadow-sm"

// Icon container (9x9 with muted background)
"w-10 h-10 rounded-xl flex items-center justify-center bg-muted"

// Primary value
"text-xl md:text-2xl font-bold tracking-tight tabular-nums"

// Trend badge (positive)
"text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950"

// Trend badge (negative)
"text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
```

#### 2. Chart Widget

Contains data visualizations with consistent axis styling and tooltips.

**Variants:**
- `bar`: Horizontal or vertical bar charts
- `line`: Trend lines with area fill
- `scatter`: Distribution plots
- `gauge`: Semi-circular or circular progress
- `radar`: Multi-axis comparison

**Structure:**
```
+----------------------------------+
| [Icon]  Title         [Actions] |
|         Subtitle                 |
+----------------------------------+
|                                  |
|   [Chart Area - min 200px]      |
|                                  |
+----------------------------------+
|   [Legend - if needed]          |
+----------------------------------+
```

**Chart Container Classes:**
```tsx
// Container with theme-aware styling
"[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground"
"[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50"
"[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border"
```

#### 3. List Widget

Displays collections of items with consistent row structure.

**Variants:**
- `simple`: Icon + text rows
- `action`: Rows with trailing action buttons
- `activity`: Avatar + action description + timestamp
- `ranked`: Numbered items with values

**Structure:**
```
+----------------------------------+
| [Icon]  Title         [View All]|
+----------------------------------+
| [Row 1]                    [>]  |
| [Row 2]                    [>]  |
| [Row 3]                    [>]  |
+----------------------------------+
```

**Row Classes:**
```tsx
// Action row with hover state
"flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"

// Activity row with divider
"flex items-start gap-3 py-2.5 divide-y divide-border/50"
```

#### 4. Action Widget

Contains primary CTAs and quick action buttons.

**Variants:**
- `primary`: Highlighted CTA card
- `grid`: Grid of action buttons
- `inline`: Horizontal action row

**Structure:**
```
+----------------------------------+
|  [Icon Container]               |
|                                  |
|  Title                          |
|  Description                    |
|                                  |
|  [Primary Button]               |
+----------------------------------+
```

**CTA Card Classes:**
```tsx
// Gradient background
"bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 border-primary/20"

// Icon container
"w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"
```

#### 5. Status Widget

Shows health indicators, progress tracking, and system status.

**Variants:**
- `health`: Circular progress with status text
- `multi-progress`: Multiple stacked progress bars
- `status-grid`: Grid of status indicators

**Structure:**
```
+----------------------------------+
| [Icon]  Title                   |
+----------------------------------+
|                                  |
|   [Circular Progress]           |
|   [Status Label]                |
|                                  |
+----------------------------------+
|   [Breakdown Legend]            |
+----------------------------------+
```

---

## Color Semantics

### Primary Semantic Colors

| Semantic | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| Success | `emerald-600` | `emerald-400` | Healthy metrics, passing scores, positive trends |
| Warning | `amber-600` | `amber-400` | Attention needed, borderline values |
| Error | `red-600` | `red-400` | Critical issues, failing scores, negative trends |
| Info | `blue-600` | `blue-400` | Informational content, neutral highlights |

### Background/Container Colors

```tsx
// Success container
"bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"

// Warning container
"bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"

// Error container
"bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"

// Info container
"bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"

// Neutral container
"bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
```

### Psychometrics-Specific Colors

Used exclusively in the psychometrics dashboard for data quality indicators:

| Status | Light Mode | Dark Mode | Usage |
|--------|------------|-----------|-------|
| Active/Valid | `emerald-600` | `emerald-400` | Active items, valid measurements |
| Probation | `amber-600` | `amber-400` | Collecting data, pending validation |
| Flagged | `orange-600` | `orange-400` | Needs review, quality issues |
| Retired | `red-600` | `red-400` | Excluded from use |
| Reliable | `emerald-600` | `emerald-400` | Alpha >= 0.7 |
| Acceptable | `amber-600` | `amber-400` | Alpha 0.6-0.7 |
| Unreliable | `red-600` | `red-400` | Alpha < 0.6 |
| Insufficient | `gray-600` | `gray-400` | Not enough data |

### Role-Specific Accent Colors (Lens System)

| Role/Lens | Primary | Glow Animation | Usage |
|-----------|---------|----------------|-------|
| User/Personal | `emerald-500` | `lens-glow-emerald` | Personal dashboard, employee view |
| Content/Editor | `blue-500` | `lens-glow-blue` | Content management, editing |
| Admin | `violet-500` | `lens-glow-violet` | Admin panels, system management |

### Chart Color Palette

```tsx
// Chart config colors (from globals.css)
const chartColors = {
  chart1: "oklch(0.65 0.12 258)",  // Blue
  chart2: "oklch(0.8 0.14 97)",    // Lime/Green
  chart3: "oklch(0.72 0.14 143)",  // Teal
  chart4: "oklch(0.7 0.16 25)",    // Orange
  chart5: "oklch(0.68 0.15 295)",  // Purple
};

// For Recharts - use CSS variables
const chartConfig = {
  score: { color: "hsl(var(--primary))" },
  target: { color: "hsl(var(--muted-foreground))" },
  gap: { color: "hsl(var(--destructive))" },
};
```

---

## Data Visualization Guidelines

### Chart Type Selection

| Data Type | Recommended Chart | Alternative |
|-----------|------------------|-------------|
| Single category comparison | Horizontal Bar | Vertical Bar |
| Trend over time | Line with Area | Sparkline |
| Part-to-whole | Donut/Pie | Stacked Bar |
| Multi-axis comparison | Radar | Grouped Bar |
| Distribution | Scatter | Histogram |
| Progress/Score | Gauge | Progress Bar |
| Gap analysis | Horizontal Bar (dual) | Bullet Chart |

### Axis Styling

```tsx
// X-Axis / Category Axis
<XAxis
  dataKey="name"
  tick={{ fill: "hsl(var(--foreground))", fontSize: isMobile ? 10 : 12 }}
  tickLine={false}
  axisLine={{ stroke: "hsl(var(--border))" }}
/>

// Y-Axis / Value Axis
<YAxis
  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: isMobile ? 10 : 12 }}
  tickLine={false}
  axisLine={false}
  domain={[0, 100]} // For percentage values
/>

// Grid Lines
<CartesianGrid
  strokeDasharray="3 3"
  horizontal={true}
  vertical={false}
  stroke="hsl(var(--border))"
/>
```

### Tooltip Pattern

```tsx
// Standard tooltip styling
<Tooltip
  cursor={{ fill: 'transparent' }}
  contentStyle={{
    backgroundColor: "hsl(var(--background))",
    borderColor: "hsl(var(--border))",
    color: "hsl(var(--foreground))",
    fontSize: isMobile ? "12px" : "14px",
    padding: isMobile ? "8px" : "12px",
    borderRadius: "var(--radius)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
  labelStyle={{
    fontWeight: 600,
    marginBottom: "4px",
  }}
/>

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="font-medium text-sm text-foreground mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">{entry.name}:</span>
          <span className="text-lg font-bold tabular-nums">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}
```

### Legend Placement

- **Bottom**: Default for most charts (horizontal, centered)
- **Right**: For charts with many categories
- **None**: For small charts or when labels are on chart

```tsx
<Legend
  wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
  iconSize={isMobile ? 10 : 14}
  layout="horizontal"
  verticalAlign="bottom"
  align="center"
/>
```

### Mobile Chart Adaptations

```tsx
function useChartConfig() {
  const isMobile = useIsMobile();

  return {
    height: isMobile ? 220 : 300,
    fontSize: isMobile ? 10 : 12,
    margin: isMobile
      ? { top: 5, right: 10, left: 5, bottom: 5 }
      : { top: 5, right: 30, left: 20, bottom: 5 },
    barSize: isMobile ? 14 : 20,
    labelMaxLength: isMobile ? 12 : 20,
  };
}
```

---

## Animation Strategy

### Motion Variants

```tsx
// Standard entry animation
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Container with staggered children
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08
    }
  }
};

// Scale entrance
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

// Fade only (for simpler transitions)
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};
```

### Widget Entry Animations

```tsx
// Apply to widget container
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-40px" }}
  variants={fadeInUp}
>
  <Card>...</Card>
</motion.div>

// For staggered grid items
<motion.div variants={staggerContainer}>
  {items.map((item, index) => (
    <motion.div key={item.id} variants={fadeInUp}>
      <WidgetCard {...item} />
    </motion.div>
  ))}
</motion.div>
```

### Data Loading Transitions

```tsx
// Skeleton shimmer (from globals.css)
.loading-modern::after {
  animation: loading-shimmer 1.5s infinite;
}

// Progress bar shimmer
.progress-shimmer::after {
  animation: shimmer 2s infinite;
}

// Chart data transition
<Radar
  isAnimationActive={!prefersReducedMotion}
  animationDuration={800}
  animationEasing="ease-out"
/>
```

### Micro-interactions

```tsx
// Hover lift
<motion.div
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.99 }}
  className="transition-shadow hover:shadow-md"
>
  ...
</motion.div>

// Button press
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  ...
</motion.button>

// Row highlight
<motion.div
  whileHover={{ x: 2 }}
  className="hover:bg-muted/50 transition-colors"
>
  ...
</motion.div>
```

### Reduced Motion Support

```tsx
// Hook usage
const prefersReducedMotion = useReducedMotion();

const motionProps = prefersReducedMotion
  ? { initial: "visible", animate: "visible" }
  : { initial: "hidden", whileInView: "visible", viewport: { once: true } };

// CSS fallback (from globals.css)
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Timing Reference

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Entry fade | 300-400ms | easeOut |
| Stagger delay | 60ms | - |
| Hover transitions | 200ms | ease |
| Press feedback | 75ms | ease-out |
| Chart animations | 800ms | ease-out |
| Modal transitions | 200ms | easeInOut |

---

## Responsive Grid System

### Breakpoint Definitions

```tsx
// Tailwind defaults (can be customized in tailwind.config.js)
const breakpoints = {
  sm: "640px",   // Mobile landscape
  md: "768px",   // Tablet portrait
  lg: "1024px",  // Tablet landscape / Small desktop
  xl: "1280px",  // Desktop
  "2xl": "1536px", // Large desktop
};
```

### Column System

| Breakpoint | Columns | Gutter | Container Padding |
|------------|---------|--------|-------------------|
| Mobile (<640px) | 4 | 12px | 16px |
| Tablet (640-1024px) | 8 | 16px | 24px |
| Desktop (>1024px) | 12 | 24px | 32px |

### Widget Span Guidelines

| Widget Type | Mobile | Tablet | Desktop |
|-------------|--------|--------|---------|
| Stats (small) | full | span-4 | span-3 |
| Stats (medium) | full | span-4 | span-4 |
| Chart (small) | full | span-4 | span-4 |
| Chart (large) | full | full | span-8 |
| List | full | span-4 | span-4 |
| Action CTA | full | span-4 | span-4 |

### Tailwind Grid Classes

```tsx
// Main dashboard grid
<div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
  {/* Left column - 8 of 12 on desktop */}
  <div className="lg:col-span-8 space-y-6">
    ...
  </div>

  {/* Right column - 4 of 12 on desktop */}
  <div className="lg:col-span-4 space-y-6">
    ...
  </div>
</div>

// Stats cards grid
<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
  <StatsCard />
  <StatsCard />
  <StatsCard />
  <StatsCard />
</div>

// Flexible card layout
<div className="flex flex-wrap gap-3 sm:gap-4">
  <Card className="flex-1 min-w-[280px]">...</Card>
  <Card className="flex-1 min-w-[280px]">...</Card>
</div>
```

### Widget Priority for Reordering

On smaller screens, widgets stack in priority order:

1. **Critical**: Pending actions, alerts, health status
2. **Primary**: Key metrics, main chart
3. **Secondary**: Activity feed, quick actions
4. **Tertiary**: Supporting charts, detailed stats

```tsx
// Use order utilities for priority
<div className="order-1 lg:order-none"> {/* First on mobile */}
  <PendingActionsWidget />
</div>
<div className="order-2 lg:order-none">
  <StatsCards />
</div>
<div className="order-3 lg:order-none">
  <MainChart />
</div>
```

### Container Queries

```tsx
// Enable container queries on parent
<div className="@container">
  <Card className="@container/card">
    {/* Responsive based on container width */}
    <CardTitle className="text-lg @[250px]/card:text-xl @[400px]/card:text-2xl">
      ...
    </CardTitle>
  </Card>
</div>
```

---

## Accessibility Guidelines

### Color Contrast Requirements

- **Normal text**: 4.5:1 minimum (AA)
- **Large text (18px+ or 14px+ bold)**: 3:1 minimum
- **UI components and graphics**: 3:1 minimum
- **Focus indicators**: 3:1 against adjacent colors

### Focus Indicators

```tsx
// Global focus styles (from globals.css)
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

// Enhanced focus with ring
"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Card focus
"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
```

### Screen Reader Patterns for Charts

```tsx
// Radar chart with SR description
<div role="img" aria-label={ariaLabel}>
  <ResponsiveContainer>
    <RadarChart>...</RadarChart>
  </ResponsiveContainer>

  {/* Screen reader only: detailed data */}
  <div className="sr-only">
    <h3>Detailed results:</h3>
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}: {item.value}%</li>
      ))}
    </ul>
  </div>
</div>

// Stats card SR enhancement
<CardTitle>
  {title}
  <span className="sr-only">, value is {value}</span>
</CardTitle>
```

### Keyboard Navigation

```tsx
// Ensure all interactive elements are focusable
<motion.div
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="focus-visible:ring-2 focus-visible:ring-ring"
>
  ...
</motion.div>

// Skip link for dashboard
<a
  href="#main-content"
  className="skip-link"
>
  Skip to main content
</a>
```

### Touch Targets

```tsx
// Minimum 44x44px for touch targets
"min-h-[44px] min-w-[44px]"

// Or use utility class
"touch-target"

// Enhanced for primary actions
"touch-target-lg" // 48x48px
```

### Live Regions for Dynamic Content

```tsx
// Status updates
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// Error announcements
<div
  role="alert"
  aria-live="assertive"
>
  {errorMessage}
</div>
```

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  :root {
    --muted-foreground: oklch(0.30 0.015 264);
    --border: oklch(0.70 0.01 264);
  }

  /* Stronger borders */
  [data-slot="card"] {
    border-width: 2px;
  }

  /* Enhanced focus */
  :focus-visible {
    outline: 3px solid hsl(var(--ring));
  }
}
```

---

## Component Specifications

### Widget Card Base

```tsx
interface WidgetCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Size specifications
const sizeSpecs = {
  sm: {
    padding: 'p-3 sm:p-4',
    titleSize: 'text-sm',
    iconContainer: 'w-8 h-8',
    iconSize: 'w-3.5 h-3.5',
  },
  md: {
    padding: 'p-4 sm:p-6',
    titleSize: 'text-base',
    iconContainer: 'w-9 h-9',
    iconSize: 'w-4 h-4',
  },
  lg: {
    padding: 'p-5 sm:p-8',
    titleSize: 'text-lg',
    iconContainer: 'w-10 h-10',
    iconSize: 'w-5 h-5',
  },
};
```

### Stats Card Specifications

```tsx
interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ElementType;
  description?: string;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  href?: string;
  onClick?: () => void;
}
```

### Spacing Tokens

```tsx
// Widget internal spacing
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
};

// Gap between widgets
const widgetGap = {
  mobile: '1rem',    // 16px
  tablet: '1.25rem', // 20px
  desktop: '1.5rem', // 24px
};

// Container padding
const containerPadding = {
  mobile: '1rem',
  tablet: '1.5rem',
  desktop: '2rem',
};
```

### Typography Scale

```tsx
// Dashboard typography
const typography = {
  pageTitle: 'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight',
  pageSubtitle: 'text-sm sm:text-base text-muted-foreground',
  widgetTitle: 'text-base font-semibold',
  widgetSubtitle: 'text-xs text-muted-foreground',
  metricPrimary: 'text-xl md:text-2xl font-bold tabular-nums',
  metricSecondary: 'text-lg font-semibold tabular-nums',
  bodyText: 'text-sm',
  caption: 'text-xs text-muted-foreground',
  badge: 'text-xs font-medium',
};
```

### Icon Sizing

```tsx
// Consistent icon sizes
const iconSizes = {
  xs: 'w-3 h-3',     // 12px - inline with text
  sm: 'w-3.5 h-3.5', // 14px - small buttons
  md: 'w-4 h-4',     // 16px - standard
  lg: 'w-5 h-5',     // 20px - widget headers
  xl: 'w-6 h-6',     // 24px - hero elements
  '2xl': 'w-8 h-8',  // 32px - empty states
};

// Icon container sizes
const iconContainerSizes = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-9 h-9 rounded-lg',
  lg: 'w-10 h-10 rounded-xl',
  xl: 'w-11 h-11 rounded-xl',
};
```

---

## Code Examples

### Complete Stats Widget Example

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface StatsWidgetProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  href?: string;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  default: "",
  success: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20",
  warning: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
  info: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
  destructive: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  destructive: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export function StatsWidget({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  href,
  loading = false,
  className,
}: StatsWidgetProps) {
  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const content = (
    <Card className={cn(
      "h-full transition-all duration-200 group",
      variantStyles[variant],
      href && "cursor-pointer hover:shadow-md active:scale-[0.99]",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            iconStyles[variant]
          )}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-sm font-medium line-clamp-2">
            {title}
            <span className="sr-only">, value is {value}</span>
          </CardTitle>
        </div>
        {href && (
          <ArrowUpRight
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xl md:text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                trend.isPositive
                  ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950"
                  : "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-1 h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="mr-1 h-2.5 w-2.5" />
              )}
              {trend.value}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
```

### Complete Chart Widget Example

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; target?: number }>;
  viewAllHref?: string;
  loading?: boolean;
  className?: string;
}

export function ChartWidget({
  title,
  subtitle,
  data,
  viewAllHref,
  loading = false,
  className,
}: ChartWidgetProps) {
  const isMobile = useIsMobile();

  const chartConfig = {
    height: isMobile ? 220 : 280,
    fontSize: isMobile ? 10 : 12,
    barSize: isMobile ? 14 : 20,
    margin: isMobile
      ? { top: 5, right: 10, left: 5, bottom: 5 }
      : { top: 5, right: 30, left: 20, bottom: 5 },
  };

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {subtitle && (
                <CardDescription className="text-xs">{subtitle}</CardDescription>
              )}
            </div>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref}>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                View All
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ height: chartConfig.height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chartConfig.margin}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--foreground))", fontSize: chartConfig.fontSize }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) =>
                  isMobile && value.length > 10 ? `${value.slice(0, 10)}...` : value
                }
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: chartConfig.fontSize }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  fontSize: isMobile ? "12px" : "14px",
                  padding: isMobile ? "8px" : "12px",
                  borderRadius: "var(--radius)",
                }}
              />
              {data[0]?.target !== undefined && (
                <Legend
                  wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                  iconSize={isMobile ? 10 : 14}
                />
              )}
              <Bar
                dataKey="value"
                name="Value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={chartConfig.barSize}
              />
              {data[0]?.target !== undefined && (
                <Bar
                  dataKey="target"
                  name="Target"
                  fill="hsl(var(--muted-foreground))"
                  radius={[4, 4, 0, 0]}
                  barSize={chartConfig.barSize}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Complete Dashboard Grid Layout Example

```tsx
'use client';

import { motion, Variants, useReducedMotion } from 'framer-motion';
import { StatsWidget } from './StatsWidget';
import { ChartWidget } from './ChartWidget';
import { ListWidget } from './ListWidget';
import { ActionWidget } from './ActionWidget';
import { Target, Layers, ClipboardList, Activity } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08
    }
  }
};

interface DashboardLayoutProps {
  stats: DashboardStats;
  chartData: ChartData[];
  activities: Activity[];
}

export function DashboardLayout({ stats, chartData, activities }: DashboardLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  const motionProps = prefersReducedMotion
    ? { initial: "visible", animate: "visible" }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-40px" } };

  return (
    <div className="flex flex-1 flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">

      {/* Stats Row - 4 columns on desktop, 2 on mobile */}
      <motion.div
        {...motionProps}
        variants={staggerContainer}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeInUp}>
          <StatsWidget
            title="Competencies"
            value={stats.totalCompetencies}
            icon={Target}
            href="/hr/competencies"
            trend={{ value: "+12%", label: "from last month", isPositive: true }}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatsWidget
            title="Behavioral Indicators"
            value={stats.totalBehavioralIndicators}
            icon={Layers}
            href="/hr/behavioral-indicators"
            description={`~${stats.avgIndicatorsPerCompetency} per competency`}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatsWidget
            title="Assessment Questions"
            value={stats.totalAssessmentQuestions}
            icon={ClipboardList}
            href="/hr/assessment-questions"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatsWidget
            title="Active Templates"
            value={stats.activeTemplates}
            icon={Activity}
            variant="success"
            href="/test-templates"
          />
        </motion.div>
      </motion.div>

      {/* Main Grid - 8/4 split on desktop */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">

        {/* Left Column */}
        <motion.div
          {...motionProps}
          variants={staggerContainer}
          className="lg:col-span-8 space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <ChartWidget
              title="Competency Distribution"
              subtitle="By category"
              data={chartData}
              viewAllHref="/hr/competencies"
            />
          </motion.div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          {...motionProps}
          variants={staggerContainer}
          className="lg:col-span-4 space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <ListWidget
              title="Recent Activity"
              items={activities}
              viewAllHref="/activity"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <ActionWidget
              title="Ready to assess?"
              description="Discover your strengths and growth areas."
              actionLabel="Start Assessment"
              actionHref="/test-templates"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## Appendix: File References

### Key Component Files

| Component | Location |
|-----------|----------|
| Card | `src/components/ui/card.tsx` |
| Badge | `src/components/ui/badge.tsx` |
| Progress | `src/components/ui/progress.tsx` |
| Chart Container | `src/components/ui/chart.tsx` |
| StatsCard (ui) | `src/components/ui/stats-card.tsx` |
| StatsCard (display) | `src/components/data-display/StatsCard.tsx` |
| FlexibleStatsCards | `src/components/data-display/FlexibleStatsCards.tsx` |
| CompetencyRadarChart | `src/components/data-display/charts/CompetencyRadarChart.tsx` |
| GapAnalysisBarChart | `src/components/data-display/charts/GapAnalysisBarChart.tsx` |

### Dashboard Examples

| Dashboard | Location |
|-----------|----------|
| Main Dashboard | `app/(workspace)/dashboard/_components/dashboard-content.tsx` |
| Psychometrics Dashboard | `app/(workspace)/psychometrics/page.tsx` |
| Psychometrics Stats | `app/(workspace)/psychometrics/_components/PsychometricStatsCards.tsx` |
| Dashboard Hero | `app/(workspace)/psychometrics/_components/DashboardHero.tsx` |

### Style Files

| File | Purpose |
|------|---------|
| `app/globals.css` | Global styles, animations, utilities |
| `tailwind.config.js` | Tailwind configuration |
| CSS Variables | Theme tokens (in globals.css) |

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Author**: UI Design Team
**Status**: Active
