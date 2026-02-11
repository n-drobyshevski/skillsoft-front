'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { CompetencyReliability, ReliabilityStatus } from '@/types/psychometrics';

type StatusCategory = 'excellent' | 'good' | 'acceptable' | 'issues';

interface StatusCount {
  status: StatusCategory;
  count: number;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

interface ReliabilityQuickStatsProps {
  /** Competency reliability data */
  competencies: CompetencyReliability[];
  /** Handler when a status category is tapped */
  onStatusFilter?: (status: StatusCategory | null) => void;
  /** Currently active filter */
  activeFilter?: StatusCategory | null;
  /** Additional CSS classes */
  className?: string;
}

function categorizeReliability(comp: CompetencyReliability): StatusCategory {
  if (comp.cronbachAlpha == null || comp.reliabilityStatus === 'INSUFFICIENT_DATA') {
    return 'issues'; // Group insufficient data with issues
  }
  if (comp.cronbachAlpha >= 0.8) {
    return 'excellent';
  }
  if (comp.cronbachAlpha >= 0.7) {
    return 'good';
  }
  if (comp.cronbachAlpha >= 0.6) {
    return 'acceptable';
  }
  return 'issues';
}

export function ReliabilityQuickStats({
  competencies,
  onStatusFilter,
  activeFilter,
  className,
}: ReliabilityQuickStatsProps) {
  const statusCounts = useMemo(() => {
    const counts: StatusCount[] = [
      {
        status: 'excellent',
        count: 0,
        label: 'Excellent',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        icon: CheckCircle2,
      },
      {
        status: 'good',
        count: 0,
        label: 'Good',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        icon: CheckCircle2,
      },
      {
        status: 'acceptable',
        count: 0,
        label: 'Acceptable',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        icon: AlertCircle,
      },
      {
        status: 'issues',
        count: 0,
        label: 'Issues',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        icon: XCircle,
      },
    ];

    competencies.forEach(comp => {
      const category = categorizeReliability(comp);
      const index = counts.findIndex(c => c.status === category);
      if (index !== -1) {
        counts[index].count++;
      }
    });

    return counts;
  }, [competencies]);

  const handleClick = (status: StatusCategory) => {
    if (onStatusFilter) {
      onStatusFilter(activeFilter === status ? null : status);
    }
  };

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {statusCounts.map(({ status, count, label, color, bgColor, icon: Icon }) => (
        <button
          key={status}
          type="button"
          className={cn(
            'flex flex-col items-center p-2 rounded-lg transition-all min-h-[56px]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'active:scale-[0.97]',
            activeFilter === status
              ? cn(bgColor, 'ring-1 ring-current/20')
              : 'hover:bg-muted/50'
          )}
          onClick={() => handleClick(status)}
          aria-pressed={activeFilter === status}
          aria-label={`${label}: ${count} competencies`}
        >
          <div className="flex items-center gap-1">
            <Icon className={cn('h-3 w-3', color)} />
            <span className={cn('text-lg font-bold tabular-nums', color)}>
              {count}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Export the categorization function for use in other components
export { categorizeReliability, type StatusCategory };
