'use client';

/**
 * Hook for fetching and managing a user's Competency Passport.
 *
 * Migrated from React Query to simple useState + useEffect pattern.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { passportApi } from '@/services/api';
import type { CompetencyPassport } from '@/types/domain';

// ============================================================================
// Types
// ============================================================================

export interface UsePassportOptions {
  /** Whether to enable the query */
  enabled?: boolean;
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
  const { enabled = true } = options;
  const shouldFetch = enabled && !!clerkUserId;

  const [passport, setPassport] = useState<CompetencyPassport | null>(null);
  const [isLoading, setIsLoading] = useState(shouldFetch);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clerkUserIdRef = useRef(clerkUserId);
  clerkUserIdRef.current = clerkUserId;
  const mountedRef = useRef(true);

  const doFetch = useCallback(() => {
    const id = clerkUserIdRef.current;
    if (!id || !mountedRef.current) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    passportApi
      .getPassport(id)
      .then((data) => {
        if (!mountedRef.current) return;
        setPassport(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (shouldFetch) {
      doFetch();
    } else {
      setIsLoading(false);
    }
  }, [shouldFetch, doFetch]);

  const competencyCount = passport?.scores ? Object.keys(passport.scores).length : 0;

  return {
    passport,
    isLoading,
    isError,
    error,
    refetch: doFetch,
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
  const { enabled = true } = options;
  const shouldFetch = enabled && !!clerkUserId;

  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(shouldFetch);

  useEffect(() => {
    if (!shouldFetch || !clerkUserId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    passportApi
      .hasValidPassport(clerkUserId)
      .then((valid) => {
        if (!cancelled) {
          setIsValid(valid);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsValid(false);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [shouldFetch, clerkUserId]);

  return { isValid, isLoading };
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
