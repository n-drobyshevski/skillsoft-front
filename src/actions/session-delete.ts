'use server';

/**
 * Re-exports for session delete server actions.
 *
 * The actual implementations live in the route-adjacent actions file:
 * app/(workspace)/test-templates/[id]/results/actions.ts
 *
 * This wrapper exists so client components under src/ can import without
 * relying on the @/ alias reaching the app/ directory or dealing with
 * the [id] dynamic segment in filesystem paths.
 */
export {
  deleteTestSession,
  bulkDeleteTestSessions,
} from '../../../app/(workspace)/test-templates/[id]/results/actions';
