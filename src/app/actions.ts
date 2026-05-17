'use server'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

interface ApiError extends Error {
  status?: number;
}

// Constants
const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred.';

// Cache revalidation paths
const COMPETENCIES_PATH = '/competencies';
const BEHAVIORAL_INDICATORS_PATH = '/behavioral-indicators';
const USERS_PATH = '/users';
const HOME_PATH = '/';
const PSYCHOMETRICS_PATH = '/psychometrics';
const DOCS_PATH = '/docs';
const SITEMAP_PATH = '/api/sitemap';

export async function revalidateCompetencyTags(competencyId?: string) {
  try {
    // Invalidate paths (both legacy and workspace paths)
    revalidatePath(COMPETENCIES_PATH);
    revalidatePath('/hr/competencies');
    revalidatePath(HOME_PATH);
    revalidatePath('/dashboard');
    if (competencyId) {
      revalidatePath(`${COMPETENCIES_PATH}/${competencyId}`);
      revalidatePath(`/hr/competencies/${competencyId}`);
    }

    // Immediate invalidation for primary entity (read-your-own-writes)
    updateTag('competencies');
    if (competencyId) {
      updateTag(`competency-${competencyId}`);
    }
    // Dashboard uses eventual consistency (background revalidation)
    revalidateTag('dashboard', 'max');
  } catch {
    // Error revalidating competency paths - silently fail in production
  }
}

/**
 * Revalidate documentation pages cache
 * Инвалидирует кеш страниц документации
 *
 * @param slug - Optional documentation page slug to invalidate specific page
 *               Опциональный slug страницы для инвалидации конкретной страницы
 *
 * @example
 * // Invalidate all docs pages / Инвалидировать все страницы документации
 * await revalidateDocsTags();
 *
 * // Invalidate specific page / Инвалидировать конкретную страницу
 * await revalidateDocsTags('getting-started');
 */
export async function revalidateDocsTags(slug?: string): Promise<{ success: boolean; message: string }> {
  try {
    // Invalidate the entire docs section
    // Инвалидируем всю секцию документации
    revalidatePath(DOCS_PATH);

    // If slug provided, also invalidate the specific page
    // Если указан slug, также инвалидируем конкретную страницу
    if (slug) {
      revalidatePath(`${DOCS_PATH}/${slug}`);
    }

    // Invalidate sitemap as docs content affects it
    // Инвалидируем sitemap, так как контент документации влияет на него
    revalidatePath(SITEMAP_PATH);

    // Immediate invalidation for docs content (read-your-own-writes)
    // Немедленная инвалидация контента документации
    updateTag('docs');
    if (slug) {
      updateTag(`docs-${slug}`);
    }

    return {
      success: true,
      message: slug
        ? `Successfully revalidated docs page: ${slug}`
        : 'Successfully revalidated all docs pages'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Revalidation failed: ${errorMessage}` };
  }
}

/**
 * Revalidate psychometrics cache after item status updates
 */
export async function revalidatePsychometricsTags(questionId?: string) {
  try {
    // Invalidate paths
    revalidatePath(PSYCHOMETRICS_PATH);
    revalidatePath(`${PSYCHOMETRICS_PATH}/items`);
    revalidatePath(`${PSYCHOMETRICS_PATH}/flagged`);
    revalidatePath(`${PSYCHOMETRICS_PATH}/dashboard`);
    if (questionId) {
      revalidatePath(`${PSYCHOMETRICS_PATH}/items/${questionId}`);
      revalidatePath(`${PSYCHOMETRICS_PATH}/flagged/${questionId}`);
    }

    // Immediate invalidation for primary psychometrics data
    updateTag('psychometrics-items');
    updateTag('psychometrics-flagged');
    if (questionId) {
      updateTag(`psychometrics-item-${questionId}`);
    }
    // Dashboard stats use eventual consistency
    revalidateTag('psychometrics-dashboard', 'max');
  } catch {
    // Silently fail in production
  }
}

import { fetchApi } from '@/services/api';
import { getAuthHeaders } from '@/services/roleApi';
import type { Competency } from '@/types/domain';

// Competency form data type
export type CompetencyFormData = {
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  approvalStatus: string;
  standardCodes?: Record<string, unknown>;
};

// Action result types for type safety
export type ActionSuccessResult<T = undefined> = {
  success: true;
  message: string;
  data?: T;
};

export type ActionErrorResult = {
  success: false;
  message: string;
};

export type ActionResult<T = undefined> = ActionSuccessResult<T> | ActionErrorResult;

/**
 * Server Action: Create a new competency
 */
export async function createCompetencyAction(data: CompetencyFormData): Promise<ActionResult<Competency>> {
  try {
    const authHeaders = await getAuthHeaders();
    const newCompetency = await fetchApi<Competency>('/competencies', {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });

    await revalidateCompetencyTags();

    return { 
      success: true, 
      message: 'Competency created successfully.',
      data: newCompetency 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to create competency: ${errorMessage}` };
  }
}

