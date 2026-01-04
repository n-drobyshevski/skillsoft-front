'use client';

/**
 * MobilePriorityStack
 *
 * A mobile-optimized layout that prioritizes the most important content:
 *
 * 1. Primary Insight (always expanded) - Strategy-specific hero content
 * 2. Quick Stats (always visible) - Duration & question count
 * 3. Secondary Sections (accordion) - Timeline, Analytics, Help
 * 4. Floating Fine Tune Button - Always accessible via bottom sheet
 *
 * Key UX improvements over collapsible-only approach:
 * - Reduces tap count to see important info (primary insight visible immediately)
 * - Fine Tune is always one tap away (floating button)
 * - Strategy-relevant content is prioritized
 */

import React, { memo, Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BarChart3,
  Clock,
  HelpCircle,
  LineChart,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, STRATEGY_HELP_CONTENT } from '../strategy-context';
import { SimulationResult } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';
import { StrategyPrimaryInsight } from './StrategyPrimaryInsight';
import { FineTuneSheet } from './FineTuneSheet';

// ============================================
// LAZY LOADED TAB COMPONENTS (OPTIMIZED)
// ============================================

const AnalyticsTab = lazy(
  () => import(/* webpackChunkName: "simulator-analytics-opt" */ '../tabs/AnalyticsTabOptimized')
);
const TimelineTab = lazy(
  () => import(/* webpackChunkName: "simulator-timeline-opt" */ '../tabs/TimelineTabOptimized')
);

// ============================================
// TYPES
// ============================================

interface MobilePriorityStackProps {
  /** Simulation result data */
  result: SimulationResult;
  /** Current assessment strategy */
  strategy: Strategy;
  /** Passing score threshold */
  passingScore: number;
  /** Number of competencies */
  competencyCount: number;
  /** O*NET SOC code */
  onetSocCode?: string;
  /** Team ID */
  teamId?: string;
  /** Team name */
  teamName?: string;
  /** Fine tune settings */
  fineTuneSettings: {
    strictness: number;
    saturation: number;
    allowBacktracking: boolean;
    onStrictnessChange: (value: number) => void;
    onSaturationChange: (value: number) => void;
    onAllowBacktrackingChange: (value: boolean) => void;
    onApply: () => void;
    onRun: () => void;
    disabled: boolean;
  };
}

// ============================================
// SKELETON
// ============================================

function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse p-2">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

// ============================================
// QUICK STATS
// ============================================

interface QuickStatsProps {
  durationMinutes: number;
  questionCount: number;
}

const QuickStats = memo(function QuickStats({
  durationMinutes,
  questionCount,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-dashed">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Duration
            </div>
            <div className="text-lg font-bold tabular-nums">
              {durationMinutes} min
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Questions
            </div>
            <div className="text-lg font-bold tabular-nums">
              {questionCount}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// ============================================
// HELP CONTENT
// ============================================

interface HelpContentProps {
  strategy: Strategy;
}

const HelpContent = memo(function HelpContent({ strategy }: HelpContentProps) {
  const content = STRATEGY_HELP_CONTENT[strategy];

  return (
    <div className="space-y-3 p-2">
      <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
        {content.points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use the floating settings button
          to adjust strictness and saturation, then re-run to compare results.
        </p>
      </div>
    </div>
  );
});

// ============================================
// SECONDARY SECTIONS ACCORDION
// ============================================

interface SecondarySectionsProps {
  result: SimulationResult;
  strategy: Strategy;
}

const SecondarySections = memo(function SecondarySections({
  result,
  strategy,
}: SecondarySectionsProps) {
  const config = STRATEGY_CONFIG[strategy];

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {/* Timeline Section */}
      <AccordionItem
        value="timeline"
        className="border rounded-xl overflow-hidden bg-muted/20"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 min-h-[52px]">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Question Timeline</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <Suspense fallback={<TabSkeleton />}>
            <TimelineTab result={result} />
          </Suspense>
        </AccordionContent>
      </AccordionItem>

      {/* Analytics Section */}
      <AccordionItem
        value="analytics"
        className="border rounded-xl overflow-hidden bg-muted/20"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 min-h-[52px]">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Coverage Analytics</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <Suspense fallback={<TabSkeleton />}>
            <AnalyticsTab result={result} />
          </Suspense>
        </AccordionContent>
      </AccordionItem>

      {/* Help Section */}
      <AccordionItem
        value="help"
        className="border rounded-xl overflow-hidden bg-muted/20"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 min-h-[52px]">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">How This Works</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <HelpContent strategy={strategy} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const MobilePriorityStack = memo(function MobilePriorityStack({
  result,
  strategy,
  passingScore,
  competencyCount,
  onetSocCode,
  teamId,
  teamName,
  fineTuneSettings,
}: MobilePriorityStackProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* 1. Primary Insight (Always Expanded) */}
      <StrategyPrimaryInsight
        result={result}
        strategy={strategy}
        passingScore={passingScore}
        onetSocCode={onetSocCode}
        teamId={teamId}
        teamName={teamName}
      />

      {/* 2. Quick Stats (Always Visible) */}
      <QuickStats
        durationMinutes={result.estimatedDurationMinutes}
        questionCount={result.sampleQuestions.length}
      />

      {/* 3. Secondary Sections (Accordion) */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Detailed Analysis
        </h3>
        <SecondarySections result={result} strategy={strategy} />
      </div>

      {/* 4. Floating Fine Tune Button + Sheet */}
      <FineTuneSheet
        strategy={strategy}
        strictness={fineTuneSettings.strictness}
        onStrictnessChange={fineTuneSettings.onStrictnessChange}
        saturation={fineTuneSettings.saturation}
        onSaturationChange={fineTuneSettings.onSaturationChange}
        allowBacktracking={fineTuneSettings.allowBacktracking}
        onAllowBacktrackingChange={fineTuneSettings.onAllowBacktrackingChange}
        onApply={fineTuneSettings.onApply}
        onRun={fineTuneSettings.onRun}
        isSimulating={fineTuneSettings.disabled}
      />
    </div>
  );
});

export default MobilePriorityStack;
