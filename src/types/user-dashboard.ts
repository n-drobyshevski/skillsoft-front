import type { TestSessionSummary, TestResult, CompetencyScore } from './domain';

/** Computed personal statistics for the user dashboard */
export interface PersonalStats {
  testsTaken: number;
  avgScore: number;       // mean of overallPercentage, 0-100
  passRate: string;       // e.g. "4/5"
  passCount: number;
  totalCompleted: number;
}

/** Aggregated competency with average score across all results */
export interface AggregatedCompetency {
  competencyName: string;
  competencyCategory?: string;
  avgPercentage: number;  // 0-100
  resultCount: number;    // how many results contributed
}

/** Big Five profile extracted from the most recent TEAM_FIT result */
export interface BigFiveSnapshot {
  profile: Record<string, number>;  // e.g. { openness: 72, ... }
  resultId: string;                 // link to the source result
  templateName: string;
}

/** Complete data shape for the user dashboard */
export interface UserDashboardData {
  pendingSessions: TestSessionSummary[];
  completedResults: TestResult[];
  personalStats: PersonalStats | null;       // null if 0 completed
  topCompetencies: AggregatedCompetency[];   // empty if < 2 results
  bigFiveSnapshot: BigFiveSnapshot | null;   // null if no Big Five data
}

// Re-export for convenience — CompetencyScore is the source type for AggregatedCompetency
export type { CompetencyScore };
