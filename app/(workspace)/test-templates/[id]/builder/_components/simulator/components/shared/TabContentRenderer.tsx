'use client';

import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Strategy } from '../../strategy-context';
import { SimulationResult, SimulationProfile } from '../../types';
import { HelpTab } from './HelpTab';

// Lazy-loaded tab components (shared across desktop and mobile)
const AnalyticsTab = lazy(
  () => import(/* webpackChunkName: "simulator-analytics-opt" */ '../../tabs/AnalyticsTabOptimized')
);
const TimelineTab = lazy(
  () => import(/* webpackChunkName: "simulator-timeline-opt" */ '../../tabs/TimelineTabOptimized')
);
const StrategyInsightsTab = lazy(
  () => import(/* webpackChunkName: "simulator-insights" */ '../../tabs/StrategyInsightsTab')
);
const SimulatedResultsTab = lazy(
  () => import(/* webpackChunkName: "simulator-results" */ '../../tabs/SimulatedResultsTab')
);

// FineTuneTab is small (~5KB), direct import is better than lazy overhead
import FineTuneTab from '../../tabs/FineTuneTab';

export function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

export interface FineTuneSettings {
  strictness: number;
  saturation: number;
  allowBacktracking: boolean;
  onStrictnessChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onAllowBacktrackingChange: (value: boolean) => void;
  onApply: () => void;
  onRun: () => void;
  disabled: boolean;
}

interface TabContentRendererProps {
  tabId: string;
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
  fineTuneSettings: FineTuneSettings;
}

export function TabContentRenderer({
  tabId,
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
  fineTuneSettings,
}: TabContentRendererProps) {
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
