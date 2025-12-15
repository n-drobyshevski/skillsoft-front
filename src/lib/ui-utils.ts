/**
 * UI utility functions for styling and icons.
 * Moved from app/utils.ts to follow Next.js 16 best practices.
 */

import React from "react";
import {
  BrainCircuit,
  Award,
  GraduationCap,
  Users,
  Heart,
  Clock,
  LightbulbIcon,
  UsersRound,
  ListTodo,
  Gavel,
  ChartColumn,
  Pencil,
  BadgeQuestionMark,
  Binary,
  MessageSquare
} from "lucide-react";
import { DifficultyLevel } from "@/types/domain";

// ============================================
// COLOR CONSTANTS
// ============================================

const COMMON_COLORS = {
  NOVICE: "border-red-500/20 text-red-700 bg-red-50/90 dark:bg-red-950/90 dark:text-red-200 dark:border-red-400/30",
  DEVELOPING: "border-amber-500/20 text-amber-700 bg-amber-50/90 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-400/30",
  PROFICIENT: "border-emerald-500/20 text-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-400/30",
  ADVANCED: "border-blue-500/20 text-blue-700 bg-blue-50/90 dark:bg-blue-950/90 dark:text-blue-200 dark:border-blue-400/30",
  EXPERT: "border-violet-500/20 text-violet-700 bg-violet-50/90 dark:bg-violet-950/90 dark:text-violet-200 dark:border-violet-400/30",
} as const;

const LEVEL_COLORS_DARK = {
  NOVICE: "border-red-600/30 text-red-700 bg-red-50/90 dark:bg-red-950/90 dark:text-red-200 dark:border-red-400/30",
  DEVELOPING: "border-amber-600/30 text-amber-800 bg-amber-50/90 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-400/30",
  PROFICIENT: "border-emerald-600/30 text-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-400/30",
  ADVANCED: "border-blue-600/30 text-blue-700 bg-blue-50/90 dark:bg-blue-950/90 dark:text-blue-200 dark:border-blue-400/30",
  EXPERT: "border-violet-600/30 text-violet-700 bg-violet-50/90 dark:bg-violet-950/90 dark:text-violet-200 dark:border-violet-400/30",
} as const;

// ============================================
// COMPETENCY HELPERS
// ============================================

export function competencyCategoryToIcon(category: string) {
  const iconMap = new Map([
    ['COGNITIVE', BrainCircuit],
    ['INTERPERSONAL', Users],
    ['LEADERSHIP', GraduationCap],
    ['ADAPTABILITY', Binary],
    ['EMOTIONAL_INTELLIGENCE', Heart],
    ['COMMUNICATION', MessageSquare],
    ['COLLABORATION', UsersRound],
    ['CRITICAL_THINKING', LightbulbIcon],
    ['TIME_MANAGEMENT', Clock],
  ]);
  
  const IconComponent = iconMap.get(category) || Award;
  return React.createElement(IconComponent, { className: "h-4 w-4" });
}


export function levelToNumber(level: string): number {
  const levelMap = new Map([
    ['NOVICE', 1],
    ['DEVELOPING', 2],
    ['PROFICIENT', 3],
    ['ADVANCED', 4],
    ['EXPERT', 5],
  ]);
  
  return levelMap.get(level) || 1;
}

export function levelToColor(level: string): string {
  switch (level) {
    case 'NOVICE':
      return LEVEL_COLORS_DARK.NOVICE;
    case 'DEVELOPING':
      return LEVEL_COLORS_DARK.DEVELOPING;
    case 'PROFICIENT':
      return LEVEL_COLORS_DARK.PROFICIENT;
    case 'ADVANCED':
      return LEVEL_COLORS_DARK.ADVANCED;
    case 'EXPERT':
      return LEVEL_COLORS_DARK.EXPERT;
    default:
      return LEVEL_COLORS_DARK.NOVICE;
  }
}

// ============================================
// APPROVAL STATUS HELPERS
// ============================================

