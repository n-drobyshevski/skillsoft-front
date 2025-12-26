# Mobile-First Item Detail Page Architecture

## Overview

This document outlines the mobile-first implementation architecture for the `psychometrics/items/[id]` page redesign using Next.js 16+, React 19, Tailwind CSS v4, and shadcn/ui components.

## Current State Analysis

### Existing Structure
```
app/(workspace)/psychometrics/items/[questionId]/
  page.tsx                    # Server Component (data fetching, static content)
  _components/
    ItemDetailClient.tsx      # Client Component (recalculate, status change)
```

### Key Dependencies
- `SemiCircularGauge` - Animated gauge with Framer Motion
- `ValidityStatusBadge` - Status display component
- `MetricComparisonRow` - Threshold comparison visualization
- `Sheet` / `Drawer` - Mobile-optimized overlays (vaul + Radix)

---

## Proposed Architecture

### 1. Component Hierarchy (Mobile-First)

```
ItemDetailPage (Server Component)
  ItemDetailLayout
    MobileItemHero          # Compact hero for mobile
      QuickStatsRow         # Horizontal scroll stats

    ItemContent
      QuestionSection       # Collapsible on mobile

      MetricsSection
        MobileMetricsStack  # Stacked gauges on mobile
        DesktopMetricsGrid  # Side-by-side on desktop

      ThresholdsSection     # Accordion on mobile

      DistractorSection     # Conditional render

      RecommendationsSection

      HistorySection        # Timeline view

    MobileActionSheet       # Bottom sheet for actions (mobile only)
    DesktopActionBar        # Inline actions (desktop only)
```

### 2. File Structure

```
app/(workspace)/psychometrics/items/[questionId]/
  page.tsx                           # Server Component - data fetching
  loading.tsx                        # Streaming skeleton
  error.tsx                          # Error boundary

  _components/
    index.ts                         # Barrel exports

    # Layout Components
    ItemDetailLayout.tsx             # Responsive layout wrapper
    MobileItemHero.tsx               # Mobile-optimized hero section
    QuickStatsRow.tsx                # Horizontal scrollable stats

    # Content Sections (Server Components where possible)
    QuestionSection.tsx              # Question text + hierarchy
    MetricsSection.tsx               # Gauge visualizations
    ThresholdsSection.tsx            # Metric comparisons
    DistractorSection.tsx            # Distractor efficiency
    RecommendationsSection.tsx       # AI recommendations
    HistorySection.tsx               # Status change timeline

    # Interactive Components (Client)
    ItemDetailClient.tsx             # Main client wrapper
    MobileActionSheet.tsx            # Bottom sheet actions
    StatusChangeDialog.tsx           # Status change modal
    RecalculateButton.tsx            # Recalculate action

    # Responsive Utilities
    ResponsiveGauges.tsx             # Adaptive gauge layout
    MobileAccordionWrapper.tsx       # Progressive disclosure
```

---

## 3. Breakpoint Strategy (Mobile-First)

### Tailwind Breakpoints
```typescript
// tailwind.config.ts (reference)
screens: {
  'sm': '640px',   // Small tablets
  'md': '768px',   // Tablets
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
}
```

### Component Breakpoint Patterns

```tsx
// Base: Mobile (< 640px)
// sm: Small tablets (640px+)
// md: Tablets (768px+)
// lg: Desktop (1024px+)

// Example: Page padding
<div className="p-4 sm:p-5 md:p-6 lg:p-8">

// Example: Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Example: Text sizing
<h1 className="text-xl sm:text-2xl lg:text-3xl">

// Example: Hide/show elements
<div className="md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>
```

---

## 4. Component Implementations

### 4.1 ItemDetailLayout.tsx

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\_components\ItemDetailLayout.tsx

import { cn } from '@/lib/utils';
import type { ItemStatisticsDetail } from '@/types/psychometrics';
import { MobileActionSheet } from './MobileActionSheet';

