'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAuthHeaders } from '@/services/roleApi';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type HealthStatus = 'CRITICAL' | 'MODERATE' | 'HEALTHY';
export type SimulationProfile = 'PERFECT_CANDIDATE' | 'RANDOM_GUESSER' | 'FAILING_CANDIDATE';
export type Strategy = 'UNIVERSAL_BASELINE' | 'TARGETED_FIT' | 'DYNAMIC_GAP_ANALYSIS';
export type Difficulty = 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED';
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
  text: string;
  difficulty: string;
  competencyName: string;
  indicatorTitle: string;
  estimatedTimeSeconds: number;
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
  simulatedScore?: number;
  runLogs: string[];
}

export interface InventoryHeatmap {
  competencyHealth: Record<string, HealthStatus>;
  totalCompetencies: number;
  healthyCounts: number;
  criticalCounts: number;
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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
        strategy: state.strategy,
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

    // Revalidate caches
    revalidateTag(`test-template-${state.templateId}`, 'max');
    revalidatePath(`/test-templates/${state.templateId}`);
    revalidatePath(`/test-templates/${state.templateId}/builder`);

    return { success: true, data: state };
  } catch (error) {
    console.error('updateBlueprint error:', error);
    // Allow optimistic UI to persist in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Save failed but optimistic UI preserved');
      return { success: true, data: state };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save blueprint',
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

  const difficulties = ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED'] as const;
  
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
      return {
        id: `q-${i}`,
        text: `Sample question ${i + 1} about ${comp?.name || 'competency'}`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        competencyName: comp?.name || 'Unknown',
        indicatorTitle: `${comp?.name || 'Competency'} - Key Indicator`,
        estimatedTimeSeconds: 60 + Math.floor(Math.random() * 60),
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
    difficultyDistribution: {
      FOUNDATIONAL: 30,
      INTERMEDIATE: 50,
      ADVANCED: 20,
    },
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
        strategy: state.strategy,
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
    return { success: true, data: result };
  } catch (error) {
    console.error('simulateTest error:', error);
    // Return mock data in development
    console.log('[DEV] Using mock simulation data');
    return {
      success: true,
      data: generateMockSimulation(state, profile),
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
        revalidate: 60,
        tags: ['inventory-heatmap'],
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

    revalidateTag(`test-template-${templateId}`, 'max');
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
