'use client';

/**
 * SimulatorPanelV3 - Two-Phase Simulator Panel
 *
 * This version implements the two-phase UI pattern:
 *
 * Phase 1: CONFIGURE (before simulation)
 * - Strategy badge (prominent, expanded)
 * - Visible preflight warnings (not hidden in tooltip)
 * - Persona selection card
 * - Large, prominent "Run Simulation" CTA
 *
 * Phase 2: RESULTS (after simulation)
 * - Score display (hero position)
 * - Compact persona selector + re-run button
 * - Strategy-ordered tabs for detailed analysis
 * - Mobile: Floating action bar for quick re-runs
 *
 * Key UX improvements over V2:
 * - Progressive disclosure - shows only what's needed in each phase
 * - Prominent actions - Run CTA is large and obvious
 * - Visible warnings - Preflight issues shown inline, not in tooltips
 * - Quick iteration - Re-run is always accessible
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
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary';
import { StrategyEmptyState } from './StrategyEmptyState';
import { StrategyLoadingSkeleton } from './StrategyLoadingSkeleton';
import { ConfigurePhase } from './components/ConfigurePhase';
import { ResultsPhase } from './components/ResultsPhase';

// ============================================
// TYPES
// ============================================

interface SimulatorPanelV3Props {
  /** Render mode: desktop uses tabs, mobile uses stacked sections */
  variant?: 'desktop' | 'mobile';
}

type SimulatorPhase = 'configure' | 'results' | 'loading' | 'error';

// ============================================
// PRELOAD FUNCTIONS
// ============================================

const preloadAnalytics = () =>
  import(/* webpackChunkName: "simulator-analytics" */ './tabs/AnalyticsTab');
const preloadTimeline = () =>
  import(/* webpackChunkName: "simulator-timeline" */ './tabs/TimelineTab');
const preloadInsights = () =>
  import(/* webpackChunkName: "simulator-insights" */ './tabs/StrategyInsightsTab');

// ============================================
// MAIN COMPONENT
// ============================================

export function SimulatorPanelV3({ variant = 'desktop' }: SimulatorPanelV3Props) {
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
    // Loading state takes priority
    if (isSimulating && !simulationResult) {
      return 'loading';
    }

    // If we have results, show results phase
    if (simulationResult) {
      return 'results';
    }

    // Otherwise, configure phase
    return 'configure';
  }, [isSimulating, simulationResult]);

  // ============================================
  // HOOKS
  // ============================================

  // Dynamic tab ordering based on strategy
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

  // Preflight validation
  const preflight = usePreflightValidation({
    competencies: state.competencies,
    strategy,
    onetSocCode: state.onetSocCode,
    teamId: state.teamId,
  });

  // ============================================
  // EFFECTS
  // ============================================

  // Sync local state with blueprint state changes
  useEffect(() => {
    setStrictness(state.strictnessLevel ?? 50);
    setSaturation(state.saturationThreshold ?? 70);
    setAllowBacktracking(state.adaptivity?.allowBacktracking ?? true);
  }, [state.strictnessLevel, state.saturationThreshold, state.adaptivity]);

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
        return <StrategyLoadingSkeleton strategy={strategy} />;

      case 'results':
        if (!simulationResult) return null;
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
            variant={variant}
          />
        );

      case 'configure':
      default:
        // Check if strategy validation failed (missing required config)
        if (!validation.isValid && state.competencies.length > 0) {
          return (
            <StrategyEmptyState
              strategy={strategy}
              type="missing-config"
            />
          );
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

export default SimulatorPanelV3;
