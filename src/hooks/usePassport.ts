'use client';

import { useQuery } from '@tanstack/react-query';
import { passportApi } from '@/services/api';
import type { CompetencyPassport } from '@/types/domain';

// ============================================================================
// Query Keys
// ============================================================================

export const passportKeys = {
  all: ['passport'] as const,
  byUser: (clerkUserId: string) => [...passportKeys.all, 'user', clerkUserId] as const,
  validity: (clerkUserId: string) => [...passportKeys.all, 'validity', clerkUserId] as const,
};

// ============================================================================
// Types
// ============================================================================

export interface UsePassportOptions {
  /** Whether to enable the query */
  enabled?: boolean;
  /** Stale time in milliseconds (default: 5 minutes) */
  staleTime?: number;
}

export interface UsePassportReturn {
  /** The passport data */
  passport: CompetencyPassport | null;
  /** Whether the passport is currently loading */
  isLoading: boolean;
  /** Whether there was an error fetching */
  isError: boolean;
  /** Error message if any */
  error: Error | null;
  /** Refetch the passport data */
  refetch: () => void;
  /** Whether the passport is valid */
  isValid: boolean;
  /** Number of measured competencies */
  competencyCount: number;
}

export interface DeltaAnalysis {
  /** Competencies that can be skipped (already in passport) */
  skippableCompetencies: string[];
  /** Number of competencies that can be skipped */
  skippableCount: number;
  /** Competencies that still need assessment */
  remainingCompetencies: string[];
  /** Number of competencies that need assessment */
  remainingCount: number;
  /** Estimated time saved in minutes */
  estimatedTimeSaved: number;
  /** Estimated questions saved */
  estimatedQuestionsSaved: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const AVG_QUESTIONS_PER_COMPETENCY = 5;
const AVG_TIME_PER_QUESTION = 1.5; // minutes

// ============================================================================
// Hook: usePassport
// ============================================================================

/**
 * Hook to fetch and manage a user's Competency Passport.
 *
 * @param clerkUserId - The Clerk user ID to fetch passport for
 * @param options - Query options
 * @returns Passport data and status
 */
export function usePassport(
  clerkUserId: string | undefined | null,
  options: UsePassportOptions = {}
): UsePassportReturn {
  const { enabled = true, staleTime = DEFAULT_STALE_TIME } = options;

  const query = useQuery({
    queryKey: passportKeys.byUser(clerkUserId ?? ''),
    queryFn: () => passportApi.getPassport(clerkUserId!),
    enabled: enabled && !!clerkUserId,
    staleTime,
  });

  const passport = query.data ?? null;
  const competencyCount = passport?.scores ? Object.keys(passport.scores).length : 0;

  return {
    passport,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isValid: passport?.isValid ?? false,
    competencyCount,
  };
}

// ============================================================================
// Hook: usePassportValidity
// ============================================================================

/**
 * Lightweight hook to check if a user has a valid passport.
 * Use this when you only need to know validity, not full passport data.
 */
export function usePassportValidity(
  clerkUserId: string | undefined | null,
  options: UsePassportOptions = {}
): { isValid: boolean; isLoading: boolean } {
  const { enabled = true, staleTime = DEFAULT_STALE_TIME } = options;

  const query = useQuery({
    queryKey: passportKeys.validity(clerkUserId ?? ''),
    queryFn: () => passportApi.hasValidPassport(clerkUserId!),
    enabled: enabled && !!clerkUserId,
    staleTime,
  });

  return {
    isValid: query.data ?? false,
    isLoading: query.isLoading,
  };
}

// ============================================================================
// Utility: calculateDeltaAnalysis
// ============================================================================

/**
 * Calculate which competencies can be skipped based on passport data.
 *
 * @param passport - The user's competency passport
 * @param requiredCompetencyIds - Competency IDs required by the assessment
 * @returns Delta analysis with skippable/remaining competencies
 */
export function calculateDeltaAnalysis(
  passport: CompetencyPassport | null,
  requiredCompetencyIds: string[]
): DeltaAnalysis {
  if (!passport?.isValid || !passport.scores) {
    return {
      skippableCompetencies: [],
      skippableCount: 0,
      remainingCompetencies: requiredCompetencyIds,
      remainingCount: requiredCompetencyIds.length,
      estimatedTimeSaved: 0,
      estimatedQuestionsSaved: 0,
    };
  }

  const passportCompetencyIds = Object.keys(passport.scores);

  const skippableCompetencies = requiredCompetencyIds.filter(
    (id) => passportCompetencyIds.includes(id)
  );

  const remainingCompetencies = requiredCompetencyIds.filter(
    (id) => !passportCompetencyIds.includes(id)
  );

  const estimatedQuestionsSaved = skippableCompetencies.length * AVG_QUESTIONS_PER_COMPETENCY;
  const estimatedTimeSaved = Math.round(estimatedQuestionsSaved * AVG_TIME_PER_QUESTION);

  return {
    skippableCompetencies,
    skippableCount: skippableCompetencies.length,
    remainingCompetencies,
    remainingCount: remainingCompetencies.length,
    estimatedTimeSaved,
    estimatedQuestionsSaved,
  };
}

// ============================================================================
// Utility: formatTimeSaved
// ============================================================================

/**
 * Format time saved in a human-readable format.
 */
export function formatTimeSaved(minutes: number): string {
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `~${hours} h`;
  return `~${hours} h ${remainingMinutes} min`;
}

export default usePassport;
