'use client';

/**
 * Test Session Context
 *
 * Provides the TestSessionAdapter to child components via React Context.
 * This allows the ImmersivePlayer to be mode-agnostic while still accessing
 * the appropriate API adapter (authenticated or anonymous).
 *
 * @module context/test-session-context
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type {
  TestSessionAdapter,
  SessionMode,
} from '@/adapters/test-session-adapter';

// CONTEXT TYPES

/**
 * Context value provided to consumers.
 */
interface TestSessionContextValue {
  /** The adapter instance for API calls */
  adapter: TestSessionAdapter;
  /** Current session mode */
  mode: SessionMode;
  /** Whether test-drive insights are available */
  supportsTestDrive: boolean;
  /** Whether answer review is available */
  supportsAnswerReview: boolean;
  /** Whether taker info is required on completion */
  requiresTakerInfo: boolean;
}

// CONTEXT

const TestSessionContext = createContext<TestSessionContextValue | null>(null);

// PROVIDER

interface TestSessionProviderProps {
  /** The adapter to use for this session */
  adapter: TestSessionAdapter;
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component that makes the TestSessionAdapter available to all
 * child components in the tree.
 *
 * Usage:
 * ```tsx
 * const adapter = new AuthenticatedTestSessionAdapter(userId, userRole);
 *
 * <TestSessionProvider adapter={adapter}>
 *   <ImmersivePlayer session={session} ... />
 * </TestSessionProvider>
 * ```
 */
export function TestSessionProvider({ adapter, children }: TestSessionProviderProps) {
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<TestSessionContextValue>(() => ({
    adapter,
    mode: adapter.mode,
    supportsTestDrive: adapter.supportsTestDrive,
    supportsAnswerReview: adapter.supportsAnswerReview,
    requiresTakerInfo: adapter.requiresTakerInfo,
  }), [adapter]);

  return (
    <TestSessionContext.Provider value={value}>
      {children}
    </TestSessionContext.Provider>
  );
}

// HOOKS

/**
 * Hook to access the full test session context.
 *
 * @returns The test session context value
 * @throws Error if used outside of TestSessionProvider
 *
 * Usage:
 * ```tsx
 * const { adapter, mode, supportsTestDrive } = useTestSession();
 * ```
 */
export function useTestSession(): TestSessionContextValue {
  const context = useContext(TestSessionContext);

  if (!context) {
    throw new Error(
      'useTestSession must be used within a TestSessionProvider. ' +
      'Make sure to wrap your component tree with <TestSessionProvider adapter={...}>.'
    );
  }

  return context;
}

/**
 * Hook to access just the adapter for API calls.
 * Convenience wrapper around useTestSession().
 *
 * @returns The test session adapter
 * @throws Error if used outside of TestSessionProvider
 *
 * Usage:
 * ```tsx
 * const adapter = useTestSessionAdapter();
 * const question = await adapter.getCurrentQuestion(sessionId);
 * ```
 */
export function useTestSessionAdapter(): TestSessionAdapter {
  return useTestSession().adapter;
}

/**
 * Hook to access just the session mode.
 * Convenience wrapper around useTestSession().
 *
 * @returns The current session mode ('authenticated' or 'anonymous')
 * @throws Error if used outside of TestSessionProvider
 *
 * Usage:
 * ```tsx
 * const mode = useSessionMode();
 * if (mode === 'anonymous') {
 *   // Show taker info form
 * }
 * ```
 */
export function useSessionMode(): SessionMode {
  return useTestSession().mode;
}

/**
 * Hook to check if a feature is supported by the current adapter.
 *
 * @returns Object with feature flags
 * @throws Error if used outside of TestSessionProvider
 *
 * Usage:
 * ```tsx
 * const { supportsTestDrive, supportsAnswerReview } = useSessionFeatures();
 * ```
 */
export function useSessionFeatures(): {
  supportsTestDrive: boolean;
  supportsAnswerReview: boolean;
  requiresTakerInfo: boolean;
} {
  const { supportsTestDrive, supportsAnswerReview, requiresTakerInfo } = useTestSession();
  return { supportsTestDrive, supportsAnswerReview, requiresTakerInfo };
}
