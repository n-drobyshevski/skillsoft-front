'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ActivityCard } from './ActivityCard';
import { FileQuestion } from 'lucide-react';
import type { TestActivity } from '@/types/activity';

export interface ActivityCardListProps {
  /** Activity data to display */
  data: TestActivity[];
  /** Optional className */
  className?: string;
}

/**
 * ActivityCardList - Mobile card list for activity items.
 *
 * Features:
 * - Renders ActivityCard for each item
 * - Proper spacing between cards
 * - Empty state handling
 * - Touch-optimized layout
 */
export function ActivityCardList({ data, className }: ActivityCardListProps) {
  const t = useTranslations('activity');

  if (data.length === 0) {
    return <ActivityEmptyState />;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {data.map((activity) => (
        <ActivityCard key={activity.sessionId} activity={activity} />
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function ActivityEmptyState() {
  const t = useTranslations('activity.empty');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">{t('title')}</h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        {t('description')}
      </p>
    </div>
  );
}

export default ActivityCardList;
