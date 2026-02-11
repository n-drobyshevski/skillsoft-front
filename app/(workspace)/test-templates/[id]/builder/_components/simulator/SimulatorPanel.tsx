'use client';

import React, { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertTriangle,
  Loader2,
  Play,
  Target,
  Clock,
  HelpCircle,
  LineChart,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from '../BlueprintWorkspaceProvider';
import { PersonaSelector } from './PersonaSelector';
import { WarningsList } from './WarningsList';
import { SimulationProfile } from './types';

// Strategy-aware components
import { StrategyHeroBadge } from './StrategyHeroBadge';
import { StrategyScoreDisplay } from './StrategyScoreDisplay';
import { StrategyEmptyState } from './StrategyEmptyState';
import { StrategyLoadingSkeleton } from './StrategyLoadingSkeleton';
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary';
import {
  Strategy,
  STRATEGY_CONFIG,
  STRATEGY_HELP_CONTENT,
  validateStrategy,
} from './strategy-context';

// ============================================
// LAZY LOADED COMPONENTS
// ============================================

// Lazy-load heavy tab components with charts
const AnalyticsTab = lazy(
  () => import(/* webpackChunkName: "simulator-analytics" */ './tabs/AnalyticsTab')
);
const TimelineTab = lazy(
  () => import(/* webpackChunkName: "simulator-timeline" */ './tabs/TimelineTab')
);
const FineTuneTab = lazy(
  () => import(/* webpackChunkName: "simulator-finetune" */ './tabs/FineTuneTab')
);
const StrategyInsightsTab = lazy(
  () => import(/* webpackChunkName: "simulator-insights" */ './tabs/StrategyInsightsTab')
);

// Preload functions for eager loading after simulation
const preloadAnalytics = () =>
  import(/* webpackChunkName: "simulator-analytics" */ './tabs/AnalyticsTab');
const preloadTimeline = () =>
  import(/* webpackChunkName: "simulator-timeline" */ './tabs/TimelineTab');
const preloadInsights = () =>
  import(/* webpackChunkName: "simulator-insights" */ './tabs/StrategyInsightsTab');

// ============================================
// TYPES
// ============================================

interface SimulatorPanelProps {
  /** Render mode: desktop uses tabs, mobile uses stacked sections */
  variant?: 'desktop' | 'mobile';
}

// ============================================
// HELPER COMPONENTS
// ============================================

function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

// Strategy-aware help content
function HelpTab({ strategy }: { strategy: Strategy }) {
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

// Collapsible section for mobile view
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

export function SimulatorPanel({ variant = 'desktop' }: SimulatorPanelProps) {
  const { state, isSimulating, simulationResult, runSimulation, updateSettings } =
    useBlueprintWorkspace();

  const [selectedProfile, setSelectedProfile] =
    useState<SimulationProfile>('RANDOM_GUESSER');
  const [strictness, setStrictness] = useState<number>(state.strictnessLevel ?? 50);
  const [saturation, setSaturation] = useState<number>(state.saturationThreshold ?? 70);
  const [allowBacktracking, setAllowBacktracking] = useState<boolean>(
    state.adaptivity?.allowBacktracking ?? true
  );

  // Get strategy from blueprint state
  const strategy: Strategy = state.strategy || 'UNIVERSAL_BASELINE';
  const strategyConfig = STRATEGY_CONFIG[strategy];
  const validation = validateStrategy(strategy, state.onetSocCode, state.teamId);

  useEffect(() => {
    setStrictness(state.strictnessLevel ?? 50);
    setSaturation(state.saturationThreshold ?? 70);
    setAllowBacktracking(state.adaptivity?.allowBacktracking ?? true);
  }, [state.strictnessLevel, state.saturationThreshold, state.adaptivity]);

  const applySettings = useCallback(() => {
    const adaptivity = state.adaptivity || {
      mode: 'ADAPTIVE_STANDARD',
      allowBacktracking: true,
    };

    updateSettings({
      strictnessLevel: strictness,
      saturationThreshold: saturation,
      adaptivity: {
        ...adaptivity,
        allowBacktracking,
      },
    });
  }, [updateSettings, strictness, saturation, allowBacktracking, state.adaptivity]);

  const handleRunSimulation = useCallback(() => {
    applySettings();
    runSimulation(selectedProfile);
  }, [applySettings, runSimulation, selectedProfile]);

  // Preload tab chunks when simulation result arrives
  useEffect(() => {
    if (simulationResult) {
      preloadTimeline();
      preloadInsights();
      const timer = setTimeout(() => {
        preloadAnalytics();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [simulationResult]);

  const canSimulate = state.competencies.length > 0;

  // Pre-flight validation warnings (strategy-aware)
  const preflightWarnings = React.useMemo(() => {
    const warnings: string[] = [];

    // No competencies
    if (state.competencies.length === 0) {
      warnings.push('No competencies added');
    }
    // Too few competencies
    else if (state.competencies.length < 3) {
      warnings.push(
        `Only ${state.competencies.length} competency - consider adding more for balanced assessment`
      );
    }

    // Check weight balance
    if (state.competencies.length > 0) {
      const totalWeight = state.competencies.reduce((sum, c) => sum + (c.weight ?? 1), 0);
      const maxWeight = Math.max(...state.competencies.map((c) => c.weight ?? 1));
      if (totalWeight > 0 && maxWeight / totalWeight > 0.5) {
        const heaviest = state.competencies.find((c) => (c.weight ?? 1) === maxWeight);
        warnings.push(
          `${heaviest?.name || 'One competency'} has >50% weight - may skew results`
        );
      }
    }

    // Check question counts
    const lowQuestionComps = state.competencies.filter((c) => c.questionCount < 3);
    if (lowQuestionComps.length > 0) {
      warnings.push(
        `${lowQuestionComps.length} competenc${lowQuestionComps.length === 1 ? 'y has' : 'ies have'} few questions`
      );
    }

    // Strategy-specific warnings
    if (strategy === 'TARGETED_FIT' && !state.onetSocCode) {
      warnings.push('No O*NET SOC code - job alignment disabled');
    }
    if (strategy === 'DYNAMIC_GAP_ANALYSIS' && !state.teamId) {
      warnings.push('No team selected - gap analysis limited');
    }

    return warnings;
  }, [state.competencies, strategy, state.onetSocCode, state.teamId]);

  const hasPreflightWarnings = preflightWarnings.length > 0 && canSimulate;

  return (
    <SimulatorErrorBoundary>
      <div className={cn('flex flex-col h-full min-h-0', strategyConfig.bg)}>
        {/* Strategy + Persona Header */}
        <div className="p-3 border-b bg-background/50 space-y-3">
          {/* Strategy Badge */}
          <StrategyHeroBadge
            strategy={strategy}
            validation={validation}
            variant={variant === 'mobile' ? 'expanded' : 'compact'}
          />

          {/* Persona Selector + Run Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Test Persona
            </span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'min-h-[44px] md:h-7 md:min-h-0 text-xs gap-1.5 rounded-lg active:scale-95',
                        hasPreflightWarnings && 'border-amber-500/50 hover:border-amber-500',
                        strategyConfig.focusColor
                      )}
                      onClick={handleRunSimulation}
                      disabled={isSimulating || !canSimulate}
                      aria-label={
                        isSimulating
                          ? 'Running simulation'
                          : hasPreflightWarnings
                            ? `Run simulation (${preflightWarnings.length} warnings)`
                            : 'Run simulation'
                      }
                    >
                      {isSimulating ? (
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      ) : hasPreflightWarnings ? (
                        <AlertTriangle className="h-3 w-3 text-amber-500" aria-hidden="true" />
                      ) : (
                        <Play className="h-3 w-3" aria-hidden="true" />
                      )}
                      Run
                    </Button>
                    {hasPreflightWarnings && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 text-[10px] font-bold bg-amber-500 text-white border-0 rounded-full"
                      >
                        <span className="sr-only">warnings: </span>
                        {preflightWarnings.length}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                {hasPreflightWarnings && (
                  <TooltipContent side="bottom" align="end" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Pre-flight warnings
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {preflightWarnings.map((warning, i) => (
                          <li key={i}>* {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <PersonaSelector
            selected={selectedProfile}
            onSelect={setSelectedProfile}
            disabled={isSimulating}
          />
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-4">
            {!canSimulate ? (
              <StrategyEmptyState strategy={strategy} type="no-competencies" />
            ) : isSimulating && !simulationResult ? (
              <StrategyLoadingSkeleton strategy={strategy} />
            ) : simulationResult ? (
              <>
                {/* Strategy-Aware Score Display */}
                <StrategyScoreDisplay
                  strategy={strategy}
                  score={simulationResult.simulatedScore}
                  passingScore={state.passingScore}
                  profile={selectedProfile}
                  competencyCount={state.competencies.length}
                  onetSocCode={state.onetSocCode}
                  teamId={state.teamId}
                  teamBenchmark={75} // TODO: Get from team data
                />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-[10px] text-muted-foreground">Duration</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {simulationResult.estimatedDurationMinutes} min
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-[10px] text-muted-foreground">Questions</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {simulationResult.sampleQuestions.length}
                    </span>
                  </div>
                </div>

                {/* Warnings */}
                <WarningsList warnings={simulationResult.warnings} />

                {/* Mobile: Collapsible sections / Desktop: Tabs */}
                {variant === 'mobile' ? (
                  // Mobile: Stacked collapsible sections
                  <div className="mt-4 space-y-3">
                    <CollapsibleSection
                      title="Timeline"
                      icon={<LineChart className="h-4 w-4 text-muted-foreground" />}
                      defaultOpen={strategy === 'UNIVERSAL_BASELINE'}
                    >
                      <Suspense fallback={<TabSkeleton />}>
                        <TimelineTab result={simulationResult} />
                      </Suspense>
                    </CollapsibleSection>

                    {/* Strategy Insights - NEW */}
                    <CollapsibleSection
                      title="Strategy Insights"
                      icon={
                        <Lightbulb
                          className={cn('h-4 w-4', strategyConfig.iconText)}
                        />
                      }
                      badge={
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] ml-2', strategyConfig.border)}
                        >
                          {strategyConfig.shortLabel}
                        </Badge>
                      }
                      defaultOpen={strategy !== 'UNIVERSAL_BASELINE'}
                    >
                      <Suspense fallback={<TabSkeleton />}>
                        <StrategyInsightsTab
                          result={simulationResult}
                          strategy={strategy}
                          onetSocCode={state.onetSocCode}
                          teamId={state.teamId}
                        />
                      </Suspense>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Statistics"
                      icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    >
                      <Suspense fallback={<TabSkeleton />}>
                        <AnalyticsTab result={simulationResult} />
                      </Suspense>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Fine Tune"
                      icon={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
                    >
                      <Suspense fallback={<TabSkeleton />}>
                        <FineTuneTab
                          strictness={strictness}
                          onStrictnessChange={setStrictness}
                          saturation={saturation}
                          onSaturationChange={setSaturation}
                          allowBacktracking={allowBacktracking}
                          onAllowBacktrackingChange={setAllowBacktracking}
                          onApply={applySettings}
                          onRun={handleRunSimulation}
                          disabled={isSimulating}
                        />
                      </Suspense>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Help"
                      icon={<HelpCircle className="h-4 w-4 text-muted-foreground" />}
                    >
                      <HelpTab strategy={strategy} />
                    </CollapsibleSection>
                  </div>
                ) : (
                  // Desktop: Tabs with 5 items - scrollable tab content
                  <Tabs defaultValue="timeline" className="mt-4 flex flex-col flex-1 min-h-0">
                    <TabsList className="grid grid-cols-5 gap-1 p-1 w-full h-auto bg-muted/50 shrink-0">
                      <TabsTrigger
                        value="timeline"
                        className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <LineChart className="h-4 w-4" aria-hidden="true" />
                        <span>Timeline</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="insights"
                        className={cn(
                          'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm'
                        )}
                      >
                        <Lightbulb className="h-4 w-4" aria-hidden="true" />
                        <span>Insights</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="analytics"
                        className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <BarChart3 className="h-4 w-4" aria-hidden="true" />
                        <span>Stats</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="fine"
                        className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                        <span>Tune</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="help"
                        className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <HelpCircle className="h-4 w-4" aria-hidden="true" />
                        <span>Help</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeline" className="mt-3">
                      <Suspense fallback={<TabSkeleton />}>
                        <TimelineTab result={simulationResult} />
                      </Suspense>
                    </TabsContent>

                    <TabsContent value="insights" className="mt-3">
                      <Suspense fallback={<TabSkeleton />}>
                        <StrategyInsightsTab
                          result={simulationResult}
                          strategy={strategy}
                          onetSocCode={state.onetSocCode}
                          teamId={state.teamId}
                        />
                      </Suspense>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-3">
                      <Suspense fallback={<TabSkeleton />}>
                        <AnalyticsTab result={simulationResult} />
                      </Suspense>
                    </TabsContent>

                    <TabsContent value="fine" className="mt-3">
                      <Suspense fallback={<TabSkeleton />}>
                        <FineTuneTab
                          strictness={strictness}
                          onStrictnessChange={setStrictness}
                          saturation={saturation}
                          onSaturationChange={setSaturation}
                          allowBacktracking={allowBacktracking}
                          onAllowBacktrackingChange={setAllowBacktracking}
                          onApply={applySettings}
                          onRun={handleRunSimulation}
                          disabled={isSimulating}
                        />
                      </Suspense>
                    </TabsContent>

                    <TabsContent value="help" className="mt-3">
                      <HelpTab strategy={strategy} />
                    </TabsContent>
                  </Tabs>
                )}
              </>
            ) : !validation.isValid ? (
              <StrategyEmptyState strategy={strategy} type="missing-config" />
            ) : (
              <StrategyEmptyState
                strategy={strategy}
                type="no-simulation"
                onAction={handleRunSimulation}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </SimulatorErrorBoundary>
  );
}

export default SimulatorPanel;
