/**
 * Test Session Adapters
 *
 * Re-exports all adapter-related types and classes for clean imports.
 *
 * @example
 * ```typescript
 * import {
 *   TestSessionAdapter,
 *   AuthenticatedTestSessionAdapter,
 *   AnonymousTestSessionAdapter,
 *   createAuthenticatedAdapter,
 *   createAnonymousAdapterFromStorage,
 * } from '@/adapters';
 * ```
 */

// Types and interfaces
export type {
  SessionMode,
  AnonymousTakerInfo,
  CompetencyBreakdownItem,
  InlineResultData,
  CompletionResult,
  SessionData,
  TestSessionAdapter,
} from './test-session-adapter';

// Type guards
export {
  isAuthenticatedMode,
  isAnonymousMode,
} from './test-session-adapter';

// Authenticated adapter
export {
  AuthenticatedTestSessionAdapter,
  createAuthenticatedAdapter,
} from './authenticated-test-session-adapter';

// Anonymous adapter
export {
  AnonymousTestSessionAdapter,
  createAnonymousAdapterFromStorage,
  createAnonymousAdapter,
} from './anonymous-test-session-adapter';