interface ItemDetailLayoutProps {
  item: ItemStatisticsDetail;
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive layout wrapper for item detail page.
 * Provides consistent spacing and mobile action sheet positioning.
 */
export function ItemDetailLayout({
  item,
  children,
  className
}: ItemDetailLayoutProps) {
  return (
    <div className={cn(
      // Mobile-first base padding
      'flex flex-1 flex-col gap-4 p-4 pt-0',
      // Tablet+ spacing
      'sm:gap-5 sm:p-5',
      // Desktop spacing
      'md:gap-6 md:p-6',
      // Extra bottom padding for mobile action sheet
      'pb-24 md:pb-6',
      className
    )}>
      {children}

      {/* Mobile action sheet - fixed at bottom */}
      <MobileActionSheet item={item} />
    </div>
  );
}
```

### 4.2 MobileItemHero.tsx

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\_components\MobileItemHero.tsx

'use client';

import { cn } from '@/lib/utils';
import { ValidityStatusBadge } from '../../../_components';
import { ItemValidityStatus } from '@/types/psychometrics';
import { Users, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface MobileItemHeroProps {
  status: ItemValidityStatus;
  competencyName: string;
  responseCount: number;
  lastCalculatedAt: string | null;
  className?: string;
}

// Status-based gradient backgrounds
const STATUS_GRADIENTS: Record<ItemValidityStatus, string> = {
  [ItemValidityStatus.ACTIVE]:
    'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20',
  [ItemValidityStatus.PROBATION]:
    'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20',
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]:
    'from-orange-500/10 via-orange-500/5 to-transparent dark:from-orange-500/20',
  [ItemValidityStatus.RETIRED]:
    'from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/20',
};

export function MobileItemHero({
  status,
  competencyName,
  responseCount,
  lastCalculatedAt,
  className,
}: MobileItemHeroProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      // Full-bleed gradient on mobile
      '-mx-4 px-4 pt-4 pb-3',
      'sm:-mx-5 sm:px-5',
      'md:-mx-6 md:px-6 md:pt-6 md:pb-4',
      'bg-gradient-to-b',
      STATUS_GRADIENTS[status],
      className
    )}>
      {/* Header row - always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
            Item Details
          </h1>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {competencyName}
          </p>
        </div>
        <ValidityStatusBadge
          status={status}
          size="lg"
          className="shrink-0"
        />
      </div>

      {/* Quick stats - horizontal scroll on mobile */}
      <div className={cn(
        'flex gap-4 mt-3 overflow-x-auto scrollbar-hide',
        '-mx-4 px-4 sm:-mx-5 sm:px-5 md:mx-0 md:px-0',
        'md:flex-wrap'
      )}>
        <QuickStat
          icon={Users}
          label="Responses"
          value={responseCount.toLocaleString('ru-RU')}
        />
        {lastCalculatedAt && (
          <QuickStat
            icon={Clock}
            label="Updated"
            value={new Date(lastCalculatedAt).toLocaleDateString('ru-RU')}
          />
        )}
      </div>
    </div>
  );
}

// Compact stat pill for hero section
function QuickStat({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm whitespace-nowrap shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
```

### 4.3 MobileActionSheet.tsx (Bottom Sheet)

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\_components\MobileActionSheet.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ItemStatisticsDetail, ItemValidityStatus } from '@/types/psychometrics';
import { psychometricsApi } from '@/services/api';
import {
  RefreshCw,
  Settings2,
  Loader2,
  MoreHorizontal,
  Ban,
  CheckCircle2,
} from 'lucide-react';

interface MobileActionSheetProps {
  item: ItemStatisticsDetail;
}

/**
 * Mobile-optimized action sheet using vaul Drawer (bottom sheet).
 * Only renders on mobile breakpoints.
 * Uses native bottom sheet pattern for better UX.
 */
