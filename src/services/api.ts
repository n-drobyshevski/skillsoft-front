/**
 * API Service - Backwards compatibility re-export.
 *
 * The monolithic api.ts has been split into per-domain modules under ./api/.
 * This file re-exports everything for backwards compatibility so that
 * `import { ... } from '@/services/api'` continues to work.
 *
 * For new code, prefer importing from the specific module:
 *   import { competenciesApi } from '@/services/api/competencies'
 */
export {
  fetchApi,
  competenciesApi,
  behavioralIndicatorsApi,
  assessmentQuestionsApi,
  usersApi,
  testTemplatesApi,
  testSessionsApi,
  testResultsApi,
  psychometricsApi,
  onetApi,
  teamsApi,
  passportApi,
  assemblyApi,
  activityApi,
  templateSharingApi,
} from './api/index';

export type { ApiError } from './api/index';
