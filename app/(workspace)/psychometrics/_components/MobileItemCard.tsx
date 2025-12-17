'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ItemStatistics, ItemValidityStatus } from '@/types/psychometrics';
import { ValidityStatusBadge } from './ValidityStatusBadge';
import { MetricBadge } from './MetricCell';
import { ChevronRight } from 'lucide-react';

interface MobileItemCardProps {
  item: ItemStatistics;
  isSelected: boolean;
  onToggle: (id: string) => void;
  className?: string;
}

/**
 * Get left border color based on item validity status
 */
function getStatusBorderColor(status: ItemValidityStatus): string {
  switch (status) {
    case ItemValidityStatus.ACTIVE:
      return 'border-l-emerald-500';
    case ItemValidityStatus.PROBATION:
      return 'border-l-amber-500';
    case ItemValidityStatus.FLAGGED_FOR_REVIEW:
      return 'border-l-orange-500';
    case ItemValidityStatus.RETIRED:
      return 'border-l-red-500';
    default:
      return 'border-l-transparent';
  }
}

/**
 * MobileItemCard - Mobile-optimized card view for psychometric items
 * Shows question text, competency, metrics, and status in a touch-friendly layout.
 * Minimum 44px touch targets for selection and navigation.
 */
export function MobileItemCard({
  item,
  isSelected,
  onToggle,
  className,
}: MobileItemCardProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(item.id);
  };

  return (
    <Card
      className={cn(
        'relative transition-all border-l-4',
        getStatusBorderColor(item.validityStatus),
        isSelected
          ? 'bg-primary/5 border-primary/30 shadow-sm'
          : 'hover:bg-muted/50',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-3">
          {/* Checkbox with 44px touch target */}
          <div
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 cursor-pointer"
            onClick={handleCheckboxClick}
            role="button"
            aria-label={`Select item: ${item.questionText.slice(0, 30)}`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(item.id)}
              className="h-5 w-5"
              aria-label={`Select item`}
            />
          </div>

          {/* Main content */}
          <Link
            href={`/psychometrics/items/${item.questionId}`}
            className="flex-1 min-w-0 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Question text - 3 line clamp */}
                <p className="text-sm font-medium text-foreground line-clamp-3 group-hover:text-primary transition-colors">
                  {item.questionText}
                </p>

                {/* Competency and indicator */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.competencyName}
                  </span>
                  {item.indicatorTitle && (
                    <>
                      <span className="text-xs text-muted-foreground/50">|</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {item.indicatorTitle}
                      </span>
                    </>
                  )}
                </div>

                {/* Metrics row */}
                <div className="mt-2 flex items-center gap-3">
                  {/* Difficulty (p) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">p</span>
                    <MetricBadge
                      value={item.difficultyIndex}
                      type="difficulty"
                      size="sm"
                    />
                  </div>

                  {/* Discrimination (rpb) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">rpb</span>
                    <MetricBadge
                      value={item.discriminationIndex}
                      type="discrimination"
                      size="sm"
                    />
                  </div>

                  {/* Response count */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {item.responseCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ответов
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: Status badge and chevron */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <ValidityStatusBadge status={item.validityStatus} />
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MobileItemCardList - Container for mobile item cards with proper spacing
 */
interface MobileItemCardListProps {
  items: ItemStatistics[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
}

export function MobileItemCardList({
  items,
  selectedIds,
  onToggle,
  className,
}: MobileItemCardListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <MobileItemCard
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default MobileItemCard;
