'use client';

/**
 * ConfigurePhase
 *
 * The initial phase of the simulator shown before any simulation has run.
 * Features a prominent Run CTA, visible preflight warnings, and clear
 * persona selection.
 *
 * This replaces the scattered configuration UI with a focused,
 * action-oriented layout that guides users to run their first simulation.
 */

import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, StrategyValidation } from '../strategy-context';
import { SimulationProfile } from '../types';
import { PreflightValidationResult } from '../hooks/usePreflightValidation';
import { StrategyHeroBadge } from '../StrategyHeroBadge';
import { PersonaSelector } from '../PersonaSelector';
import { PreflightWarningsAlert } from './PreflightWarningsAlert';

// ============================================
// TYPES
// ============================================

interface ConfigurePhaseProps {
  /** Current assessment strategy */
  strategy: Strategy;
  /** Strategy validation result */
  validation: StrategyValidation;
  /** Selected simulation persona */
  selectedProfile: SimulationProfile;
  /** Callback when persona changes */
  onProfileChange: (profile: SimulationProfile) => void;
  /** Callback to run simulation */
  onRun: () => void;
  /** Whether simulation is currently running */
  isSimulating: boolean;
  /** Preflight validation result */
  preflight: PreflightValidationResult;
  /** Render variant */
  variant?: 'desktop' | 'mobile';
}

// ============================================
// PROMINENT RUN CTA
// ============================================

interface RunCTAProps {
  onRun: () => void;
  isSimulating: boolean;
  canSimulate: boolean;
  strategy: Strategy;
}

const RunCTA = memo(function RunCTA({
  onRun,
  isSimulating,
  canSimulate,
  strategy,
}: RunCTAProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];

  return (
    <Button
      size="lg"
      onClick={onRun}
      disabled={isSimulating || !canSimulate}
      className={cn(
        'w-full h-14 text-base font-semibold gap-3 rounded-xl shadow-md',
        'transition-all duration-200 active:scale-[0.98]',
        config.badgeBg
      )}
    >
      {isSimulating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {t('runningSimulation')}
        </>
      ) : (
        <>
          <Play className="h-5 w-5" />
          {t('runSimulation')}
        </>
      )}
    </Button>
  );
});

// ============================================
// STRATEGY INTRO CARD
// ============================================

interface StrategyIntroProps {
  strategy: Strategy;
  validation: StrategyValidation;
}

const StrategyIntro = memo(function StrategyIntro({
  strategy,
  validation,
}: StrategyIntroProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];

  return (
    <div className={cn('p-4 rounded-xl border', config.border, config.bg)}>
      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-lg shrink-0', config.iconBg)}>
          <Sparkles className={cn('h-5 w-5', config.iconText)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">
            {t('configure.testYourBlueprint')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('configure.runDescription')}
          </p>
        </div>
      </div>
    </div>
  );
});

// ============================================
// PERSONA SELECTION CARD
// ============================================

interface PersonaSelectionCardProps {
  selectedProfile: SimulationProfile;
  onProfileChange: (profile: SimulationProfile) => void;
  isSimulating: boolean;
}

const PersonaSelectionCard = memo(function PersonaSelectionCard({
  selectedProfile,
  onProfileChange,
  isSimulating,
}: PersonaSelectionCardProps) {
  const t = useTranslations('builder.simulator');

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{t('configure.selectTestPersona')}</CardTitle>
        <CardDescription className="text-xs">
          {t('configure.selectPersonaDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PersonaSelector
          selected={selectedProfile}
          onSelect={onProfileChange}
          disabled={isSimulating}
        />
      </CardContent>
    </Card>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const ConfigurePhase = memo(function ConfigurePhase({
  strategy,
  validation,
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  preflight,
  variant = 'desktop',
}: ConfigurePhaseProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Strategy Badge - Prominent at top */}
      <StrategyHeroBadge
        strategy={strategy}
        validation={validation}
        variant="expanded"
      />

      {/* Intro Card - Explains what simulation does (hidden on mobile) */}
      <div className="hidden md:block">
        <StrategyIntro strategy={strategy} validation={validation} />
      </div>

      {/* Preflight Warnings - Visible, not tooltip */}
      <PreflightWarningsAlert
        validation={preflight}
        compact={variant === 'desktop'}
      />

      {/* Persona Selection */}
      <PersonaSelectionCard
        selectedProfile={selectedProfile}
        onProfileChange={onProfileChange}
        isSimulating={isSimulating}
      />

      {/* Prominent Run CTA */}
      <div className="pt-2">
        <RunCTA
          onRun={onRun}
          isSimulating={isSimulating}
          canSimulate={preflight.canSimulate}
          strategy={strategy}
        />

        {/* Helper text */}
        {!preflight.canSimulate && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('configure.addCompetenciesToEnable')}
          </p>
        )}
      </div>
    </div>
  );
});

export default ConfigurePhase;
