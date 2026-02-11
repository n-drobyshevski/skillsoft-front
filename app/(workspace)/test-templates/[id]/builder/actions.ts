'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAuthHeaders } from '@/services/roleApi';

// ============================================
// CACHE TAG HELPERS - Granular invalidation
// ============================================

/**
 * Cache tag naming convention for surgical invalidation:
 * - template:{id} - Entire template data
 * - template:{id}:blueprint - Blueprint structure (competencies, weights)
 * - template:{id}:settings - Template settings (time limit, passing score)
 * - template:{id}:simulation - Simulation results
 * - competency:inventory - Global competency inventory health
 *
 * Note: Not exported because "use server" files can only export async functions
 */
const CacheTags = {
  template: (id: string) => `template:${id}`,
  blueprint: (id: string) => `template:${id}:blueprint`,
  settings: (id: string) => `template:${id}:settings`,
  simulation: (id: string) => `template:${id}:simulation`,
  competencyInventory: 'competency:inventory',
} as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

export type HealthStatus = 'CRITICAL' | 'MODERATE' | 'HEALTHY';
export type SimulationProfile = 'PERFECT_CANDIDATE' | 'RANDOM_GUESSER' | 'FAILING_CANDIDATE';
export type Strategy = 'UNIVERSAL_BASELINE' | 'TARGETED_FIT' | 'DYNAMIC_GAP_ANALYSIS';
export type Difficulty = 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SelectionReason =
  | 'COVERAGE_GAP'
  | 'CALIBRATION'
  | 'ADAPTIVE_CHECK'
  | 'RANDOMIZED'
  | 'BACKSTOP';
export type AdaptivityMode = 'LINEAR' | 'ADAPTIVE_STANDARD' | 'RUTHLESS';

export interface BlueprintCompetency {
  id: string;
  name: string;
  category: string;
  questionCount: number;
  weight: number;
  difficulty?: Difficulty;
}

export interface AdaptivitySettings {
  mode: AdaptivityMode;
  allowBacktracking: boolean;
}

export interface BlueprintState {
  templateId: string;
  templateName: string;
  strategy: Strategy;
  competencies: BlueprintCompetency[];
  adaptivity: AdaptivitySettings;
  timeLimitMinutes: number;
  passingScore: number;
  includeBigFive?: boolean;
  onetSocCode?: string;
  strictnessLevel?: number;
  teamId?: string;
  saturationThreshold?: number;
}

export interface LibraryCompetency {
  id: string;
  name: string;
  category: string;
  description: string;
  questionCount: number;
  health: HealthStatus;
}

export interface QuestionSummary {
  id: string;
  competencyId?: string;
  text: string;
  difficulty: string;
  competencyName: string;
  indicatorTitle: string;
  estimatedTimeSeconds: number;
  selectionReason?: SelectionReason;
  abilityDelta?: number;
}

export interface InventoryWarning {
  competencyId: string;
  competencyName: string;
  difficulty: string;
  currentCount: number;
  severity: HealthStatus;
}

export interface SimulationResult {
  valid: boolean;
  composition: Record<string, number>;
  sampleQuestions: QuestionSummary[];
  warnings: InventoryWarning[];
  estimatedDurationMinutes: number;
  difficultyDistribution: Record<string, number>;
  distributionByCompetency: Array<{
    competencyId: string;
    competencyName: string;
    questionCount: number;
    weight: number;
    difficultyMix: Record<Difficulty, number>;
  }>;
  distributionByDifficulty: Record<Difficulty, number>;
  selectionReasons: Record<SelectionReason, number>;
  simulatedScore?: number;
  runLogs: string[];
}

export interface InventoryHeatmap {
  competencyHealth: Record<string, HealthStatus>;
  totalCompetencies: number;
  healthyCounts: number;
  criticalCounts: number;
}

export interface SampleQuestionResponse {
  text: string;
  difficulty?: Difficulty;
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Import strategy mapping utilities (non-server-action exports)
import { toBackendStrategy } from './strategy-mapping';

// ============================================
// API HELPERS
// ============================================

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return 'http://localhost:8080/api';
  }
  const protocol =
    apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
      ? 'http'
      : 'https';
  return `${protocol}://${apiUrl}/api`;
};

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Update the blueprint (save draft changes)
 * Supports optimistic updates - errors will trigger rollback
 */
