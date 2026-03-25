'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricCardItem } from './types';

// ============================================================================
// Left accent border — reinforces status via position + color (color-not-only)
// ============================================================================

const ACCENT_BORDER_CLASSES = {
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
  default: 'border-l-border',
} as const;

const CARD_BORDER_CLASSES = {
  success: 'border-emerald-500/20 dark:border-emerald-500/15',
  warning: 'border-amber-500/20 dark:border-amber-500/15',
  info: 'border-blue-500/20 dark:border-blue-500/15',
  default: 'border-border',
} as const;

const CARD_BG_CLASSES = {
  success: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  warning: 'bg-amber-50/50 dark:bg-amber-950/20',
  info: 'bg-blue-50/50 dark:bg-blue-950/20',
  default: '',
} as const;

const ICON_BG_CLASSES = {
  success: 'bg-emerald-100 dark:bg-emerald-900/30',
  warning: 'bg-amber-100 dark:bg-amber-900/30',
  info: 'bg-blue-100 dark:bg-blue-900/30',
  default: 'bg-muted',
} as const;

const ICON_TEXT_CLASSES = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  default: 'text-muted-foreground',
} as const;

const VALUE_TEXT_CLASSES = {
  success: 'text-emerald-700 dark:text-emerald-300',
  warning: 'text-amber-700 dark:text-amber-300',
  info: 'text-blue-700 dark:text-blue-300',
  default: 'text-foreground',
} as const;

const LABEL_TEXT_CLASSES = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  default: 'text-muted-foreground',
} as const;

const BAR_FILL_CLASSES = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  default: 'bg-primary',
} as const;

const BAR_TRACK_CLASSES = {
  success: 'bg-emerald-500/15',
  warning: 'bg-amber-500/15',
  info: 'bg-blue-500/15',
  default: 'bg-muted',
} as const;

interface MetricCardsProps {
  metrics: MetricCardItem[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const t = useTranslations('results.shared.metricCards');
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
      role="list"
      aria-label={t('ariaLabel')}
    >
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        const v = metric.variant;
        const hasSparklines = metric.sparklines && metric.sparklines.length > 0;

        return (
          <Card
            key={i}
            role="listitem"
            aria-label={`${metric.label}: ${metric.value} ${metric.sublabel ?? t('defaultSublabel')}`}
            className={cn(
              'rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
              'border-l-[3px]',
              ACCENT_BORDER_CLASSES[v],
              CARD_BORDER_CLASSES[v],
              CARD_BG_CLASSES[v],
            )}
          >
            <CardContent className="p-4 flex flex-col min-h-[120px]">
              {/* Header row: label + help + icon */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase', LABEL_TEXT_CLASSES[v])}>
                    {metric.label}
                    {metric.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-5 h-5 -m-0.5 rounded-full text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-manipulation"
                            aria-label={`Help: ${metric.label}`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px]">
                          {metric.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {/* Value */}
                  <div className={cn('text-[28px] sm:text-[32px] font-bold tabular-nums leading-none tracking-tight mt-1', VALUE_TEXT_CLASSES[v])}>
                    {metric.value}
                  </div>
                  {/* Sublabel */}
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {metric.sublabel ?? t('defaultSublabel')}
                  </div>
                </div>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-2', ICON_BG_CLASSES[v])}>
                  <Icon className={cn('w-4 h-4', ICON_TEXT_CLASSES[v])} />
                </div>
              </div>

              {/* Sparklines — fills remaining space for equal card heights */}
              <div className="flex-1 flex flex-col justify-end">
                {hasSparklines ? (
                  <div className="flex flex-col gap-2">
                    {metric.sparklines!.slice(0, 3).map((spark, j) => (
                      <Tooltip key={j}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help group">
                            <span className="text-[10px] text-muted-foreground w-[110px] truncate shrink-0 group-hover:text-foreground transition-colors">
                              {spark.name}
                            </span>
                            <div className={cn('flex-1 h-1.5 rounded-full overflow-hidden', BAR_TRACK_CLASSES[v])}>
                              <div
                                className={cn('h-full rounded-full transition-all duration-300', BAR_FILL_CLASSES[v])}
                                style={{ width: `${Math.min(spark.value, 100)}%` }}
                              />
                            </div>
                            <span className={cn('text-[10px] font-semibold tabular-nums w-[26px] text-right shrink-0', LABEL_TEXT_CLASSES[v])}>
                              {Math.round(spark.value)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px]">
                          {spark.name} — {Math.round(spark.value)}%
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ) : (
                  /* Empty state — subtle indicator when no sparklines */
                  <div className={cn('h-1.5 rounded-full w-full', BAR_TRACK_CLASSES[v])}>
                    <div
                      className={cn('h-full rounded-full opacity-40', BAR_FILL_CLASSES[v])}
                      style={{ width: typeof metric.value === 'number' ? `${Math.min((metric.value / Math.max(metric.value, 5)) * 100, 100)}%` : '50%' }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
