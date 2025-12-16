'use client';

import { Badge } from '@/components/ui/badge';
import {
  ItemValidityStatus,
  ItemValidityStatusDisplay
} from '@/types/psychometrics';
import { cn } from '@/lib/utils';

interface ValidityStatusBadgeProps {
  status: ItemValidityStatus;
  className?: string;
  showLabel?: boolean;
}

const statusColorMap: Record<ItemValidityStatus, string> = {
  [ItemValidityStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  [ItemValidityStatus.PROBATION]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  [ItemValidityStatus.RETIRED]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

export function ValidityStatusBadge({
  status,
  className,
  showLabel = true
}: ValidityStatusBadgeProps) {
  const display = ItemValidityStatusDisplay[status];

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
