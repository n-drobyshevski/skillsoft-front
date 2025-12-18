import { z } from 'zod';
import { CompetencyCategory, ApprovalStatus } from '@/types/domain';

// O*NET Reference validation - uses camelCase for backend Java records
const onetRefSchema = z.object({
  code: z.string().min(1, 'O*NET code is required'),
  title: z.string().optional(),
  elementType: z.enum(['ability', 'skill', 'knowledge', 'work_activity', 'work_style', 'interest', 'work_value', 'work_context']).optional(),
}).optional();

// ESCO Reference validation - uses camelCase for backend Java records
const escoRefSchema = z.object({
  uri: z.string().url('Must be a valid ESCO URI'),
  title: z.string().optional(),
  skillType: z.enum(['skill', 'competence', 'knowledge', 'language', 'transversal']).optional(),
}).optional();

// Big Five Reference validation - matches backend BigFiveRefDto
const bigFiveRefSchema = z.object({
  trait: z.enum(['OPENNESS', 'CONSCIENTIOUSNESS', 'EXTRAVERSION', 'AGREEABLENESS', 'EMOTIONAL_STABILITY']),
  title: z.string().optional(),
  facet: z.string().optional(),
}).optional();

// Global Category validation - uses camelCase for backend Java records (legacy)
const globalCategorySchema = z.object({
  // New format: bigFive + dimension (camelCase for Java records)
  bigFive: z.enum(['OPENNESS', 'CONSCIENTIOUSNESS', 'EXTRAVERSION', 'AGREEABLENESS', 'EMOTIONAL_STABILITY']).optional(),
  dimension: z.string().optional(),
  // Legacy format: domain + trait + facet
  domain: z.enum(['big_five', 'cognitive', 'technical', 'interpersonal', 'leadership', 'emotional_intelligence']).optional(),
  trait: z.string().optional(),
  facet: z.string().optional(),
}).optional();

// StandardCodes DTO validation - uses camelCase for backend Java records
const standardCodesSchema = z.object({
  onetRef: onetRefSchema,
  escoRef: escoRefSchema,
  bigFiveRef: bigFiveRefSchema,
  globalCategory: globalCategorySchema, // Legacy, kept for backward compatibility
}).optional();

export const competencySchema = z.object({
  // Backend: @Size(min = 2, max = 100)
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  // Backend: @Size(min = 50, max = 1000)
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000, 'Description must be at most 1000 characters'),
  category: z.enum(Object.values(CompetencyCategory) as [string, ...string[]]),
  isActive: z.boolean(),
  approvalStatus: z.enum(Object.values(ApprovalStatus) as [string, ...string[]]),
  standardCodes: standardCodesSchema,
});
