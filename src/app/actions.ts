'use server'

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateCompetencyTags(competencyId?: string) {
  try {
    // Invalidate paths
    revalidatePath('/competencies');
    revalidatePath('/');
    if (competencyId) {
      revalidatePath(`/competencies/${competencyId}`);
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

// Constants
const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred.';

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
    revalidatePath('/behavioral-indicators');
    revalidatePath(`/behavioral-indicators/${indicatorId}`);

    return { success: true, message: 'Indicator updated successfully.' };
  } catch (error) {
    // Return a serializable error object for the client to handle
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to update indicator: ${errorMessage}` };
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
    await fetchApi(`/competencies/${competencyId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    // Comprehensive cache invalidation
    revalidatePath('/competencies');
    revalidatePath(`/competencies/${competencyId}`);
    revalidatePath('/'); // Dashboard page
    
    // Invalidate fetchApi cache tags
    revalidateTag('competencies', 'max');
    revalidateTag(`competency-${competencyId}`, 'max');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete competency: ${errorMessage}`);
  }
}

export async function deleteIndicator(indicatorId: string, competencyId?: string) {
  try {
    await fetchApi(`/behavioral-indicators/${indicatorId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    revalidatePath('/behavioral-indicators');
    if (competencyId) {
      revalidatePath(`/competencies/${competencyId}`);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete indicator: ${errorMessage}`);
  }
}

export async function deleteAssessmentQuestion(questionId: string, competencyId?: string, indicatorId?: string) {
  try {
    await fetchApi(`/questions/${questionId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    revalidatePath('/assessment-questions');
    if (competencyId) {
      revalidatePath(`/competencies/${competencyId}`);
    }
    if (indicatorId) {
      revalidatePath(`/behavioral-indicators/${indicatorId}`);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    throw new Error(`Failed to delete question: ${errorMessage}`);
  }
}