import type { MockQuestion, MockPsychometrics, MockMapping, MockScoring, MockUsage } from './shared-types';

export const mockQuestion: MockQuestion = {
  id: 'demo-q3',
  questionText: 'What approach best addresses team conflict in a cross-functional project?',
  questionType: 'MCQ',
  answerOptions: [
    {
      id: 'a',
      text: 'Avoid the conflict and wait for it to resolve naturally',
      score: 0,
      correct: false,
    },
    {
      id: 'b',
      text: 'Address concerns openly in a facilitated group setting',
      score: 3,
      correct: true,
      explanation:
        'Open facilitated discussion allows all perspectives to be heard while maintaining psychological safety. This approach builds trust and creates lasting resolution.',
    },
    {
      id: 'c',
      text: 'Escalate immediately to senior management for resolution',
      score: 1,
      correct: false,
    },
    {
      id: 'd',
      text: 'Let team members resolve it independently without intervention',
      score: 1.5,
      correct: false,
    },
  ],
  difficultyLevel: 'INTERMEDIATE',
  metadata: { tags: ['INTERPERSONAL', 'MID', 'LEADERSHIP'], complexity_score: 0.55 },
};

export const mockPsychometrics: MockPsychometrics = {
  discriminationIndex: 0.72,
  difficultyIndex: 0.45,
  cronbachAlpha: 0.81,
  timeLimit: 120,
  sem: 0.15,
  ciLower: 0.66,
  ciUpper: 0.96,
  correctRate: 0.68,
  avgResponseTime: 45,
  medianResponseTime: 38,
};

export const mockMapping: MockMapping = {
  competencyName: 'Conflict Resolution',
  indicatorTitle: 'Demonstrates constructive conflict management in team settings',
  onetCode: '43-1011.00',
  escoUri: 'http://data.europa.eu/esco/skill/S4.3.1',
  bigFiveCategory: 'Agreeableness',
  weight: 0.85,
  questionsInIndicator: 3,
  questionsInCompetency: 8,
  contributionPct: 12,
};

export const mockScoring: MockScoring = {
  maxScore: 3,
  scoringMethod: 'Binary',
  optionScores: { a: 0, b: 3, c: 1, d: 1.5 },
};

export const mockUsage: MockUsage = {
  assessmentCount: 12,
  lastModified: '2w ago',
  position: 3,
  totalQuestions: 25,
};

/**
 * Port from ScoringTab.tsx:31-38 — score color based on ratio.
 * Guards against division by zero when maxScore is 0.
 */
export function getScoreColor(score: number, maxScore: number): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.8) return 'text-green-400 bg-green-500/20 border-green-500/30';
  if (ratio >= 0.6) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  if (ratio >= 0.4) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  if (ratio >= 0.2) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  return 'text-red-400 bg-red-500/20 border-red-500/30';
}

/**
 * Port from PsychometricsTab.tsx:31-82 — difficulty config.
 * Uses string literals instead of DifficultyLevel enum.
 */
export function getDifficultyConfig(level: MockQuestion['difficultyLevel']): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  value: number;
} {
  switch (level) {
    case 'FOUNDATIONAL':
      return {
        label: 'Foundational',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        value: 20,
      };
    case 'INTERMEDIATE':
      return {
        label: 'Intermediate',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        value: 40,
      };
    case 'ADVANCED':
      return {
        label: 'Advanced',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        value: 60,
      };
    case 'EXPERT':
      return {
        label: 'Expert',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        value: 80,
      };
    case 'SPECIALIZED':
      return {
        label: 'Specialized',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        value: 95,
      };
    default: {
      const _exhaustive: never = level;
      void _exhaustive;
      return {
        label: 'Unknown',
        color: 'text-neutral-400',
        bgColor: 'bg-neutral-500/20',
        borderColor: 'border-neutral-500/30',
        value: 0,
      };
    }
  }
}

/**
 * Port from PsychometricsTab.tsx:113-127 — discrimination interpretation.
 * Translated to English for the demo context.
 */
export function getDiscriminationInterpretation(value: number | undefined): {
  label: string;
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral';
} {
  if (value === undefined) return { label: 'Not calculated', status: 'neutral' };
  if (value >= 0.4) return { label: 'Excellent', status: 'excellent' };
  if (value >= 0.3) return { label: 'Good', status: 'good' };
  if (value >= 0.2) return { label: 'Acceptable', status: 'acceptable' };
  return { label: 'Needs review', status: 'poor' };
}

/**
 * New — derive A-F quality grade from psychometric data.
 * Weighted composite: Cronbach alpha (60%) + discrimination index (40%).
 */
export function computeQualityGrade(psychometrics: MockPsychometrics): {
  grade: string;
  color: string;
  label: string;
} {
  const score = (psychometrics.cronbachAlpha * 0.6 + psychometrics.discriminationIndex * 0.4) * 100;
  if (score >= 85) return { grade: 'A', color: 'text-emerald-400', label: 'Excellent' };
  if (score >= 75) return { grade: 'B', color: 'text-blue-400', label: 'Good' };
  if (score >= 65) return { grade: 'C', color: 'text-amber-400', label: 'Acceptable' };
  if (score >= 50) return { grade: 'D', color: 'text-orange-400', label: 'Needs Work' };
  return { grade: 'F', color: 'text-red-400', label: 'Poor' };
}
