'use client';

/**
 * MobilePriorityStack
 *
 * A mobile-optimized layout that prioritizes the most important content:
 *
 * 1. Primary Insight (always expanded) - Strategy-specific hero content
 * 2. Secondary Sections (accordion) - Timeline, Analytics, Help
 * 3. Floating Fine Tune Button - Always accessible via bottom sheet
 *
 * Key UX improvements over collapsible-only approach:
 * - Reduces tap count to see important info (primary insight visible immediately)
 * - Fine Tune is always one tap away (floating button)
 * - Strategy-relevant content is prioritized
 */

import React, { memo, Suspense, lazy } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, STRATEGY_HELP_CONTENT } from '../strategy-context';
import { SimulationResult, SimulationProfile } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';
import { StrategyScoreDisplay } from '../StrategyScoreDisplay';
import { WarningsList } from '../WarningsList';
import { FineTuneSheet } from './FineTuneSheet';

// ============================================
// LAZY LOADED TAB COMPONENTS (OPTIMIZED)
// ============================================

const QuestionsTab = lazy(
  () => import(/* webpackChunkName: "simulator-questions-tab" */ '../tabs/QuestionsTab')
);

// ============================================
// TYPES
// ============================================

interface MobilePriorityStackProps {
  /** Simulation result data */
  result: SimulationResult;
  /** Current assessment strategy */
  strategy: Strategy;
  /** Selected simulation persona */
  profile: SimulationProfile;
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

// ============================================
// HELP CONTENT
// ============================================

interface HelpContentProps {
  strategy: Strategy;
}

const HelpContent = memo(function HelpContent({ strategy }: HelpContentProps) {
  const t = useTranslations('builder.simulator');
  const content = STRATEGY_HELP_CONTENT[strategy];

  return (
    <div className="space-y-3 p-2">
      <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
        {content.pointKeys.map((key, i) => (
          <li key={i}>{t(key as Parameters<typeof t>[0])}</li>
        ))}
      </ul>
      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{t('results.tip')}</span>{' '}
          {t('results.tipContent')}
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
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {/* Questions Section (merged Timeline + Analytics) */}
      <AccordionItem
        value="questions"
        className="border rounded-xl overflow-hidden bg-muted/20"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 min-h-[52px]">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('sections.questions')}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <Suspense fallback={<TabSkeleton />}>
            <QuestionsTab result={result} />
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
            <span className="text-sm font-medium">{t('results.howThisWorks')}</span>
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
  profile,
  passingScore,
  competencyCount,
  onetSocCode,
  teamId,
  teamName,
  fineTuneSettings,
}: MobilePriorityStackProps) {
  const t = useTranslations('builder.simulator');

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* 1. Score Display (Expanded variant for mobile) */}
      <StrategyScoreDisplay
        strategy={strategy}
        score={result.simulatedScore}
        passingScore={passingScore}
        profile={profile}
        competencyCount={competencyCount}
        onetSocCode={onetSocCode}
        teamId={teamId}
        teamName={teamName}
        variant="expanded"
        result={result}
      />

      {/* Inventory Warnings */}
      <WarningsList warnings={result.warnings} />

      {/* 3. Secondary Sections (Accordion) */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {t('results.detailedAnalysis')}
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
