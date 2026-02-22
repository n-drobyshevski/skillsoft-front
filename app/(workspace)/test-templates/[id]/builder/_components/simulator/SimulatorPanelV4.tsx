'use client';

/**
 * SimulatorPanelV4 - Mobile Priority Stack Edition
 *
 * This version combines all optimizations:
 * - P0: Component decomposition + dynamic tab ordering
 * - P1 (Phase 3): Two-phase UI with prominent CTA
 * - P1 (Phase 4): Mobile priority stack with bottom sheet
 *
 * Mobile Experience:
 * - Configure Phase: Strategy badge, visible warnings, persona card, large Run CTA
 * - Results Phase: Primary insight (expanded), quick stats, accordion sections
 * - Floating Fine Tune button → opens bottom sheet
 * - Floating action bar for quick re-runs
 *
 * Desktop Experience:
 * - Configure Phase: Same as mobile but optimized layout
 * - Results Phase: Compact header, dynamic tabs, inline fine tune
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from '../BlueprintWorkspaceProvider';

// Strategy context
import { Strategy, STRATEGY_CONFIG, validateStrategy } from './strategy-context';

// Types
import { SimulationProfile } from './types';

// Hooks
import { useAvailableStrategyTabs, useDefaultTab } from './hooks/useStrategyTabs';
import { usePreflightValidation } from './hooks/usePreflightValidation';

// Components
import { useTranslations } from 'next-intl';
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary';
import { SimulationLoadingStepper } from './SimulationLoadingStepper';
import { StrategyEmptyState } from './StrategyEmptyState';
import { ConfigurePhase } from './components/ConfigurePhase';
import { ResultsPhase } from './components/ResultsPhase';
import { MobilePriorityStack } from './components/MobilePriorityStack';
import { SimulatorTabs } from './components/SimulatorTabs';
import { personaConfig } from './types';

// ============================================
// TYPES
// ============================================

interface SimulatorPanelV4Props {
  /** Render mode: desktop uses tabs, mobile uses priority stack */
  variant?: 'desktop' | 'mobile';
}

type SimulatorPhase = 'configure' | 'results' | 'loading';

// ============================================
// PRELOAD FUNCTIONS (OPTIMIZED TABS)
// ============================================

const preloadResultsTab = () =>
  import(/* webpackChunkName: "simulator-results-tab" */ './tabs/ResultsTab');
const preloadQuestionsTab = () =>
  import(/* webpackChunkName: "simulator-questions-tab" */ './tabs/QuestionsTab');

// ============================================
// MOBILE RESULTS VIEW
// ============================================

