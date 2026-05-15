import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { SimulationResult } from '@/types/blueprint';

// TYPES

/**
 * Simulation store state - manages test simulation execution and results.
 *
 * Note: The actual simulateTest server action call is orchestrated by
 * BlueprintWorkspaceProvider, not by this store. The store only manages
 * the state lifecycle (isSimulating, result). This avoids importing
 * server actions from src/store/ (which cannot reach app/ server files).
 */
interface SimulationStoreState {
  /** The result of the most recent simulation run */
  simulationResult: SimulationResult | null;
  /** Whether a simulation is currently in progress */
  isSimulating: boolean;
}

interface SimulationStoreActions {
  /**
   * Mark simulation as started (loading state).
   */
  setSimulating: (isSimulating: boolean) => void;

  /**
   * Set the simulation result after a successful run.
   * Also clears the isSimulating flag.
   */
  setSimulationResult: (result: SimulationResult) => void;

  /**
   * Reset the simulation result to null (clear previous run).
   */
  resetSimulation: () => void;
}

export type SimulationStore = SimulationStoreState & SimulationStoreActions;

// DEFAULT STATE

const defaultState: SimulationStoreState = {
  simulationResult: null,
  isSimulating: false,
};

// STORE

/**
 * Simulation Store
 *
 * Manages the test simulation state lifecycle:
 * - Tracks simulation in-progress state
 * - Stores the latest simulation result
 *
 * The actual simulateTest server action is called from
 * BlueprintWorkspaceProvider, which then updates this store.
 *
 * Uses subscribeWithSelector for granular subscriptions.
 */
export const useSimulationStore = create<SimulationStore>()(
  devtools(
    subscribeWithSelector((set) => ({
      // Initial state
      ...defaultState,

      // ACTIONS

      setSimulating: (isSimulating) => {
        set({ isSimulating }, false, 'setSimulating');
      },

      setSimulationResult: (result) => {
        set(
          { simulationResult: result, isSimulating: false },
          false,
          'setSimulationResult'
        );
      },

      resetSimulation: () => {
        set(defaultState, false, 'resetSimulation');
      },
    })),
    {
      name: 'SimulationStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// SELECTOR HOOKS

/**
 * Select the simulation result.
 */
export const useSimulationResult = () =>
  useSimulationStore((s) => s.simulationResult);

/**
 * Select whether a simulation is in progress.
 */
export const useIsSimulating = () =>
  useSimulationStore((s) => s.isSimulating);

/**
 * Select all simulation state (result + loading flag).
 */
export const useSimulationState = () =>
  useSimulationStore(
    useShallow((s) => ({
      simulationResult: s.simulationResult,
      isSimulating: s.isSimulating,
    }))
  );

/**
 * Select simulation actions (stable references from Zustand).
 */
export const useSimulationActions = () =>
  useSimulationStore(
    useShallow((s) => ({
      setSimulating: s.setSimulating,
      setSimulationResult: s.setSimulationResult,
      resetSimulation: s.resetSimulation,
    }))
  );
