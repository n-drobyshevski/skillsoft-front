import { cache } from 'react';
import { revalidateQuestionTags } from '@/app/actions';
import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { AssessmentQuestion } from '@/types/domain';

// Input types for API operations
interface QuestionInput {
    questionText: string;
    questionType: string;
    answerOptions?: Array<{
        text?: string;
        label?: string;
        value?: number;
        score?: number;
        correct?: boolean;
        explanation?: string;
    }>;
    scoringRubric: string;
    timeLimit?: number;
    difficultyLevel: string;
    isActive: boolean;
    orderIndex: number;
}

// Cached assessment questions fetcher
const getIndicatorQuestionsCached = cache(async (competencyId: string, behavioralIndicatorId: string) : Promise<AssessmentQuestion[] | null> => {
    return fetchApi(
      `/behavioral-indicators/${behavioralIndicatorId}/questions`,
      {
        tags: [`questions-${competencyId}-${behavioralIndicatorId}`],
        revalidate: 60,
        silentStatusCodes: [404], // 404 is expected when indicator doesn't exist or has no questions
      }
    );
});
// Cached ALL assessment questions fetcher
const getAllQuestionsCached = cache(async () : Promise<AssessmentQuestion[] | null> => {
    return fetchApi(
        `/questions`,
        {
            tags: [`questions-all`],
            revalidate: 60,
        }
    );
});
export const assessmentQuestionsApi = {
  getIndicatorQuestions: getIndicatorQuestionsCached,
  getAllQuestions: getAllQuestionsCached,

  getQuestionById: async (
    questionId: string
  ) : Promise<AssessmentQuestion | null> => {
    return fetchApi(
      `/questions/${questionId}`,
      {
        tags: [`question-${questionId}`],
        revalidate: 60,
        silentStatusCodes: [404], // 404 is expected for non-existent/deleted questions
      }
    );
  },

  createQuestion: async (
    competencyId: string,
    behavioralIndicatorId: string,
    data: QuestionInput
  ): Promise<AssessmentQuestion> => {
    const payload = {
      behavioralIndicatorId,
      questionText: String(data.questionText || ''),
      questionType: String(data.questionType || 'MULTIPLE_CHOICE'),
      answerOptions: Array.isArray(data.answerOptions) ? data.answerOptions.map(option => {
        const cleanOption: Record<string, unknown> = {};
        if (option.text !== undefined) cleanOption.text = String(option.text);
        if (option.label !== undefined) cleanOption.label = String(option.label);
        if (option.value !== undefined) cleanOption.value = Number(option.value);
        if (option.score !== undefined) cleanOption.score = Number(option.score);
        if (option.correct !== undefined) cleanOption.correct = Boolean(option.correct);
        if (option.explanation !== undefined) cleanOption.explanation = String(option.explanation);
        return cleanOption;
      }) : [],
      scoringRubric: String(data.scoringRubric || ''),
      timeLimit: data.timeLimit ? Number(data.timeLimit) : null,
      difficultyLevel: String(data.difficultyLevel || 'FOUNDATIONAL'),
      isActive: Boolean(data.isActive ?? true),
      orderIndex: Number(data.orderIndex || 0)
    };

    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<AssessmentQuestion>(
      `/questions`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
        authHeaders,
      }
    );
    await revalidateQuestionTags(competencyId, behavioralIndicatorId);
    return result;
  },

  updateQuestion: async (
    questionId: string,
    data: QuestionInput,
    competencyId: string,
    behavioralIndicatorId: string,
  ): Promise<AssessmentQuestion> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<AssessmentQuestion>(
      `/questions/${questionId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        cache: "no-store",
        authHeaders,
      }
    );
    await revalidateQuestionTags(
      questionId,
      competencyId,
      behavioralIndicatorId
    );
    return result;
  },

  deleteQuestion: async (
    competencyId: string,
    behavioralIndicatorId: string,
    questionId: string
  ) => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(
      `/questions/${questionId}`,
      {
        method: "DELETE",
        cache: "no-store",
        authHeaders,
      }
    );
    await revalidateQuestionTags(
      questionId,
      competencyId,
      behavioralIndicatorId,
    );
  },
};