export function MobileActionSheet({ item }: MobileActionSheetProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Only render on mobile
  if (!isMobile) return null;

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await psychometricsApi.recalculateItem(item.questionId);
      toast.success('Recalculation complete');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to recalculate');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleQuickAction = async (newStatus: ItemValidityStatus, reason: string) => {
    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, { newStatus, reason });
      toast.success('Status updated');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isLoading = isRecalculating || isUpdatingStatus;

  return (
    <>
      {/* Fixed bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t p-3 pb-safe">
        <div className="flex gap-2 max-w-lg mx-auto">
          {/* Primary action - Recalculate */}
          <Button
            variant="outline"
            className="flex-1 gap-2 min-h-[44px]"
            onClick={handleRecalculate}
            disabled={isLoading}
          >
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recalculate
          </Button>

          {/* More actions drawer */}
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                disabled={isLoading}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Actions</DrawerTitle>
                <DrawerDescription>
                  Manage item status and settings
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-2">
                {/* Quick actions based on current status */}
                {item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-emerald-600"
                    onClick={() => handleQuickAction(
                      ItemValidityStatus.ACTIVE,
                      'Reviewed and approved'
                    )}
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Mark as Reviewed
                  </Button>
                )}

                {item.validityStatus !== ItemValidityStatus.RETIRED && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-red-600"
                    onClick={() => handleQuickAction(
                      ItemValidityStatus.RETIRED,
                      'Retired due to poor metrics'
                    )}
                    disabled={isLoading}
                  >
                    <Ban className="h-5 w-5" />
                    Retire Item
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    setIsOpen(false);
                    // Open status change dialog
                  }}
                  disabled={isLoading}
                >
                  <Settings2 className="h-5 w-5" />
                  Change Status...
                </Button>
              </div>

              <DrawerFooter>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
}
```

### 4.4 ResponsiveGauges.tsx

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\_components\ResponsiveGauges.tsx

'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DifficultyGauge, DiscriminationGauge } from '../../../_components';
import { Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveGaugesProps {
  difficultyIndex: number | null;
  discriminationIndex: number | null;
  difficultyQuality: { label: string; color: string; description: string };
  discriminationQuality: { label: string; color: string; description: string };
  className?: string;
}

/**
 * Responsive gauge layout component.
 * - Mobile: Stacked vertical layout with smaller gauges
 * - Tablet+: Side-by-side horizontal layout with larger gauges
 */
export function ResponsiveGauges({
  difficultyIndex,
  discriminationIndex,
  difficultyQuality,
  discriminationQuality,
  className,
}: ResponsiveGaugesProps) {
  const isMobile = useIsMobile();

  // Use smaller gauges on mobile
  const gaugeSize = isMobile ? 'sm' : 'lg';

  return (
    <div className={cn(
      // Mobile: stacked
      'grid gap-4',
      // Tablet+: side by side
      'md:grid-cols-2 md:gap-6',
      className
    )}>
      {/* Difficulty Gauge Card */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Difficulty Index (p)
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Proportion of correct answers
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-3 md:py-4">
          <DifficultyGauge value={difficultyIndex} size={gaugeSize} />
          <div className="mt-3 md:mt-4 text-center">
            <Badge variant="outline" className={difficultyQuality.color}>
              {difficultyQuality.label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1.5 md:mt-2 max-w-[200px]">
              {difficultyQuality.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Discrimination Gauge Card */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Discrimination Index (rpb)
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Correlation with total score
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-3 md:py-4">
          <DiscriminationGauge value={discriminationIndex} size={gaugeSize} />
          <div className="mt-3 md:mt-4 text-center">
            <Badge variant="outline" className={discriminationQuality.color}>
              {discriminationQuality.label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1.5 md:mt-2 max-w-[200px]">
              {discriminationQuality.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4.5 MobileAccordionWrapper.tsx (Progressive Disclosure)

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\_components\MobileAccordionWrapper.tsx

'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AccordionSection {
  id: string;
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface MobileAccordionWrapperProps {
  sections: AccordionSection[];
  className?: string;
}

/**
 * Progressive disclosure wrapper that:
 * - Mobile: Renders as collapsible accordion sections
 * - Desktop: Renders as standard cards (always expanded)
 *
 * This reduces cognitive load on mobile while showing
 * all content on larger screens.
 */
export function MobileAccordionWrapper({
  sections,
  className,
}: MobileAccordionWrapperProps) {
  const isMobile = useIsMobile();

  // Desktop: Render as regular cards
  if (!isMobile) {
    return (
      <div className={cn('space-y-6', className)}>
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {section.icon}
                {section.title}
                {section.badge}
              </CardTitle>
            </CardHeader>
            <CardContent>{section.children}</CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Mobile: Render as accordion
  const defaultOpenSections = sections
    .filter((s) => s.defaultOpen)
    .map((s) => s.id);

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpenSections}
      className={cn('space-y-2', className)}
    >
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className="border rounded-lg px-3 bg-card"
        >
          <AccordionTrigger className="py-3 hover:no-underline [&>svg]:size-4">
            <div className="flex items-center gap-2 text-left">
              {section.icon}
              <span className="text-sm font-medium">{section.title}</span>
              {section.badge}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {section.children}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

### 4.6 Updated page.tsx with Suspense Boundaries

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPsychometricsItemDetailCached } from '@/services/api.cache.psychometrics';

// Component imports
import { ItemDetailLayout } from './_components/ItemDetailLayout';
import { MobileItemHero } from './_components/MobileItemHero';
import { QuestionSection } from './_components/QuestionSection';
import { ResponsiveGauges } from './_components/ResponsiveGauges';
import { ThresholdsSection } from './_components/ThresholdsSection';
import { IssuesBanner } from './_components/IssuesBanner';
import { ItemDetailClient } from './_components/ItemDetailClient';

// Skeleton imports
import {
  HeroSkeleton,
  GaugesSkeleton,
  CardSkeleton,
} from './_components/Skeletons';

export const metadata: Metadata = {
  title: 'Item Details - Psychometrics - SkillSoft',
  description: 'Detailed psychometric statistics for assessment item.',
};

interface PageProps {
  params: Promise<{ questionId: string }>;
}

// Quality calculation functions (unchanged)
function getDiscriminationQuality(rpb: number | null) { /* ... */ }
function getDifficultyQuality(p: number | null) { /* ... */ }

export default async function ItemDetailPage({ params }: PageProps) {
  const { questionId } = await params;
  const item = await getPsychometricsItemDetailCached(questionId);

  if (!item) {
    notFound();
  }

  const discQuality = getDiscriminationQuality(item.discriminationIndex);
  const diffQuality = getDifficultyQuality(item.difficultyIndex);

  return (
    <ItemDetailLayout item={item}>
      {/* Hero Section - Immediate render for LCP */}
      <MobileItemHero
        status={item.validityStatus}
        competencyName={item.competencyName}
        responseCount={item.responseCount}
        lastCalculatedAt={item.lastCalculatedAt}
      />

      {/* Question Text - Priority content */}
      <QuestionSection
        questionText={item.questionText}
        competencyName={item.competencyName}
        indicatorTitle={item.indicatorTitle}
      />

      {/* Gauges Section - Can stream in */}
      <Suspense fallback={<GaugesSkeleton />}>
        <ResponsiveGauges
          difficultyIndex={item.difficultyIndex}
          discriminationIndex={item.discriminationIndex}
          difficultyQuality={diffQuality}
          discriminationQuality={discQuality}
        />
      </Suspense>

      {/* Thresholds Section */}
      <ThresholdsSection
        difficultyIndex={item.difficultyIndex}
        discriminationIndex={item.discriminationIndex}
        responseCount={item.responseCount}
      />

      {/* Issues Banner - Conditional */}
      <IssuesBanner item={item} />

      {/* Client-side interactive components */}
      <Suspense fallback={<CardSkeleton />}>
        <ItemDetailClient item={item} />
      </Suspense>
    </ItemDetailLayout>
  );
}
```

