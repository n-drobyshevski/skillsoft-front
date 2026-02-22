'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { testTemplatesApi } from '@/services/api';
import { AssessmentGoal } from '@/types/domain';

/**
 * Centralized cache revalidation for test templates
 * Invalidates both paths and cache tags for complete cache clearing
 */
async function revalidateTemplateCache(templateId?: string) {
  // Invalidate paths
  revalidatePath('/test-templates');
  revalidatePath('/dashboard');
  revalidatePath('/');
  if (templateId) {
    revalidatePath(`/test-templates/${templateId}`);
    revalidatePath(`/test-templates/${templateId}/settings`);
    revalidatePath(`/test-templates/${templateId}/builder`);
  }

  // Invalidate all cache tags (critical for fetch cache)
  revalidateTag('test-templates', 'max');
  revalidateTag('test-templates-active', 'max');
  revalidateTag('test-templates-search', 'max');
  revalidateTag('test-templates-stats', 'max');
  if (templateId) {
    revalidateTag(`test-template-${templateId}`, 'max');
  }
}

/**
 * Publish a draft template
 * Sets isActive to true (active = published/live)
 */
export async function publishTemplate(templateId: string) {
  try {
    // Update template to active (published)
    await testTemplatesApi.updateTemplate(templateId, {
      isActive: true,
    });

    // Revalidate all caches
    await revalidateTemplateCache(templateId);

    return { success: true };
  } catch (error) {
    console.error('Failed to publish template:', error);
    return { success: false, error: 'Failed to publish template' };
  }
}

/**
 * Create a new version of a published template using the backend versioning API.
 * Preserves version chain via parentId linkage.
 */
export async function createNewVersion(templateId: string, archiveOriginal: boolean) {
  try {
    const newTemplate = await testTemplatesApi.createNextVersion(templateId, archiveOriginal);

    // Revalidate all caches
    await revalidateTemplateCache(templateId);
    await revalidateTemplateCache(newTemplate.id);

    // Redirect to the new draft version
    redirect(`/test-templates/${newTemplate.id}/settings`);
  } catch (error) {
    // redirect throws an error, so we need to rethrow it
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Failed to create new version:', error);
    return { success: false, error: 'Failed to create new version' };
  }
}

/**
 * Archive a template
 * Sets isActive to false
 */
export async function archiveTemplate(templateId: string) {
  try {
    await testTemplatesApi.updateTemplate(templateId, {
      isActive: false,
    });

    // Revalidate all caches
    await revalidateTemplateCache(templateId);

    return { success: true };
  } catch (error) {
    console.error('Failed to archive template:', error);
    return { success: false, error: 'Failed to archive template' };
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string) {
  try {
    await testTemplatesApi.deleteTemplate(templateId);

    // Revalidate all caches
    await revalidateTemplateCache(templateId);

    // Redirect to templates list
    redirect('/test-templates');
  } catch (error) {
    // redirect throws an error, so we need to rethrow it
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Failed to delete template:', error);
    return { success: false, error: 'Failed to delete template' };
  }
}

/**
 * Update template metadata (name, description)
 * Can be done even on published templates
 */
export async function updateTemplateMetadata(
  templateId: string,
  data: { name?: string; description?: string }
) {
  try {
    await testTemplatesApi.updateTemplate(templateId, data);

    // Revalidate all caches
    await revalidateTemplateCache(templateId);

    return { success: true };
  } catch (error) {
    console.error('Failed to update template:', error);
    return { success: false, error: 'Failed to update template' };
  }
}

/**
 * Build blueprint object from form data based on goal
 */
function buildBlueprintFromFormData(
  goal: AssessmentGoal,
  data: {
    // OVERVIEW fields
    includeBigFive?: boolean;
    preferredDifficulty?: string;
    // JOB_FIT fields
    onetSocCode?: string;
    strictnessLevel?: number;
    enableDeltaTesting?: boolean;
    candidateClerkUserId?: string;
    // TEAM_FIT fields
    teamId?: string;
    saturationThreshold?: number;
  }
): Record<string, unknown> {
  switch (goal) {
    case AssessmentGoal.OVERVIEW:
      return {
        strategy: 'OVERVIEW',
        include_big_five: data.includeBigFive ?? true,
        preferred_difficulty: data.preferredDifficulty ?? 'INTERMEDIATE',
      };
    case AssessmentGoal.JOB_FIT:
      return {
        strategy: 'JOB_FIT',
        onet_soc_code: data.onetSocCode || '',
        strictness_level: data.strictnessLevel ?? 60,
        enable_delta_testing: data.enableDeltaTesting ?? false,
        candidate_clerk_user_id: data.candidateClerkUserId || '',
      };
    case AssessmentGoal.TEAM_FIT:
      return {
        strategy: 'TEAM_FIT',
        team_id: data.teamId || '',
        saturation_threshold: data.saturationThreshold ?? 0.7,
      };
    default:
      return {};
  }
}

/**
 * Update all template settings
 * Handles full configuration update including assessment options and blueprint
 */
export async function updateTemplateSettings(
  templateId: string,
  data: {
    name?: string;
    description?: string;
    goal?: AssessmentGoal;
    questionsPerIndicator?: number;
    timeLimitMinutes?: number;
    passingScore?: number;
    isActive?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    allowSkip?: boolean;
    allowBackNavigation?: boolean;
    showResultsImmediately?: boolean;
    // Blueprint fields for OVERVIEW goal
    includeBigFive?: boolean;
    preferredDifficulty?: string;
    // Blueprint fields for JOB_FIT goal
    onetSocCode?: string;
    strictnessLevel?: number;
    enableDeltaTesting?: boolean;
    candidateClerkUserId?: string;
    // Blueprint fields for TEAM_FIT goal
    teamId?: string;
    saturationThreshold?: number;
  }
) {
  try {
    // Build blueprint based on goal
    const blueprint = data.goal ? buildBlueprintFromFormData(data.goal, data) : undefined;

    // Extract only the core settings for the API call
    const updatePayload = {
      name: data.name,
      description: data.description,
      goal: data.goal,
      questionsPerIndicator: data.questionsPerIndicator,
      timeLimitMinutes: data.timeLimitMinutes,
      passingScore: data.passingScore,
      isActive: data.isActive,
      shuffleQuestions: data.shuffleQuestions,
      shuffleOptions: data.shuffleOptions,
      allowSkip: data.allowSkip,
      allowBackNavigation: data.allowBackNavigation,
      showResultsImmediately: data.showResultsImmediately,
      blueprint,
    };

    await testTemplatesApi.updateTemplate(templateId, updatePayload);

    // Revalidate all caches
    await revalidateTemplateCache(templateId);

    return { success: true };
  } catch (error) {
    console.error('Failed to update template settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update template settings'
    };
  }
}
