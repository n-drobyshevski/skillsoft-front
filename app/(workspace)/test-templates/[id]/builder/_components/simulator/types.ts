import { SimulationResult, SimulationProfile, Difficulty, SelectionReason } from '../../actions';

export type { SimulationResult, SimulationProfile, Difficulty, SelectionReason };

export const personaConfig: Record<
  SimulationProfile,
  {
    icon: string;
    /** Translation key under builder.simulator.personas.* */
    labelKey: string;
    /** Translation key under builder.simulator.personas.* */
    descriptionKey: string;
    color: string;
    bgColor: string;
    glowColor: string;
    iconAnimation: string;
  }
> = {
  PERFECT_CANDIDATE: {
    icon: 'Sparkles',
    labelKey: 'personas.perfect',
    descriptionKey: 'personas.perfectDescription',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    glowColor: 'ring-emerald-400/50 dark:ring-emerald-400/30',
    iconAnimation: 'animate-icon-twinkle',
  },
  RANDOM_GUESSER: {
    icon: 'Shuffle',
    labelKey: 'personas.random',
    descriptionKey: 'personas.randomDescription',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    glowColor: 'ring-amber-400/50 dark:ring-amber-400/30',
    iconAnimation: 'animate-icon-shuffle',
  },
  FAILING_CANDIDATE: {
    icon: 'TrendingDown',
    labelKey: 'personas.failing',
    descriptionKey: 'personas.failingDescription',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
    glowColor: 'ring-red-400/50 dark:ring-red-400/30',
    iconAnimation: 'animate-icon-bounce-down',
  },
};

export const difficultyColors: Record<Difficulty, string> = {
  FOUNDATIONAL: '#22c55e',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#f97316',
  EXPERT: '#ef4444',
};

export const difficultyLevelMap: Record<Difficulty, number> = {
  FOUNDATIONAL: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

/**
 * Translation key references for selection reasons.
 * Components that can use hooks should call t(selectionReasonKeys[reason]) at render time.
 */
export const selectionReasonKeys: Record<SelectionReason, string> = {
  COVERAGE_GAP: 'selectionReason.coverageGap',
  CALIBRATION: 'selectionReason.calibration',
  ADAPTIVE_CHECK: 'selectionReason.adaptiveCheck',
  RANDOMIZED: 'selectionReason.randomized',
  BACKSTOP: 'selectionReason.backstop',
};

/**
 * Static English display labels for selection reasons.
 * Use in non-hook contexts (e.g., chart data transforms inside useMemo).
 * For full i18n support use selectionReasonKeys with useTranslations.
 */
export const selectionReasonLabels: Record<SelectionReason, string> = {
  COVERAGE_GAP: 'Coverage gap',
  CALIBRATION: 'Calibration',
  ADAPTIVE_CHECK: 'Adaptive check',
  RANDOMIZED: 'Randomized',
  BACKSTOP: 'Backstop',
};
