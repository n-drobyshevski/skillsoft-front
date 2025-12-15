"use client";

import { useState, useEffect, useCallback } from "react";
import { testSessionsApi } from "@/services/api";
import { TemplateReadinessResponse } from "@/types/domain";
import { ApiError } from "@/types/errors";

interface UseTemplateReadinessReturn {
  readiness: TemplateReadinessResponse | null;
  isReady: boolean;
  isLoading: boolean;
  error: ApiError | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to check if a test template is ready to start.
 * Pre-flight validation that all competencies have sufficient questions.
 *
 * @param templateId The template UUID to check
 * @param enabled Whether to enable the check (default: true)
 * @returns Readiness status, loading state, and error info
 *
 * @example
 * const { isReady, isLoading, readiness, error } = useTemplateReadiness(templateId);
 *
 * if (isLoading) return <Loading />;
 * if (!isReady) return <ReadinessAlert readiness={readiness} />;
 */
export function useTemplateReadiness(
  templateId: string | undefined,
  enabled: boolean = true
): UseTemplateReadinessReturn {
  const [readiness, setReadiness] = useState<TemplateReadinessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const checkReadiness = useCallback(async () => {
    if (!templateId || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await testSessionsApi.checkTemplateReadiness(templateId);
      setReadiness(response);
    } catch (err) {
      setError(err as ApiError);
      // Set a "not ready" state when there's an error
      setReadiness({
        ready: false,
        message: err instanceof Error ? err.message : "Failed to check template readiness",
        competencyReadiness: [],
        totalQuestionsAvailable: 0,
        questionsRequired: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [templateId, enabled]);

  useEffect(() => {
    checkReadiness();
  }, [checkReadiness]);

  return {
    readiness,
    isReady: readiness?.ready ?? false,
    isLoading,
    error,
    refresh: checkReadiness,
  };
}

export type { UseTemplateReadinessReturn };
