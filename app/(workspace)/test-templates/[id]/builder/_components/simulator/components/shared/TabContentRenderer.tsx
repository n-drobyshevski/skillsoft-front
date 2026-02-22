'use client';

import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Strategy } from '../../strategy-context';
import { SimulationResult, SimulationProfile } from '../../types';
import { HelpTab } from './HelpTab';

// Lazy-loaded tab components (shared across desktop and mobile)
const ResultsTab = lazy(
  () => import(/* webpackChunkName: "simulator-results-tab" */ '../../tabs/ResultsTab')
);
const QuestionsTab = lazy(
  () => import(/* webpackChunkName: "simulator-questions-tab" */ '../../tabs/QuestionsTab')
);

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
}: TabContentRendererProps) {
  switch (tabId) {
    case 'results':
      return (
        <Suspense fallback={<TabSkeleton />}>
          <ResultsTab
            result={result}
            strategy={strategy}
            persona={persona}
            passingScore={passingScore}
            onetSocCode={onetSocCode}
            teamId={teamId}
          />
        </Suspense>
      );

    case 'questions':
      return (
        <Suspense fallback={<TabSkeleton />}>
          <QuestionsTab result={result} />
        </Suspense>
      );

    case 'help':
      return <HelpTab strategy={strategy} />;

    default:
      return null;
  }
}
