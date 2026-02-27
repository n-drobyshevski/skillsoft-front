'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useIndicatorInventory } from '@/store/blueprint-store';
import type { IndicatorQuestionStats, Difficulty } from '@/types/blueprint';

// ============================================
// TYPES
// ============================================

type BorrowingRisk = 'NONE' | 'LOW' | 'HIGH';

interface IndicatorExpansionProps {
  competencyId: string;
  /** Questions allocated for this competency in the blueprint (for risk calc) */
  questionsPerCompetency: number;
}

// ============================================
// RISK CALCULATION
// ============================================

function getIndicatorRisk(
  indicator: IndicatorQuestionStats,
  questionsPerCompetency: number,
  indicatorCount: number
): BorrowingRisk {
  if (indicatorCount === 0) return 'HIGH';
  const expected = Math.ceil(questionsPerCompetency / indicatorCount);
  if (indicator.totalQuestions >= expected) return 'NONE';
  if (indicator.totalQuestions >= 1) return 'LOW';
  return 'HIGH';
}

function getOverallRisk(risks: BorrowingRisk[]): string {
  const highCount = risks.filter((r) => r === 'HIGH').length;
  if (highCount > 0) return 'high';
  if (risks.some((r) => r === 'LOW')) return 'moderate';
  return 'none';
}

// ============================================
// DIFFICULTY BAR
// ============================================

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  FOUNDATIONAL: 'bg-blue-500',
  INTERMEDIATE: 'bg-emerald-500',
  ADVANCED: 'bg-amber-500',
  EXPERT: 'bg-red-500',
};

const DIFFICULTY_KEYS: Difficulty[] = ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

function DifficultyBar({ counts }: { counts: Record<Difficulty, number> }) {
  const t = useTranslations('builder.library.difficultyLabels');

  return (
    <div className="flex items-center gap-1">
      {DIFFICULTY_KEYS.map((diff) => {
        const count = counts[diff] ?? 0;
        const label = t(diff.toLowerCase() as 'foundational' | 'intermediate' | 'advanced' | 'expert');
        return (
          <div key={diff} className="flex items-center gap-0.5" title={`${label}: ${count}`}>
            <div
              className={cn(
                'h-2 w-1.5 rounded-[1px] transition-opacity',
                DIFFICULTY_COLORS[diff],
                count === 0 && 'opacity-15'
              )}
            />
            <span className="text-[9px] text-muted-foreground/70 tabular-nums">
              {label}:{count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// RISK BADGE
// ============================================

function RiskBadge({ risk }: { risk: BorrowingRisk }) {
  const t = useTranslations('builder.library.risk');
  const config = {
    NONE: {
      icon: CheckCircle2,
      label: t('none'),
      className: 'text-emerald-500 dark:text-emerald-400',
    },
    LOW: {
      icon: AlertTriangle,
      label: t('low'),
      className: 'text-amber-500 dark:text-amber-400',
    },
    HIGH: {
      icon: AlertCircle,
      label: t('high'),
      className: 'text-red-500 dark:text-red-400',
    },
  };

  const { icon: Icon, className, label } = config[risk];

  return (
    <div className={cn('shrink-0', className)} title={label}>
      <Icon className="h-3 w-3" />
    </div>
  );
}

// ============================================
// SKELETON LOADER
// ============================================

function IndicatorSkeleton() {
  const t = useTranslations('builder.library');
  return (
    <div className="space-y-2 p-2 animate-pulse" aria-label={t('loading')}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 h-8">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="flex-1" />
          <div className="h-3 w-8 bg-muted rounded" />
          <div className="h-3 w-3 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// INDICATOR ROW
// ============================================

function IndicatorRow({
  indicator,
  risk,
}: {
  indicator: IndicatorQuestionStats;
  risk: BorrowingRisk;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md',
        'bg-muted/30 dark:bg-muted/20',
        !indicator.isActive && 'opacity-40'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium leading-tight truncate">
          {indicator.title}
        </p>
        <DifficultyBar counts={indicator.questionsByDifficulty} />
      </div>
      <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
        {indicator.totalQuestions}q
      </span>
      <RiskBadge risk={risk} />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function IndicatorExpansion({
  competencyId,
  questionsPerCompetency,
}: IndicatorExpansionProps) {
  const t = useTranslations('builder.library');
  const inventory = useIndicatorInventory(competencyId);

  if (!inventory) {
    return <IndicatorSkeleton />;
  }

  const activeIndicators = inventory.indicators.filter((ind) => ind.isActive);
  const risks = activeIndicators.map((ind) =>
    getIndicatorRisk(ind, questionsPerCompetency, activeIndicators.length)
  );
  const overallRisk = getOverallRisk(risks);
  const borrowingCount = risks.filter((r) => r !== 'NONE').length;

  return (
    <div className="space-y-1.5 px-1 pt-1.5 pb-2">
      {/* Header */}
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
        {t('indicators', { count: activeIndicators.length })}
      </p>

      {/* Indicator rows */}
      <div className="space-y-1">
        {inventory.indicators.map((ind) => (
          <IndicatorRow
            key={ind.indicatorId}
            indicator={ind}
            risk={ind.isActive ? (risks[activeIndicators.indexOf(ind)] ?? 'HIGH') : 'HIGH'}
          />
        ))}
      </div>

      {/* Footer: overall risk summary */}
      {borrowingCount > 0 && (
        <div className="flex items-center gap-1.5 px-1 pt-1">
          <span className={cn(
            'text-[10px] font-medium',
            overallRisk === 'high' && 'text-red-600 dark:text-red-400',
            overallRisk === 'moderate' && 'text-amber-600 dark:text-amber-400',
          )}>
            {t('borrowingRisk')}: {t(`risk${overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)}` as 'riskNone' | 'riskLow' | 'riskModerate' | 'riskHigh')}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {t('indicatorsMayBorrow', { count: borrowingCount })}
          </span>
        </div>
      )}
    </div>
  );
}
