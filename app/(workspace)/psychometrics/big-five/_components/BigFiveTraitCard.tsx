'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ReliabilityStatusBadge } from '../../_components/ReliabilityStatusBadge';
import { BigFiveReliability, BigFiveTrait } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { Users, FileText, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Color palette for each Big Five trait
 */
export const TRAIT_COLORS: Record<BigFiveTrait, {
  bg: string;
  text: string;
  accent: string;
  border: string;
  lightBg: string;
}> = {
  [BigFiveTrait.OPENNESS]: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    text: 'text-violet-600 dark:text-violet-400',
    accent: '#8b5cf6',
    border: 'border-violet-200 dark:border-violet-800',
    lightBg: 'bg-violet-100 dark:bg-violet-900/40',
  },
  [BigFiveTrait.CONSCIENTIOUSNESS]: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-600 dark:text-blue-400',
    accent: '#3b82f6',
    border: 'border-blue-200 dark:border-blue-800',
    lightBg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  [BigFiveTrait.EXTRAVERSION]: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-600 dark:text-amber-400',
    accent: '#f59e0b',
    border: 'border-amber-200 dark:border-amber-800',
    lightBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  [BigFiveTrait.AGREEABLENESS]: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    accent: '#10b981',
    border: 'border-emerald-200 dark:border-emerald-800',
    lightBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  [BigFiveTrait.EMOTIONAL_STABILITY]: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    accent: '#06b6d4',
    border: 'border-cyan-200 dark:border-cyan-800',
    lightBg: 'bg-cyan-100 dark:bg-cyan-900/40',
  },
};

/**
 * Maps BigFiveTrait enum values to translation keys
 * Exported for reuse in other Big Five components
 */
export const getTraitKey = (trait: BigFiveTrait): string => {
  const mapping: Record<BigFiveTrait, string> = {
    [BigFiveTrait.OPENNESS]: 'openness',
    [BigFiveTrait.CONSCIENTIOUSNESS]: 'conscientiousness',
    [BigFiveTrait.EXTRAVERSION]: 'extraversion',
    [BigFiveTrait.AGREEABLENESS]: 'agreeableness',
    [BigFiveTrait.EMOTIONAL_STABILITY]: 'emotionalStability',
  };
  return mapping[trait];
};

interface BigFiveTraitCardProps {
  reliability: BigFiveReliability;
  className?: string;
}

/**
 * Individual trait summary card displaying reliability metrics
 * with trait-specific color accent and statistics
 */
export function BigFiveTraitCard({ reliability, className }: BigFiveTraitCardProps) {
  const t = useTranslations('psychometrics.bigFivePage');
  const colors = TRAIT_COLORS[reliability.trait];
  const traitKey = getTraitKey(reliability.trait);

  const formatAlpha = (value: number | null): string => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md',
        colors.border,
        className
      )}
    >
      {/* Colored accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: colors.accent }}
      />

      <CardContent className="p-4 pt-5">
        {/* Header: Trait name and status badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className={cn('font-semibold text-sm truncate', colors.text)}>
              {t(`traits.${traitKey}.label`)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {t(`traits.${traitKey}.description`)}
            </p>
          </div>
          <ReliabilityStatusBadge
            status={reliability.reliabilityStatus}
            className="shrink-0"
          />
        </div>

        {/* Large Alpha value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: colors.accent }}
            >
              {formatAlpha(reliability.cronbachAlpha)}
            </span>
            <span className="text-xs text-muted-foreground">{t('card.alpha')}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className={cn('rounded-md p-2 text-center', colors.lightBg)}>
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className={cn('h-3.5 w-3.5', colors.text)} />
            </div>
            <div className={cn('text-sm font-semibold tabular-nums', colors.text)}>
              {reliability.contributingCompetencies ?? '-'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('stats.competencies')}
            </div>
          </div>

          <div className={cn('rounded-md p-2 text-center', colors.lightBg)}>
            <div className="flex items-center justify-center mb-1">
              <FileText className={cn('h-3.5 w-3.5', colors.text)} />
            </div>
            <div className={cn('text-sm font-semibold tabular-nums', colors.text)}>
              {reliability.totalItems ?? '-'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('stats.questions')}
            </div>
          </div>

          <div className={cn('rounded-md p-2 text-center', colors.lightBg)}>
            <div className="flex items-center justify-center mb-1">
              <Users className={cn('h-3.5 w-3.5', colors.text)} />
            </div>
            <div className={cn('text-sm font-semibold tabular-nums', colors.text)}>
              {reliability.sampleSize?.toLocaleString() ?? '-'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('stats.responses')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
