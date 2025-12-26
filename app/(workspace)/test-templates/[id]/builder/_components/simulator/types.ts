import { SimulationResult, SimulationProfile, Difficulty, SelectionReason } from '../../actions';

export type { SimulationResult, SimulationProfile, Difficulty, SelectionReason };

export const personaConfig: Record<
  SimulationProfile,
  {
    icon: string;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  PERFECT_CANDIDATE: {
    icon: 'Sparkles',
    label: 'Perfect',
    description: 'Ideal candidate',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
  },
  RANDOM_GUESSER: {
    icon: 'Shuffle',
    label: 'Random',
    description: 'Random answers',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
  },
  FAILING_CANDIDATE: {
    icon: 'TrendingDown',
    label: 'Failing',
    description: 'Poor performer',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
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

export const selectionReasonLabels: Record<SelectionReason, string> = {
  COVERAGE_GAP: 'Coverage gap',
  CALIBRATION: 'Calibration',
  ADAPTIVE_CHECK: 'Adaptive check',
  RANDOMIZED: 'Randomized',
  BACKSTOP: 'Backstop',
};
