'use client';

/**
 * AlphaIfDeletedList - Responsive list/table for Alpha-if-Deleted analysis
 *
 * Features:
 * - Mobile: Card-based list with touch-friendly targets
 * - Desktop: Full table with detailed information
 * - Expandable list with "Show all" button
 * - Color-coded improvements (positive/negative/neutral)
 * - WCAG 2.1 AA accessible
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UiLink } from '@/components/ui/ui-link';
import {
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AlphaIfDeletedEntry } from '@/types/psychometrics';

// ============================================
// TYPES
// ============================================

interface AlphaIfDeletedListProps {
  /** Sorted entries from sortAlphaIfDeleted utility */
  entries: Array<[string, AlphaIfDeletedEntry]>;
  /** Current Cronbach's Alpha for comparison */
  currentAlpha: number | null;
  /** Initial number of items to show (default: 5) */
  initialDisplayCount?: number;
  /** Optional className */
  className?: string;
  /** Show as card with header (default: true) */
  showCard?: boolean;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get improvement status and styling
 */
function getImprovementStatus(improvement: number): {
  type: 'positive' | 'negative' | 'neutral';
  Icon: typeof TrendingUp;
  colorClass: string;
  badgeClass: string;
  label: string;
} {
  if (improvement > 0.01) {
    return {
      type: 'positive',
      Icon: TrendingUp,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
      label: 'Улучшит Alpha',
    };
  }
  if (improvement < -0.01) {
    return {
      type: 'negative',
      Icon: TrendingDown,
      colorClass: 'text-red-600 dark:text-red-400',
      badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
      label: 'Важен для шкалы',
    };
  }
  return {
    type: 'neutral',
    Icon: Minus,
    colorClass: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
    label: 'Нейтрален',
  };
}

/**
 * Format improvement value with sign
 */
function formatImprovement(improvement: number): string {
  const sign = improvement > 0 ? '+' : '';
  return `${sign}${improvement.toFixed(3)}`;
}

// ============================================
// MOBILE CARD COMPONENT
// ============================================

interface AlphaIfDeletedCardProps {
  questionId: string;
  entry: AlphaIfDeletedEntry;
  currentAlpha: number | null;
}

function AlphaIfDeletedCard({ questionId, entry, currentAlpha }: AlphaIfDeletedCardProps) {
  const status = getImprovementStatus(entry.improvement);
  const isProblematic = entry.improvement > 0.01;

  return (
    <Link
      href={`/psychometrics/items/${questionId}`}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg text-left',
        'min-h-[52px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isProblematic
          ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
          : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
      )}
      aria-label={`${entry.questionText}. Alpha без элемента: ${entry.alphaIfDeleted.toFixed(3)}. Изменение: ${formatImprovement(entry.improvement)}`}
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-medium line-clamp-2">{entry.questionText}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Alpha без:{' '}
          <span className={cn('font-mono', status.colorClass)}>
            {entry.alphaIfDeleted.toFixed(3)}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={status.badgeClass}>
          {formatImprovement(entry.improvement)}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  );
}

// ============================================
// MOBILE LIST COMPONENT
// ============================================

interface MobileListProps {
  entries: Array<[string, AlphaIfDeletedEntry]>;
  currentAlpha: number | null;
  initialDisplayCount: number;
}

function MobileList({ entries, currentAlpha, initialDisplayCount }: MobileListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMore = entries.length > initialDisplayCount;
  const displayEntries = isExpanded ? entries : entries.slice(0, initialDisplayCount);

  return (
    <div className="space-y-2">
      {displayEntries.map(([questionId, entry]) => (
        <AlphaIfDeletedCard
          key={questionId}
          questionId={questionId}
          entry={entry}
          currentAlpha={currentAlpha}
        />
      ))}

      {/* Expand/Collapse Button */}
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 min-h-[44px]"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="alpha-if-deleted-list"
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 mr-2 transition-transform',
              isExpanded && 'rotate-180'
            )}
            aria-hidden="true"
          />
          {isExpanded
            ? 'Свернуть список'
            : `Показать еще ${entries.length - initialDisplayCount} элементов`}
        </Button>
      )}

      {/* Legend */}
      <AlphaIfDeletedLegend />
    </div>
  );
}

