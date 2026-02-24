'use client';

import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface WarningBadgeProps {
  count: number;
  hasErrors: boolean;
  className?: string;
}

/**
 * Compact badge showing the number of warnings/errors on a competency card.
 * Returns null when count is zero.
 */
export function WarningBadge({ count, hasErrors, className }: WarningBadgeProps) {
  const t = useTranslations('builder.card');

  if (count === 0) return null;

  return (
    <Badge
      variant={hasErrors ? 'destructive' : 'outline'}
      aria-label={t('warningsCount', { count })}
      className={cn(
        'flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5',
        !hasErrors && 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        className
      )}
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{count}</span>
    </Badge>
  );
}
