'use server'

import { revalidatePath } from 'next/cache';

export async function revalidateCompetencyTags(competencyId?: string) {
  try {
    revalidatePath('/competencies');
    revalidatePath('/');
    if (competencyId) {
      revalidatePath(`/competencies/${competencyId}`);
    }
  } catch (error) {
    console.error('Error revalidating competency paths:', error);
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
    revalidatePath('/behavioral-indicators');
    revalidatePath(`/behavioral-indicators/${indicatorId}`);

    return { success: true, message: 'Indicator updated successfully.' };
  } catch (error) {
    // Return a serializable error object for the client to handle
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
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
  } catch (error) {
    console.error('Error revalidating question paths:', error);
  }
}