export async function updateBlueprint(
  state: BlueprintState
): Promise<ActionResponse<BlueprintState>> {
  try {
    const authHeaders = await getAuthHeaders();

    const updatePayload = {
      name: state.templateName,
      blueprint: {
        strategy: toBackendStrategy(state.strategy),
        competencyIds: state.competencies.map((c) => c.id),
        adaptivity: state.adaptivity,
        includeBigFive: state.includeBigFive,
        onetSocCode: state.onetSocCode,
        strictnessLevel: state.strictnessLevel,
        teamId: state.teamId,
        saturationThreshold: state.saturationThreshold,
      },
      competencyIds: state.competencies.map((c) => c.id),
      timeLimitMinutes: state.timeLimitMinutes,
      passingScore: state.passingScore,
    };

    const response = await fetch(
      `${getApiBaseUrl()}/v1/tests/templates/${state.templateId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(updatePayload),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save: ${response.status}`);
    }

    // Revalidate caches with granular tags - Next.js 16 requires profile/config
    // Only invalidate blueprint-specific cache, not entire template
    revalidateTag(CacheTags.blueprint(state.templateId), { expire: 0 });
    revalidateTag(CacheTags.settings(state.templateId), { expire: 0 });
    // Also invalidate simulation cache since blueprint changed
    revalidateTag(CacheTags.simulation(state.templateId), { expire: 0 });
    // Path revalidation for page-level cache
    revalidatePath(`/test-templates/${state.templateId}/builder`);

    return { success: true, data: state };
  } catch (error) {
    console.error('updateBlueprint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save blueprint',
    };
  }
}

/**
 * Fetch a representative sample question for a competency
 */
export async function getSampleQuestion(
  competencyId: string
): Promise<ActionResponse<SampleQuestionResponse>> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${getApiBaseUrl()}/v1/tests/competencies/${competencyId}/sample-question`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Sample fetch failed: ${response.status}`);
    }

    const data: SampleQuestionResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getSampleQuestion error:', error);
    return {
      success: true,
      data: {
        text: 'Scenario: You are leading a cross-functional project with conflicting stakeholder goals. How do you align the team and keep delivery on track?',
        difficulty: 'INTERMEDIATE',
      },
    };
  }
}

/**
 * Generate mock simulation data for development
 */
function generateMockSimulation(
  state: BlueprintState,
  profile: SimulationProfile
): SimulationResult {
  const scoreByProfile: Record<SimulationProfile, number> = {
    PERFECT_CANDIDATE: 95,
    RANDOM_GUESSER: 50,
    FAILING_CANDIDATE: 25,
  };

  const difficulties: Difficulty[] = ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
  const selectionReasons: SelectionReason[] = [
    'COVERAGE_GAP',
    'CALIBRATION',
    'ADAPTIVE_CHECK',
    'RANDOMIZED',
    'BACKSTOP',
  ];

  const difficultyDistribution: Record<Difficulty, number> = {
    FOUNDATIONAL: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    EXPERT: 0,
  };

  const selectionReasonCounts: Record<SelectionReason, number> = {
    COVERAGE_GAP: 0,
    CALIBRATION: 0,
    ADAPTIVE_CHECK: 0,
    RANDOMIZED: 0,
    BACKSTOP: 0,
  };
  
  return {
    valid: state.competencies.length > 0,
    composition: state.competencies.reduce(
      (acc, c) => {
        acc[c.name] = c.questionCount;
        return acc;
      },
      {} as Record<string, number>
    ),
    sampleQuestions: Array.from({ length: Math.min(20, state.competencies.length * 3) }, (_, i) => {
      const comp = state.competencies[i % state.competencies.length];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const selectionReason = selectionReasons[Math.floor(Math.random() * selectionReasons.length)];

      difficultyDistribution[difficulty] += 1;
      selectionReasonCounts[selectionReason] += 1;

      return {
        id: `q-${i}`,
        competencyId: comp?.id,
        text: `Sample question ${i + 1} about ${comp?.name || 'competency'}`,
        difficulty,
        competencyName: comp?.name || 'Unknown',
        indicatorTitle: `${comp?.name || 'Competency'} - Key Indicator`,
        estimatedTimeSeconds: 60 + Math.floor(Math.random() * 60),
        selectionReason,
        abilityDelta: Number(((Math.random() - 0.5) * 0.2).toFixed(2)),
      };
    }),
    warnings: state.competencies
      .filter((c) => c.questionCount < 3)
      .map((c) => ({
        competencyId: c.id,
        competencyName: c.name,
        difficulty: c.difficulty || 'INTERMEDIATE',
        currentCount: c.questionCount,
        severity: c.questionCount === 0 ? 'CRITICAL' : ('MODERATE' as HealthStatus),
      })),
    estimatedDurationMinutes:
      state.timeLimitMinutes ||
      Math.ceil(state.competencies.reduce((sum, c) => sum + c.questionCount * 1.5, 0)),
    difficultyDistribution,
    distributionByCompetency: state.competencies.map((c) => ({
      competencyId: c.id,
      competencyName: c.name,
      questionCount: c.questionCount,
      weight: c.weight,
      difficultyMix: {
        FOUNDATIONAL: Math.max(5, Math.floor(Math.random() * 20)),
        INTERMEDIATE: Math.max(10, Math.floor(Math.random() * 30)),
        ADVANCED: Math.max(5, Math.floor(Math.random() * 20)),
        EXPERT: Math.max(0, Math.floor(Math.random() * 10)),
      },
    })),
    distributionByDifficulty: difficultyDistribution,
    selectionReasons: selectionReasonCounts,
    simulatedScore: scoreByProfile[profile],
    runLogs: [
      `[MOCK] Simulation with profile: ${profile}`,
      `[MOCK] Competencies: ${state.competencies.length}`,
      `[MOCK] Strategy: ${state.strategy}`,
    ],
  };
}

