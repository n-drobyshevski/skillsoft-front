'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import type { CompetencyReliability, ReliabilityStatus } from '@/types/psychometrics';

interface CompactReliabilityCardProps {
  /** Competency reliability data */
  competency: CompetencyReliability;
  /** Additional CSS classes */
  className?: string;
}

interface StatusStyle {
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
  label: string;
  icon: React.ElementType;
}

function getStatusStyle(value: number | null, status: ReliabilityStatus): StatusStyle {
  if (value == null || status === 'INSUFFICIENT_DATA') {
    return {
      color: 'gray',
      textColor: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
      borderColor: 'border-l-gray-400 dark:border-l-gray-500',
      progressColor: 'bg-gray-400 dark:bg-gray-500',
      label: 'No Data',
      icon: HelpCircle,
    };
  }
  if (value >= 0.8) {
    return {
      color: 'emerald',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      borderColor: 'border-l-emerald-500 dark:border-l-emerald-400',
      progressColor: 'bg-emerald-500 dark:bg-emerald-400',
      label: 'Excellent',
      icon: CheckCircle,
    };
  }
  if (value >= 0.7) {
    return {
      color: 'blue',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
      borderColor: 'border-l-blue-500 dark:border-l-blue-400',
      progressColor: 'bg-blue-500 dark:bg-blue-400',
      label: 'Good',
      icon: CheckCircle,
    };
  }
  if (value >= 0.6) {
    return {
      color: 'amber',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      borderColor: 'border-l-amber-500 dark:border-l-amber-400',
      progressColor: 'bg-amber-500 dark:bg-amber-400',
      label: 'Acceptable',
      icon: AlertCircle,
    };
  }
  return {
    color: 'red',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50/50 dark:bg-red-950/20',
    borderColor: 'border-l-red-500 dark:border-l-red-400',
    progressColor: 'bg-red-500 dark:bg-red-400',
    label: 'Unreliable',
    icon: AlertTriangle,
  };
}

export function CompactReliabilityCard({
  competency,
  className,
}: CompactReliabilityCardProps) {
  const { cronbachAlpha, competencyName, reliabilityStatus, sampleSize } = competency;
  const style = getStatusStyle(cronbachAlpha, reliabilityStatus);
  const Icon = style.icon;
  const progressValue = cronbachAlpha != null ? cronbachAlpha * 100 : 0;

  return (
    <Link
      href={`/psychometrics/competencies/${competency.competencyId}`}
      className={cn(
        'grid w-full rounded-lg border border-l-[3px] p-3',
        'grid-cols-[auto_1fr_auto]',
        'items-center gap-x-2 gap-y-1.5',
        'transition-all duration-150',
        'hover:shadow-sm hover:border-primary/30',
        'active:scale-[0.99]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'min-h-[64px]', // Ensures touch target compliance (> 44px)
        style.borderColor,
        style.bgColor,
        className
      )}
    >
      {/* Row 1: Icon | Name | Value */}
      <Icon className={cn('h-4 w-4', style.textColor)} />
      <p
        className="font-medium text-sm leading-tight truncate"
        title={competencyName}
      >
        {competencyName}
      </p>
      <span className={cn('text-sm font-bold tabular-nums', style.textColor)}>
        {cronbachAlpha != null ? cronbachAlpha.toFixed(2) : '—'}
      </span>

      {/* Row 2: Progress bar spanning full width */}
      <div
        className="col-span-3 h-1.5 rounded-full bg-muted/60 overflow-hidden"
        role="progressbar"
        aria-valuenow={cronbachAlpha != null ? Math.round(cronbachAlpha * 100) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Cronbach's Alpha: ${cronbachAlpha != null ? cronbachAlpha.toFixed(2) : 'нет данных'}`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', style.progressColor)}
          style={{ width: `${progressValue}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Row 3: Status | spacer | Responses */}
      <span className={cn('text-xs font-medium', style.textColor)}>
        {style.label}
      </span>
      <span />
      <span className="text-xs text-muted-foreground tabular-nums text-right">
        {sampleSize != null ? `${sampleSize} resp.` : ''}
      </span>
    </Link>
  );
}

// Skeleton for loading state
export function CompactReliabilityCardSkeleton() {
  return (
    <div className="rounded-lg border border-l-[3px] border-l-muted p-3 min-h-[64px] animate-pulse">
      <div className="flex items-start gap-2 mb-2">
        <div className="h-4 w-4 rounded bg-muted shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
        <div className="h-6 w-10 bg-muted rounded" />
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-1.5" />
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}
