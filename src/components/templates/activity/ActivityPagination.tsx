'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ActivityPaginationProps {
  /** Current page (0-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of elements */
  totalElements: number;
  /** Page size */
  pageSize: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Whether this is the first page */
  isFirst: boolean;
  /** Whether this is the last page */
  isLast: boolean;
  /** Optional className */
  className?: string;
}

/**
 * ActivityPagination - Responsive pagination for activity list.
 *
 * Features:
 * - Sticky on mobile with safe area padding
 * - Shows "1-10 of 42" format
 * - Previous/Next buttons with 44px touch targets
 * - Disabled states for first/last page
 */
export function ActivityPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFirst,
  isLast,
  className,
}: ActivityPaginationProps) {
  const t = useTranslations('activity.pagination');

  // Calculate display range
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        // Base styles
        'flex items-center justify-between',
        // Padding
        'pt-4 mt-4 border-t',
        // Mobile: sticky at bottom with safe area
        'md:static',
        'sticky bottom-0 bg-background/95 backdrop-blur-sm',
        'pb-safe px-1',
        className
      )}
    >
      {/* Page info */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{from}-{to}</span>
        {' '}{t('of')}{' '}
        <span className="font-medium text-foreground">{totalElements}</span>
      </p>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 min-h-[44px] min-w-[44px]"
          disabled={isFirst}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          aria-label={t('previous')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 min-h-[44px] min-w-[44px]"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default ActivityPagination;
