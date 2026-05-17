import { z } from 'zod';
import {
  ObservabilityLevel,
  ApprovalStatus,
  IndicatorMeasurementType,
  ContextScope
} from '@/types/domain';
import { TranslationFunction } from '@/lib/schema-factory';

export function createIndicatorSchema(t: TranslationFunction) {
  // Constraints must match the backend exactly. Mismatches let invalid
  // input pass FE validation and surface as opaque 400s after submit.
  // BE source of truth: CreateIndicatorRequest.java / UpdateIndicatorRequest.java
  return z.object({
    title: z.string()
      .min(5, t('validation.minLength', { min: '5' }))
      .max(150, t('validation.maxLength', { max: '150' })),

    description: z.string()
      .min(20, t('validation.minLength', { min: '20' }))
      .max(500, t('validation.maxLength', { max: '500' })),

    observabilityLevel: z.nativeEnum(ObservabilityLevel, {
      message: t('validation.selectOption')
    }),

    measurementType: z.nativeEnum(IndicatorMeasurementType, {
      message: t('validation.selectOption')
    }),

    weight: z.number()
      .min(0.01, t('validation.weightRange', { min: '0.01', max: '1' }))
      .max(1, t('validation.weightRange', { min: '0.01', max: '1' })),

    examples: z.string().max(1000, t('validation.maxLength', { max: '1000' })).optional(),
    counterExamples: z.string().max(1000, t('validation.maxLength', { max: '1000' })).optional(),

    contextScope: z.nativeEnum(ContextScope, {
      message: t('validation.selectOption')
    }),

    isActive: z.boolean().optional(),
    approvalStatus: z.nativeEnum(ApprovalStatus, {
      message: t('validation.selectOption'),
    }).optional(),
    orderIndex: z.number()
      .int(t('validation.integerRequired'))
      .min(1, t('validation.minValue', { min: '1' }))
      .max(20, t('validation.maxValue', { max: '20' }))
      .optional(),
  }).strict();
}

// Export type for form values
export type IndicatorFormValues = z.infer<ReturnType<typeof createIndicatorSchema>>;
