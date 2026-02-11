'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UiLink } from '@/components/ui/ui-link';
import { cn } from '@/lib/utils';
import { Files, ExternalLink } from 'lucide-react';
import { ValidityStatusBadge } from './ValidityStatusBadge';
import { ItemValidityStatus, DiscriminationFlag } from '@/types/psychometrics';

export interface SimilarItem {
  /** Question ID */
  questionId: string;
  /** Question text (truncated) */
  questionText: string;
  /** Competency name */
  competencyName?: string;
  /** Validity status */
  validityStatus?: ItemValidityStatus;
  /** Discrimination flag */
  discriminationFlag?: DiscriminationFlag;
  /** Discrimination index value */
  discriminationIndex?: number | null;
  /** Similarity score (0-1) */
  similarityScore?: number;
}

interface SimilarItemsCardProps {
  /** Title for the card */
  title?: string;
  /** Description text */
  description?: string;
  /** List of similar items */
  items: SimilarItem[];
  /** Current item ID to exclude from list */
  currentItemId?: string;
  /** Maximum items to show */
  maxItems?: number;
  /** Additional className */
  className?: string;
  /** Base path for item links */
  basePath?: string;
}

const discriminationFlagColors: Record<DiscriminationFlag, string> = {
  [DiscriminationFlag.NONE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  [DiscriminationFlag.WARNING]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [DiscriminationFlag.CRITICAL]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [DiscriminationFlag.NEGATIVE]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const discriminationFlagLabels: Record<DiscriminationFlag, string> = {
  [DiscriminationFlag.NONE]: 'Норма',
  [DiscriminationFlag.WARNING]: 'Предупреждение',
  [DiscriminationFlag.CRITICAL]: 'Критично',
  [DiscriminationFlag.NEGATIVE]: 'Токсичный',
};

/**
 * SimilarItemCard - Individual item in the list
 */
function SimilarItemRow({
  item,
  basePath = '/psychometrics/items',
}: {
  item: SimilarItem;
  basePath?: string;
}) {
  return (
    <Link
      href={`${basePath}/${item.questionId}`}
      className="group block p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {item.questionText}
          </p>
          {item.competencyName && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {item.competencyName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.validityStatus && (
            <ValidityStatusBadge
              status={item.validityStatus}
              showLabel={false}
              size="sm"
            />
          )}
          {item.discriminationFlag && item.discriminationFlag !== DiscriminationFlag.NONE && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                discriminationFlagColors[item.discriminationFlag]
              )}
            >
              {discriminationFlagLabels[item.discriminationFlag]}
            </Badge>
          )}
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        {item.discriminationIndex !== undefined && item.discriminationIndex !== null && (
          <span className="text-xs text-muted-foreground">
            rpb: <span className="font-mono">{item.discriminationIndex.toFixed(2)}</span>
          </span>
        )}
        {item.similarityScore !== undefined && (
          <span className="text-xs text-muted-foreground">
            Сходство: <span className="font-mono">{(item.similarityScore * 100).toFixed(0)}%</span>
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * SimilarItemsCard - Card displaying related/similar flagged items
 *
 * Shows a list of items that share similar issues or characteristics,
 * helping identify patterns in problematic items.
 */
export function SimilarItemsCard({
  title = 'Похожие элементы',
  description,
  items,
  currentItemId,
  maxItems = 5,
  className,
  basePath = '/psychometrics/items',
}: SimilarItemsCardProps) {
  // Filter out current item and limit
  const filteredItems = items
    .filter((item) => item.questionId !== currentItemId)
    .slice(0, maxItems);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Files className="h-4 w-4" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <SimilarItemRow
              key={item.questionId}
              item={item}
              basePath={basePath}
            />
          ))}
        </div>
        {items.length > maxItems && (
          <div className="mt-4 text-center">
            <UiLink
              href={`${basePath}?status=FLAGGED_FOR_REVIEW`}
              variant="muted"
              size="sm"
            >
              Показать все ({items.length - maxItems} еще)
            </UiLink>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * FlaggedItemsList - Simplified list without card wrapper
 */
export function FlaggedItemsList({
  items,
  currentItemId,
  maxItems = 5,
  className,
  basePath = '/psychometrics/items',
}: Omit<SimilarItemsCardProps, 'title' | 'description'>) {
  const filteredItems = items
    .filter((item) => item.questionId !== currentItemId)
    .slice(0, maxItems);

  if (filteredItems.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {filteredItems.map((item) => (
        <SimilarItemRow
          key={item.questionId}
          item={item}
          basePath={basePath}
        />
      ))}
    </div>
  );
}
