import { z } from 'zod';
import { DifficultyLevel, QuestionType } from '@/types/domain';
import { TranslationFunction } from '@/lib/schema-factory';

/**
 * Controlled vocabulary for question tags.
 * Per Smart Assessment Strategy: Two-Tier Scoping System
 * - GENERAL: Context-neutral (Scenario A - Universal Baseline)
 * - IT, SALES, FINANCE, MEDICAL, ENGINEERING: Domain-specific (Scenario B)
 * - JUNIOR, MID, SENIOR: Complexity/seniority markers (Scenario C - Adaptive)
 */
export const QUESTION_TAG_OPTIONS = [
  'GENERAL',
  'IT',
  'SALES',
  'FINANCE',
  'MEDICAL',
  'ENGINEERING',
  'JUNIOR',
  'MID',
  'SENIOR',
] as const;

export type QuestionTag = typeof QUESTION_TAG_OPTIONS[number];

/**
 * Answer option schema for question responses.
 * Supports vector weights for SJT (Situational Judgment) questions.
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
 * Creates question metadata schema.
 * Per ROADMAP.md Section 1.B: Allows filtering questions by context and difficulty.
 */
function createQuestionMetadataSchema() {
  return z.object({
    tags: z.array(z.enum(QUESTION_TAG_OPTIONS)).optional(),
    difficulty: z.string().optional(),
    time_limit_sec: z.number().optional(),
    context: z.string().optional(),
    scenario_type: z.string().optional(),
    measurement_target: z.string().optional(),
  }).catchall(z.unknown());
}

/**
 * Creates an i18n-aware assessment question schema.
 * Error messages are translated using the provided translation function.
 *
 * @param t - Translation function from useTranslations()
 * @returns Zod schema with translated error messages
 *
 * @example
 * ```tsx
 * const t = useTranslations();
 * const schema = useMemo(() => createQuestionSchema(t), [t]);
 * const form = useForm({ resolver: zodResolver(schema) });
 * ```
 */
export function createQuestionSchema(t: TranslationFunction) {
  return z.object({
    questionText: z.string()
      .min(10, t('validation.minLength', { min: '10' })),

    questionType: z.nativeEnum(QuestionType, {
      message: t('validation.selectOption')
    }),

    answerOptions: z.array(answerOptionSchema).min(1, t('validation.minItems', { min: '1' })),

    scoringRubric: z.string(),

    timeLimit: z.number().optional(),

    difficultyLevel: z.nativeEnum(DifficultyLevel, {
      message: t('validation.selectOption')
    }),

    metadata: createQuestionMetadataSchema().optional(),

    isActive: z.boolean(),

    orderIndex: z.number(),
  }).strict();
}

// Export type for form values
export type QuestionFormValues = z.infer<ReturnType<typeof createQuestionSchema>>;
