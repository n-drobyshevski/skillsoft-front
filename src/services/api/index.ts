/**
 * API Service - Barrel re-exports
 *
 * Split from the monolithic api.ts into per-domain modules for tree-shaking.
 * All existing imports from '@/services/api' continue to work unchanged.
 */

// Core utilities
export { fetchApi } from './core';
export type { ApiError } from './core';

// Domain API modules
export { competenciesApi } from './competencies';
export { behavioralIndicatorsApi } from './indicators';
export { assessmentQuestionsApi } from './questions';
export { usersApi } from './users';
export { testTemplatesApi } from './templates';
export { testSessionsApi } from './sessions';
export { testResultsApi } from './results';
export { psychometricsApi } from './psychometrics';
export { onetApi } from './onet';
export { teamsApi } from './teams';
export { passportApi } from './passport';
export { assemblyApi } from './assembly';
export { activityApi } from './activity';
export { templateSharingApi } from './sharing';
export { statsApi } from './stats';
export type { NavigationBadgeCounts } from './stats';
