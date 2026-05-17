import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { behavioralIndicatorsApi } from '@/services/api';
import { BehavioralIndicator } from '@/types/domain';

interface UseWeightValidationProps {
  competencyId?: string;
  currentIndicatorId?: string;
  currentWeight: number;
}

interface WeightValidationResult {
  isLoading: boolean;
  isValid: boolean;
  remainingWeight: number;
  currentTotal: number;
  maxAllowed: number;
  errorMessage?: string;
}

const MAX_WEIGHT_PER_COMPETENCY = 1.0;
const WEIGHT_TOLERANCE = 0.001;

export function useWeightValidation({
  competencyId,
  currentIndicatorId,
  currentWeight,
}: UseWeightValidationProps): WeightValidationResult {
  const t = useTranslations('forms');
  const [isLoading, setIsLoading] = useState(true);
  const [existingIndicators, setExistingIndicators] = useState<BehavioralIndicator[]>([]);

  useEffect(() => {
    async function fetchExistingIndicators() {
      if (!competencyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const indicators = await behavioralIndicatorsApi.getIndicators(competencyId);
        setExistingIndicators(indicators || []);
      } catch {
        // Silently treat as empty — surfacing this in UI would be misleading
        // since /behavioral-indicators is a list endpoint that may legitimately
        // return 404 when the competency has no children.
        setExistingIndicators([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExistingIndicators();
  }, [competencyId]);

  const currentTotal = existingIndicators
    .filter(indicator => indicator.id !== currentIndicatorId)
    .reduce((sum, indicator) => sum + indicator.weight, 0);

  const newTotal = currentTotal + currentWeight;
  const remainingWeight = Math.max(0, MAX_WEIGHT_PER_COMPETENCY - currentTotal);
  const isValid = newTotal <= (MAX_WEIGHT_PER_COMPETENCY + WEIGHT_TOLERANCE);

  let errorMessage: string | undefined;
  if (!isValid) {
    errorMessage = t('indicator.alerts.weightLimitExceeded', {
      max: MAX_WEIGHT_PER_COMPETENCY.toFixed(2),
      current: currentTotal.toFixed(3),
      weight: currentWeight.toFixed(3),
      total: newTotal.toFixed(3),
    });
  }

  return {
    isLoading,
    isValid,
    remainingWeight,
    currentTotal,
    maxAllowed: remainingWeight,
    errorMessage,
  };
}