export function approvalStatusToColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'border-yellow-500/30 text-yellow-500 bg-yellow-500/8 dark:text-yellow-300';
    case 'PENDING_REVIEW':
      return 'border-yellow-500/30 text-yellow-500 bg-yellow-500/8 dark:text-yellow-300';
    case 'APPROVED':
      return 'border-emerald-500/30 text-emerald-600 bg-emerald-500/8 dark:text-emerald-300';
    case 'REJECTED':
      return 'border-red-500/30 text-red-400 bg-red-500/8 dark:text-red-300';
    case 'ARCHIVED':
      return 'border-gray-500/30 text-gray-400 bg-gray-500/8 dark:text-gray-300';
    case 'UNDER_REVISION':
      return 'border-blue-500/30 text-blue-600 bg-blue-500/8 dark:text-blue-300';
    default:
      return 'border-gray-500/30 text-gray-400 bg-gray-500/8 dark:text-gray-300';
  }
}

// ============================================
// BEHAVIORAL INDICATOR HELPERS
// ============================================

export function biLevelToColor(level: string): string {
  switch (level) {
    case 'NOVICE':
      return COMMON_COLORS.NOVICE;
    case 'DEVELOPING':
      return COMMON_COLORS.DEVELOPING;
    case 'PROFICIENT':
      return COMMON_COLORS.PROFICIENT;
    case 'ADVANCED':
      return COMMON_COLORS.ADVANCED;
    case 'EXPERT':
      return COMMON_COLORS.EXPERT;
    default:
      return COMMON_COLORS.NOVICE;
  }
}

// ============================================
// QUESTION HELPERS
// ============================================

export function questionTypeToIcon(category: string) {
  const iconMap = new Map([
    ['MULTIPLE_CHOICE', ListTodo],
    ['SITUATIONAL_JUDGMENT', Gavel],
    ['LIKERT_SCALE', ChartColumn],
    ['OPEN_ENDED', Pencil],
    ['OPEN_TEXT', Pencil],
    ['TRUE_FALSE', BadgeQuestionMark],
  ]);
  
  const IconComponent = iconMap.get(category) || BadgeQuestionMark;
  return React.createElement(IconComponent, { className: "h-4 w-4" });
}

export function questionDifficultyToColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case DifficultyLevel.FOUNDATIONAL:
      return COMMON_COLORS.PROFICIENT; // Green for easy
    case DifficultyLevel.INTERMEDIATE:
      return COMMON_COLORS.DEVELOPING; // Amber for medium
    case DifficultyLevel.ADVANCED:
      return COMMON_COLORS.NOVICE; // Red for hard
    case DifficultyLevel.EXPERT:
      return COMMON_COLORS.EXPERT;
    default:
      return COMMON_COLORS.PROFICIENT;
  }
}

export function questionTypeToColor(type: string): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'border-blue-500/30 text-blue-700 bg-blue-50/90 dark:bg-blue-950/90 dark:text-blue-200 dark:border-blue-400/30';
    case 'SINGLE_CHOICE':
      return 'border-indigo-500/30 text-indigo-700 bg-indigo-50/90 dark:bg-indigo-950/90 dark:text-indigo-200 dark:border-indigo-400/30';
    case 'TRUE_FALSE':
      return 'border-violet-500/30 text-violet-700 bg-violet-50/90 dark:bg-violet-950/90 dark:text-violet-200 dark:border-violet-400/30';
    case 'OPEN_TEXT':
      return 'border-orange-500/30 text-orange-700 bg-orange-50/90 dark:bg-orange-950/90 dark:text-orange-200 dark:border-orange-400/30';
    case 'SCENARIO_BASED':
      return 'border-purple-500/30 text-purple-700 bg-purple-50/90 dark:bg-purple-950/90 dark:text-purple-200 dark:border-purple-400/30';
    case 'LIKERT_SCALE':
      return 'border-teal-500/30 text-teal-700 bg-teal-50/90 dark:bg-teal-950/90 dark:text-teal-200 dark:border-teal-400/30';
    case 'SITUATIONAL_JUDGMENT':
      return 'border-pink-500/30 text-pink-700 bg-pink-50/90 dark:bg-pink-950/90 dark:text-pink-200 dark:border-pink-400/30';
    default:
      return 'border-border text-muted-foreground bg-muted/50';
  }
}