/**
 * Server Action: Update an existing competency
 */
export async function updateCompetencyAction(competencyId: string, data: CompetencyFormData): Promise<ActionResult<Competency>> {
  try {
    const authHeaders = await getAuthHeaders();
    const updatedCompetency = await fetchApi<Competency>(`/competencies/${competencyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });

    await revalidateCompetencyTags(competencyId);

    return { 
      success: true, 
      message: 'Competency updated successfully.',
      data: updatedCompetency 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to update competency: ${errorMessage}` };
  }
}

/**
 * Server Action: Delete a competency
 */
export async function deleteCompetencyAction(competencyId: string): Promise<ActionResult> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`/competencies/${competencyId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });

    await revalidateCompetencyTags(competencyId);

    return { success: true, message: 'Competency deleted successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to delete competency: ${errorMessage}` };
  }
}

// Full form data shape (used by the edit form which surfaces all fields).
export type IndicatorFormData = {
  title: string;
  description?: string;
  observabilityLevel: string;
  measurementType: string;
  weight: number;
  examples?: string;
  counterExamples?: string;
  contextScope?: string;
  isActive?: boolean;
  approvalStatus?: string;
  orderIndex?: number;
};

// Create-time payload: a stricter shape that omits fields the user shouldn't
// pick at creation. orderIndex is computed server-side; isActive defaults to
// true; approvalStatus is not in CreateIndicatorRequest (backend ignores it).
export type CreateIndicatorFormData = Omit<
  IndicatorFormData,
  'isActive' | 'approvalStatus' | 'orderIndex'
>;

export async function updateIndicatorAction(indicatorId: string, data: IndicatorFormData) {
  const t = await getTranslations('indicator');
  try {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });

    revalidatePath(BEHAVIORAL_INDICATORS_PATH);
    revalidatePath(`${BEHAVIORAL_INDICATORS_PATH}/${indicatorId}`);

    return { success: true, message: t('updatedSuccess') };
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    const prefix = t('updateFailed');
    return { success: false, message: detail ? `${prefix}: ${detail}` : prefix };
  }
}

export async function createIndicatorAction(competencyId: string, data: CreateIndicatorFormData) {
  const t = await getTranslations('indicator');
  try {
    const authHeaders = await getAuthHeaders();

    // Compute next orderIndex from existing siblings so creation order is sane
    // (backend would otherwise default missing orderIndex to 0).
    let nextOrderIndex = 1;
    try {
      const existing = await fetchApi<Array<{ orderIndex?: number }>>(
        `/competencies/${competencyId}/behavioral-indicators`,
        { cache: 'no-store', silentStatusCodes: [404], authHeaders },
      );
      if (Array.isArray(existing) && existing.length > 0) {
        nextOrderIndex = existing.length + 1;
      }
    } catch {
      // Fall back to 1 if the count fetch fails — backend will accept it.
    }

    const newIndicator = await fetchApi<{ id: string }>(`/behavioral-indicators`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        competencyId,
        isActive: true,
        orderIndex: nextOrderIndex,
      }),
      cache: 'no-store',
      authHeaders,
    });

    revalidatePath(BEHAVIORAL_INDICATORS_PATH);
    revalidatePath(COMPETENCIES_PATH);
    revalidatePath(`${COMPETENCIES_PATH}/${competencyId}`);
    revalidatePath(`${COMPETENCIES_PATH}/${competencyId}/edit`);
    revalidatePath(`${BEHAVIORAL_INDICATORS_PATH}/${newIndicator.id}`);

    return {
      success: true,
      message: t('createdSuccess'),
      data: newIndicator,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    const prefix = t('createFailed');
    return { success: false, message: detail ? `${prefix}: ${detail}` : prefix };
  }
}

export async function revalidateQuestionTags(questionId: string, competencyId?: string, behavioralIndicatorId?: string ) {
  try {
    revalidatePath('/assessment-questions');
    if (questionId) {
      revalidatePath(`/assessment-questions/${questionId}`);
    }
    if (competencyId) {
      revalidatePath(`/competencies/${competencyId}`);
    }
    if (behavioralIndicatorId) {
      revalidatePath(`/behavioral-indicators/${behavioralIndicatorId}`);
    }
  } catch {
    // Error revalidating question paths - silently fail in production
  }
}