### 4.7 Skeleton Components

```tsx
// D:\projects\diplom\skillsoft\frontend-app\app\(workspace)\psychometrics\items\[questionId]\_components\Skeletons.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function HeroSkeleton() {
  return (
    <div className="-mx-4 px-4 pt-4 pb-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32 sm:h-7 md:h-8" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4 mt-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

export function GaugesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2 md:pb-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            {/* Gauge skeleton */}
            <Skeleton className="h-16 w-28 md:h-24 md:w-40 rounded-t-full" />
            <Skeleton className="h-6 w-16 mt-3" />
            <Skeleton className="h-5 w-20 mt-2 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

export function ActionBarSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
```

---

## 5. Performance Optimizations

### 5.1 React 19 Suspense Boundaries

```tsx
// Streaming pattern for progressive loading
<Suspense fallback={<GaugesSkeleton />}>
  <ResponsiveGauges {...props} />
</Suspense>
```

### 5.2 Partial Prerendering (PPR) - Next.js 15+

```tsx
// Enable experimental PPR in next.config.ts
experimental: {
  ppr: true,
}

// Mark dynamic sections with Suspense
export default async function Page() {
  return (
    <div>
      {/* Static shell - prerendered */}
      <Header />

      {/* Dynamic content - streamed */}
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

### 5.3 Image Optimization

```tsx
import Image from 'next/image';

