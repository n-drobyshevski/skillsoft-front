'use client';

/**
 * SimulationLoadingStepper
 *
 * Vertical stepper with auto-advancing timed phases that replaces the generic
 * skeleton during simulation loading. Conveys precision and progress specific
 * to the active strategy and persona context.
 *
 * Phases:
 *   1. Assembling questions  (1 200 ms)
 *   2. Simulating responses  (1 800 ms, persona-aware subtitle)
 *   3. Calculating scores    (1 500 ms, strategy-aware subtitle)
 *   4. Generating report     (stays until unmount)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Brain,
  Calculator,
  Check,
  FileBarChart,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, getStrategyConfig } from './strategy-context';
import { SimulationProfile } from './types';

// ============================================
// TYPES
// ============================================

interface PhaseStep {
  id: string;
  Icon: React.ElementType;
  labelKey: string;
  subtitleKey: string;
  durationMs: number;
}

interface SimulationLoadingStepperProps {
  strategy: Strategy;
  profile: SimulationProfile;
  className?: string;
}

// ============================================
// HOOK
// ============================================

/**
 * Advances currentIndex through phases based on each phase's durationMs.
 * The final phase stays active indefinitely — the component is unmounted
 * when simulation results arrive.
 *
 * @param phases - array of phase steps (must be memoised)
 * @param resetKey - when this value changes, the stepper resets to phase 0
 */
