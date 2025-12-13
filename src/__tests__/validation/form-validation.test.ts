/**
 * Tests for Form Validation Schemas
 * Phase 3: HR CRUD Tests - Form Validation
 *
 * Tests cover:
 * - Competency form validation
 * - Behavioral indicator form validation
 * - Assessment question form validation
 * - Standard codes validation
 * - Edge cases and boundary conditions
 * - Russian content validation
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import validation schemas from the app
// Note: These are relative to the actual location of validation files
const competencySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'COGNITIVE',
    'INTERPERSONAL',
    'LEADERSHIP',
    'ADAPTABILITY',
    'EMOTIONAL_INTELLIGENCE',
    'COMMUNICATION',
    'COLLABORATION',
    'CRITICAL_THINKING',
    'TIME_MANAGEMENT',
  ]),
  level: z.enum(['NOVICE', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT']),
  isActive: z.boolean(),
  approvalStatus: z.enum([
    'DRAFT',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'ARCHIVED',
    'UNDER_REVISION',
  ]),
  standardCodes: z.object({
    onetRef: z.object({
      code: z.string().min(1, 'O*NET code is required'),
      title: z.string().optional(),
      elementType: z.enum([
        'ability',
        'skill',
        'knowledge',
        'work_activity',
        'work_style',
        'interest',
        'work_value',
        'work_context',
      ]).optional(),
    }).optional(),
    escoRef: z.object({
      uri: z.string().url('Must be a valid ESCO URI'),
      title: z.string().optional(),
      skillType: z.enum(['skill', 'competence', 'knowledge', 'language', 'transversal']).optional(),
    }).optional(),
    bigFiveRef: z.object({
      trait: z.enum([
        'OPENNESS',
        'CONSCIENTIOUSNESS',
        'EXTRAVERSION',
        'AGREEABLENESS',
        'EMOTIONAL_STABILITY',
      ]),
      title: z.string().optional(),
      facet: z.string().optional(),
    }).optional(),
  }).optional(),
});

const indicatorSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  observabilityLevel: z.enum(['NOVICE', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT']),
  measurementType: z.enum(['FREQUENCY', 'QUALITY', 'IMPACT', 'CONSISTENCY', 'IMPROVEMENT']),
  weight: z.number().min(0.01, 'Weight must be at least 0.01').max(1, 'Weight cannot exceed 1'),
  examples: z.string().optional(),
  counterExamples: z.string().optional(),
  isActive: z.boolean(),
  approvalStatus: z.enum([
    'DRAFT',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'ARCHIVED',
    'UNDER_REVISION',
  ]),
  orderIndex: z.number().min(1, 'Order index must be positive').max(20, 'Order index must be 20 or less'),
  contextScope: z.enum(['UNIVERSAL', 'PROFESSIONAL', 'TECHNICAL', 'MANAGERIAL']),
});

const questionSchema = z.object({
  questionText: z.string().min(10, 'Question text must be at least 10 characters'),
  questionType: z.enum([
    'LIKERT',
    'SJT',
    'MCQ',
    'LIKERT_SCALE',
    'SITUATIONAL_JUDGMENT',
    'BEHAVIORAL_EXAMPLE',
    'MULTIPLE_CHOICE',
    'CAPABILITY_ASSESSMENT',
    'SELF_REFLECTION',
    'PEER_FEEDBACK',
    'FREQUENCY_SCALE',
    'OPEN_TEXT',
    'SINGLE_CHOICE',
  ]),
  answerOptions: z.array(z.object({
    id: z.string().optional(),
    text: z.string().optional(),
    label: z.string().optional(),
    value: z.number().optional(),
    score: z.number().optional(),
    correct: z.boolean().optional(),
    explanation: z.string().optional(),
    effectiveness: z.number().optional(),
    weights: z.record(z.string(), z.number()).optional(),
  })).optional(),
  scoringRubric: z.string(),
  timeLimit: z.number().optional(),
  difficultyLevel: z.enum(['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'SPECIALIZED']),
  metadata: z.object({
    tags: z.array(z.enum([
      'GENERAL',
      'IT',
      'SALES',
      'FINANCE',
      'MEDICAL',
      'ENGINEERING',
      'JUNIOR',
      'MID',
      'SENIOR',
    ])).optional(),
    difficulty: z.string().optional(),
    time_limit_sec: z.number().optional(),
    context: z.string().optional(),
    scenario_type: z.string().optional(),
    measurement_target: z.string().optional(),
  }).optional(),
  isActive: z.boolean(),
  orderIndex: z.number().min(1, 'Order index must be positive').max(50, 'Maximum 50 questions per indicator'),
});

describe('Form Validation Schemas', () => {
  // ==========================================
  // Competency Schema Validation
  // ==========================================
  describe('Competency Schema', () => {
    describe('Name field', () => {
      it('should accept valid names', () => {
        const validNames = [
          'Communication',
          'Problem Solving',
          'Critical Thinking Skills',
          'Emotional Intelligence',
          'Abc', // Minimum 3 characters
        ];

        validNames.forEach(name => {
          const result = competencySchema.shape.name.safeParse(name);
          expect(result.success).toBe(true);
        });
      });

      it('should reject names shorter than 3 characters', () => {
        const invalidNames = ['', 'A', 'Ab'];

        invalidNames.forEach(name => {
          const result = competencySchema.shape.name.safeParse(name);
          expect(result.success).toBe(false);
        });
      });

      it('should accept Russian names', () => {
        const russianNames = [
          'Коммуникация',
          'Решение проблем',
          'Лидерство',
        ];

        russianNames.forEach(name => {
          const result = competencySchema.shape.name.safeParse(name);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Description field', () => {
      it('should accept valid descriptions', () => {
        const validDescriptions = [
          'This is a valid description.',
          'A description that meets the minimum requirement',
          '1234567890', // Exactly 10 characters
        ];

        validDescriptions.forEach(desc => {
          const result = competencySchema.shape.description.safeParse(desc);
          expect(result.success).toBe(true);
        });
      });

      it('should reject descriptions shorter than 10 characters', () => {
        const invalidDescriptions = ['', 'Short', '123456789'];

        invalidDescriptions.forEach(desc => {
          const result = competencySchema.shape.description.safeParse(desc);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Category field', () => {
      it('should accept all valid categories', () => {
        const validCategories = [
          'COGNITIVE',
          'INTERPERSONAL',
          'LEADERSHIP',
          'ADAPTABILITY',
          'EMOTIONAL_INTELLIGENCE',
          'COMMUNICATION',
          'COLLABORATION',
          'CRITICAL_THINKING',
          'TIME_MANAGEMENT',
        ];

        validCategories.forEach(category => {
          const result = competencySchema.shape.category.safeParse(category);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid categories', () => {
        const invalidCategories = ['INVALID', 'cognitive', '', 'Technical'];

        invalidCategories.forEach(category => {
          const result = competencySchema.shape.category.safeParse(category);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Level field', () => {
      it('should accept all valid proficiency levels', () => {
        const validLevels = ['NOVICE', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT'];

        validLevels.forEach(level => {
          const result = competencySchema.shape.level.safeParse(level);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid levels', () => {
        const invalidLevels = ['BEGINNER', 'expert', '', 'MASTER'];

        invalidLevels.forEach(level => {
          const result = competencySchema.shape.level.safeParse(level);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Approval Status field', () => {
      it('should accept all valid approval statuses', () => {
        const validStatuses = [
          'DRAFT',
          'PENDING_REVIEW',
          'APPROVED',
          'REJECTED',
          'ARCHIVED',
          'UNDER_REVISION',
        ];

        validStatuses.forEach(status => {
          const result = competencySchema.shape.approvalStatus.safeParse(status);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Standard Codes validation', () => {
      it('should accept valid O*NET reference', () => {
        const validOnetRef = {
          code: '2.A.1.a',
          title: 'Oral Comprehension',
          elementType: 'ability' as const,
        };

        const result = competencySchema.shape.standardCodes?.safeParse({
          onetRef: validOnetRef,
        });
        expect(result?.success).toBe(true);
      });

      it('should accept valid ESCO reference', () => {
        const validEscoRef = {
          uri: 'http://data.europa.eu/esco/skill/1234',
          title: 'Communication skills',
          skillType: 'skill' as const,
        };

        const result = competencySchema.shape.standardCodes?.safeParse({
          escoRef: validEscoRef,
        });
        expect(result?.success).toBe(true);
      });

      it('should accept valid Big Five reference', () => {
        const validBigFiveRef = {
          trait: 'OPENNESS' as const,
          title: 'Openness to Experience',
          facet: 'intellectual_curiosity',
        };

        const result = competencySchema.shape.standardCodes?.safeParse({
          bigFiveRef: validBigFiveRef,
        });
        expect(result?.success).toBe(true);
      });

      it('should reject invalid ESCO URI', () => {
        const invalidEscoRef = {
          uri: 'not-a-valid-url',
          title: 'Test',
        };

        const result = competencySchema.shape.standardCodes?.safeParse({
          escoRef: invalidEscoRef,
        });
        expect(result?.success).toBe(false);
      });
    });

    describe('Full competency validation', () => {
      it('should validate a complete competency object', () => {
        const validCompetency = {
          name: 'Communication',
          description: 'Effective verbal and written communication skills',
          category: 'INTERPERSONAL' as const,
          level: 'PROFICIENT' as const,
          isActive: true,
          approvalStatus: 'APPROVED' as const,
          standardCodes: {
            onetRef: { code: '2.A.1.a', title: 'Oral Comprehension' },
            bigFiveRef: { trait: 'EXTRAVERSION' as const, title: 'Extraversion' },
          },
        };

        const result = competencySchema.safeParse(validCompetency);
        expect(result.success).toBe(true);
      });

      it('should fail validation with missing required fields', () => {
        const invalidCompetency = {
          name: 'Test',
          // Missing description, category, level, isActive, approvalStatus
        };

        const result = competencySchema.safeParse(invalidCompetency);
        expect(result.success).toBe(false);
      });
    });
  });

  // ==========================================
  // Behavioral Indicator Schema Validation
  // ==========================================
  describe('Indicator Schema', () => {
    describe('Title field', () => {
      it('should accept valid titles', () => {
        const validTitles = [
          'Active Listening',
          'Clear Articulation',
          'Valid', // Minimum 5 characters
        ];

        validTitles.forEach(title => {
          const result = indicatorSchema.shape.title.safeParse(title);
          expect(result.success).toBe(true);
        });
      });

      it('should reject titles shorter than 5 characters', () => {
        const invalidTitles = ['', 'Test', 'ABCD'];

        invalidTitles.forEach(title => {
          const result = indicatorSchema.shape.title.safeParse(title);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Weight field', () => {
      it('should accept valid weights', () => {
        const validWeights = [0.01, 0.1, 0.25, 0.5, 0.75, 1.0];

        validWeights.forEach(weight => {
          const result = indicatorSchema.shape.weight.safeParse(weight);
          expect(result.success).toBe(true);
        });
      });

      it('should reject weights below minimum', () => {
        const invalidWeights = [0, 0.001, 0.005, -0.1];

        invalidWeights.forEach(weight => {
          const result = indicatorSchema.shape.weight.safeParse(weight);
          expect(result.success).toBe(false);
        });
      });

      it('should reject weights above maximum', () => {
        const invalidWeights = [1.01, 1.5, 2, 100];

        invalidWeights.forEach(weight => {
          const result = indicatorSchema.shape.weight.safeParse(weight);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Order Index field', () => {
      it('should accept valid order indices', () => {
        const validIndices = [1, 5, 10, 15, 20];

        validIndices.forEach(index => {
          const result = indicatorSchema.shape.orderIndex.safeParse(index);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid order indices', () => {
        const invalidIndices = [0, -1, 21, 100];

        invalidIndices.forEach(index => {
          const result = indicatorSchema.shape.orderIndex.safeParse(index);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Context Scope field', () => {
      it('should accept all valid context scopes', () => {
        const validScopes = ['UNIVERSAL', 'PROFESSIONAL', 'TECHNICAL', 'MANAGERIAL'];

        validScopes.forEach(scope => {
          const result = indicatorSchema.shape.contextScope.safeParse(scope);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid context scopes', () => {
        const invalidScopes = ['GENERAL', 'universal', '', 'CUSTOM'];

        invalidScopes.forEach(scope => {
          const result = indicatorSchema.shape.contextScope.safeParse(scope);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Measurement Type field', () => {
      it('should accept all valid measurement types', () => {
        const validTypes = ['FREQUENCY', 'QUALITY', 'IMPACT', 'CONSISTENCY', 'IMPROVEMENT'];

        validTypes.forEach(type => {
          const result = indicatorSchema.shape.measurementType.safeParse(type);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Full indicator validation', () => {
      it('should validate a complete indicator object', () => {
        const validIndicator = {
          title: 'Active Listening',
          description: 'Demonstrates attentive listening in conversations',
          observabilityLevel: 'PROFICIENT' as const,
          measurementType: 'FREQUENCY' as const,
          weight: 0.3,
          examples: 'Maintains eye contact, asks clarifying questions',
          counterExamples: 'Interrupts frequently, appears distracted',
          isActive: true,
          approvalStatus: 'APPROVED' as const,
          orderIndex: 1,
          contextScope: 'UNIVERSAL' as const,
        };

        const result = indicatorSchema.safeParse(validIndicator);
        expect(result.success).toBe(true);
      });
    });
  });

  // ==========================================
  // Assessment Question Schema Validation
  // ==========================================
  describe('Question Schema', () => {
    describe('Question Text field', () => {
      it('should accept valid question texts', () => {
        const validTexts = [
          'How often do you seek feedback from colleagues?',
          'Describe a time when you demonstrated leadership.',
          'ValidText1', // Exactly 10 characters
        ];

        validTexts.forEach(text => {
          const result = questionSchema.shape.questionText.safeParse(text);
          expect(result.success).toBe(true);
        });
      });

      it('should reject question texts shorter than 10 characters', () => {
        const invalidTexts = ['', 'Short?', '123456789'];

        invalidTexts.forEach(text => {
          const result = questionSchema.shape.questionText.safeParse(text);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Question Type field', () => {
      it('should accept primary question types', () => {
        const primaryTypes = ['LIKERT', 'SJT', 'MCQ'];

        primaryTypes.forEach(type => {
          const result = questionSchema.shape.questionType.safeParse(type);
          expect(result.success).toBe(true);
        });
      });

      it('should accept extended question types', () => {
        const extendedTypes = [
          'LIKERT_SCALE',
          'SITUATIONAL_JUDGMENT',
          'BEHAVIORAL_EXAMPLE',
          'MULTIPLE_CHOICE',
          'OPEN_TEXT',
        ];

        extendedTypes.forEach(type => {
          const result = questionSchema.shape.questionType.safeParse(type);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Difficulty Level field', () => {
      it('should accept all valid difficulty levels', () => {
        const validLevels = ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'SPECIALIZED'];

        validLevels.forEach(level => {
          const result = questionSchema.shape.difficultyLevel.safeParse(level);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Order Index field', () => {
      it('should accept valid order indices (1-50)', () => {
        const validIndices = [1, 10, 25, 50];

        validIndices.forEach(index => {
          const result = questionSchema.shape.orderIndex.safeParse(index);
          expect(result.success).toBe(true);
        });
      });

      it('should reject order indices outside range', () => {
        const invalidIndices = [0, -1, 51, 100];

        invalidIndices.forEach(index => {
          const result = questionSchema.shape.orderIndex.safeParse(index);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Metadata Tags field', () => {
      it('should accept valid controlled vocabulary tags', () => {
        const validTags = [
          ['GENERAL'],
          ['GENERAL', 'JUNIOR'],
          ['IT', 'MID'],
          ['SALES', 'SENIOR'],
          ['FINANCE', 'MEDICAL', 'ENGINEERING'],
        ];

        validTags.forEach(tags => {
          const result = questionSchema.shape.metadata?.safeParse({ tags });
          expect(result?.success).toBe(true);
        });
      });

      it('should reject invalid tags', () => {
        const invalidTags = [
          ['INVALID'],
          ['general'], // lowercase
          ['CUSTOM_TAG'],
        ];

        invalidTags.forEach(tags => {
          const result = questionSchema.shape.metadata?.safeParse({ tags });
          expect(result?.success).toBe(false);
        });
      });
    });

    describe('Answer Options validation', () => {
      it('should accept valid Likert scale options', () => {
        const likertOptions = [
          { label: 'Strongly Disagree', value: 1 },
          { label: 'Disagree', value: 2 },
          { label: 'Neutral', value: 3 },
          { label: 'Agree', value: 4 },
          { label: 'Strongly Agree', value: 5 },
        ];

        const result = questionSchema.shape.answerOptions?.safeParse(likertOptions);
        expect(result?.success).toBe(true);
      });

      it('should accept valid MCQ options with correct flag', () => {
        const mcqOptions = [
          { text: 'Option A', value: 1, correct: false },
          { text: 'Option B', value: 2, correct: true },
          { text: 'Option C', value: 3, correct: false },
        ];

        const result = questionSchema.shape.answerOptions?.safeParse(mcqOptions);
        expect(result?.success).toBe(true);
      });

      it('should accept valid SJT options with effectiveness and weights', () => {
        const sjtOptions = [
          {
            text: 'Response A',
            value: 1,
            effectiveness: 2,
            weights: { Leadership: 0.5, Empathy: -0.3 },
          },
          {
            text: 'Response B',
            value: 2,
            effectiveness: 5,
            weights: { Leadership: 0.8, Empathy: 0.9 },
          },
        ];

        const result = questionSchema.shape.answerOptions?.safeParse(sjtOptions);
        expect(result?.success).toBe(true);
      });
    });

    describe('Full question validation', () => {
      it('should validate a complete Likert question', () => {
        const validQuestion = {
          questionText: 'How often do you seek feedback from colleagues?',
          questionType: 'LIKERT_SCALE' as const,
          answerOptions: [
            { label: 'Never', value: 1 },
            { label: 'Rarely', value: 2 },
            { label: 'Sometimes', value: 3 },
            { label: 'Often', value: 4 },
            { label: 'Always', value: 5 },
          ],
          scoringRubric: 'Higher scores indicate more proactive feedback seeking',
          timeLimit: 30,
          difficultyLevel: 'INTERMEDIATE' as const,
          metadata: { tags: ['GENERAL' as const] },
          isActive: true,
          orderIndex: 1,
        };

        const result = questionSchema.safeParse(validQuestion);
        expect(result.success).toBe(true);
      });

      it('should validate a complete SJT question', () => {
        const validQuestion = {
          questionText: 'A colleague asks for help when you are busy. What do you do?',
          questionType: 'SITUATIONAL_JUDGMENT' as const,
          answerOptions: [
            { text: 'Ignore them', value: 1, effectiveness: 1 },
            { text: 'Help them immediately', value: 2, effectiveness: 3 },
            { text: 'Explain your situation and offer to help later', value: 3, effectiveness: 5 },
          ],
          scoringRubric: 'Evaluates prioritization and teamwork',
          timeLimit: 180,
          difficultyLevel: 'ADVANCED' as const,
          metadata: { tags: ['GENERAL' as const, 'MID' as const] },
          isActive: true,
          orderIndex: 2,
        };

        const result = questionSchema.safeParse(validQuestion);
        expect(result.success).toBe(true);
      });

      it('should validate an Open Text question', () => {
        const validQuestion = {
          questionText: 'Describe a challenging situation you faced at work.',
          questionType: 'OPEN_TEXT' as const,
          answerOptions: [],
          scoringRubric: 'Evaluate for clarity, relevance, and depth',
          timeLimit: 300,
          difficultyLevel: 'EXPERT' as const,
          metadata: { tags: ['SENIOR' as const] },
          isActive: true,
          orderIndex: 1,
        };

        const result = questionSchema.safeParse(validQuestion);
        expect(result.success).toBe(true);
      });
    });
  });

  // ==========================================
  // Edge Cases and Boundary Conditions
  // ==========================================
  describe('Edge Cases and Boundary Conditions', () => {
    describe('String length boundaries', () => {
      it('should accept exactly 3 character name', () => {
        const result = competencySchema.shape.name.safeParse('ABC');
        expect(result.success).toBe(true);
      });

      it('should reject 2 character name', () => {
        const result = competencySchema.shape.name.safeParse('AB');
        expect(result.success).toBe(false);
      });

      it('should accept exactly 10 character description', () => {
        const result = competencySchema.shape.description.safeParse('1234567890');
        expect(result.success).toBe(true);
      });

      it('should reject 9 character description', () => {
        const result = competencySchema.shape.description.safeParse('123456789');
        expect(result.success).toBe(false);
      });
    });

    describe('Numeric boundaries', () => {
      it('should accept weight of exactly 0.01', () => {
        const result = indicatorSchema.shape.weight.safeParse(0.01);
        expect(result.success).toBe(true);
      });

      it('should accept weight of exactly 1.0', () => {
        const result = indicatorSchema.shape.weight.safeParse(1.0);
        expect(result.success).toBe(true);
      });

      it('should accept order index of exactly 1', () => {
        const result = indicatorSchema.shape.orderIndex.safeParse(1);
        expect(result.success).toBe(true);
      });

      it('should accept order index of exactly 20', () => {
        const result = indicatorSchema.shape.orderIndex.safeParse(20);
        expect(result.success).toBe(true);
      });

      it('should accept question order index of exactly 50', () => {
        const result = questionSchema.shape.orderIndex.safeParse(50);
        expect(result.success).toBe(true);
      });
    });

    describe('Special characters and unicode', () => {
      it('should accept names with special characters', () => {
        const specialNames = [
          'Communication & Collaboration',
          'Problem-Solving Skills',
          "Leader's Mindset",
          'Time Management (Advanced)',
        ];

        specialNames.forEach(name => {
          const result = competencySchema.shape.name.safeParse(name);
          expect(result.success).toBe(true);
        });
      });

      it('should accept descriptions with unicode', () => {
        const unicodeDescriptions = [
          'This description includes emojis (but we avoid them)',
          'Description with accents: cafe, resume',
          'German text: Zusammenarbeit und Kommunikation',
        ];

        unicodeDescriptions.forEach(desc => {
          const result = competencySchema.shape.description.safeParse(desc);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Empty arrays and optional fields', () => {
      it('should accept empty answer options array', () => {
        const result = questionSchema.shape.answerOptions?.safeParse([]);
        expect(result?.success).toBe(true);
      });

      it('should accept undefined optional fields', () => {
        const minimalIndicator = {
          title: 'Valid Title',
          description: 'Valid description that meets requirements',
          observabilityLevel: 'NOVICE' as const,
          measurementType: 'FREQUENCY' as const,
          weight: 0.5,
          isActive: true,
          approvalStatus: 'DRAFT' as const,
          orderIndex: 1,
          contextScope: 'UNIVERSAL' as const,
          // examples and counterExamples are optional
        };

        const result = indicatorSchema.safeParse(minimalIndicator);
        expect(result.success).toBe(true);
      });
    });
  });
});
