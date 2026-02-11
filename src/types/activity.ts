/**
 * Activity Tracking Types
 *
 * Types for candidate test activity tracking system.
 * Used by dashboard RecentActivityWidget and Template Activity pages.
 */

import { AssessmentGoal } from './domain';

/**
 * Session status for activity events.
 * Matches backend SessionStatus enum for terminal states.
 */
export type ActivityEventType = 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';

/**
 * Test activity item for activity feeds.
 * Represents a single test session event with user enrichment.
 */
export interface TestActivity {
  sessionId: string;
  clerkUserId: string;
  userName: string;
  userImageUrl?: string;
  templateId: string;
  templateName: string;
  templateGoal: AssessmentGoal;
  eventType: ActivityEventType;
  occurredAt: string; // ISO datetime string
  score?: number;
  passed?: boolean;
  timeSpentSeconds?: number;
}

/**
 * Aggregated activity statistics for a template.
 * Used in template activity dashboard stats cards.
 */
export interface TemplateActivityStats {
  templateId: string;
  templateName: string;
  goal: AssessmentGoal;
  totalSessions: number;
  completedCount: number;
  abandonedCount: number;
  timedOutCount: number;
  completionRate: number; // 0-100
  passRate: number; // 0-100
  averageScore: number; // 0-100
  averageTimeSeconds: number;
  lastActivity?: string; // ISO datetime string
}

/**
 * Filter parameters for activity queries.
 */
export interface ActivityFilterParams {
  templateId?: string;
  status?: ActivityEventType;
  passed?: boolean;
  from?: string; // ISO datetime
  to?: string; // ISO datetime
  page?: number;
  size?: number;
}

/**
 * Paginated response for activity queries.
 */
export interface ActivityPage {
  content: TestActivity[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * User result summary - represents the latest attempt per user.
 * Groups TestActivity by clerkUserId, keeping only the most recent.
 */
export interface UserResultSummary {
  clerkUserId: string;
  userName: string;
  userImageUrl?: string;
  latestSession: {
    sessionId: string;
    eventType: ActivityEventType;
    occurredAt: string;
    score?: number;
    passed?: boolean;
    timeSpentSeconds?: number;
  };
  totalAttempts: number;
}