/**
 * Run test simulation with a persona profile
 * Returns expected results based on the persona
 */
export async function simulateTest(
  state: BlueprintState,
  profile: SimulationProfile
): Promise<ActionResponse<SimulationResult>> {
  try {
    const authHeaders = await getAuthHeaders();

    const simulatePayload = {
      templateId: state.templateId,
      blueprint: {
        strategy: toBackendStrategy(state.strategy),
        competencyIds: state.competencies.map((c) => c.id),
        adaptivity: state.adaptivity,
        includeBigFive: state.includeBigFive,
        onetSocCode: state.onetSocCode,
        strictnessLevel: state.strictnessLevel,
        teamId: state.teamId,
        saturationThreshold: state.saturationThreshold,
      },
      profile,
    };

    const response = await fetch(
      `${getApiBaseUrl()}/v1/tests/templates/simulate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(simulatePayload),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Simulation failed: ${response.status}`
      );
    }

    const result: SimulationResult = await response.json();

    // Normalize: ensure distributionByCompetency is populated
    // Backend returns sampleQuestions with competencyId - derive distribution from that
    if (!result.distributionByCompetency?.length && result.sampleQuestions?.length) {
      // Group questions by competencyId and count
      const competencyMap = new Map<string, {
        count: number;
        competencyName: string;
        difficultyMix: Record<Difficulty, number>;
      }>();

      result.sampleQuestions.forEach((q) => {
        const compId = q.competencyId || 'unknown';
        const existing = competencyMap.get(compId) || {
          count: 0,
          competencyName: q.competencyName || `Competency`,
          difficultyMix: { FOUNDATIONAL: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 },
        };
        existing.count++;
        const diff = (q.difficulty as Difficulty) || 'INTERMEDIATE';
        if (existing.difficultyMix[diff] !== undefined) {
          existing.difficultyMix[diff]++;
        }
        competencyMap.set(compId, existing);
      });

      // Also try to get competency names from state that was passed
      const competencyNames = new Map(
        state.competencies.map((c) => [c.id, c.name])
      );

      result.distributionByCompetency = Array.from(competencyMap.entries()).map(
        ([compId, data]) => ({
          competencyId: compId,
          competencyName: competencyNames.get(compId) || data.competencyName,
          questionCount: data.count,
          weight: 1,
          difficultyMix: data.difficultyMix,
        })
      );
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('simulateTest error:', error);
    // Return mock data only in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DEV] Using mock simulation data');
      return {
        success: true,
        data: generateMockSimulation(state, profile),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    };
  }
}

/**
 * Fetch inventory health status for all competencies
 */
export async function fetchInventoryHealth(): Promise<
  ActionResponse<InventoryHeatmap>
> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${getApiBaseUrl()}/v1/tests/inventory/heatmap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      next: {
        revalidate: 60, // Stale-while-revalidate: refresh every 60s
        tags: [CacheTags.competencyInventory],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Fetch heatmap failed: ${response.status}`
      );
    }

    const result: InventoryHeatmap = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('fetchInventoryHealth error:', error);
    // Return empty mock data
    return {
      success: true,
      data: {
        competencyHealth: {},
        totalCompetencies: 0,
        healthyCounts: 0,
        criticalCounts: 0,
      },
    };
  }
}

/**
 * Publish the blueprint (lock version)
 */
export async function publishBlueprint(
  templateId: string
): Promise<ActionResponse<{ published: boolean; version: number }>> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${getApiBaseUrl()}/v1/tests/templates/${templateId}/publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Publish failed: ${response.status}`);
    }

    const result = await response.json();

    // Invalidate all template-related caches on publish
    revalidateTag(CacheTags.template(templateId), { expire: 0 });
    revalidateTag(CacheTags.blueprint(templateId), { expire: 0 });
    revalidateTag(CacheTags.settings(templateId), { expire: 0 });
    revalidateTag(CacheTags.simulation(templateId), { expire: 0 });
    revalidatePath(`/test-templates/${templateId}`);

    return { success: true, data: { published: true, version: result.version ?? 1 } };
  } catch (error) {
    console.error('publishBlueprint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Publish failed',
    };
  }
}
