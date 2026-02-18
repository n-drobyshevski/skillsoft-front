/**
 * Strategy Context - Types and Configuration for Strategy-Aware SimulatorPanel
 *
 * This module provides centralized configuration for adapting the simulator
 * to different test template strategies (UNIVERSAL_BASELINE, TARGETED_FIT, DYNAMIC_GAP_ANALYSIS).
 */

import { LucideIcon } from 'lucide-react';

// ============================================
// STRATEGY TYPES
// ============================================

export type Strategy = 'UNIVERSAL_BASELINE' | 'TARGETED_FIT' | 'DYNAMIC_GAP_ANALYSIS';

export interface StrategySection {
  id: string;
  title: string;
  icon: string;
  defaultOpen: boolean;
  priority: number; // Lower = higher priority
  requiresData?: 'onetSocCode' | 'teamId';
}

export interface StrategyDisplayConfig {
  /** Primary label for the strategy */
  label: string;
  /** Short label for compact displays */
  shortLabel: string;
  /** Brief description */
  description: string;
  /** Icon name from lucide-react */
  icon: string;
  /** Theme classes */
  border: string;
  bg: string;
  iconBg: string;
  iconText: string;
  accentGradient: string;
  badgeBg: string;
  focusColor: string;
  /** Available sections for this strategy */
  sections: StrategySection[];
}

export interface StrategyValidation {
  isValid: boolean;
  missingRequirements: string[];
  warnings: string[];
}

// ============================================
// STRATEGY-SPECIFIC CONTEXT DATA
// ============================================

export interface JobRequirement {
  competencyId: string;
  name: string;
  importance: 'Critical' | 'Important' | 'Nice-to-Have';
  weight: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  scores: Record<string, number>;
}

export interface StrategyContextData {
  // TARGETED_FIT specific
  onetSocCode?: string;
  jobTitle?: string;
  jobRequirements?: JobRequirement[];

  // DYNAMIC_GAP_ANALYSIS specific
  teamId?: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  teamAverageScores?: Record<string, number>;
}

// ============================================
// STRATEGY CONFIGURATION REGISTRY
// ============================================

