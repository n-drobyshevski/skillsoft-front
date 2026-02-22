'use client';

/**
 * MobileResultsView
 *
 * Mobile results layout with priority stack and floating action bar.
 * Uses shadcn Select/Button for visual consistency with desktop.
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
import { MobilePriorityStack } from './MobilePriorityStack';

// ============================================
// PERSONA ICONS
// ============================================

const PERSONA_ICONS: Record<SimulationProfile, React.ElementType> = {
  PERFECT_CANDIDATE: Sparkles,
  RANDOM_GUESSER: Shuffle,
  FAILING_CANDIDATE: TrendingDown,
};

// ============================================
// TYPES
// ============================================

interface MobileResultsViewProps {
  result: SimulationResult;
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

// ============================================
// MAIN COMPONENT
// ============================================

export const MobileResultsView = memo(function MobileResultsView({
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
  const config = STRATEGY_CONFIG[strategy];
  const profiles = Object.keys(personaConfig) as SimulationProfile[];
  const Icon = PERSONA_ICONS[selectedProfile];

  return (
    <div className="flex flex-col">
      {/* Priority Stack Layout */}
      <MobilePriorityStack
        result={result}
        strategy={strategy}
        profile={selectedProfile}
        passingScore={passingScore}
        competencyCount={competencyCount}
        onetSocCode={onetSocCode}
        teamId={teamId}
        fineTuneSettings={fineTuneSettings}
      />

      {/* Floating Action Bar */}
      <div
        className={cn(
          'sticky bottom-0 left-0 right-0 z-30',
          'p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t',
          'flex items-center gap-2'
        )}
      >
        {/* Persona Selector (shadcn) */}
        <Select
          value={selectedProfile}
          onValueChange={(v) => onProfileChange(v as SimulationProfile)}
          disabled={isSimulating}
        >
          <SelectTrigger className="w-[140px] h-11">
            <SelectValue>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm">
                  {t(personaConfig[selectedProfile].labelKey as Parameters<typeof t>[0])}
                </span>
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

        {/* Re-run Button (shadcn) */}
        <Button
          onClick={onRun}
          disabled={isSimulating}
          className={cn('flex-1 h-11 gap-2', config.badgeBg)}
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
    </div>
  );
});

export default MobileResultsView;
