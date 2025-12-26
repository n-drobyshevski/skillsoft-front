'use client';

import { Badge } from '@/components/ui/badge';
import {
  ReliabilityStatus,
  ReliabilityStatusDisplay
} from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, LucideIcon } from 'lucide-react';

interface ReliabilityStatusBadgeProps {
  status: ReliabilityStatus;
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  iconOnly?: boolean;
  /** Size variant - affects padding and text size */
  size?: 'sm' | 'md';
}

const statusColorMap: Record<ReliabilityStatus, string> = {
  [ReliabilityStatus.RELIABLE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  [ReliabilityStatus.ACCEPTABLE]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  [ReliabilityStatus.UNRELIABLE]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  [ReliabilityStatus.INSUFFICIENT_DATA]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
};

// Icons for accessibility - not relying on color alone
const statusIconMap: Record<ReliabilityStatus, LucideIcon> = {
  [ReliabilityStatus.RELIABLE]: CheckCircle2,
  [ReliabilityStatus.ACCEPTABLE]: AlertTriangle,
  [ReliabilityStatus.UNRELIABLE]: XCircle,
  [ReliabilityStatus.INSUFFICIENT_DATA]: HelpCircle,
};

export function ReliabilityStatusBadge({
  status,
  className,
  showLabel = true,
  showIcon = true,
  iconOnly = false,
  size = 'md',
}: ReliabilityStatusBadgeProps) {
  const display = ReliabilityStatusDisplay[status];
  const Icon = statusIconMap[status];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: '',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        statusColorMap[status],
        'gap-1',
        sizeClasses[size],
        className
      )}
      title={display.description}
    >
      {showIcon && (
        <Icon
          className={cn(
            'shrink-0',
            iconOnly ? 'h-4 w-4' : size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
          )}
          aria-hidden="true"
        />
      )}
      {!iconOnly && (showLabel ? display.label : status)}
      {iconOnly && <span className="sr-only">{display.label}</span>}
    </Badge>
  );
}
