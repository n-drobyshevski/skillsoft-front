import { z } from 'zod';
import { ProficiencyLevel, ApprovalStatus, IndicatorMeasurementType } from '@/types/domain';

const measurementTypes = Object.values(IndicatorMeasurementType);

export const indicatorSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'), // Matches DB constraint
  description: z.string().min(10, 'Description must be at least 10 characters'), // Required, matches DB constraint
  observabilityLevel: z.nativeEnum(ProficiencyLevel),
  measurementType: z.nativeEnum(IndicatorMeasurementType),
  weight: z.number().min(0.01, 'Weight must be at least 0.01').max(1, 'Weight cannot exceed 1'), // Matches DB constraint
  examples: z.string().optional(),
  counterExamples: z.string().optional(),
  isActive: z.boolean(),
  approvalStatus: z.nativeEnum(ApprovalStatus),
  orderIndex: z.number().min(1, 'Order index must be positive').max(20, 'Order index must be 20 or less'),
}).strict(); // Prevent extra fields from being included
