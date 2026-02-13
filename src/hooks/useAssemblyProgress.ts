'use client';

import { useState, useRef, useEffect } from 'react';
import { testSessionsApi, assemblyApi } from '@/services/api';
import type { AssemblyProgress, AssemblyPhase, TestSession } from '@/types/domain';

// ============================================================================
// Configuration
// ============================================================================

const POLLING_CONFIG = {
  /** Initial polling interval (ms) during active assembly */
  ACTIVE_INTERVAL_MS: 500,
  /** Slower interval for later phases (ms) */
  SLOW_INTERVAL_MS: 1000,
  /** Maximum poll attempts before timeout */
  MAX_POLL_ATTEMPTS: 60,
  /** Maximum retry attempts for failed assembly */
  MAX_RETRIES: 3,
  /** Retry delays with exponential backoff */
  RETRY_DELAYS: [1000, 2000, 4000],
} as const;

// ============================================================================
// Types
// ============================================================================

interface UseAssemblyProgressState {
  /** Current phase in the assembly process */
  phase: AssemblyPhase;
  /** Progress data from backend */
  progress: AssemblyProgress | null;
  /** True while assembly is in progress */
  isAssembling: boolean;
  /** True when assembly completed successfully */
  isComplete: boolean;
  /** True when assembly failed */
  isFailed: boolean;
  /** Error message if failed */
  error: string | null;
  /** Number of retry attempts made */
  retryCount: number;
  /** Session ID after successful session creation */
  sessionId: string | null;
}

interface UseAssemblyProgressOptions {
  /** Callback when assembly completes successfully */
  onComplete?: (sessionId: string) => void;
  /** Callback when assembly fails */
  onError?: (error: string) => void;
}

export interface UseAssemblyProgressReturn extends UseAssemblyProgressState {
  /** Start the assembly process */
  startAssembly: (templateId: string, clerkUserId?: string | null) => Promise<void>;
  /** Retry failed assembly */
  retry: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: UseAssemblyProgressState = {
  phase: 'INITIALIZING',
  progress: null,
  isAssembling: false,
  isComplete: false,
  isFailed: false,
  error: null,
  retryCount: 0,
  sessionId: null,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAssemblyProgress(
  options: UseAssemblyProgressOptions = {}
): UseAssemblyProgressReturn {
  const [state, setState] = useState<UseAssemblyProgressState>(initialState);

  // Refs for cleanup and tracking
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const templateIdRef = useRef<string>('');
  const clerkUserIdRef = useRef<string>('');
  const sessionIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollCountRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Poll for progress updates
  const pollProgress = async () => {
    if (!templateIdRef.current || !isMountedRef.current) return;

    pollCountRef.current += 1;

    // Check for timeout
    if (pollCountRef.current > POLLING_CONFIG.MAX_POLL_ATTEMPTS) {
      cleanup();
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          phase: 'FAILED',
          isFailed: true,
          isAssembling: false,
          error: 'Assembly timed out. Please try again.',
        }));
        options.onError?.('Assembly timed out');
      }
      return;
    }

    try {
      const progress = await assemblyApi.getProgress(templateIdRef.current);

      if (!isMountedRef.current) return;

      if (!progress) {
        // No progress data yet - backend may not have started
        // Check if we have a session ID and assembly should be complete
        if (sessionIdRef.current && pollCountRef.current > 5) {
          // Assume complete if session exists and no progress endpoint
          setState((prev) => ({
            ...prev,
            phase: 'COMPLETE',
            isComplete: true,
            isAssembling: false,
            progress: {
              sessionId: sessionIdRef.current!,
              templateId: templateIdRef.current,
              phase: 'COMPLETE',
              totalCompetencies: 0,
              processedCompetencies: 0,
              questionsSelected: 0,
              percentComplete: 100,
              elapsedMillis: pollCountRef.current * POLLING_CONFIG.ACTIVE_INTERVAL_MS,
              message: 'Assembly complete',
              inProgress: false,
            },
          }));
          cleanup();
          options.onComplete?.(sessionIdRef.current!);
        }
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: progress.phase,
        progress,
        isComplete: progress.phase === 'COMPLETE',
        isFailed: progress.phase === 'FAILED',
        isAssembling: progress.inProgress,
      }));

      // Handle completion
      if (progress.phase === 'COMPLETE') {
        cleanup();
        if (sessionIdRef.current) {
          options.onComplete?.(sessionIdRef.current);
        }
      }

      // Handle failure
      if (progress.phase === 'FAILED') {
        cleanup();
        setState((prev) => ({
          ...prev,
          error: progress.message || 'Assembly failed',
        }));
        options.onError?.(progress.message || 'Assembly failed');
      }
    } catch (err) {
      // Continue polling on error - backend may still be processing
      console.warn('Error polling assembly progress:', err);
    }
  };

  // Start the assembly process
  const startAssembly = async (templateId: string, clerkUserId?: string | null) => {
    // Store refs for polling and retry
    templateIdRef.current = templateId;
    clerkUserIdRef.current = clerkUserId || '';
    sessionIdRef.current = null;

    // Reset state
    setState({
      ...initialState,
      isAssembling: true,
      phase: 'INITIALIZING',
    });

    // Cleanup any existing polling
    cleanup();

    try {
      // Start the session (this triggers backend assembly)
      const session = await testSessionsApi.startSession({
        templateId,
        clerkUserId: clerkUserId || '',
      });

      if (!isMountedRef.current) return;

      sessionIdRef.current = session.id;

      setState((prev) => ({
        ...prev,
        sessionId: session.id,
      }));

      // Start polling for progress
      pollIntervalRef.current = setInterval(
        pollProgress,
        POLLING_CONFIG.ACTIVE_INTERVAL_MS
      );

      // Also poll immediately
      pollProgress();
    } catch (err) {
      cleanup();
      if (!isMountedRef.current) return;

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start assembly';
      setState((prev) => ({
        ...prev,
        phase: 'FAILED',
        isFailed: true,
        isAssembling: false,
        error: errorMessage,
      }));
      options.onError?.(errorMessage);
    }
  };

  // Retry failed assembly
  const retry = async () => {
    if (state.retryCount >= POLLING_CONFIG.MAX_RETRIES) {
      setState((prev) => ({
        ...prev,
        error: 'Maximum retry attempts reached. Please try again later.',
      }));
      return;
    }

    // Wait with exponential backoff before retrying
    const delay =
      POLLING_CONFIG.RETRY_DELAYS[state.retryCount] ||
      POLLING_CONFIG.RETRY_DELAYS[POLLING_CONFIG.RETRY_DELAYS.length - 1];
    await new Promise((resolve) => setTimeout(resolve, delay));

    setState((prev) => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null,
      isFailed: false,
    }));

    await startAssembly(templateIdRef.current, clerkUserIdRef.current);
  };

  // Reset to initial state
  const reset = () => {
    cleanup();
    setState(initialState);
    templateIdRef.current = '';
    clerkUserIdRef.current = '';
    sessionIdRef.current = null;
  };

  return {
    ...state,
    startAssembly,
    retry,
    reset,
  };
}

export default useAssemblyProgress;
