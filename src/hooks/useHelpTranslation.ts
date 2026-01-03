'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type HelpCategory = 'competency' | 'indicator' | 'question';

type CompetencyHelpKey = 'name' | 'description' | 'category' | 'level' | 'isActive' | 'approvalStatus';
type IndicatorHelpKey = 'title' | 'description' | 'weight' | 'observabilityLevel' | 'measurementType' | 'examples' | 'counterExamples';
type QuestionHelpKey = 'questionText' | 'questionType' | 'answerOptions' | 'difficultyLevel' | 'scoringRubric' | 'timeLimit' | 'contextTags';

type HelpKeyMap = {
  competency: CompetencyHelpKey;
  indicator: IndicatorHelpKey;
  question: QuestionHelpKey;
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
  const t = useTranslations('help');
  return t;
}
