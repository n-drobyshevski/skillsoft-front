'use client';

import React, { Suspense, lazy, memo, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  BarChart3,
  SlidersHorizontal,
  HelpCircle,
  Lightbulb,
  Briefcase,
  Users,
  LayoutGrid,
  CheckSquare,
  GitCompareArrows,
  Radar,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, STRATEGY_HELP_CONTENT } from '../strategy-context';
import { SimulationResult, SimulationProfile } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';

// ============================================
// LAZY LOADED TAB COMPONENTS
// ============================================

const AnalyticsTab = lazy(
  () => import(/* webpackChunkName: "simulator-analytics" */ '../tabs/AnalyticsTab')
);
const TimelineTab = lazy(
  () => import(/* webpackChunkName: "simulator-timeline" */ '../tabs/TimelineTab')
);
const StrategyInsightsTab = lazy(
  () => import(/* webpackChunkName: "simulator-insights" */ '../tabs/StrategyInsightsTab')
);
const SimulatedResultsTab = lazy(
  () => import(/* webpackChunkName: "simulator-results" */ '../tabs/SimulatedResultsTab')
);

// FineTuneTab is small (~5KB), direct import is better than lazy overhead
import FineTuneTab from '../tabs/FineTuneTab';

// ============================================
// TYPES
// ============================================

interface SimulatorTabsProps {
  /** Ordered tabs based on strategy */
  tabs: TabConfig[];
  /** Default tab to show */
  defaultTab: string;
  /** Simulation result */
  result: SimulationResult;
  /** Current strategy */
  strategy: Strategy;
  /** Current simulation persona */
  persona: SimulationProfile;
  /** Passing score threshold */
  passingScore: number;
  /** O*NET SOC code */
  onetSocCode?: string;
  /** Team ID */
  teamId?: string;
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
// ICON MAP
// ============================================

const ICON_MAP: Record<string, React.ElementType> = {
  LineChart,
  BarChart3,
  SlidersHorizontal,
  HelpCircle,
  Lightbulb,
  Briefcase,
  Users,
  LayoutGrid,
  CheckSquare,
  GitCompareArrows,
  Radar,
  FileCheck,
};

function getIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] ?? HelpCircle;
}

// ============================================
// TAB SKELETON
// ============================================

function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

// ============================================
// HELP TAB (Strategy-aware)
// ============================================

interface HelpTabProps {
  strategy: Strategy;
}

function HelpTab({ strategy }: HelpTabProps) {
  const content = STRATEGY_HELP_CONTENT[strategy];

  return (
    <div className="space-y-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        {content.title}
      </div>
      <ul className="list-disc pl-4 space-y-1.5">
        {content.points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
      <div className="pt-2 border-t border-border mt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use personas to stress-test
          difficulty bands. Adjust strictness and saturation, then re-run to compare.
        </p>
      </div>
    </div>
  );
}

// ============================================
// TAB CONTENT RENDERER
// ============================================

interface TabContentRendererProps {
  tabId: string;
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
  fineTuneSettings: SimulatorTabsProps['fineTuneSettings'];
}

function TabContentRenderer({
  tabId,
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
  fineTuneSettings,
}: TabContentRendererProps) {
  // Map tab IDs to actual components
  switch (tabId) {
    case 'timeline':
      return (
        <Suspense fallback={<TabSkeleton />}>
          <TimelineTab result={result} />
        </Suspense>
      );

    case 'insights':
    case 'job-alignment':
    case 'team-comparison':
    case 'gap-analysis':
      return (
        <Suspense fallback={<TabSkeleton />}>
          <StrategyInsightsTab
            result={result}
            strategy={strategy}
            onetSocCode={onetSocCode}
            teamId={teamId}
          />
        </Suspense>
      );

    case 'simulated-results':
      return (
        <Suspense fallback={<TabSkeleton />}>
          <SimulatedResultsTab
            result={result}
            strategy={strategy}
            persona={persona}
            passingScore={passingScore}
            onetSocCode={onetSocCode}
            teamId={teamId}
          />
        </Suspense>
      );

    case 'analytics':
      return (
        <Suspense fallback={<TabSkeleton />}>
          <AnalyticsTab result={result} />
        </Suspense>
      );

    case 'finetune':
    case 'fine':
      return (
        <FineTuneTab
          strictness={fineTuneSettings.strictness}
          onStrictnessChange={fineTuneSettings.onStrictnessChange}
          saturation={fineTuneSettings.saturation}
          onSaturationChange={fineTuneSettings.onSaturationChange}
          allowBacktracking={fineTuneSettings.allowBacktracking}
          onAllowBacktrackingChange={fineTuneSettings.onAllowBacktrackingChange}
          onApply={fineTuneSettings.onApply}
          onRun={fineTuneSettings.onRun}
          disabled={fineTuneSettings.disabled}
        />
      );

    case 'help':
      return <HelpTab strategy={strategy} />;

    default:
      return null;
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export const SimulatorTabs = memo(function SimulatorTabs({
  tabs,
  defaultTab,
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
  fineTuneSettings,
}: SimulatorTabsProps) {
  const strategyConfig = STRATEGY_CONFIG[strategy];

  // Filter to only show available tabs (max 5 for UI)
  const visibleTabs = useMemo(() => tabs.slice(0, 5), [tabs]);

  return (
    <Tabs defaultValue={defaultTab} className="mt-4 flex flex-col flex-1 min-h-0">
      <TabsList
        className={cn(
          'grid gap-1 p-1 w-full h-auto bg-muted/50 shrink-0',
          `grid-cols-${Math.min(visibleTabs.length, 5)}`
        )}
        style={{
          gridTemplateColumns: `repeat(${Math.min(visibleTabs.length, 5)}, minmax(0, 1fr))`,
        }}
      >
        {visibleTabs.map((tab) => {
          const Icon = getIcon(tab.icon);
          const isStrategySpecific =
            tab.id === 'insights' ||
            tab.id === 'job-alignment' ||
            tab.id === 'team-comparison';

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px]',
                'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                isStrategySpecific && 'data-[state=active]:' + strategyConfig.iconText
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="truncate max-w-full">{tab.title}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {visibleTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-3">
          <TabContentRenderer
            tabId={tab.id}
            result={result}
            strategy={strategy}
            persona={persona}
            passingScore={passingScore}
            onetSocCode={onetSocCode}
            teamId={teamId}
            fineTuneSettings={fineTuneSettings}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
});

export default SimulatorTabs;
