'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  status?: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral';
  className?: string;
}

/** Map semantic status to Tailwind color overrides applied on top of the outline variant. */
function statusClasses(status: MetricBadgeProps['status']): string {
  switch (status) {
    case 'excellent':
      return 'border-green-500/40 bg-green-500/15 text-green-400';
    case 'good':
      return 'border-blue-500/40 bg-blue-500/15 text-blue-400';
    case 'acceptable':
      return 'border-amber-500/40 bg-amber-500/15 text-amber-400';
    case 'poor':
      return 'border-red-500/40 bg-red-500/15 text-red-400';
    case 'neutral':
    default:
      return 'border-neutral-600 bg-neutral-700/40 text-neutral-400';
  }
}

export function MetricBadge({ label, value, status, className }: MetricBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
        statusClasses(status),
        className,
      )}
    >
      <span className="text-current/60 font-normal">{label}</span>
      <span className="font-semibold">{value}</span>
    </Badge>
  );
}
