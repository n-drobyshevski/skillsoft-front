'use client';

import React, { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult, SimulationProfile } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';
import { getIcon, TabContentRenderer } from './shared';
import type { FineTuneSettings } from './shared';

// ============================================
// TYPES
// ============================================

interface SimulatorTabsProps {
  tabs: TabConfig[];
  defaultTab: string;
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
  fineTuneSettings: FineTuneSettings;
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
  const t = useTranslations('builder.simulator');
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
          const isStrategySpecific = tab.id === 'results';

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
              <span className="truncate max-w-full">{t(tab.titleKey as Parameters<typeof t>[0])}</span>
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
