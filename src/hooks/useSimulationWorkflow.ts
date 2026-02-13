'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from './use-debounce';

/**
 * Simulation Workflow Hook - Phase 4.2 Workflow Formalization
 *
 * Provides improved simulation workflow with:
 * - Debounced auto-simulation on blueprint changes
 * - Simulation queue to prevent race conditions on rapid clicks
 * - Comparison mode for A/B testing blueprints
 */

// ============================================
// TYPES
// ============================================

export interface SimulationRequest<TState, TProfile, TResult> {
  id: string;
  state: TState;
  profile: TProfile;
  timestamp: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: TResult;
  error?: string;
}

export interface SimulationComparison<TResult> {
  baseline: TResult | null;
  comparison: TResult | null;
  diff?: {
    scoreDelta: number;
    durationDelta: number;
    questionCountDelta: number;
  };
}

interface UseSimulationWorkflowOptions<TState, TProfile, TResult> {
  /** Function to execute the simulation */
  onSimulate: (state: TState, profile: TProfile) => Promise<TResult>;
  /** Debounce delay for auto-simulation (ms) */
  autoSimulateDebounceMs?: number;
  /** Enable auto-simulation on state changes */
  enableAutoSimulate?: boolean;
  /** Callback when auto-simulation triggers */
  onAutoSimulate?: (result: TResult) => void;
}

interface UseSimulationWorkflowReturn<TState, TProfile, TResult> {
  // State
  isSimulating: boolean;
  currentResult: TResult | null;
  queueLength: number;
  comparison: SimulationComparison<TResult>;

  // Actions
  runSimulation: (state: TState, profile: TProfile) => Promise<TResult | null>;
  setBaseline: (result: TResult | null) => void;
  clearComparison: () => void;
  cancelPending: () => void;

  // Auto-simulation
  triggerAutoSimulate: (state: TState, profile: TProfile) => void;
}

// ============================================
// HOOK
// ============================================

export function useSimulationWorkflow<TState, TProfile, TResult>({
  onSimulate,
  autoSimulateDebounceMs = 3000,
  enableAutoSimulate = false,
  onAutoSimulate,
}: UseSimulationWorkflowOptions<TState, TProfile, TResult>): UseSimulationWorkflowReturn<TState, TProfile, TResult> {
  // Queue management
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentResult, setCurrentResult] = useState<TResult | null>(null);
  const queueRef = useRef<SimulationRequest<TState, TProfile, TResult>[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Comparison mode
  const [comparison, setComparison] = useState<SimulationComparison<TResult>>({
    baseline: null,
    comparison: null,
  });

  // Auto-simulation state
  const [autoSimulateState, setAutoSimulateState] = useState<{
    state: TState;
    profile: TProfile;
  } | null>(null);

  // Debounced auto-simulation trigger
  const debouncedAutoState = useDebounce(autoSimulateState, autoSimulateDebounceMs);

  // Process queue
  const processQueue = useCallback(async () => {
    if (isSimulating || queueRef.current.length === 0) {
      return;
    }

    // Get latest request (skip stale ones)
    const request = queueRef.current[queueRef.current.length - 1];
    queueRef.current = []; // Clear queue, we only care about latest

    if (!request) return;

    setIsSimulating(true);
    request.status = 'running';

    try {
      const result = await onSimulate(request.state, request.profile);
      request.status = 'completed';
      request.result = result;
      setCurrentResult(result);

      // Update comparison if in comparison mode
      if (comparison.baseline) {
        setComparison((prev) => ({
          ...prev,
          comparison: result,
          diff: calculateDiff(prev.baseline, result),
        }));
      }

      return result;
    } catch (error) {
      request.status = 'failed';
      request.error = error instanceof Error ? error.message : 'Simulation failed';
      throw error;
    } finally {
      setIsSimulating(false);
    }
  }, [isSimulating, onSimulate, comparison.baseline]);

  // Run simulation with queue management
  const runSimulation = useCallback(
    async (state: TState, profile: TProfile): Promise<TResult | null> => {
      const request: SimulationRequest<TState, TProfile, TResult> = {
        id: crypto.randomUUID(),
        state,
        profile,
        timestamp: Date.now(),
        status: 'queued',
      };

      queueRef.current.push(request);

      // If already simulating, queue will be processed when current finishes
      if (isSimulating) {
        return null; // Queued, result will come later
      }

      try {
        const result = await processQueue();
        return result ?? null;
      } catch {
        return null;
      }
    },
    [isSimulating, processQueue]
  );

  // Auto-simulation effect
  useEffect(() => {
    if (!enableAutoSimulate || !debouncedAutoState) {
      return;
    }

    const { state, profile } = debouncedAutoState;

    // Run auto-simulation
    runSimulation(state, profile).then((result) => {
      if (result && onAutoSimulate) {
        onAutoSimulate(result);
      }
    });
  }, [debouncedAutoState, enableAutoSimulate, onAutoSimulate, runSimulation]);

  // Trigger auto-simulation (debounced)
  const triggerAutoSimulate = (state: TState, profile: TProfile) => {
    setAutoSimulateState({ state, profile });
  };

  // Set baseline for comparison
  const setBaseline = (result: TResult | null) => {
    setComparison({
      baseline: result,
      comparison: null,
      diff: undefined,
    });
  };

  // Clear comparison mode
  const clearComparison = () => {
    setComparison({
      baseline: null,
      comparison: null,
      diff: undefined,
    });
  };

  // Cancel pending simulations
  const cancelPending = () => {
    queueRef.current = [];
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    isSimulating,
    currentResult,
    queueLength: queueRef.current.length,
    comparison,
    runSimulation,
    setBaseline,
    clearComparison,
    cancelPending,
    triggerAutoSimulate,
  };
}

// ============================================
// HELPERS
// ============================================

function calculateDiff<TResult>(
  baseline: TResult | null,
  comparison: TResult | null
): SimulationComparison<TResult>['diff'] | undefined {
  if (!baseline || !comparison) {
    return undefined;
  }

  // Type guard for simulation result structure
  const baselineResult = baseline as {
    simulatedScore?: number;
    estimatedDurationMinutes?: number;
    sampleQuestions?: { length: number };
  };
  const comparisonResult = comparison as {
    simulatedScore?: number;
    estimatedDurationMinutes?: number;
    sampleQuestions?: { length: number };
  };

  return {
    scoreDelta:
      (comparisonResult.simulatedScore ?? 0) - (baselineResult.simulatedScore ?? 0),
    durationDelta:
      (comparisonResult.estimatedDurationMinutes ?? 0) -
      (baselineResult.estimatedDurationMinutes ?? 0),
    questionCountDelta:
      (comparisonResult.sampleQuestions?.length ?? 0) -
      (baselineResult.sampleQuestions?.length ?? 0),
  };
}
