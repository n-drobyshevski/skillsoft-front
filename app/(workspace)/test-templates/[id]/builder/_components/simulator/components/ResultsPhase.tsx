'use client';

/**
 * ResultsPhase
 *
 * The results phase of the simulator shown after a simulation has completed.
 * Features the score display prominently, with tabs/sections for detailed
 * analysis and a floating re-run button for quick iteration.
 */

import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw, Sparkles, Shuffle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult, SimulationProfile, personaConfig } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';
import { SimulatorResults } from './SimulatorResults';
import { SimulatorTabs } from './SimulatorTabs';
import { FineTunePopover } from './FineTunePopover';

// ============================================
// TYPES
// ============================================

interface ResultsPhaseProps {
  /** Simulation result data */
  result: SimulationResult;
  /** Current assessment strategy */
  strategy: Strategy;
  /** Ordered tabs based on strategy */
  tabs: TabConfig[];
  /** Default tab to show */
  defaultTab: string;
  /** Selected simulation persona */
  selectedProfile: SimulationProfile;
  /** Callback when persona changes */
  onProfileChange: (profile: SimulationProfile) => void;
  /** Callback to run simulation */
  onRun: () => void;
  /** Whether simulation is currently running */
  isSimulating: boolean;
  /** Passing score threshold */
  passingScore: number;
  /** Number of competencies */
  competencyCount: number;
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
// PERSONA ICONS
// ============================================

const PERSONA_ICONS: Record<SimulationProfile, React.ElementType> = {
  PERFECT_CANDIDATE: Sparkles,
  RANDOM_GUESSER: Shuffle,
  FAILING_CANDIDATE: TrendingDown,
};

// ============================================
// RESULTS HEADER (compact persona + re-run)
// ============================================

interface ResultsHeaderProps {
  selectedProfile: SimulationProfile;
  onProfileChange: (profile: SimulationProfile) => void;
  onRun: () => void;
  isSimulating: boolean;
  strategy: Strategy;
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

const ResultsHeader = memo(function ResultsHeader({
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  strategy,
  fineTuneSettings,
}: ResultsHeaderProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];
  const profiles = Object.keys(personaConfig) as SimulationProfile[];

  return (
    <div className="flex items-center justify-end gap-2 mb-4">
      {/* Persona Dropdown */}
      <Select
        value={selectedProfile}
        onValueChange={(v) => onProfileChange(v as SimulationProfile)}
        disabled={isSimulating}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder={t('personas.changePersona')} />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => {
            const ProfileIcon = PERSONA_ICONS[profile];
            return (
              <SelectItem key={profile} value={profile}>
                <div className="flex items-center gap-2">
                  <ProfileIcon className="h-3.5 w-3.5" />
                  <span>{t(personaConfig[profile].labelKey as Parameters<typeof t>[0])}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Fine Tune Popover */}
      <FineTunePopover
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

      {/* Re-run Button */}
      <Button
        size="sm"
        onClick={onRun}
        disabled={isSimulating}
        className={cn('h-8 gap-1.5 text-xs', config.badgeBg)}
      >
        {isSimulating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        {t('rerun')}
      </Button>
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const ResultsPhase = memo(function ResultsPhase({
  result,
  strategy,
  tabs,
  defaultTab,
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  passingScore,
  competencyCount,
  onetSocCode,
  teamId,
  fineTuneSettings,
}: ResultsPhaseProps) {
  return (
    <div className="flex flex-col">
      {/* Header with persona selector, fine tune popover, and re-run */}
      <ResultsHeader
          selectedProfile={selectedProfile}
          onProfileChange={onProfileChange}
          onRun={onRun}
          isSimulating={isSimulating}
          strategy={strategy}
          fineTuneSettings={fineTuneSettings}
        />

      {/* Results Display */}
      <SimulatorResults
        result={result}
        strategy={strategy}
        profile={selectedProfile}
        passingScore={passingScore}
        competencyCount={competencyCount}
        onetSocCode={onetSocCode}
        teamId={teamId}
        teamBenchmark={75}
      />

      {/* Tabs/Sections */}
      <SimulatorTabs
        tabs={tabs}
        defaultTab={defaultTab}
        result={result}
        strategy={strategy}
        persona={selectedProfile}
        passingScore={passingScore}
        onetSocCode={onetSocCode}
        teamId={teamId}
        fineTuneSettings={fineTuneSettings}
      />
    </div>
  );
});

export default ResultsPhase;
