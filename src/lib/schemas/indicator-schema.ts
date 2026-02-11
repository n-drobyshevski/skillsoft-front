import { z } from 'zod';
import {
  ObservabilityLevel,
  ApprovalStatus,
  IndicatorMeasurementType,
  ContextScope
} from '@/types/domain';
import { TranslationFunction } from '@/lib/schema-factory';

/**
 * Creates an i18n-aware behavioral indicator schema.
 * Error messages are translated using the provided translation function.
 *
 * @param t - Translation function from useTranslations()
 * @returns Zod schema with translated error messages
 *
 * @example
 * ```tsx
 * const t = useTranslations();
 * const schema = useMemo(() => createIndicatorSchema(t), [t]);
 * const form = useForm({ resolver: zodResolver(schema) });
 * ```
 */
export function createIndicatorSchema(t: TranslationFunction) {
  return z.object({
    title: z.string()
      .min(5, t('validation.minLength', { min: '5' }))
      .max(200, t('validation.maxLength', { max: '200' })),

    description: z.string()
      .min(10, t('validation.minLength', { min: '10' }))
      .max(2000, t('validation.maxLength', { max: '2000' })),

    observabilityLevel: z.nativeEnum(ObservabilityLevel, {
      message: t('validation.selectOption')
    }),

    measurementType: z.nativeEnum(IndicatorMeasurementType, {
      message: t('validation.selectOption')
    }),

    weight: z.number()
      .min(0.01, t('validation.weightRange', { min: '0.01', max: '1' }))
      .max(1, t('validation.weightRange', { min: '0.01', max: '1' })),

    examples: z.string().optional(),
    counterExamples: z.string().optional(),
    isActive: z.boolean(),

    approvalStatus: z.nativeEnum(ApprovalStatus, {
      message: t('validation.selectOption')
    }),

    orderIndex: z.number()
      .int(t('validation.integerRequired'))
      .min(1, t('validation.minValue', { min: '1' }))
      .max(20, t('validation.maxValue', { max: '20' })),

    contextScope: z.nativeEnum(ContextScope, {
      message: t('validation.selectOption')
    }),
  }).strict();
}

// Export type for form values
export type IndicatorFormValues = z.infer<ReturnType<typeof createIndicatorSchema>>;
