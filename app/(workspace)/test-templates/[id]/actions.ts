'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { testTemplatesApi } from '@/services/api';
import { AssessmentGoal } from '@/types/domain';

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

    // Revalidate the template pages
    revalidatePath(`/test-templates/${templateId}`);
    revalidatePath('/test-templates');

    return { success: true };
  } catch (error) {
    console.error('Failed to publish template:', error);
    return { success: false, error: 'Failed to publish template' };
  }
}

/**
 * Create a new version of a published template
 * Clones the template as a new draft (inactive)
 */
export async function createNewVersion(templateId: string) {
  try {
    // Fetch the current template
    const template = await testTemplatesApi.getTemplateById(templateId);
    
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Create a new template (will default to inactive on backend)
    const newTemplate = await testTemplatesApi.createTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      goal: template.goal,
      competencyIds: template.competencyIds,
      timeLimitMinutes: template.timeLimitMinutes,
      passingScore: template.passingScore,
      allowBackNavigation: template.allowBackNavigation,
      shuffleQuestions: template.shuffleQuestions,
      shuffleOptions: template.shuffleOptions,
      allowSkip: template.allowSkip,
      showResultsImmediately: template.showResultsImmediately,
      blueprint: template.blueprint,
    });

    // Ensure the new template is inactive (draft)
    await testTemplatesApi.updateTemplate(newTemplate.id, { isActive: false });

    // Revalidate paths
    revalidatePath('/test-templates');

    // Redirect to the new template
    redirect(`/test-templates/${newTemplate.id}`);
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

    revalidatePath(`/test-templates/${templateId}`);
    revalidatePath('/test-templates');

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

    revalidatePath('/test-templates');

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

    revalidatePath(`/test-templates/${templateId}`);
    revalidatePath('/test-templates');

    return { success: true };
  } catch (error) {
    console.error('Failed to update template:', error);
    return { success: false, error: 'Failed to update template' };
  }
}

/**
 * Update all template settings
 * Handles full configuration update including assessment options
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
  }
) {
  try {
    await testTemplatesApi.updateTemplate(templateId, data);

    // Revalidate all affected paths
    revalidatePath(`/test-templates/${templateId}`);
    revalidatePath(`/test-templates/${templateId}/settings`);
    revalidatePath(`/test-templates/${templateId}/builder`);
    revalidatePath('/test-templates');

    return { success: true };
  } catch (error) {
    console.error('Failed to update template settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update template settings'
    };
  }
}