// For any images in the component
<Image
  src="/path/to/image.png"
  alt="Description"
  width={200}
  height={100}
  priority // for LCP images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 5.4 Bundle Optimization

```tsx
// Dynamic imports for non-critical components
const HistorySection = dynamic(() => import('./HistorySection'), {
  loading: () => <CardSkeleton />,
  ssr: true,
});
```

---

## 6. Touch Interactions

### 6.1 Touch Targets (44px minimum)

```tsx
// All interactive elements must be at least 44x44px
<Button className="min-h-[44px] min-w-[44px]">
  <Icon className="h-5 w-5" />
</Button>

// With appropriate spacing
<div className="flex gap-3"> {/* 12px gap between touch targets */}
```

### 6.2 Swipe Gestures (Optional Enhancement)

```tsx
// Using @use-gesture/react for swipe actions
import { useDrag } from '@use-gesture/react';

function SwipeableCard({ onSwipeLeft, onSwipeRight, children }) {
  const bind = useDrag(({ movement: [mx], direction: [dx], cancel }) => {
    if (Math.abs(mx) > 100) {
      if (dx > 0) onSwipeRight?.();
      else onSwipeLeft?.();
      cancel();
    }
  });

  return <div {...bind()}>{children}</div>;
}
```

---

## 7. Accessibility

### 7.1 Focus Management

```tsx
// Focus trap in modals
import { useFocusTrap } from '@/hooks/use-focus-trap';

function Modal({ isOpen, children }) {
  const ref = useFocusTrap(isOpen);
  return <div ref={ref}>{children}</div>;
}
```

### 7.2 Reduced Motion

```tsx
// Respect prefers-reduced-motion
import { useReducedMotion } from '@/hooks/use-reduced-motion';

function AnimatedGauge({ value }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ pathLength: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.8,
        ease: 'easeOut',
      }}
    />
  );
}

// CSS approach
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.3 Screen Reader Optimization

```tsx
// Semantic HTML structure
<article aria-labelledby="item-title">
  <header>
    <h1 id="item-title">Item Details</h1>
  </header>

  <section aria-labelledby="metrics-heading">
    <h2 id="metrics-heading">Psychometric Metrics</h2>
    {/* Content */}
  </section>
</article>

// Live regions for updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## 8. State Management

### 8.1 Local UI State

