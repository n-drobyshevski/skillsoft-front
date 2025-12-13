/**
 * Tests for Assessment Questions API Service
 * Phase 3: HR CRUD Tests - Assessment Questions
 *
 * Tests cover:
 * - READ operations (getAllQuestions, getQuestionById)
 * - CREATE operation (createQuestion)
 * - UPDATE operation (updateQuestion)
 * - DELETE operation (deleteQuestion)
 * - Error handling scenarios
 * - Question types (Likert, SJT, MCQ, Open Text)
 * - Answer options handling
 * - Metadata and tags
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  mockQuestions,
  resetMockStores,
} from '../mocks/handlers';
import type {
  AssessmentQuestion,
  QuestionType,
  DifficultyLevel,
  AnswerOption,
  QuestionMetadata,
} from '@/types/domain';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';

// Helper functions for API calls
async function fetchQuestions(): Promise<AssessmentQuestion[]> {
  const response = await fetch(`${API_BASE}/questions`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchQuestionById(id: string): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/questions/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function createQuestion(
  behavioralIndicatorId: string,
  data: Partial<AssessmentQuestion>
): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/questions?behavioralIndicatorId=${behavioralIndicatorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function updateQuestion(id: string, data: Partial<AssessmentQuestion>): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function deleteQuestion(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

describe('Assessment Questions API', () => {
  beforeEach(() => {
    resetMockStores();
  });

  // ==========================================
  // READ Operations
  // ==========================================
  describe('READ Operations', () => {
    describe('getAllQuestions', () => {
      it('should fetch all assessment questions', async () => {
        const questions = await fetchQuestions();

        expect(questions).toBeInstanceOf(Array);
        expect(questions.length).toBe(mockQuestions.length);
      });

      it('should return questions with correct structure', async () => {
        const questions = await fetchQuestions();
        const first = questions[0];

        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('behavioralIndicatorId');
        expect(first).toHaveProperty('questionText');
        expect(first).toHaveProperty('questionType');
        expect(first).toHaveProperty('answerOptions');
        expect(first).toHaveProperty('scoringRubric');
        expect(first).toHaveProperty('timeLimit');
        expect(first).toHaveProperty('difficultyLevel');
        expect(first).toHaveProperty('isActive');
        expect(first).toHaveProperty('orderIndex');
      });

      it('should return questions with various types', async () => {
        const questions = await fetchQuestions();
        const types = new Set(questions.map(q => q.questionType));

        expect(types.size).toBeGreaterThan(1);
      });

      it('should return questions with answer options', async () => {
        const questions = await fetchQuestions();
        const questionsWithOptions = questions.filter(
          q => q.answerOptions && q.answerOptions.length > 0
        );

        expect(questionsWithOptions.length).toBeGreaterThan(0);
      });

      it('should return questions with metadata tags', async () => {
        const questions = await fetchQuestions();
        const questionsWithTags = questions.filter(
          q => q.metadata?.tags && q.metadata.tags.length > 0
        );

        expect(questionsWithTags.length).toBeGreaterThan(0);
      });
    });

    describe('getQuestionById', () => {
      it('should fetch a single question by ID', async () => {
        const question = await fetchQuestionById('q-1');

        expect(question).toBeDefined();
        expect(question.id).toBe('q-1');
        expect(question.questionType).toBe('LIKERT_SCALE');
      });

      it('should return 404 for non-existent question', async () => {
        await expect(fetchQuestionById('non-existent-id')).rejects.toThrow();
      });

      it('should return question with scoring rubric', async () => {
        const question = await fetchQuestionById('q-1');

        expect(question.scoringRubric).toBeDefined();
        expect(question.scoringRubric.length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================
  // CREATE Operations
  // ==========================================
  describe('CREATE Operations', () => {
    it('should create a Likert scale question', async () => {
      const newQuestion = await createQuestion('bi-1', {
        questionText: 'How strongly do you agree with this statement?',
        questionType: 'LIKERT_SCALE' as QuestionType,
        answerOptions: [
          { id: 'opt-1', label: 'Strongly Disagree', value: 1 },
          { id: 'opt-2', label: 'Disagree', value: 2 },
          { id: 'opt-3', label: 'Neutral', value: 3 },
          { id: 'opt-4', label: 'Agree', value: 4 },
          { id: 'opt-5', label: 'Strongly Agree', value: 5 },
        ],
        scoringRubric: 'Higher scores indicate stronger agreement',
        timeLimit: 30,
        difficultyLevel: 'FOUNDATIONAL' as DifficultyLevel,
        isActive: true,
        orderIndex: 1,
      });

      expect(newQuestion).toBeDefined();
      expect(newQuestion.id).toMatch(/^q-\d+$/);
      expect(newQuestion.questionType).toBe('LIKERT_SCALE');
      expect(newQuestion.answerOptions).toHaveLength(5);
    });

    it('should create a Situational Judgment question', async () => {
      const newQuestion = await createQuestion('bi-2', {
        questionText: 'A colleague asks for help with a task when you are busy. What do you do?',
        questionType: 'SITUATIONAL_JUDGMENT' as QuestionType,
        answerOptions: [
          { id: 'opt-1', text: 'Ignore the request', value: 1, effectiveness: 1 },
          { id: 'opt-2', text: 'Explain you are busy and offer to help later', value: 2, effectiveness: 4 },
          { id: 'opt-3', text: 'Stop your work immediately to help', value: 3, effectiveness: 2 },
          { id: 'opt-4', text: 'Briefly assess their need and prioritize accordingly', value: 4, effectiveness: 5 },
        ],
        scoringRubric: 'Evaluates prioritization and teamwork skills',
        timeLimit: 180,
        difficultyLevel: 'INTERMEDIATE' as DifficultyLevel,
        isActive: true,
        orderIndex: 2,
        metadata: { tags: ['GENERAL', 'MID'] },
      });

      expect(newQuestion.questionType).toBe('SITUATIONAL_JUDGMENT');
      expect(newQuestion.answerOptions?.some(o => o.effectiveness !== undefined)).toBe(true);
    });

    it('should create a Multiple Choice question', async () => {
      const newQuestion = await createQuestion('bi-1', {
        questionText: 'Which of the following is NOT a characteristic of active listening?',
        questionType: 'MULTIPLE_CHOICE' as QuestionType,
        answerOptions: [
          { id: 'opt-1', text: 'Maintaining eye contact', value: 1, correct: false },
          { id: 'opt-2', text: 'Interrupting to share your thoughts', value: 2, correct: true },
          { id: 'opt-3', text: 'Asking clarifying questions', value: 3, correct: false },
          { id: 'opt-4', text: 'Paraphrasing what was said', value: 4, correct: false },
        ],
        scoringRubric: 'Correct answer: Option 2 - Interrupting is not active listening',
        timeLimit: 60,
        difficultyLevel: 'FOUNDATIONAL' as DifficultyLevel,
        isActive: true,
        orderIndex: 3,
      });

      expect(newQuestion.questionType).toBe('MULTIPLE_CHOICE');
      const correctOption = newQuestion.answerOptions?.find(o => o.correct === true);
      expect(correctOption).toBeDefined();
    });

    it('should create an Open Text question', async () => {
      const newQuestion = await createQuestion('bi-3', {
        questionText: 'Describe a situation where you demonstrated leadership skills.',
        questionType: 'OPEN_TEXT' as QuestionType,
        answerOptions: [],
        scoringRubric: 'Evaluate for: specific example, actions taken, outcome achieved',
        timeLimit: 300,
        difficultyLevel: 'ADVANCED' as DifficultyLevel,
        isActive: true,
        orderIndex: 1,
        metadata: { tags: ['GENERAL', 'SENIOR'] },
      });

      expect(newQuestion.questionType).toBe('OPEN_TEXT');
      expect(newQuestion.answerOptions).toEqual([]);
      expect(newQuestion.timeLimit).toBe(300);
    });

    it('should fail to create question with short text', async () => {
      await expect(
        createQuestion('bi-1', {
          questionText: 'Too short', // Less than 10 characters
          questionType: 'LIKERT_SCALE' as QuestionType,
          answerOptions: [],
          scoringRubric: 'Test rubric',
          difficultyLevel: 'FOUNDATIONAL' as DifficultyLevel,
          isActive: true,
          orderIndex: 1,
        })
      ).rejects.toThrow('Question text must be at least 10 characters');
    });

    it('should create question with metadata tags', async () => {
      const newQuestion = await createQuestion('bi-1', {
        questionText: 'How do you handle constructive criticism in the workplace?',
        questionType: 'LIKERT_SCALE' as QuestionType,
        answerOptions: [
          { label: 'Very poorly', value: 1 },
          { label: 'Poorly', value: 2 },
          { label: 'Neutrally', value: 3 },
          { label: 'Well', value: 4 },
          { label: 'Very well', value: 5 },
        ],
        scoringRubric: 'Higher scores indicate better handling of criticism',
        difficultyLevel: 'INTERMEDIATE' as DifficultyLevel,
        isActive: true,
        orderIndex: 1,
        metadata: {
          tags: ['GENERAL', 'JUNIOR'],
          difficulty: '0.4',
          time_limit_sec: 45,
        } as QuestionMetadata,
      });

      expect(newQuestion.metadata?.tags).toContain('GENERAL');
      expect(newQuestion.metadata?.tags).toContain('JUNIOR');
    });

    it('should persist created question to store', async () => {
      const initialCount = (await fetchQuestions()).length;

      await createQuestion('bi-1', {
        questionText: 'This is a persisted question for testing purposes',
        questionType: 'LIKERT_SCALE' as QuestionType,
        answerOptions: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
        ],
        scoringRubric: 'Standard Likert scoring',
        difficultyLevel: 'FOUNDATIONAL' as DifficultyLevel,
        isActive: true,
        orderIndex: 10,
      });

      const finalCount = (await fetchQuestions()).length;
      expect(finalCount).toBe(initialCount + 1);
    });

    it('should create question with SJT vector weights', async () => {
      const newQuestion = await createQuestion('bi-2', {
        questionText: 'Your team member consistently misses deadlines. How do you address this?',
        questionType: 'SJT' as QuestionType,
        answerOptions: [
          {
            id: 'opt-1',
            text: 'Report them to management immediately',
            value: 1,
            weights: { Leadership: -0.5, Empathy: -1.0, Assertiveness: 0.5 },
          },
          {
            id: 'opt-2',
            text: 'Have a private conversation to understand the underlying issues',
            value: 2,
            weights: { Leadership: 0.8, Empathy: 1.0, Assertiveness: 0.3 },
          },
          {
            id: 'opt-3',
            text: 'Ignore the issue and complete their work yourself',
            value: 3,
            weights: { Leadership: -1.0, Empathy: 0.2, Assertiveness: -1.0 },
          },
        ],
        scoringRubric: 'Uses ipsative scoring with vector weights',
        timeLimit: 180,
        difficultyLevel: 'ADVANCED' as DifficultyLevel,
        isActive: true,
        orderIndex: 1,
      });

      const optionWithWeights = newQuestion.answerOptions?.find(o => o.weights !== undefined);
      expect(optionWithWeights).toBeDefined();
      expect(optionWithWeights?.weights).toHaveProperty('Leadership');
    });
  });

  // ==========================================
  // UPDATE Operations
  // ==========================================
  describe('UPDATE Operations', () => {
    it('should update question text', async () => {
      const updated = await updateQuestion('q-1', {
        questionText: 'Updated question text that is long enough for validation',
      });

      expect(updated.id).toBe('q-1');
      expect(updated.questionText).toBe('Updated question text that is long enough for validation');
    });

    it('should update answer options', async () => {
      const newOptions: AnswerOption[] = [
        { id: 'new-1', label: 'Never', value: 1 },
        { id: 'new-2', label: 'Sometimes', value: 2 },
        { id: 'new-3', label: 'Always', value: 3 },
      ];

      const updated = await updateQuestion('q-1', {
        answerOptions: newOptions,
      });

      expect(updated.answerOptions).toHaveLength(3);
      expect(updated.answerOptions?.[0].label).toBe('Never');
    });

    it('should update difficulty level', async () => {
      const updated = await updateQuestion('q-1', {
        difficultyLevel: 'EXPERT' as DifficultyLevel,
      });

      expect(updated.difficultyLevel).toBe('EXPERT');
    });

    it('should update time limit', async () => {
      const updated = await updateQuestion('q-1', {
        timeLimit: 120,
      });

      expect(updated.timeLimit).toBe(120);
    });

    it('should update isActive status', async () => {
      const updated = await updateQuestion('q-1', {
        isActive: false,
      });

      expect(updated.isActive).toBe(false);
    });

    it('should update metadata tags', async () => {
      const updated = await updateQuestion('q-1', {
        metadata: {
          tags: ['IT', 'SENIOR'],
          difficulty: '0.8',
        },
      });

      expect(updated.metadata?.tags).toContain('IT');
      expect(updated.metadata?.tags).toContain('SENIOR');
    });

    it('should fail to update with invalid short text', async () => {
      await expect(
        updateQuestion('q-1', {
          questionText: 'Too short',
        })
      ).rejects.toThrow('Question text must be at least 10 characters');
    });

    it('should allow partial updates', async () => {
      const original = await fetchQuestionById('q-1');

      const updated = await updateQuestion('q-1', {
        timeLimit: 45,
      });

      expect(updated.questionText).toBe(original.questionText); // Unchanged
      expect(updated.questionType).toBe(original.questionType); // Unchanged
      expect(updated.timeLimit).toBe(45); // Changed
    });

    it('should return 404 when updating non-existent question', async () => {
      await expect(
        updateQuestion('non-existent-id', {
          questionText: 'This should fail because question does not exist',
        })
      ).rejects.toThrow();
    });

    it('should update scoring rubric', async () => {
      const updated = await updateQuestion('q-1', {
        scoringRubric: 'Updated scoring rubric with new evaluation criteria',
      });

      expect(updated.scoringRubric).toBe('Updated scoring rubric with new evaluation criteria');
    });
  });

  // ==========================================
  // DELETE Operations
  // ==========================================
  describe('DELETE Operations', () => {
    it('should delete an existing question', async () => {
      const initialCount = (await fetchQuestions()).length;

      await deleteQuestion('q-4');

      const finalCount = (await fetchQuestions()).length;
      expect(finalCount).toBe(initialCount - 1);
    });

    it('should return 404 when deleting non-existent question', async () => {
      await expect(deleteQuestion('non-existent-id')).rejects.toThrow();
    });

    it('should make deleted question unfetchable', async () => {
      await deleteQuestion('q-2');

      await expect(fetchQuestionById('q-2')).rejects.toThrow();
    });
  });

  // ==========================================
  // Question Types
  // ==========================================
  describe('Question Types', () => {
    it('should support all primary question types', async () => {
      const types: QuestionType[] = ['LIKERT', 'SJT', 'MCQ'];

      for (const type of types) {
        const question = await createQuestion('bi-1', {
          questionText: `Test question for type ${type} with enough characters`,
          questionType: type,
          answerOptions: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
          scoringRubric: `Scoring for ${type}`,
          difficultyLevel: 'INTERMEDIATE' as DifficultyLevel,
          isActive: true,
          orderIndex: 1,
        });

        expect(question.questionType).toBe(type);
      }
    });

    it('should support extended question types', async () => {
      const extendedTypes: QuestionType[] = [
        'LIKERT_SCALE',
        'SITUATIONAL_JUDGMENT',
        'MULTIPLE_CHOICE',
        'OPEN_TEXT',
        'BEHAVIORAL_EXAMPLE',
      ];

      for (const type of extendedTypes) {
        const question = await createQuestion('bi-1', {
          questionText: `Test question for type ${type} with enough characters`,
          questionType: type,
          answerOptions: type === 'OPEN_TEXT' || type === 'BEHAVIORAL_EXAMPLE' ? [] : [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
          scoringRubric: `Scoring for ${type}`,
          difficultyLevel: 'INTERMEDIATE' as DifficultyLevel,
          isActive: true,
          orderIndex: 1,
        });

        expect(question.questionType).toBe(type);
      }
    });
  });

  // ==========================================
  // Difficulty Levels
  // ==========================================
  describe('Difficulty Levels', () => {
    it('should support all difficulty levels', async () => {
      const levels: DifficultyLevel[] = [
        'FOUNDATIONAL',
        'INTERMEDIATE',
        'ADVANCED',
        'EXPERT',
        'SPECIALIZED',
      ];

      for (const level of levels) {
        const question = await createQuestion('bi-1', {
          questionText: `Test question for difficulty level ${level}`,
          questionType: 'LIKERT_SCALE' as QuestionType,
          answerOptions: [
            { label: '1', value: 1 },
            { label: '5', value: 5 },
          ],
          scoringRubric: 'Standard rubric',
          difficultyLevel: level,
          isActive: true,
          orderIndex: 1,
        });

        expect(question.difficultyLevel).toBe(level);
      }
    });

    it('should return questions with various difficulty levels', async () => {
      const questions = await fetchQuestions();
      const levels = new Set(questions.map(q => q.difficultyLevel));

      expect(levels.size).toBeGreaterThan(1);
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/questions`, () => {
          return HttpResponse.json(
            { message: 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
          );
        })
      );

      await expect(fetchQuestions()).rejects.toThrow();
    });

    it('should handle not found errors', async () => {
      await expect(fetchQuestionById('definitely-not-found')).rejects.toThrow();
    });

    it('should handle missing behavioral indicator ID on create', async () => {
      // Create without the query parameter
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: 'Question without indicator ID',
          questionType: 'LIKERT_SCALE',
          answerOptions: [],
          scoringRubric: 'Test',
          difficultyLevel: 'FOUNDATIONAL',
          isActive: true,
          orderIndex: 1,
        }),
      });

      expect(response.ok).toBe(false);
      const error = await response.json();
      expect(error.message).toContain('Behavioral indicator ID is required');
    });
  });

  // ==========================================
  // Data Characteristics
  // ==========================================
  describe('Data Characteristics', () => {
    it('should support Russian content in questions', async () => {
      const russianQuestion = await createQuestion('bi-1', {
        questionText: 'Как часто вы запрашиваете обратную связь от коллег?', // Russian question
        questionType: 'LIKERT_SCALE' as QuestionType,
        answerOptions: [
          { label: 'Никогда', value: 1 }, // "Never" in Russian
          { label: 'Редко', value: 2 }, // "Rarely"
          { label: 'Иногда', value: 3 }, // "Sometimes"
          { label: 'Часто', value: 4 }, // "Often"
          { label: 'Всегда', value: 5 }, // "Always"
        ],
        scoringRubric: 'Высокие баллы указывают на проактивность', // Russian rubric
        difficultyLevel: 'INTERMEDIATE' as DifficultyLevel,
        isActive: true,
        orderIndex: 1,
      });

      expect(russianQuestion.questionText).toContain('обратную связь');
      expect(russianQuestion.answerOptions?.[0].label).toBe('Никогда');
    });

    it('should have questions with appropriate time limits by type', async () => {
      const questions = await fetchQuestions();

      // Likert questions should have shorter time limits
      const likertQuestion = questions.find(q => q.questionType === 'LIKERT_SCALE');
      if (likertQuestion) {
        expect(likertQuestion.timeLimit).toBeLessThanOrEqual(60);
      }

      // SJT questions should have longer time limits
      const sjtQuestion = questions.find(q => q.questionType === 'SITUATIONAL_JUDGMENT');
      if (sjtQuestion) {
        expect(sjtQuestion.timeLimit).toBeGreaterThanOrEqual(120);
      }

      // Open text questions should have the longest time limits
      const openTextQuestion = questions.find(q => q.questionType === 'OPEN_TEXT');
      if (openTextQuestion) {
        expect(openTextQuestion.timeLimit).toBeGreaterThanOrEqual(180);
      }
    });

    it('should have questions with context-neutral tags for Scenario A', async () => {
      const questions = await fetchQuestions();
      const generalQuestions = questions.filter(
        q => q.metadata?.tags?.includes('GENERAL')
      );

      expect(generalQuestions.length).toBeGreaterThan(0);
    });
  });
});
