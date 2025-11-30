import { useState, useEffect } from 'react';
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
const WEIGHT_TOLERANCE = 0.001; // Small tolerance for floating point comparison

export function useWeightValidation({ 
  competencyId, 
  currentIndicatorId, 
  currentWeight 
}: UseWeightValidationProps): WeightValidationResult {
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
      } catch (error) {
        console.error('Failed to fetch existing indicators:', error);
        setExistingIndicators([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExistingIndicators();
  }, [competencyId]);

  // Calculate current total weight (excluding the current indicator if editing)
  const currentTotal = existingIndicators
    .filter(indicator => indicator.id !== currentIndicatorId)
    .reduce((sum, indicator) => sum + indicator.weight, 0);

  // Calculate what the new total would be with the current weight
  const newTotal = currentTotal + currentWeight;
  
  // Calculate remaining available weight
  const remainingWeight = Math.max(0, MAX_WEIGHT_PER_COMPETENCY - currentTotal);
  
  // Check if the new weight would exceed the limit
  const isValid = newTotal <= (MAX_WEIGHT_PER_COMPETENCY + WEIGHT_TOLERANCE);
  
  let errorMessage: string | undefined;
  if (!isValid) {
    errorMessage = `Total weight cannot exceed ${MAX_WEIGHT_PER_COMPETENCY}. Current total: ${currentTotal.toFixed(3)}, your weight: ${currentWeight.toFixed(3)}, resulting total: ${newTotal.toFixed(3)}`;
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