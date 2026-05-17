import { z } from 'zod';
import { CompetencyCategory, ApprovalStatus } from '@/types/domain';
import { TranslationFunction } from '@/lib/schema-factory';

// Patterns mirror the backend Jakarta @Pattern regexes in StandardCodesDto.java
// so that invalid selector output is caught at the form level instead of
// surfacing as an opaque 400 from the server.
export const ONET_CODE_PATTERN = /^\d+(\.[A-Za-z0-9]+){1,4}$/;
export const ESCO_URI_PATTERN =
  /^https?:\/\/data\.europa\.eu\/esco\/(skill|occupation|isced-f|qualification)\/[a-fA-F0-9-]+$/;

/**
 * O*NET Reference validation schema factory.
 */
function createOnetRefSchema(t: TranslationFunction) {
  return z.object({
    code: z.string()
      .min(1, t('validation.onetCodeRequired'))
      .regex(ONET_CODE_PATTERN, t('validation.onetCodePattern')),
    title: z.string().optional(),
    elementType: z.enum([
      'ability', 'skill', 'knowledge', 'work_activity',
      'work_style', 'interest', 'work_value', 'work_context'
    ]).optional(),
  }).optional();
}

/**
 * ESCO Reference validation schema factory.
 */
function createEscoRefSchema(t: TranslationFunction) {
  return z.object({
    uri: z.string()
      .url(t('validation.escoUriInvalid'))
      .regex(ESCO_URI_PATTERN, t('validation.escoUriPattern')),
    title: z.string().optional(),
    skillType: z.enum([
      'skill', 'competence', 'knowledge', 'language', 'transversal'
    ]).optional(),
  }).optional();
}

/**
 * Big Five Reference validation schema factory.
 */
function createBigFiveRefSchema() {
  return z.object({
    trait: z.enum([
      'OPENNESS', 'CONSCIENTIOUSNESS', 'EXTRAVERSION',
      'AGREEABLENESS', 'EMOTIONAL_STABILITY'
    ]),
    title: z.string().optional(),
    facet: z.string().optional(),
  }).optional();
}

/**
 * Global Category validation schema (legacy format).
 */
function createGlobalCategorySchema() {
  return z.object({
    bigFive: z.enum([
      'OPENNESS', 'CONSCIENTIOUSNESS', 'EXTRAVERSION',
      'AGREEABLENESS', 'EMOTIONAL_STABILITY'
    ]).optional(),
    dimension: z.string().optional(),
    domain: z.enum([
      'big_five', 'cognitive', 'technical',
      'interpersonal', 'leadership', 'emotional_intelligence'
    ]).optional(),
    trait: z.string().optional(),
    facet: z.string().optional(),
  }).optional();
}

/**
 * StandardCodes DTO validation schema factory.
 */
function createStandardCodesSchema(t: TranslationFunction) {
  return z.object({
    onetRef: createOnetRefSchema(t),
    escoRef: createEscoRefSchema(t),
    bigFiveRef: createBigFiveRefSchema(),
    globalCategory: createGlobalCategorySchema(),
  }).optional();
}

/**
 * Creates an i18n-aware competency schema.
 * Error messages are translated using the provided translation function.
 *
 * @param t - Translation function from useTranslations()
 * @returns Zod schema with translated error messages
 *
 * @example
 * ```tsx
 * const t = useTranslations();
 * const schema = useMemo(() => createCompetencySchema(t), [t]);
 * const form = useForm({ resolver: zodResolver(schema) });
 * ```
 */
export function createCompetencySchema(t: TranslationFunction) {
  return z.object({
    // Backend: @Size(min = 2, max = 100)
    name: z.string()
      .min(2, t('validation.minLength', { min: '2' }))
      .max(100, t('validation.maxLength', { max: '100' })),

    // Backend: @Size(min = 50, max = 1000)
    description: z.string()
      .min(50, t('validation.minLength', { min: '50' }))
      .max(1000, t('validation.maxLength', { max: '1000' })),

    category: z.nativeEnum(CompetencyCategory, {
      message: t('validation.selectOption')
    }),

    isActive: z.boolean(),

    approvalStatus: z.nativeEnum(ApprovalStatus, {
      message: t('validation.selectOption')
    }),

    standardCodes: createStandardCodesSchema(t),
  });
}

// Export type for form values
export type CompetencyFormValues = z.infer<ReturnType<typeof createCompetencySchema>>;