function useSimulationPhases(
  phases: PhaseStep[],
  resetKey: string,
): { currentIndex: number } {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset to first phase when resetKey changes (strategy/persona switch).
    setCurrentIndex(0);

    let cancelled = false;
    let accumulated = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    phases.forEach((phase, idx) => {
      // The last phase has no timeout — stays active until component unmounts.
      if (idx === phases.length - 1) return;

      accumulated += phase.durationMs;
      const handle = setTimeout(() => {
        if (!cancelled) setCurrentIndex(idx + 1);
      }, accumulated);

      timers.push(handle);
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // resetKey drives the full reset; phases is stable via useMemo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return { currentIndex };
}

// ============================================
// ACCENT COLOR HELPERS
// ============================================

/**
 * Maps the strategy's iconText class to a concrete CSS color value used for
 * box-shadow glow. We avoid injecting arbitrary Tailwind classes at runtime.
 */
function getStrategyGlowColor(strategy: Strategy): string {
  switch (strategy) {
    case 'TARGETED_FIT':
      return 'rgba(16,185,129,0.35)'; // emerald-500
    case 'DYNAMIC_GAP_ANALYSIS':
      return 'rgba(59,130,246,0.35)'; // blue-500
    default:
      return 'rgba(var(--color-primary),0.35)';
  }
}

/**
 * Returns Tailwind border/background utility classes for the active step
 * circle, derived from the strategy configuration.
 */
function getActiveCircleClasses(strategy: Strategy): string {
  const cfg = getStrategyConfig(strategy);
  return cn(cfg.iconBg, cfg.iconText);
}

/**
 * Returns the Tailwind accent background class for lines and progress bars.
 */
function getStrategyAccentBg(strategy: Strategy): string {
  switch (strategy) {
    case 'TARGETED_FIT':
      return 'bg-emerald-500';
    case 'DYNAMIC_GAP_ANALYSIS':
      return 'bg-blue-500';
    default:
      return 'bg-primary';
  }
}

// ============================================
// STEP CIRCLE
// ============================================

interface StepCircleProps {
  state: 'completed' | 'active' | 'pending';
  Icon: React.ElementType;
  strategy: Strategy;
}

function StepCircle({ state, Icon, strategy }: StepCircleProps) {
  const cfg = getStrategyConfig(strategy);
  const glowColor = getStrategyGlowColor(strategy);
  const activeClasses = getActiveCircleClasses(strategy);

  const baseCircle =
    'relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all duration-500';

  if (state === 'completed') {
    return (
      <div
        className={cn(
          baseCircle,
          'bg-muted text-muted-foreground'
        )}
        aria-hidden="true"
      >
        <Check className="w-4 h-4 animate-step-check-in" />
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className="relative shrink-0" aria-hidden="true">
        {/* Pulsing ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-60',
            cfg.iconBg
          )}
          style={{ animationDuration: '1.4s' }}
        />
        {/* Second static ring */}
        <div
          className={cn(
            'absolute -inset-1 rounded-full opacity-30',
            cfg.iconBg
          )}
        />
        {/* Circle */}
        <div
          className={cn(baseCircle, activeClasses)}
          style={{
            boxShadow: `0 0 0 3px ${glowColor}`,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // pending
  return (
    <div
      className={cn(baseCircle, 'bg-muted/50 text-muted-foreground/40')}
      aria-hidden="true"
    >
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ============================================
// CONNECTOR LINE
// ============================================

interface ConnectorLineProps {
  /** 0 = unfilled, 1 = half-filled (active step below), 2 = fully filled */
  fillState: 'empty' | 'filling' | 'full';
  strategy: Strategy;
}

function ConnectorLine({ fillState, strategy }: ConnectorLineProps) {
  const accentClass = getStrategyAccentBg(strategy);

  return (
    <div
      className="relative mx-auto w-px flex-1 bg-border/60 overflow-hidden min-h-6"
      aria-hidden="true"
    >
      <div
        className={cn('absolute inset-x-0 top-0 transition-all duration-700 ease-in-out', accentClass)}
        style={{
          height:
            fillState === 'full'
              ? '100%'
              : fillState === 'filling'
                ? '50%'
                : '0%',
        }}
      />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SimulationLoadingStepper({
  strategy,
  profile,
  className,
}: SimulationLoadingStepperProps) {
  const t = useTranslations('builder.simulator');

  // ------------------------------------
  // Build phase list (memoised by strategy + profile string identity)
  // ------------------------------------

  const simulatingSubtitleKey = ((): string => {
    switch (profile) {
      case 'PERFECT_CANDIDATE':
        return 'loading.phases.simulatingPerfect';
      case 'FAILING_CANDIDATE':
        return 'loading.phases.simulatingFailing';
      default:
        return 'loading.phases.simulatingRandom';
    }
  })();

  const scoringSubtitleKey = ((): string => {
    switch (strategy) {
      case 'TARGETED_FIT':
        return 'loading.phases.scoringJobFit';
      case 'DYNAMIC_GAP_ANALYSIS':
        return 'loading.phases.scoringTeamGap';
      default:
        return 'loading.phases.scoringDefault';
    }
  })();

  // Stable reference: rebuilt only when strategy or profile changes.
  // useMemo prevents the phases array from being a new reference on every render,
  // which would cause useSimulationPhases's effect to re-run unnecessarily.
  const phases: PhaseStep[] = useMemo(
    () => [
      {
        id: 'assembling',
        Icon: Search,
        labelKey: 'loading.phases.assembling',
        subtitleKey: 'loading.phases.assemblingSubtitle',
        durationMs: 1200,
      },
      {
        id: 'simulating',
        Icon: Brain,
        labelKey: 'loading.phases.simulating',
        subtitleKey: simulatingSubtitleKey,
        durationMs: 1800,
      },
      {
        id: 'scoring',
        Icon: Calculator,
        labelKey: 'loading.phases.scoring',
        subtitleKey: scoringSubtitleKey,
        durationMs: 1500,
      },
      {
        id: 'report',
        Icon: FileBarChart,
        labelKey: 'loading.phases.report',
        subtitleKey: 'loading.phases.reportSubtitle',
        durationMs: Infinity,
      },
    ],
    [simulatingSubtitleKey, scoringSubtitleKey]
  );

  // resetKey changes when strategy or profile changes, resetting the stepper.
  const resetKey = `${strategy}:${profile}`;
  const { currentIndex } = useSimulationPhases(phases, resetKey);

  const total = phases.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);
  const progressBarClass = getStrategyAccentBg(strategy);

  return (
    <div
      className={cn('flex flex-col gap-4 py-2 select-none', className)}
      role="status"
      aria-label={t('loadingResults')}
    >
      {/* Stepper list */}
      <ol className="flex flex-col gap-0">
        {phases.map((phase, idx) => {
          const stepState: 'completed' | 'active' | 'pending' =
            idx < currentIndex
              ? 'completed'
              : idx === currentIndex
                ? 'active'
                : 'pending';

          const isLast = idx === phases.length - 1;

          /**
           * Connector fill logic:
           * - Between two completed steps → full
           * - Between a completed step and the active step → filling
           * - Everything else → empty
           */
          const connectorFill: ConnectorLineProps['fillState'] = (() => {
            if (isLast) return 'empty'; // no connector after last step
            if (idx < currentIndex - 1) return 'full';
            if (idx === currentIndex - 1) return 'filling';
            return 'empty';
          })();

          return (
            <li
              key={phase.id}
              className="flex gap-3"
            >
              {/* Left column: circle + connector */}
              <div className="flex flex-col items-center w-9">
                <StepCircle state={stepState} Icon={phase.Icon} strategy={strategy} />
                {!isLast && (
                  <ConnectorLine fillState={connectorFill} strategy={strategy} />
                )}
              </div>

              {/* Right column: text + spacer */}
              <div
                className={cn(
                  'flex flex-col justify-start pb-5',
                  isLast && 'pb-0'
                )}
              >
                {/* Label */}
                <span
                  className={cn(
                    'text-sm font-medium leading-9 transition-colors duration-300',
                    stepState === 'active' && 'text-foreground',
                    stepState === 'completed' && 'text-muted-foreground',
                    stepState === 'pending' && 'text-muted-foreground/40'
                  )}
                  {...(stepState === 'active'
                    ? { 'aria-live': 'polite', 'aria-atomic': 'true' }
                    : {})}
                >
                  {t(phase.labelKey as Parameters<typeof t>[0])}
                  {stepState === 'active' && (
                    <span className="sr-only">
                      {' — '}
                      {t('loading.phases.stepOf' as Parameters<typeof t>[0], {
                        current: currentIndex + 1,
                        total,
                      })}
                    </span>
                  )}
                </span>

                {/* Subtitle — only visible when active, fades in */}
                <span
                  className={cn(
                    'text-xs leading-tight transition-all duration-500',
                    stepState === 'active'
                      ? 'text-muted-foreground opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-1 pointer-events-none h-0 overflow-hidden'
                  )}
                  aria-hidden={stepState !== 'active'}
                >
                  {t(phase.subtitleKey as Parameters<typeof t>[0])}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Progress bar */}
      <div
        className="h-0.5 w-full rounded-full bg-border/50 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-in-out',
            progressBarClass
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Screen-reader only progress text */}
      <span className="sr-only">
        {t('loading.phases.stepOf' as Parameters<typeof t>[0], {
          current: currentIndex + 1,
          total,
        })}
      </span>

    </div>
  );
}

export default SimulationLoadingStepper;
