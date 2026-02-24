'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBlueprintStore } from '@/store/blueprint-store';
import { useSimulationStore } from '@/store/simulation-store';

// ============================================
// EXPORTED TYPES
// ============================================

export type CardExpansionState = 'collapsed' | 'half' | 'full';
export type CardWarningLevel = 'error' | 'warning' | 'info';
export type TrafficLightStatus = 'green' | 'amber' | 'red';

export interface CardWarning {
  id: string;
  level: CardWarningLevel;
  /** i18n key under builder.card (e.g. 'healthCritical') or raw simulation message */
  messageKey: string;
  /** Optional interpolation params for the i18n key */
  messageParams?: Record<string, string | number>;
  source: 'health' | 'preflight' | 'simulation';
}

export interface CardWarningsResult {
  warnings: CardWarning[];
  status: TrafficLightStatus;
  warningCount: number;
  hasErrors: boolean;
  hasWarnings: boolean;
}

interface UseCardWarningsOptions {
  competencyId: string;
  weight?: number;
  questionCount: number;
}

// ============================================
// HOOK
// ============================================

/**
 * Merges 3 warning sources (library health, preflight checks, simulation warnings)
 * into a unified CardWarningsResult for a single competency card.
 *
 * Returns i18n message keys (not raw strings) for health/preflight warnings.
 * Simulation warnings pass through their backend message directly.
 */
export function useCardWarnings({
  competencyId,
  weight = 0,
  questionCount,
}: UseCardWarningsOptions): CardWarningsResult {
  // Source 1: Library health (primitive string selector)
  const health = useBlueprintStore(
    (s) => s.libraryCompetencies.find((c) => c.id === competencyId)?.health ?? 'HEALTHY'
  );

  // Source 2: Total weight across all competencies (primitive number selector)
  const totalWeight = useBlueprintStore(
    (s) => s.state.competencies.reduce((sum, c) => sum + (c.weight ?? 0), 0)
  );

  // Source 3: Simulation warnings filtered to this competency (useShallow for stable array)
  const simulationWarnings = useSimulationStore(
    useShallow((s) => {
      if (!s.simulationResult) return [];
      return s.simulationResult.warnings.filter(
        (w) => w.competencyId === competencyId
      );
    })
  );

  return useMemo(() => {
    const warnings: CardWarning[] = [];

    // Health warnings
    if (health === 'CRITICAL') {
      warnings.push({
        id: `health-${competencyId}-critical`,
        level: 'error',
        messageKey: 'healthCritical',
        source: 'health',
      });
    } else if (health === 'MODERATE') {
      warnings.push({
        id: `health-${competencyId}-moderate`,
        level: 'warning',
        messageKey: 'healthModerate',
        source: 'health',
      });
    }

    // Preflight: low question count
    if (questionCount < 3) {
      warnings.push({
        id: `preflight-${competencyId}-low-questions`,
        level: 'warning',
        messageKey: 'lowQuestions',
        messageParams: { count: questionCount },
        source: 'preflight',
      });
    }

    // Preflight: weight imbalance
    if (totalWeight > 0 && weight / totalWeight > 0.5) {
      warnings.push({
        id: `preflight-${competencyId}-weight-imbalance`,
        level: 'warning',
        messageKey: 'weightImbalance',
        source: 'preflight',
      });
    }

    // Simulation warnings (pass through backend messages)
    simulationWarnings.forEach((sw, index) => {
      if (!sw.message) return;

      let level: CardWarningLevel;
      if (sw.level === 'ERROR') level = 'error';
      else if (sw.level === 'WARNING') level = 'warning';
      else level = 'info';

      warnings.push({
        id: `simulation-${competencyId}-${index}`,
        level,
        messageKey: sw.message,
        source: 'simulation',
      });
    });

    // Derive traffic light status (worst level wins)
    const hasErrors = warnings.some((w) => w.level === 'error');
    const hasWarnings = warnings.some((w) => w.level === 'warning');

    let status: TrafficLightStatus;
    if (hasErrors) status = 'red';
    else if (hasWarnings) status = 'amber';
    else status = 'green';

    return {
      warnings,
      status,
      warningCount: warnings.length,
      hasErrors,
      hasWarnings,
    };
  }, [competencyId, health, questionCount, weight, totalWeight, simulationWarnings]);
}
