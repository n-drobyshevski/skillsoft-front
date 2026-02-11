/**
 * E2E Test Fixtures Index
 * Re-exports all fixtures for easy importing.
 */

export { test, expect } from './auth.fixture';
export { DataFactory } from './data-factory';
export type {
  CompetencyData,
  BehavioralIndicatorData,
  QuestionData,
  UserData,
  TestTemplateData,
  TestSessionData,
  TestAnswerData,
} from './data-factory';
