'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MetricCardItem } from './types';

const CARD_BORDER_CLASSES = {
  success: 'border-emerald-200 dark:border-emerald-800',
  warning: 'border-amber-200 dark:border-amber-800',
  info: 'border-blue-200 dark:border-blue-800',
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

interface MetricCardsProps {
  metrics: MetricCardItem[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        const v = metric.variant;

        return (
          <Card
            key={i}
            className={cn(
              'rounded-xl shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200',
              CARD_BORDER_CLASSES[v],
              CARD_BG_CLASSES[v],
            )}
          >
            <CardContent className="p-4">
              {/* Header: section label + icon */}
              <div className="flex items-start justify-between mb-3.5">
                <div>
                  <div className={cn('text-[11px] font-medium tracking-wider uppercase mb-1', LABEL_TEXT_CLASSES[v])}>
                    {metric.label}
                  </div>
                  <div className={cn('text-[32px] font-bold tabular-nums leading-none tracking-tight', VALUE_TEXT_CLASSES[v])}>
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">competencies</div>
                </div>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', ICON_BG_CLASSES[v])}>
                  <Icon className={cn('w-4 h-4', ICON_TEXT_CLASSES[v])} />
                </div>
              </div>

              {/* Sparklines */}
              {metric.sparklines && metric.sparklines.length > 0 && (
                <div className="flex flex-col gap-[7px]">
                  {metric.sparklines.slice(0, 3).map((spark, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-[110px] truncate shrink-0">
                        {spark.name}
                      </span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', BAR_FILL_CLASSES[v])}
                          style={{ width: `${Math.min(spark.value, 100)}%` }}
                        />
                      </div>
                      <span className={cn('text-[10px] tabular-nums w-[22px] text-right shrink-0', LABEL_TEXT_CLASSES[v])}>
                        {Math.round(spark.value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
