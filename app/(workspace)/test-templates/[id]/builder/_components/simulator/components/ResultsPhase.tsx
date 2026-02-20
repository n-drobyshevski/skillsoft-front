'use client';

/**
 * ResultsPhase
 *
 * The results phase of the simulator shown after a simulation has completed.
 * Features the score display prominently, with tabs/sections for detailed
 * analysis and a floating re-run button for quick iteration.
 */

import React, { memo, Suspense, lazy } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Play, RefreshCw, Sparkles, Shuffle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';
import { SimulationResult, SimulationProfile, personaConfig } from '../types';
import { TabConfig } from '../hooks/useStrategyTabs';
import { StrategyScoreDisplay } from '../StrategyScoreDisplay';
import { SimulatorResults } from './SimulatorResults';
import { SimulatorTabs } from './SimulatorTabs';
import { SimulatorMobile } from './SimulatorMobile';

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
  /** Render variant */
  variant?: 'desktop' | 'mobile';
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
// FLOATING ACTION BAR
// ============================================

interface FloatingActionBarProps {
  selectedProfile: SimulationProfile;
  onProfileChange: (profile: SimulationProfile) => void;
  onRun: () => void;
  isSimulating: boolean;
  strategy: Strategy;
}

const FloatingActionBar = memo(function FloatingActionBar({
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  strategy,
}: FloatingActionBarProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];
  const Icon = PERSONA_ICONS[selectedProfile];
  const profiles = Object.keys(personaConfig) as SimulationProfile[];

  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 z-10',
        'p-3 -mx-3 -mb-3 mt-4',
        'bg-background/95 backdrop-blur-sm border-t',
        'flex items-center gap-2'
      )}
    >
      {/* Compact Persona Selector */}
      <Select
        value={selectedProfile}
        onValueChange={(v) => onProfileChange(v as SimulationProfile)}
        disabled={isSimulating}
      >
        <SelectTrigger className="w-[140px] h-10">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{t(personaConfig[selectedProfile].labelKey as Parameters<typeof t>[0])}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => {
            const ProfileIcon = PERSONA_ICONS[profile];
            return (
              <SelectItem key={profile} value={profile}>
                <div className="flex items-center gap-2">
                  <ProfileIcon className="h-4 w-4" />
                  <span>{t(personaConfig[profile].labelKey as Parameters<typeof t>[0])}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Re-run Button */}
      <Button
        onClick={onRun}
        disabled={isSimulating}
        className={cn('flex-1 h-10 gap-2', config.badgeBg)}
      >
        {isSimulating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('running')}
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            {t('rerunSimulation')}
          </>
        )}
      </Button>
    </div>
  );
});

// ============================================
// RESULTS HEADER (compact persona + re-run for desktop)
// ============================================

interface ResultsHeaderProps {
  selectedProfile: SimulationProfile;
  onProfileChange: (profile: SimulationProfile) => void;
  onRun: () => void;
  isSimulating: boolean;
  strategy: Strategy;
}

const ResultsHeader = memo(function ResultsHeader({
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  strategy,
}: ResultsHeaderProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];
  const Icon = PERSONA_ICONS[selectedProfile];
  const profiles = Object.keys(personaConfig) as SimulationProfile[];

  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      {/* Current Persona Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5 py-1 px-2">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-xs">
            {t('personas.candidate', {
              persona: t(personaConfig[selectedProfile].labelKey as Parameters<typeof t>[0]),
            })}
          </span>
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
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

        {/* Re-run Button */}
        <Button
          size="sm"
          onClick={onRun}
          disabled={isSimulating}
          className={cn('h-8 gap-1.5', config.badgeBg)}
        >
          {isSimulating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {t('rerun')}
        </Button>
      </div>
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
  variant = 'desktop',
}: ResultsPhaseProps) {
  return (
    <div className="flex flex-col">
      {/* Desktop: Header with persona selector and re-run */}
      {variant === 'desktop' && (
        <ResultsHeader
          selectedProfile={selectedProfile}
          onProfileChange={onProfileChange}
          onRun={onRun}
          isSimulating={isSimulating}
          strategy={strategy}
        />
      )}

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
      {variant === 'mobile' ? (
        <SimulatorMobile
          tabs={tabs}
          result={result}
          strategy={strategy}
          persona={selectedProfile}
          passingScore={passingScore}
          onetSocCode={onetSocCode}
          teamId={teamId}
          fineTuneSettings={fineTuneSettings}
        />
      ) : (
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
      )}

      {/* Mobile: Floating Action Bar */}
      {variant === 'mobile' && (
        <FloatingActionBar
          selectedProfile={selectedProfile}
          onProfileChange={onProfileChange}
          onRun={onRun}
          isSimulating={isSimulating}
          strategy={strategy}
        />
      )}
    </div>
  );
});

export default ResultsPhase;