export const STRATEGY_CONFIG: Record<Strategy, StrategyDisplayConfig> = {
  UNIVERSAL_BASELINE: {
    label: 'Universal Baseline',
    shortLabel: 'Baseline',
    description: 'General competency assessment for any role',
    icon: 'ClipboardList',
    border: 'border-border',
    bg: 'bg-gradient-to-br from-muted/30 to-transparent',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    accentGradient: 'bg-gradient-to-r from-primary via-primary/60 to-transparent',
    badgeBg: 'bg-primary hover:bg-primary/90',
    focusColor: 'focus-visible:ring-primary/50',
    sections: [
      { id: 'insights', title: 'Assessment Profile', icon: 'Radar', defaultOpen: true, priority: 1 },
      { id: 'simulated-results', title: 'Results Preview', icon: 'FileCheck', defaultOpen: false, priority: 2 },
      { id: 'timeline', title: 'Question Flow', icon: 'LineChart', defaultOpen: false, priority: 3 },
      { id: 'analytics', title: 'Coverage Analysis', icon: 'BarChart3', defaultOpen: false, priority: 4 },
      { id: 'finetune', title: 'Fine Tune', icon: 'SlidersHorizontal', defaultOpen: false, priority: 5 },
    ],
  },

  TARGETED_FIT: {
    label: 'Job Fit Assessment',
    shortLabel: 'Job Fit',
    description: 'Role-specific assessment aligned with O*NET standards',
    icon: 'Briefcase',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bg: 'bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    accentGradient: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent',
    badgeBg: 'bg-emerald-500 hover:bg-emerald-600',
    focusColor: 'focus-visible:ring-emerald-500/50',
    sections: [
      { id: 'job-alignment', title: 'Job Alignment', icon: 'Briefcase', defaultOpen: true, priority: 1, requiresData: 'onetSocCode' },
      { id: 'simulated-results', title: 'Fit Preview', icon: 'FileCheck', defaultOpen: false, priority: 2 },
      { id: 'timeline', title: 'Question Flow', icon: 'LineChart', defaultOpen: false, priority: 3 },
      { id: 'analytics', title: 'Skill Coverage', icon: 'CheckSquare', defaultOpen: false, priority: 4 },
      { id: 'finetune', title: 'Fine Tune', icon: 'SlidersHorizontal', defaultOpen: false, priority: 5 },
    ],
  },

  DYNAMIC_GAP_ANALYSIS: {
    label: 'Team Gap Analysis',
    shortLabel: 'Team Fit',
    description: 'Compare candidate against team baseline',
    icon: 'Users',
    border: 'border-blue-200 dark:border-blue-800/50',
    bg: 'bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    accentGradient: 'bg-gradient-to-r from-blue-500 via-blue-400 to-transparent',
    badgeBg: 'bg-blue-500 hover:bg-blue-600',
    focusColor: 'focus-visible:ring-blue-500/50',
    sections: [
      { id: 'team-comparison', title: 'Team Comparison', icon: 'Users', defaultOpen: true, priority: 1, requiresData: 'teamId' },
      { id: 'gap-analysis', title: 'Gap Analysis', icon: 'GitCompareArrows', defaultOpen: true, priority: 2, requiresData: 'teamId' },
      { id: 'simulated-results', title: 'Team Fit Preview', icon: 'FileCheck', defaultOpen: false, priority: 3 },
      { id: 'timeline', title: 'Question Flow', icon: 'LineChart', defaultOpen: false, priority: 4 },
      { id: 'analytics', title: 'Analytics', icon: 'BarChart3', defaultOpen: false, priority: 5 },
      { id: 'finetune', title: 'Fine Tune', icon: 'SlidersHorizontal', defaultOpen: false, priority: 6 },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the display configuration for a strategy
 */
export function getStrategyConfig(strategy: Strategy): StrategyDisplayConfig {
  return STRATEGY_CONFIG[strategy] || STRATEGY_CONFIG.UNIVERSAL_BASELINE;
}

/**
 * Validate strategy requirements based on available data
 */
export function validateStrategy(
  strategy: Strategy,
  onetSocCode?: string,
  teamId?: string
): StrategyValidation {
  const missingRequirements: string[] = [];
  const warnings: string[] = [];

  if (strategy === 'TARGETED_FIT') {
    if (!onetSocCode) {
      missingRequirements.push('O*NET SOC code required for job alignment insights');
    }
  }

  if (strategy === 'DYNAMIC_GAP_ANALYSIS') {
    if (!teamId) {
      missingRequirements.push('Team selection required for gap analysis');
    }
  }

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements,
    warnings,
  };
}

/**
 * Get sections available for a strategy, filtering by data availability
 */
export function getAvailableSections(
  strategy: Strategy,
  contextData: StrategyContextData
): StrategySection[] {
  const config = getStrategyConfig(strategy);

  return config.sections.filter((section) => {
    if (!section.requiresData) return true;

    switch (section.requiresData) {
      case 'onetSocCode':
        return !!contextData.onetSocCode;
      case 'teamId':
        return !!contextData.teamId;
      default:
        return true;
    }
  });
}

/**
 * Get the default open section for a strategy
 */
export function getDefaultSection(strategy: Strategy): string {
  const config = getStrategyConfig(strategy);
  const defaultOpenSection = config.sections.find((s) => s.defaultOpen);
  return defaultOpenSection?.id || 'timeline';
}

/**
 * Compute a hash for blueprint state to detect changes
 */
export function computeBlueprintHash(state: {
  competencies: Array<{ id: string; weight: number; questionCount: number }>;
  strategy: Strategy;
  passingScore: number;
  timeLimitMinutes: number;
  strictnessLevel?: number;
  saturationThreshold?: number;
}): string {
  const hashData = {
    competencies: state.competencies.map((c) => ({
      id: c.id,
      weight: c.weight,
      questionCount: c.questionCount,
    })),
    strategy: state.strategy,
    passingScore: state.passingScore,
    timeLimitMinutes: state.timeLimitMinutes,
    strictnessLevel: state.strictnessLevel,
    saturationThreshold: state.saturationThreshold,
  };

  return JSON.stringify(hashData);
}

// ============================================
// PERSONA CONFIGURATION (single source in types.ts)
// ============================================

export { personaConfig } from './types';

// ============================================
// STRATEGY HELP CONTENT
// ============================================

export const STRATEGY_HELP_CONTENT = {
  UNIVERSAL_BASELINE: {
    title: 'Universal Baseline Assessment',
    points: [
      'Evaluates broad competency coverage',
      'Generates a competency passport/profile',
      'No pass/fail scoring - discovery focused',
      'Best for: Training needs analysis, career planning',
    ],
  },
  TARGETED_FIT: {
    title: 'Job Fit Assessment',
    points: [
      'Aligned to O*NET job requirements when SOC code is set',
      'Weighted scoring against job profile',
      'Clear pass/fail threshold',
      'Best for: Hiring, role matching, promotions',
    ],
  },
  DYNAMIC_GAP_ANALYSIS: {
    title: 'Team Gap Analysis',
    points: [
      'Compares individual scores against team benchmarks',
      'Identifies complementary strengths and development gaps',
      'Select a team in settings to enable comparison',
      'Best for: Team building, succession planning',
    ],
  },
} as const;
