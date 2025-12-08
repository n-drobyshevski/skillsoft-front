'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAuthHeaders } from '@/services/roleApi';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Health status for inventory - matches backend HealthStatus enum
 */
export type HealthStatus = 'CRITICAL' | 'MODERATE' | 'HEALTHY';

/**
 * Simulation profile personas - matches backend SimulationProfile enum
 */
export type SimulationProfile = 'PERFECT_CANDIDATE' | 'RANDOM_GUESSER' | 'FAILING_CANDIDATE';

/**
 * Inventory heatmap for competencies
 */
export interface InventoryHeatmap {
  competencyHealth: Record<string, HealthStatus>;
  totalCompetencies: number;
  healthyCounts: number;
  criticalCounts: number;
}

/**
 * Adaptivity settings for test behavior
 */
export interface AdaptivitySettings {
  mode: 'LINEAR' | 'ADAPTIVE_STANDARD' | 'RUTHLESS';
  allowBacktracking: boolean;
}

/**
 * Competency configuration within a blueprint
 */
export interface BlueprintCompetency {
  id: string;
  name: string;
  category: string;
  questionCount: number;
  weight: number;
  difficulty?: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED';
}

/**
 * The current blueprint configuration state
 */
export interface BlueprintState {
  templateId: string;
  templateName: string;
  strategy: 'UNIVERSAL_BASELINE' | 'TARGETED_FIT' | 'DYNAMIC_GAP_ANALYSIS';
  competencies: BlueprintCompetency[];
  adaptivity: AdaptivitySettings;
  timeLimitMinutes: number;
  passingScore: number;
  
  // Strategy-specific fields
  includeBigFive?: boolean;          // For UNIVERSAL_BASELINE
  onetSocCode?: string;              // For TARGETED_FIT
  strictnessLevel?: number;          // For TARGETED_FIT (0-100)
  teamId?: string;                   // For DYNAMIC_GAP_ANALYSIS
  saturationThreshold?: number;      // For DYNAMIC_GAP_ANALYSIS
}

/**
 * Question summary for simulation preview
 */
export interface QuestionSummary {
  id: string;
  text: string;
  difficulty: string;
  competencyName: string;
  indicatorTitle: string;
  estimatedTimeSeconds: number;
}

/**
 * Warning about inventory issues
 */
export interface InventoryWarning {
  competencyId: string;
  competencyName: string;
  difficulty: string;
  currentCount: number;
  severity: HealthStatus;
}

/**
 * Result from running a simulation
 */
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

/**
 * Response wrapper for server actions
 */
export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// API HELPERS
// ============================================

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return "http://localhost:8080/api";
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api`;
};

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Save draft changes to the blueprint
 */
export async function saveDraftAction(
  state: BlueprintState
): Promise<ActionResponse<BlueprintState>> {
  try {
    const authHeaders = await getAuthHeaders();
    
    // Transform BlueprintState to backend UpdateTestTemplateRequest
    const updatePayload = {
      name: state.templateName,
      blueprint: {
        strategy: state.strategy,
        competencyIds: state.competencies.map(c => c.id),
        adaptivity: state.adaptivity,
        includeBigFive: state.includeBigFive,
        onetSocCode: state.onetSocCode,
        strictnessLevel: state.strictnessLevel,
        teamId: state.teamId,
        saturationThreshold: state.saturationThreshold,
      },
      competencyIds: state.competencies.map(c => c.id),
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

    // Revalidate template caches (Next.js 16 requires cache profile as 2nd arg)
    revalidateTag(`test-template-${state.templateId}`, 'max');
    revalidatePath(`/test-templates/${state.templateId}`);

    return { success: true, data: state };
  } catch (error) {
    console.error('saveDraftAction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save draft' 
    };
  }
}

/**
 * Run simulation with a specific persona profile
 */
export async function simulateAction(
  state: BlueprintState,
  profile: SimulationProfile
): Promise<ActionResponse<SimulationResult>> {
  try {
    const authHeaders = await getAuthHeaders();

    const simulatePayload = {
      templateId: state.templateId,
      blueprint: {
        strategy: state.strategy,
        competencyIds: state.competencies.map(c => c.id),
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
      throw new Error(errorData.message || `Simulation failed: ${response.status}`);
    }

    const result: SimulationResult = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('simulateAction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Simulation failed' 
    };
  }
}

/**
 * Publish the template (locks the version)
 */
export async function publishAction(
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
    
    // Revalidate template caches (Next.js 16 requires cache profile as 2nd arg)
    revalidateTag(`test-template-${templateId}`, 'max');
    revalidatePath(`/test-templates/${templateId}`);

    return { success: true, data: { published: true, version: result.version ?? 1 } };
  } catch (error) {
    console.error('publishAction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Publish failed' 
    };
  }
}

/**
 * Fetch inventory heatmap for competencies
 */
export async function fetchInventoryHeatmapAction(): Promise<ActionResponse<InventoryHeatmap>> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${getApiBaseUrl()}/v1/tests/inventory/heatmap`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        next: {
          revalidate: 60, // Cache for 1 minute
          tags: ['inventory-heatmap'],
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Fetch heatmap failed: ${response.status}`);
    }

    const result: InventoryHeatmap = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('fetchInventoryHeatmapAction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch inventory heatmap' 
    };
  }
}

/**
 * Add a competency to the blueprint (used by drag-drop)
 */
export async function addCompetencyAction(
  templateId: string,
  competency: BlueprintCompetency
): Promise<ActionResponse<BlueprintCompetency>> {
  // This is a lightweight action that validates the competency can be added
  // The actual save happens via saveDraftAction
  try {
    // Validate competency has questions
    if (competency.questionCount === 0) {
      return {
        success: false,
        error: `${competency.name} has no questions available`,
      };
    }

    return { success: true, data: competency };
  } catch (error) {
    console.error('addCompetencyAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add competency',
    };
  }
}

/**
 * Remove a competency from the blueprint
 */
export async function removeCompetencyAction(
  templateId: string,
  competencyId: string
): Promise<ActionResponse<{ removed: boolean }>> {
  try {
    return { success: true, data: { removed: true } };
  } catch (error) {
    console.error('removeCompetencyAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove competency',
    };
  }
}
