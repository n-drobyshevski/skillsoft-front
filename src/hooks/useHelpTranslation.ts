'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type HelpCategory = 'competency' | 'indicator' | 'question' | 'scenario';

type CompetencyHelpKey = 'name' | 'description' | 'category' | 'level' | 'isActive' | 'approvalStatus';
type IndicatorHelpKey = 'title' | 'description' | 'weight' | 'observabilityLevel' | 'measurementType' | 'examples' | 'counterExamples';
type QuestionHelpKey = 'questionText' | 'questionType' | 'answerOptions' | 'difficultyLevel' | 'scoringRubric' | 'timeLimit' | 'contextTags';

// Scenario help keys for config panels
type ScenarioHelpKey =
  | 'overview.bigFive.title'
  | 'overview.bigFive.description'
  | 'overview.bigFive.enable'
  | `overview.bigFive.traits.${'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotionalStability'}`
  | 'overview.difficulty.title'
  | 'overview.difficulty.description'
  | `overview.difficulty.${'basic' | 'intermediate' | 'advanced'}`
  | 'overview.estimation.questions'
  | 'overview.estimation.duration'
  | 'jobFit.onetRole'
  | 'jobFit.benchmark'
  | 'jobFit.deltaTesting'
  | 'jobFit.strictness.title'
  | 'jobFit.strictness.description'
  | `jobFit.strictness.${'lenient' | 'moderate' | 'standard' | 'strict' | 'exact'}`
  | 'teamFit.team'
  | 'teamFit.assessment'
  | 'teamFit.saturation.title'
  | 'teamFit.saturation.description'
  | 'teamFit.saturation.threshold'
  | `teamFit.gapStatus.${'full' | 'adequate' | 'gap' | 'critical'}`;

type HelpKeyMap = {
  competency: CompetencyHelpKey;
  indicator: IndicatorHelpKey;
  question: QuestionHelpKey;
  scenario: ScenarioHelpKey;
};

/**
 * Hook to access help tooltip translations with type safety
 *
 * @example
 * ```tsx
 * const { getHelp } = useHelpTranslation('competency');
 * <HelpTooltip content={getHelp('name')} />
 * ```
 */
export function useHelpTranslation<T extends HelpCategory>(category: T) {
  const t = useTranslations('help');

  return useMemo(() => ({
    /**
     * Get translated help text for a specific field
     */
    getHelp: (key: HelpKeyMap[T]): string => {
      try {
        // Use type assertion for dynamic key access - next-intl's strict types don't support template literals
        return t(`${category}.${key}` as Parameters<typeof t>[0]);
      } catch {
        // Fallback to key if translation missing
        return `${category}.${key}`;
      }
    },
  }), [t, category]);
}

/**
 * Simplified hook that returns the translation function directly
 * for use with inline translation calls
 */
export function useHelpText() {
  return useTranslations('help');
}
