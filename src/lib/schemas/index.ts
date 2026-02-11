/**
 * i18n-aware Zod schema factories for SkillSoft forms.
 *
 * These factories create Zod schemas with translated error messages.
 * Use them in form components with useMemo to create schemas dynamically.
 *
 * @example
 * ```tsx
 * import { createIndicatorSchema, IndicatorFormValues } from '@/lib/schemas';
 *
 * function MyForm() {
 *   const t = useTranslations();
 *   const schema = useMemo(() => createIndicatorSchema(t), [t]);
 *   const form = useForm<IndicatorFormValues>({
 *     resolver: zodResolver(schema),
 *   });
 * }
 * ```
 */

export {
  createIndicatorSchema,
  type IndicatorFormValues,
} from './indicator-schema';

export {
  createCompetencySchema,
  type CompetencyFormValues,
} from './competency-schema';

export {
  createQuestionSchema,
  answerOptionSchema,
  QUESTION_TAG_OPTIONS,
  type QuestionTag,
  type QuestionFormValues,
} from './question-schema';
