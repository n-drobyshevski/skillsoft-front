/**
 * Score interpretation utility for the 5-level proficiency system.
 *
 * Replaces the binary "Strength / Developing" labels with a graduated
 * Expert -> Advanced -> Proficient -> Developing -> Foundational scale.
 *
 * Bilingual support: call with an i18n `t` function that resolves
 * keys under the `resultsView.proficiencyLevel` namespace, or fall
 * back to the built-in English label.
 */

export type ProficiencyLevel =
  | 'expert'
  | 'advanced'
  | 'proficient'
  | 'developing'
  | 'foundational';

export interface ScoreInterpretation {
  /** Fallback English label */
  label: string;
  /** Machine-readable proficiency tier */
  level: ProficiencyLevel;
  /** Tailwind text-color class */
  color: string;
  /** Tailwind background utility (chip/badge backgrounds) */
  bgColor: string;
  /** Tailwind border utility */
  borderColor: string;
  /** Tailwind progress-bar fill class */
  progressColor: string;
}

const LEVELS: Record<ProficiencyLevel, Omit<ScoreInterpretation, 'level'>> = {
  expert: {
    label: 'Expert',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    progressColor: 'bg-emerald-500',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    progressColor: 'bg-blue-500',
  },
  proficient: {
    label: 'Proficient',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    progressColor: 'bg-indigo-500',
  },
  developing: {
    label: 'Developing',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    progressColor: 'bg-amber-500',
  },
  foundational: {
    label: 'Foundational',
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    progressColor: 'bg-muted-foreground/60',
  },
};

/**
 * Map a percentage score (0-100) to a 5-level proficiency interpretation.
 *
 * Thresholds:
 *  >= 85  Expert
 *  >= 70  Advanced
 *  >= 50  Proficient
 *  >= 30  Developing
 *  <  30  Foundational
 */
export function getScoreInterpretation(percentage: number): ScoreInterpretation {
  let level: ProficiencyLevel;

  if (percentage >= 85) level = 'expert';
  else if (percentage >= 70) level = 'advanced';
  else if (percentage >= 50) level = 'proficient';
  else if (percentage >= 30) level = 'developing';
  else level = 'foundational';

  return { ...LEVELS[level], level };
}

/**
 * Resolve a translated label for the given proficiency level.
 *
 * When a backend `proficiencyLabel` is already provided, it is returned as-is.
 * Otherwise, the function attempts to resolve the i18n key
 * `proficiencyLevel.<level>` via the supplied `t` function.
 *
 * @param level   - the proficiency level key
 * @param t       - next-intl translation function (optional)
 * @param backendLabel - label already computed by the backend (optional)
 */
export function getProficiencyLabel(
  level: ProficiencyLevel,
  t?: (key: string) => string,
  backendLabel?: string,
): string {
  if (backendLabel) return backendLabel;
  if (t) {
    try {
      return t(`proficiencyLevel.${level}`);
    } catch {
      // key may not exist yet; fall through to default
    }
  }
  return LEVELS[level].label;
}
