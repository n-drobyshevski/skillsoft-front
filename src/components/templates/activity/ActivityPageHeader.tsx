'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';

export interface ActivityPageHeaderProps {
  /** Template name to display */
  templateName: string;
  /** Optional className */
  className?: string;
}

/**
 * ActivityPageHeader - Compact responsive header for activity page.
 *
 * Features:
 * - Mobile: Compact layout with icon
 * - Desktop: Full title with description
 * - Template name with truncation on mobile
 */
export function ActivityPageHeader({
  templateName,
  className,
}: ActivityPageHeaderProps) {
  const t = useTranslations('activity');

  return (
    <div className={cn('space-y-1', className)}>
      {/* Title row */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
        <h1 className="text-lg md:text-2xl font-bold tracking-tight">
          {t('templateActivity')}
        </h1>
      </div>

      {/* Template name */}
      <p className="text-sm md:text-base text-muted-foreground truncate pl-10 md:pl-11">
        {templateName}
      </p>
    </div>
  );
}

export default ActivityPageHeader;
