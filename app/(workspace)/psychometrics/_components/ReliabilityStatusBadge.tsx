'use client';

import { Badge } from '@/components/ui/badge';
import {
  ReliabilityStatus,
  ReliabilityStatusDisplay
} from '@/types/psychometrics';
import { cn } from '@/lib/utils';

interface ReliabilityStatusBadgeProps {
  status: ReliabilityStatus;
  className?: string;
  showLabel?: boolean;
}

const statusColorMap: Record<ReliabilityStatus, string> = {
  [ReliabilityStatus.RELIABLE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  [ReliabilityStatus.ACCEPTABLE]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  [ReliabilityStatus.UNRELIABLE]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  [ReliabilityStatus.INSUFFICIENT_DATA]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
};

export function ReliabilityStatusBadge({
  status,
  className,
  showLabel = true
}: ReliabilityStatusBadgeProps) {
  const display = ReliabilityStatusDisplay[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        statusColorMap[status],
        className
      )}
      title={display.description}
    >
      {showLabel ? display.label : status}
    </Badge>
  );
}
