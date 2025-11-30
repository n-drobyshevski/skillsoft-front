import { z } from 'zod';
import { DifficultyLevel, QuestionType } from '@/types/domain';

/**
 * Schema for answer options with optional vector weights for SJT questions.
 * Per ROADMAP.md Section 1.B: SJT questions support ipsative scoring with weights.
 */
export const answerOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().optional(),
  label: z.string().optional(),
  value: z.number().optional(),
  score: z.number().optional(),
  correct: z.boolean().optional(),
  explanation: z.string().optional(),
  effectiveness: z.number().optional(),
  // Vector weights for SJT (Situational Judgment) questions
  // e.g., { "Leadership": 0.8, "Empathy": -1.0 }
  weights: z.record(z.string(), z.number()).optional(),
});

/**
 * Schema for question metadata JSONB field.
 * Per ROADMAP.md Section 1.B: Allows filtering questions by context and difficulty.
 * Used by Context Neutrality Filter in Scenario A (Universal Baseline)
 */
export const questionMetadataSchema = z.object({
  tags: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  time_limit_sec: z.number().optional(),
  context: z.string().optional(),
  scenario_type: z.string().optional(),
  measurement_target: z.string().optional(),
}).catchall(z.unknown());

export const questionSchema = z.object({
  questionText: z.string().min(10, 'Question text must be at least 10 characters'),
  questionType: z.nativeEnum(QuestionType),
  answerOptions: z.array(answerOptionSchema).optional(),
  scoringRubric: z.string(),
  timeLimit: z.number().optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  /**
   * Metadata JSONB field for flexible tagging and context filtering.
   * Per ROADMAP.md Section 1.B
   */
  metadata: questionMetadataSchema.optional(),
  isActive: z.boolean(),
  orderIndex: z.number().min(1, "Order index must be positive").max(50, "Maximum 50 questions per indicator"),
}).strict(); // Prevent extra fields from being included

export type QuestionFormData = z.infer<typeof questionSchema>;
