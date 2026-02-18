'use client';

import React, { memo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult, SimulationProfile } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';
import { getIcon, TabContentRenderer } from './shared';
import type { FineTuneSettings } from './shared';

// ============================================
// TYPES
// ============================================

interface SimulatorMobileProps {
  tabs: TabConfig[];
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
  fineTuneSettings: FineTuneSettings;
}

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-xl border bg-muted/30"
    >
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full p-3 text-left',
            'min-h-[48px] rounded-xl transition-colors',
            'hover:bg-muted/50 active:scale-[0.99]',
            isOpen && 'border-b'
          )}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
            {badge}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="p-3 pt-0">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export const SimulatorMobile = memo(function SimulatorMobile({
  tabs,
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
  fineTuneSettings,
}: SimulatorMobileProps) {
  const strategyConfig = STRATEGY_CONFIG[strategy];

  return (
    <div className="mt-4 space-y-3">
      {tabs.map((tab) => {
        const Icon = getIcon(tab.icon);
        const isStrategySpecific =
          tab.id === 'insights' ||
          tab.id === 'job-alignment' ||
          tab.id === 'team-comparison';

        return (
          <CollapsibleSection
            key={tab.id}
            title={tab.title}
            icon={
              <Icon
                className={cn(
                  'h-4 w-4',
                  isStrategySpecific
                    ? strategyConfig.iconText
                    : 'text-muted-foreground'
                )}
              />
            }
            defaultOpen={tab.defaultOpen}
            badge={
              isStrategySpecific ? (
                <Badge
                  variant="outline"
                  className={cn('text-[10px] ml-2', strategyConfig.border)}
                >
                  {strategyConfig.shortLabel}
                </Badge>
              ) : undefined
            }
          >
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
          </CollapsibleSection>
        );
      })}
    </div>
  );
});

export default SimulatorMobile;
