'use client';

import React, { Suspense, lazy, memo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  ChevronDown,
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

// FineTuneTab is small, direct import
import FineTuneTab from '../tabs/FineTuneTab';

// ============================================
// TYPES
// ============================================

interface SimulatorMobileProps {
  /** Ordered tabs based on strategy */
  tabs: TabConfig[];
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
// SECTION CONTENT RENDERER
// ============================================

interface SectionContentProps {
  tabId: string;
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
  fineTuneSettings: SimulatorMobileProps['fineTuneSettings'];
}

function SectionContent({
  tabId,
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
  fineTuneSettings,
}: SectionContentProps) {
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
            <SectionContent
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
