'use client';

import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG, StrategyValidation } from '../strategy-context';
import { StrategyHeroBadge } from '../StrategyHeroBadge';
import { PersonaSelector } from '../PersonaSelector';
import { SimulationProfile } from '../types';
import { PreflightValidationResult } from '../hooks/usePreflightValidation';

// ============================================
// TYPES
// ============================================

interface SimulatorHeaderProps {
  /** Current assessment strategy */
  strategy: Strategy;
  /** Strategy validation result */
  validation: StrategyValidation;
  /** Current selected persona */
  selectedProfile: SimulationProfile;
  /** Callback when persona changes */
  onProfileChange: (profile: SimulationProfile) => void;
  /** Callback to run simulation */
  onRun: () => void;
  /** Whether simulation is currently running */
  isSimulating: boolean;
  /** Preflight validation result */
  preflight: PreflightValidationResult;
  /** Render mode */
  variant?: 'desktop' | 'mobile';
}

// ============================================
// PRE-FLIGHT WARNINGS TOOLTIP
// ============================================

interface PreflightWarningsTooltipProps {
  warnings: string[];
  children: React.ReactNode;
}

function PreflightWarningsTooltip({
  warnings,
  children,
}: PreflightWarningsTooltipProps) {
  const t = useTranslations('builder.simulator');

  if (warnings.length === 0) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t('preflight.preflightWarnings')}
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// RUN BUTTON
// ============================================

interface RunButtonProps {
  onRun: () => void;
  isSimulating: boolean;
  canSimulate: boolean;
  hasWarnings: boolean;
  warningCount: number;
  focusColor: string;
}

const RunButton = memo(function RunButton({
  onRun,
  isSimulating,
  canSimulate,
  hasWarnings,
  warningCount,
  focusColor,
}: RunButtonProps) {
  const t = useTranslations('builder.simulator');

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'min-h-[44px] md:h-7 md:min-h-0 text-xs gap-1.5 rounded-lg active:scale-95',
          hasWarnings && 'border-amber-500/50 hover:border-amber-500',
          focusColor
        )}
        onClick={onRun}
        disabled={isSimulating || !canSimulate}
        aria-label={
          isSimulating
            ? t('running')
            : hasWarnings
              ? `${t('runSimulation')} (${warningCount} warnings)`
              : t('runSimulation')
        }
      >
        {isSimulating ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : hasWarnings ? (
          <AlertTriangle className="h-3 w-3 text-amber-500" aria-hidden="true" />
        ) : (
          <Play className="h-3 w-3" aria-hidden="true" />
        )}
        {t('rerun')}
      </Button>
      {hasWarnings && (
        <Badge
          variant="secondary"
          className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 text-[10px] font-bold bg-amber-500 text-white border-0 rounded-full"
        >
          <span className="sr-only">warnings: </span>
          {warningCount}
        </Badge>
      )}
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const SimulatorHeader = memo(function SimulatorHeader({
  strategy,
  validation,
  selectedProfile,
  onProfileChange,
  onRun,
  isSimulating,
  preflight,
  variant = 'desktop',
}: SimulatorHeaderProps) {
  const t = useTranslations('builder.simulator');
  const strategyConfig = STRATEGY_CONFIG[strategy];
  const warningMessages = [
    ...preflight.errors.map((e) => e.message),
    ...preflight.warnings.map((w) => w.message),
  ];

  return (
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
          {t('testDrive')}
        </span>

        <PreflightWarningsTooltip warnings={warningMessages}>
          <RunButton
            onRun={onRun}
            isSimulating={isSimulating}
            canSimulate={preflight.canSimulate}
            hasWarnings={preflight.hasWarnings && preflight.canSimulate}
            warningCount={preflight.totalIssues}
            focusColor={strategyConfig.focusColor}
          />
        </PreflightWarningsTooltip>
      </div>

      <PersonaSelector
        selected={selectedProfile}
        onSelect={onProfileChange}
        disabled={isSimulating}
      />
    </div>
  );
});

export default SimulatorHeader;
