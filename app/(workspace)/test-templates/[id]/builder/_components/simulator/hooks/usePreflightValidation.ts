/**
 * usePreflightValidation Hook
 *
 * Extracts preflight validation logic from SimulatorPanel.
 * Computes warnings about blueprint configuration before simulation runs.
 */

import { useMemo } from 'react';
import { Strategy } from '../strategy-context';

export interface PreflightWarning {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  competencyId?: string;
}

interface BlueprintCompetency {
  id: string;
  name: string;
  weight?: number;
  questionCount: number;
}

interface UsePreflightValidationOptions {
  competencies: BlueprintCompetency[];
  strategy: Strategy;
  onetSocCode?: string;
  teamId?: string;
}

export interface PreflightValidationResult {
  warnings: PreflightWarning[];
  errors: PreflightWarning[];
  canSimulate: boolean;
  hasWarnings: boolean;
  hasErrors: boolean;
  totalIssues: number;
}

/**
 * Validates blueprint configuration and returns preflight warnings/errors.
 *
 * Checks:
 * 1. No competencies added (error)
 * 2. Too few competencies (<3) (warning)
 * 3. Unbalanced weights (>50% on single competency) (warning)
 * 4. Low question counts per competency (<3) (warning)
 * 5. Strategy-specific requirements (warning)
 */
export function usePreflightValidation({
  competencies,
  strategy,
  onetSocCode,
  teamId,
}: UsePreflightValidationOptions): PreflightValidationResult {
  return useMemo(() => {
    const warnings: PreflightWarning[] = [];
    const errors: PreflightWarning[] = [];

    // ============================================
    // ERROR CHECKS (Blocking)
    // ============================================

    // No competencies - cannot simulate
    if (competencies.length === 0) {
      errors.push({
        id: 'no-competencies',
        type: 'error',
        message: 'No competencies added',
      });
    }

    // ============================================
    // WARNING CHECKS (Non-blocking)
    // ============================================

    if (competencies.length > 0) {
      // Too few competencies
      if (competencies.length < 3) {
        warnings.push({
          id: 'few-competencies',
          type: 'warning',
          message: `Only ${competencies.length} competency - consider adding more for balanced assessment`,
        });
      }

      // Check weight balance
      const totalWeight = competencies.reduce((sum, c) => sum + (c.weight ?? 1), 0);
      const maxWeight = Math.max(...competencies.map((c) => c.weight ?? 1));

      if (totalWeight > 0 && maxWeight / totalWeight > 0.5) {
        const heaviest = competencies.find((c) => (c.weight ?? 1) === maxWeight);
        warnings.push({
          id: 'weight-imbalance',
          type: 'warning',
          message: `${heaviest?.name || 'One competency'} has >50% weight - may skew results`,
          competencyId: heaviest?.id,
        });
      }

      // Check low question counts
      const lowQuestionComps = competencies.filter((c) => c.questionCount < 3);
      if (lowQuestionComps.length > 0) {
        warnings.push({
          id: 'low-questions',
          type: 'warning',
          message: `${lowQuestionComps.length} competenc${lowQuestionComps.length === 1 ? 'y has' : 'ies have'} few questions`,
        });
      }

      // ============================================
      // STRATEGY-SPECIFIC WARNINGS
      // ============================================

      if (strategy === 'TARGETED_FIT' && !onetSocCode) {
        warnings.push({
          id: 'no-onet',
          type: 'warning',
          message: 'No O*NET SOC code - job alignment disabled',
        });
      }

      if (strategy === 'DYNAMIC_GAP_ANALYSIS' && !teamId) {
        warnings.push({
          id: 'no-team',
          type: 'warning',
          message: 'No team selected - gap analysis limited',
        });
      }
    }

    const canSimulate = errors.length === 0 && competencies.length > 0;
    const hasWarnings = warnings.length > 0;
    const hasErrors = errors.length > 0;

    return {
      warnings,
      errors,
      canSimulate,
      hasWarnings,
      hasErrors,
      totalIssues: warnings.length + errors.length,
    };
  }, [competencies, strategy, onetSocCode, teamId]);
}

/**
 * Returns just the warning messages as strings (for simpler UI usage).
 */
export function usePreflightWarnings(
  options: UsePreflightValidationOptions
): string[] {
  const validation = usePreflightValidation(options);
  return useMemo(
    () => [...validation.errors, ...validation.warnings].map((w) => w.message),
    [validation]
  );
}
