import { DifficultyLevel } from '@/types/domain';

/**
 * Test-Drive Utilities
 *
 * Shared helper functions for the test-drive insights panel.
 * Used by both the production AnalyticsPanel and the design preview.
 */

// ─── Quality Grade ───────────────────────────────────────────────────────────

export interface QualityGradeResult {
  grade: string;
  color: string;
  label: string;
}

/**
 * Derive A-F quality grade from psychometric data.
 * Weighted composite: Cronbach alpha (60%) + discrimination index (40%).
 */
export function computeQualityGrade(psychometrics: {
  reliabilityCoefficient?: number;
  discriminationIndex?: number;
  cronbachAlpha?: number;
}): QualityGradeResult {
  const alpha = psychometrics.reliabilityCoefficient ?? psychometrics.cronbachAlpha ?? 0;
  const disc = psychometrics.discriminationIndex ?? 0;
  const score = (alpha * 0.6 + disc * 0.4) * 100;
  if (score >= 85) return { grade: 'A', color: 'text-emerald-400', label: 'Отличное' };
  if (score >= 75) return { grade: 'B', color: 'text-blue-400', label: 'Хорошее' };
  if (score >= 65) return { grade: 'C', color: 'text-amber-400', label: 'Допустимое' };
  if (score >= 50) return { grade: 'D', color: 'text-orange-400', label: 'Требует работы' };
  return { grade: 'F', color: 'text-red-400', label: 'Плохое' };
}

// ─── Discrimination Interpretation ───────────────────────────────────────────

export interface DiscriminationResult {
  label: string;
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral';
}

export function getDiscriminationInterpretation(
  value: number | undefined,
): DiscriminationResult {
  if (value === undefined) return { label: 'Не рассчитан', status: 'neutral' };
  if (value >= 0.4) return { label: 'Отличный', status: 'excellent' };
  if (value >= 0.3) return { label: 'Хороший', status: 'good' };
  if (value >= 0.2) return { label: 'Приемлемый', status: 'acceptable' };
  return { label: 'Требует пересмотра', status: 'poor' };
}

// ─── Score Color ─────────────────────────────────────────────────────────────

/**
 * Get Tailwind classes for a score value based on its ratio to max.
 * Returns space-separated "text-X bg-X border-X" classes.
 */
export function getScoreColor(score: number, maxScore: number): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.8) return 'text-green-400 bg-green-500/20 border-green-500/30';
  if (ratio >= 0.6) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  if (ratio >= 0.4) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  if (ratio >= 0.2) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  return 'text-red-400 bg-red-500/20 border-red-500/30';
}

// ─── Difficulty Config ───────────────────────────────────────────────────────

export interface DifficultyConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  value: number;
}

export function getDifficultyConfig(
  level: DifficultyLevel | string | undefined,
): DifficultyConfig {
  switch (level) {
    case DifficultyLevel.FOUNDATIONAL:
    case 'FOUNDATIONAL':
      return {
        label: 'Базовый',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        value: 20,
      };
    case DifficultyLevel.INTERMEDIATE:
    case 'INTERMEDIATE':
      return {
        label: 'Средний',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        value: 40,
      };
    case DifficultyLevel.ADVANCED:
    case 'ADVANCED':
      return {
        label: 'Продвинутый',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        value: 60,
      };
    case DifficultyLevel.EXPERT:
    case 'EXPERT':
      return {
        label: 'Экспертный',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        value: 80,
      };
    case DifficultyLevel.SPECIALIZED:
    case 'SPECIALIZED':
      return {
        label: 'Специализированный',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        value: 95,
      };
    default:
      return {
        label: 'Не указан',
        color: 'text-neutral-400',
        bgColor: 'bg-neutral-500/20',
        borderColor: 'border-neutral-500/30',
        value: 0,
      };
  }
}