export async function revalidateUserTags(userId?: string) {
  try {
    // Invalidate paths
    revalidatePath(USERS_PATH);
    revalidatePath(HOME_PATH);
    if (userId) {
      revalidatePath(`${USERS_PATH}/${userId}`);
    }
    
    // Immediate invalidation for primary user data
    updateTag('users');
    if (userId) {
      updateTag(`user-${userId}`);
    }
    // User stats use eventual consistency
    revalidateTag('users-stats', 'max');
  } catch {
    // Error revalidating user paths - silently fail in production
  }
}

export async function updateIndicatorQuestionsAction(indicatorId: string, questionIds: string[]) {
  try {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`/behavioral-indicators/${indicatorId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
      cache: 'no-store',
      authHeaders,
    });

    revalidatePath(`/behavioral-indicators/${indicatorId}`);

    return { success: true, message: 'Indicator questions updated successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to update indicator questions: ${errorMessage}` };
  }
}

export async function deleteCompetency(competencyId: string) {
  try {
    const authHeaders = await getAuthHeaders();
    // First, perform the delete operation (returns null for successful DELETE)
    await fetchApi(`/competencies/${competencyId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });

    // Revalidate all competency-related paths and cache tags
    await revalidateCompetencyTags(competencyId);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete competency: ${errorMessage}`);
  }
}

export async function deleteIndicator(indicatorId: string, competencyId?: string) {
  try {
    const authHeaders = await getAuthHeaders();
    // Perform the delete operation (returns null for successful DELETE)
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });

    // Try to revalidate paths, but don't let revalidation errors fail the delete
    try {
      revalidatePath('/behavioral-indicators');
      if (competencyId) {
        revalidatePath(`/competencies/${competencyId}`);
      }
    } catch {
      // Revalidation failed but the delete was successful - this is acceptable
    }

    return { success: true };
  } catch (error: unknown) {
    // Preserve the original error with its status code for better error handling
    const apiError = error as { status?: number; message?: string };
    if (apiError.status === 404) {
      // Create a new error that preserves the 404 status for client handling
      const notFoundError: ApiError = Object.assign(
        new Error('Behavioral indicator not found'), 
        { status: 404 }
      );
      throw notFoundError;
    }
    
    const errorMessage = apiError.message || UNKNOWN_ERROR_MESSAGE;
    const deleteError: ApiError = Object.assign(
      new Error(`Failed to delete indicator: ${errorMessage}`), 
      { status: apiError.status }
    );
    throw deleteError;
  }
}

export async function deleteAssessmentQuestion(questionId: string, competencyId?: string, indicatorId?: string) {
  try {
    const authHeaders = await getAuthHeaders();
    // Perform the delete operation (returns null for successful DELETE)
    await fetchApi(`/questions/${questionId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });

    // Try to revalidate paths, but don't let revalidation errors fail the delete
    try {
      revalidatePath('/assessment-questions');
      if (competencyId) {
        revalidatePath(`/competencies/${competencyId}`);
      }
      if (indicatorId) {
        revalidatePath(`/behavioral-indicators/${indicatorId}`);
      }
    } catch {
      // Revalidation failed but the delete was successful - this is acceptable
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete question: ${errorMessage}`);
  }
}

// Cache revalidation for Test Templates
const TEST_TEMPLATES_PATH = '/test-templates';

export async function revalidateTestTemplateTags(templateId?: string) {
  try {
    // Invalidate paths - use correct route paths
    revalidatePath(TEST_TEMPLATES_PATH);
    revalidatePath(HOME_PATH);
    revalidatePath('/dashboard');
    if (templateId) {
      revalidatePath(`${TEST_TEMPLATES_PATH}/${templateId}`);
      revalidatePath(`${TEST_TEMPLATES_PATH}/${templateId}/settings`);
      revalidatePath(`${TEST_TEMPLATES_PATH}/${templateId}/builder`);
    }

    // Immediate invalidation for primary template data
    updateTag('test-templates');
    updateTag('test-templates-active');
    updateTag('test-templates-search');
    if (templateId) {
      updateTag(`test-template-${templateId}`);
    }
    // Template stats use eventual consistency
    revalidateTag('test-templates-stats', 'max');
  } catch {
    // Error revalidating test template paths - silently fail in production
  }
}

export async function deleteTestTemplate(templateId: string) {
  try {
    const authHeaders = await getAuthHeaders();
    // Perform the delete operation
    await fetchApi(`/tests/templates/${templateId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });

    // Revalidate test template paths
    await revalidateTestTemplateTags(templateId);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete test template: ${errorMessage}`);
  }
}