```tsx
// Component-level state for UI interactions
const [activeTab, setActiveTab] = useState<string>('metrics');
const [isAccordionOpen, setIsAccordionOpen] = useState<Record<string, boolean>>({
  question: true,
  metrics: true,
  thresholds: false,
});
```

### 8.2 Server Actions for Mutations

```tsx
// app/actions/psychometrics.ts
'use server';

import { revalidatePath } from 'next/cache';
import { psychometricsApi } from '@/services/api';

export async function recalculateItemAction(questionId: string) {
  await psychometricsApi.recalculateItem(questionId);
  revalidatePath(`/psychometrics/items/${questionId}`);
  return { success: true };
}

export async function updateItemStatusAction(
  questionId: string,
  newStatus: string,
  reason: string
) {
  await psychometricsApi.updateItemStatus(questionId, { newStatus, reason });
  revalidatePath(`/psychometrics/items/${questionId}`);
  revalidatePath('/psychometrics/items');
  return { success: true };
}
```

```tsx
// Usage in client component
'use client';

import { useTransition } from 'react';
import { recalculateItemAction } from '@/app/actions/psychometrics';

function RecalculateButton({ questionId }) {
  const [isPending, startTransition] = useTransition();

  const handleRecalculate = () => {
    startTransition(async () => {
      const result = await recalculateItemAction(questionId);
      if (result.success) {
        toast.success('Recalculation complete');
      }
    });
  };

  return (
    <Button onClick={handleRecalculate} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : 'Recalculate'}
    </Button>
  );
}
```

---

## 9. CSS Container Queries (Optional Enhancement)

```tsx
// For truly component-responsive designs
// Tailwind CSS v4 has built-in container query support

// Component wrapper
<div className="@container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-3">
    {/* Responds to container width, not viewport */}
  </div>
</div>
```

---

## 10. Testing Strategy

### 10.1 Component Tests

```tsx
// __tests__/MobileActionSheet.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileActionSheet } from '../MobileActionSheet';

// Mock useIsMobile
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => true,
}));

describe('MobileActionSheet', () => {
  it('renders action buttons on mobile', () => {
    render(<MobileActionSheet item={mockItem} />);
    expect(screen.getByRole('button', { name: /recalculate/i })).toBeInTheDocument();
  });

  it('opens drawer when more button clicked', async () => {
    render(<MobileActionSheet item={mockItem} />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
```

### 10.2 Visual Regression

```tsx
// Playwright visual tests
test('item detail page renders correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/psychometrics/items/test-id');
  await expect(page).toHaveScreenshot('item-detail-mobile.png');
});

test('item detail page renders correctly on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad
  await page.goto('/psychometrics/items/test-id');
  await expect(page).toHaveScreenshot('item-detail-tablet.png');
});
```

---

## Implementation Checklist

- [ ] Create `ItemDetailLayout.tsx` with mobile padding and action sheet
- [ ] Create `MobileItemHero.tsx` with compact header
- [ ] Create `MobileActionSheet.tsx` using vaul Drawer
- [ ] Create `ResponsiveGauges.tsx` with adaptive sizing
- [ ] Create `MobileAccordionWrapper.tsx` for progressive disclosure
- [ ] Create skeleton components for streaming
- [ ] Update `page.tsx` with Suspense boundaries
- [ ] Add Server Actions for mutations
- [ ] Implement touch-optimized form controls
- [ ] Add accessibility attributes (ARIA, focus management)
- [ ] Add reduced motion support
- [ ] Write component tests
- [ ] Add visual regression tests
- [ ] Verify Core Web Vitals on mobile

---

## References

- [Next.js 16 App Router Docs](https://nextjs.org/docs/app)
- [React 19 Suspense](https://react.dev/reference/react/Suspense)
- [shadcn/ui Sheet Component](https://ui.shadcn.com/docs/components/sheet)
- [shadcn/ui Drawer Component](https://ui.shadcn.com/docs/components/drawer)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vaul - Drawer for React](https://vaul.emilkowal.ski/)
