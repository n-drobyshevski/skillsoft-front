import { z } from 'zod';
import { DifficultyLevel, QuestionType } from '@/enums/domain_enums';

export const questionSchema = z.object({
  questionText: z.string().min(10, 'Question text must be at least 10 characters'),
  questionType: z.nativeEnum(QuestionType),
  answerOptions: z.array(z.object({
    text: z.string().optional(),
    label: z.string().optional(),
    value: z.number().optional(),
    score: z.number().optional(),
    correct: z.boolean().optional(),
    explanation: z.string().optional(),
  })).optional(),
  scoringRubric: z.string(),
  timeLimit: z.number().optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  isActive: z.boolean(),
  orderIndex: z.number().min(1, "Order index must be positive").max(50, "Maximum 50 questions per indicator"),
}).strict(); // Prevent extra fields from being included