interface MobileResultsViewProps {
  result: NonNullable<ReturnType<typeof useBlueprintWorkspace>['simulationResult']>;
  strategy: Strategy;
  passingScore: number;
  competencyCount: number;
  onetSocCode?: string;
  teamId?: string;
  selectedProfile: SimulationProfile;
  onProfileChange: (profile: SimulationProfile) => void;
  onRun: () => void;
  isSimulating: boolean;
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

function MobileResultsView({
  result,
  strategy,
  passingScore,
  competencyCount,
  onetSocCode,
  teamId,
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  fineTuneSettings,
}: MobileResultsViewProps) {
  const t = useTranslations('builder.simulator');
  const profiles = Object.keys(personaConfig) as SimulationProfile[];

  return (
    <div className="flex flex-col">
      {/* Priority Stack Layout */}
      <MobilePriorityStack
        result={result}
        strategy={strategy}
        passingScore={passingScore}
        competencyCount={competencyCount}
        onetSocCode={onetSocCode}
        teamId={teamId}
        fineTuneSettings={fineTuneSettings}
      />

      {/* Floating Action Bar for Re-run -- offset for mobile bottom nav (h-16 = 64px + safe area) */}
      <div
        className={cn(
          'sticky bottom-0 left-0 right-0 z-30',
          'p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t',
          'flex items-center gap-2'
        )}
      >
        {/* Persona Quick Select */}
        <select
          value={selectedProfile}
          onChange={(e) => onProfileChange(e.target.value as SimulationProfile)}
          disabled={isSimulating}
          className={cn(
            'h-11 px-3 rounded-lg border bg-background text-sm appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'dark:bg-muted dark:border-border dark:text-foreground'
          )}
        >
          {profiles.map((profile) => (
            <option key={profile} value={profile}>
              {t(personaConfig[profile].labelKey as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>

        {/* Re-run Button */}
        <button
          onClick={onRun}
          disabled={isSimulating}
          className={cn(
            'flex-1 h-11 rounded-lg font-medium text-sm',
            'flex items-center justify-center gap-2',
            'transition-colors',
            STRATEGY_CONFIG[strategy].badgeBg,
            'text-white disabled:opacity-50'
          )}
        >
          {isSimulating ? (
            <>
              <span className="animate-spin">⟳</span>
              {t('running')}
            </>
          ) : (
            <>
              ↻ {t('rerunSimulation')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SimulatorPanelV4({ variant = 'desktop' }: SimulatorPanelV4Props) {
  // ============================================
  // CONTEXT
  // ============================================

  const { state, isSimulating, simulationResult, runSimulation, updateSettings } =
    useBlueprintWorkspace();

  // ============================================
  // LOCAL STATE
  // ============================================

  const [selectedProfile, setSelectedProfile] =
    useState<SimulationProfile>('RANDOM_GUESSER');
  const [strictness, setStrictness] = useState<number>(state.strictnessLevel ?? 50);
  const [saturation, setSaturation] = useState<number>(state.saturationThreshold ?? 70);
  const [allowBacktracking, setAllowBacktracking] = useState<boolean>(
    state.adaptivity?.allowBacktracking ?? true
  );

  // ============================================
  // DERIVED STATE
  // ============================================

  const strategy: Strategy = state.strategy || 'UNIVERSAL_BASELINE';
  const strategyConfig = STRATEGY_CONFIG[strategy];
  const validation = validateStrategy(strategy, state.onetSocCode, state.teamId);

  // ============================================
  // DETERMINE CURRENT PHASE
  // ============================================

  const currentPhase = useMemo((): SimulatorPhase => {
    if (isSimulating && !simulationResult) {
      return 'loading';
    }
    if (simulationResult) {
      return 'results';
    }
    return 'configure';
  }, [isSimulating, simulationResult]);

  // ============================================
  // HOOKS
  // ============================================

  const orderedTabs = useAvailableStrategyTabs({
    strategy,
    onetSocCode: state.onetSocCode,
    teamId: state.teamId,
  });

  const defaultTab = useDefaultTab({
    strategy,
    onetSocCode: state.onetSocCode,
    teamId: state.teamId,
  });

  const preflight = usePreflightValidation({
    competencies: state.competencies,
    strategy,
    onetSocCode: state.onetSocCode,
    teamId: state.teamId,
  });

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    setStrictness(state.strictnessLevel ?? 50);
    setSaturation(state.saturationThreshold ?? 70);
    setAllowBacktracking(state.adaptivity?.allowBacktracking ?? true);
  }, [state.strictnessLevel, state.saturationThreshold, state.adaptivity]);

  useEffect(() => {
    if (simulationResult) {
      preloadResultsTab();
      preloadQuestionsTab();
    }
  }, [simulationResult]);

  // ============================================
  // CALLBACKS
  // ============================================

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

  // ============================================
  // FINE TUNE SETTINGS OBJECT
  // ============================================

  const fineTuneSettings = useMemo(
    () => ({
      strictness,
      saturation,
      allowBacktracking,
      onStrictnessChange: setStrictness,
      onSaturationChange: setSaturation,
      onAllowBacktrackingChange: setAllowBacktracking,
      onApply: applySettings,
      onRun: handleRunSimulation,
      disabled: isSimulating,
    }),
    [strictness, saturation, allowBacktracking, applySettings, handleRunSimulation, isSimulating]
  );

  // ============================================
  // RENDER CONTENT BY PHASE
  // ============================================

  const renderContent = () => {
    switch (currentPhase) {
      case 'loading':
        return <SimulationLoadingStepper strategy={strategy} profile={selectedProfile} />;

      case 'results':
        if (!simulationResult) return null;

        // Mobile: Use priority stack with floating elements
        if (variant === 'mobile') {
          return (
            <MobileResultsView
              result={simulationResult}
              strategy={strategy}
              passingScore={state.passingScore}
              competencyCount={state.competencies.length}
              onetSocCode={state.onetSocCode}
              teamId={state.teamId}
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              onRun={handleRunSimulation}
              isSimulating={isSimulating}
              fineTuneSettings={fineTuneSettings}
            />
          );
        }

        // Desktop: Use standard ResultsPhase with tabs
        return (
          <ResultsPhase
            result={simulationResult}
            strategy={strategy}
            tabs={orderedTabs}
            defaultTab={defaultTab}
            selectedProfile={selectedProfile}
            onProfileChange={setSelectedProfile}
            onRun={handleRunSimulation}
            isSimulating={isSimulating}
            passingScore={state.passingScore}
            competencyCount={state.competencies.length}
            onetSocCode={state.onetSocCode}
            teamId={state.teamId}
            fineTuneSettings={fineTuneSettings}
            variant="desktop"
          />
        );

      case 'configure':
      default:
        if (!validation.isValid && state.competencies.length > 0) {
          return <StrategyEmptyState strategy={strategy} type="missing-config" />;
        }

        return (
          <ConfigurePhase
            strategy={strategy}
            validation={validation}
            selectedProfile={selectedProfile}
            onProfileChange={setSelectedProfile}
            onRun={handleRunSimulation}
            isSimulating={isSimulating}
            preflight={preflight}
            variant={variant}
          />
        );
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <SimulatorErrorBoundary>
      <div className={cn('flex flex-col h-full min-h-0', strategyConfig.bg)}>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3">{renderContent()}</div>
        </ScrollArea>
      </div>
    </SimulatorErrorBoundary>
  );
}

export default SimulatorPanelV4;
