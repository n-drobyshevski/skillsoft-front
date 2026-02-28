'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
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
// DIFFICULTY SEGMENT BAR
// ============================================

const DOT_COLORS: Record<Difficulty, string> = {
  FOUNDATIONAL: 'bg-emerald-500',
  INTERMEDIATE: 'bg-amber-500',
  ADVANCED: 'bg-orange-500',
  EXPERT: 'bg-red-500',
};

const DIFFICULTY_KEYS: Difficulty[] = ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

function DifficultyDots({ counts }: { counts: Record<Difficulty, number> }) {
  const t = useTranslations('builder.library.difficultyLabels');

  const tooltipContent = DIFFICULTY_KEYS
    .map((d) => {
      const label = t(d.toLowerCase() as 'foundational' | 'intermediate' | 'advanced' | 'expert');
      return `${label}: ${counts[d] ?? 0}`;
    })
    .join(' · ');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 shrink-0 cursor-default">
          {DIFFICULTY_KEYS.map((diff) => (
            <span
              key={diff}
              className="inline-flex items-center gap-0.5 text-xs font-medium tabular-nums text-muted-foreground/80"
            >
              <span
                className={cn('inline-block h-1.5 w-1.5 rounded-full', DOT_COLORS[diff])}
                aria-hidden="true"
              />
              {counts[diff] ?? 0}
            </span>
          ))}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}

// ============================================
// RISK BADGE
// ============================================

const RISK_BADGE_STYLES: Record<BorrowingRisk, string> = {
  NONE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  LOW: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  HIGH: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

function RiskBadge({ risk }: { risk: BorrowingRisk }) {
  const t = useTranslations('builder.library.risk');
  const config = {
    NONE: { icon: CheckCircle2, label: t('none'), tooltip: t('tooltipNone') },
    LOW: { icon: AlertTriangle, label: t('low'), tooltip: t('tooltipLow') },
    HIGH: { icon: AlertCircle, label: t('high'), tooltip: t('tooltipHigh') },
  };

  const { icon: Icon, label, tooltip } = config[risk];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 shrink-0',
            RISK_BADGE_STYLES[risk]
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className={cn(
            'text-xs-safe font-medium',
            risk === 'NONE' ? 'sr-only' : 'sr-only sm:not-sr-only'
          )}>
            {label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

// ============================================
// SKELETON LOADER
// ============================================

function IndicatorSkeleton() {
  const t = useTranslations('builder.library');
  return (
    <div className="space-y-1 px-1 pt-2 pb-2.5 animate-pulse" aria-label={t('loading')}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1 px-3 py-2.5 rounded-lg min-h-[44px]">
          <div className="h-3.5 w-3/4 bg-muted rounded" />
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((d) => (
              <span key={d} className="inline-flex items-center gap-0.5">
                <span className="inline-block h-1.5 w-1.5 bg-muted rounded-full" />
                <span className="h-3 w-3 bg-muted rounded" />
              </span>
            ))}
            <div className="h-3.5 w-8 bg-muted rounded" />
            <div className="h-5 w-5 bg-muted rounded-full" />
          </div>
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
        'flex flex-col gap-1 px-3 py-2.5 rounded-lg min-h-[44px]',
        'transition-colors duration-200',
        indicator.isActive
          ? 'bg-muted/20 dark:bg-muted/10 hover:bg-muted/50'
          : 'opacity-40'
      )}
      role="listitem"
    >
      {/* Line 1: Title (full width) */}
      <p
        className={cn(
          'text-sm font-medium leading-tight',
          !indicator.isActive && 'italic text-muted-foreground'
        )}
      >
        {indicator.title}
      </p>

      {/* Line 2: Difficulty Dots + Count + Risk */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <DifficultyDots counts={indicator.questionsByDifficulty} />
        <span className="text-xs font-medium tabular-nums text-muted-foreground shrink-0">
          {indicator.totalQuestions}q
        </span>
        <RiskBadge risk={risk} />
      </div>
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
    <div className="space-y-1 px-1 pt-2 pb-2.5">
      {/* Header */}
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3 pb-1">
        {t('indicators', { count: activeIndicators.length })}
      </p>

      {/* Indicator rows */}
      <div className="space-y-1" role="list">
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
        <div className="flex items-center gap-2 px-3 pt-2 mt-1 border-t border-border/30">
          <AlertTriangle
            className={cn(
              'h-3.5 w-3.5 shrink-0',
              overallRisk === 'high' && 'text-red-500 dark:text-red-400',
              overallRisk === 'moderate' && 'text-amber-500 dark:text-amber-400',
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'text-xs font-medium',
              overallRisk === 'high' && 'text-red-600 dark:text-red-400',
              overallRisk === 'moderate' && 'text-amber-600 dark:text-amber-400',
            )}
          >
            {t('borrowingRisk')}: {t(`risk${overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)}` as 'riskNone' | 'riskLow' | 'riskModerate' | 'riskHigh')}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('indicatorsMayBorrow', { count: borrowingCount })}
          </span>
        </div>
      )}
    </div>
  );
}