// ============================================
// DESKTOP TABLE COMPONENT
// ============================================

interface DesktopTableProps {
  entries: Array<[string, AlphaIfDeletedEntry]>;
  currentAlpha: number | null;
}

function DesktopTable({ entries, currentAlpha }: DesktopTableProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Вопрос</TableHead>
            <TableHead className="text-right">Alpha без элемента</TableHead>
            <TableHead className="text-right">Изменение</TableHead>
            <TableHead className="text-right w-[100px]">Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(([questionId, entry]) => {
            const status = getImprovementStatus(entry.improvement);
            const isProblematic = entry.improvement > 0.01;

            return (
              <TableRow
                key={questionId}
                className={cn(
                  isProblematic && 'bg-amber-50/50 dark:bg-amber-950/10'
                )}
              >
                <TableCell>
                  <UiLink
                    href={`/psychometrics/items/${questionId}`}
                    variant="primary"
                    className="line-clamp-2"
                  >
                    {entry.questionText}
                  </UiLink>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn('font-mono text-sm', status.colorClass)}>
                    {entry.alphaIfDeleted.toFixed(3)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={status.badgeClass}>
                    {formatImprovement(entry.improvement)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <status.Icon className={cn('h-4 w-4', status.colorClass)} aria-hidden="true" />
                    <span className="sr-only">{status.label}</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Legend */}
      <AlphaIfDeletedLegend />
    </div>
  );
}

// ============================================
// LEGEND COMPONENT
// ============================================

function AlphaIfDeletedLegend() {
  return (
    <div
      className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground"
      role="note"
      aria-label="Легенда интерпретации"
    >
      <p className="flex items-center gap-2 font-medium">
        <Info className="h-3 w-3" aria-hidden="true" />
        Как интерпретировать:
      </p>
      <ul className="mt-1.5 ml-5 space-y-0.5 list-disc">
        <li>
          <span className="text-emerald-600 dark:text-emerald-400">Положительное</span> — удаление
          элемента повысит Alpha
        </li>
        <li>
          <span className="text-red-600 dark:text-red-400">Отрицательное</span> — элемент важен для
          согласованности шкалы
        </li>
        <li>Близко к нулю — элемент нейтрален</li>
      </ul>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AlphaIfDeletedList({
  entries,
  currentAlpha,
  initialDisplayCount = 5,
  className,
  showCard = true,
  title = 'Alpha если элемент удален',
  description = 'Показывает влияние каждого элемента на общую надежность шкалы',
}: AlphaIfDeletedListProps) {
  const isMobile = useIsMobile();

  // Memoize problematic count
  const problematicCount = useMemo(
    () => entries.filter(([, e]) => e.improvement > 0.01).length,
    [entries]
  );

  // Empty state
  if (entries.length === 0) {
    return null;
  }

  const content = isMobile ? (
    <MobileList
      entries={entries}
      currentAlpha={currentAlpha}
      initialDisplayCount={initialDisplayCount}
    />
  ) : (
    <DesktopTable entries={entries} currentAlpha={currentAlpha} />
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {problematicCount > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
          ) : (
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          )}
          {title}
          {problematicCount > 0 && (
            <Badge
              variant="outline"
              className="ml-auto bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {problematicCount} требуют внимания
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// ============================================
// COMPACT VARIANT FOR EMBEDDED USE
// ============================================

interface AlphaIfDeletedCompactProps {
  entries: Array<[string, AlphaIfDeletedEntry]>;
  currentAlpha: number | null;
  maxItems?: number;
  className?: string;
}

/**
 * Compact version showing only top problematic items
 */
export function AlphaIfDeletedCompact({
  entries,
  currentAlpha,
  maxItems = 3,
  className,
}: AlphaIfDeletedCompactProps) {
  // Sort by improvement descending and take top items
  const topItems = entries
    .filter(([, e]) => e.improvement > 0)
    .slice(0, maxItems);

  if (topItems.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {topItems.map(([questionId, entry]) => (
        <AlphaIfDeletedCard
          key={questionId}
          questionId={questionId}
          entry={entry}
          currentAlpha={currentAlpha}
        />
      ))}
    </div>
  );
}

export default AlphaIfDeletedList;
