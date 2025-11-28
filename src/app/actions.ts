'use server'

import { revalidatePath, revalidateTag } from 'next/cache';

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

export async function revalidateCompetencyTags(competencyId?: string) {
  try {
    // Invalidate paths
    revalidatePath(COMPETENCIES_PATH);
    revalidatePath(HOME_PATH);
    if (competencyId) {
      revalidatePath(`${COMPETENCIES_PATH}/${competencyId}`);
    }
    
    // Invalidate cache tags used by fetchApi
    revalidateTag('competencies', 'max');
    if (competencyId) {
      revalidateTag(`competency-${competencyId}`, 'max');
    }
  } catch {
    // Error revalidating competency paths - silently fail in production
  }
}


import { fetchApi } from '@/services/api';

// This is a simplified type for the form data.
// For a real app, this might be shared or generated from the Zod schema.
export type IndicatorFormData = {
  title: string;
  description?: string;
  observabilityLevel: string;
  measurementType: string;
  weight: number;
  examples?: string;
  counterExamples?: string;
  isActive: boolean;
  approvalStatus: string;
  orderIndex?: number;
};

export async function updateIndicatorAction(indicatorId: string, data: IndicatorFormData) {
  try {
    // The entire mutation logic is now in one atomic server operation
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    // Revalidation happens on the server, in the same step
    revalidatePath(BEHAVIORAL_INDICATORS_PATH);
    revalidatePath(`${BEHAVIORAL_INDICATORS_PATH}/${indicatorId}`);

    return { success: true, message: 'Indicator updated successfully.' };
  } catch (error) {
    // Return a serializable error object for the client to handle
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to update indicator: ${errorMessage}` };
  }
}

export async function createIndicatorAction(competencyId: string, data: IndicatorFormData) {
  try {
    // Create the indicator
    const newIndicator = await fetchApi<{ id: string }>(`/behavioral-indicators`, {
      method: 'POST', 
      body: JSON.stringify({ ...data, competencyId }),
      cache: 'no-store',
    });

    // Comprehensive cache revalidation for indicator creation
    revalidatePath(BEHAVIORAL_INDICATORS_PATH); // All indicators page
    revalidatePath(COMPETENCIES_PATH); // All competencies page  
    revalidatePath(`${COMPETENCIES_PATH}/${competencyId}`); // Specific competency page
    revalidatePath(`${COMPETENCIES_PATH}/${competencyId}/edit`); // Competency edit page
    revalidatePath(`${BEHAVIORAL_INDICATORS_PATH}/${newIndicator.id}`); // New indicator page

    return { 
      success: true, 
      message: 'Indicator created successfully.',
      data: newIndicator 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to create indicator: ${errorMessage}` };
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
    
    // Invalidate cache tags used by fetchApi
    revalidateTag('users', 'max');
    revalidateTag('users-stats', 'max');
    if (userId) {
      revalidateTag(`user-${userId}`, 'max');
    }
  } catch {
    // Error revalidating user paths - silently fail in production
  }
}

export async function updateIndicatorQuestionsAction(indicatorId: string, questionIds: string[]) {
  try {
    await fetchApi(`/behavioral-indicators/${indicatorId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
      cache: 'no-store',
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
    // First, perform the delete operation (returns null for successful DELETE)
    await fetchApi(`/competencies/${competencyId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    // Try to revalidate paths, but don't let revalidation errors fail the delete
    try {
      revalidatePath('/competencies');
      revalidatePath(`/competencies/${competencyId}`);
      revalidatePath('/'); // Dashboard page
    } catch {
      // Revalidation failed but the delete was successful - this is acceptable
      // We won't throw here since the main operation (deletion) succeeded
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete competency: ${errorMessage}`);
  }
}

export async function deleteIndicator(indicatorId: string, competencyId?: string) {
  try {
    // Perform the delete operation (returns null for successful DELETE)
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: 'DELETE',
      cache: 'no-store',
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
    // Perform the delete operation (returns null for successful DELETE)
    await fetchApi(`/questions/${questionId}`, {
      method: 'DELETE',
      cache: 'no-store',
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