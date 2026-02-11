'use client';

/**
 * SimulatorPanelV2 - Refactored Simulator Panel
 *
 * This is a decomposed, cleaner version of the original SimulatorPanel.
 * Key improvements:
 * - Separated into focused sub-components (Header, Results, Tabs, Mobile)
 * - Uses hooks for strategy tabs ordering and preflight validation
 * - Dynamic tab ordering based on assessment strategy
 * - Memoized components to prevent unnecessary re-renders
 *
 * @see ./components/SimulatorHeader.tsx - Strategy badge, persona selector, run button
 * @see ./components/SimulatorResults.tsx - Score display, stats grid, warnings
 * @see ./components/SimulatorTabs.tsx - Desktop tabs with dynamic ordering
 * @see ./components/SimulatorMobile.tsx - Mobile collapsible sections
 * @see ./hooks/useStrategyTabs.ts - Dynamic tab ordering hook
 * @see ./hooks/usePreflightValidation.ts - Preflight validation hook
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from '../BlueprintWorkspaceProvider';

// Strategy context
import {
  Strategy,
  STRATEGY_CONFIG,
  validateStrategy,
} from './strategy-context';

// Types
import { SimulationProfile } from './types';

// Hooks
import {
  useAvailableStrategyTabs,
  useDefaultTab,
} from './hooks/useStrategyTabs';
import { usePreflightValidation } from './hooks/usePreflightValidation';

// Components
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary';
import { StrategyEmptyState } from './StrategyEmptyState';
import { StrategyLoadingSkeleton } from './StrategyLoadingSkeleton';
import { SimulatorHeader } from './components/SimulatorHeader';
import { SimulatorResults } from './components/SimulatorResults';
import { SimulatorTabs } from './components/SimulatorTabs';
import { SimulatorMobile } from './components/SimulatorMobile';

// ============================================
// TYPES
// ============================================

interface SimulatorPanelV2Props {
  /** Render mode: desktop uses tabs, mobile uses stacked sections */
  variant?: 'desktop' | 'mobile';
}

// ============================================
// PRELOAD FUNCTIONS
// ============================================

// Preload heavy tab components after simulation
const preloadAnalytics = () =>
  import(/* webpackChunkName: "simulator-analytics" */ './tabs/AnalyticsTab');
const preloadTimeline = () =>
  import(/* webpackChunkName: "simulator-timeline" */ './tabs/TimelineTab');
const preloadInsights = () =>
  import(/* webpackChunkName: "simulator-insights" */ './tabs/StrategyInsightsTab');

// ============================================
// MAIN COMPONENT
// ============================================

export function SimulatorPanelV2({ variant = 'desktop' }: SimulatorPanelV2Props) {
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

  const fineTuneSettings = {
    strictness,
    saturation,
    allowBacktracking,
    onStrictnessChange: setStrictness,
    onSaturationChange: setSaturation,
    onAllowBacktrackingChange: setAllowBacktracking,
    onApply: applySettings,
    onRun: handleRunSimulation,
    disabled: isSimulating,
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderContent = () => {
    // No competencies - show empty state
    if (!preflight.canSimulate) {
      return <StrategyEmptyState strategy={strategy} type="no-competencies" />;
    }

    // Simulating - show loading skeleton
    if (isSimulating && !simulationResult) {
      return <StrategyLoadingSkeleton strategy={strategy} />;
    }

    // Has results - show results and tabs
    if (simulationResult) {
      return (
        <>
          <SimulatorResults
            result={simulationResult}
            strategy={strategy}
            profile={selectedProfile}
            passingScore={state.passingScore}
            competencyCount={state.competencies.length}
            onetSocCode={state.onetSocCode}
            teamId={state.teamId}
            teamBenchmark={75} // TODO: Get from team data
          />

          {variant === 'mobile' ? (
            <SimulatorMobile
              tabs={orderedTabs}
              result={simulationResult}
              strategy={strategy}
              persona={selectedProfile}
              passingScore={state.passingScore}
              onetSocCode={state.onetSocCode}
              teamId={state.teamId}
              fineTuneSettings={fineTuneSettings}
            />
          ) : (
            <SimulatorTabs
              tabs={orderedTabs}
              defaultTab={defaultTab}
              result={simulationResult}
              strategy={strategy}
              persona={selectedProfile}
              passingScore={state.passingScore}
              onetSocCode={state.onetSocCode}
              teamId={state.teamId}
              fineTuneSettings={fineTuneSettings}
            />
          )}
        </>
      );
    }

    // Strategy validation failed - show config needed state
    if (!validation.isValid) {
      return <StrategyEmptyState strategy={strategy} type="missing-config" />;
    }

    // Ready to simulate - show initial empty state with run prompt
    return (
      <StrategyEmptyState
        strategy={strategy}
        type="no-simulation"
        onAction={handleRunSimulation}
      />
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <SimulatorErrorBoundary>
      <div className={cn('flex flex-col h-full min-h-0', strategyConfig.bg)}>
        {/* Header: Strategy Badge + Persona Selector + Run Button */}
        <SimulatorHeader
          strategy={strategy}
          validation={validation}
          selectedProfile={selectedProfile}
          onProfileChange={setSelectedProfile}
          onRun={handleRunSimulation}
          isSimulating={isSimulating}
          preflight={preflight}
          variant={variant}
        />

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-4">{renderContent()}</div>
        </ScrollArea>
      </div>
    </SimulatorErrorBoundary>
  );
}

export default SimulatorPanelV2;
