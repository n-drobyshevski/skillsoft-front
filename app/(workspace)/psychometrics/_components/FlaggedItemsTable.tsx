'use client';

import Link from 'next/link';
import { UiLink } from '@/components/ui/ui-link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  FlaggedItemSummary,
  DiscriminationFlag,
  DiscriminationFlagDisplay,
  DifficultyFlag,
  DifficultyFlagDisplay
} from '@/types/psychometrics';
import { ValidityStatusBadge } from './ValidityStatusBadge';
import { TableHeaderWithHelp } from './PsychometricHelpTooltip';
import { AlertTriangle, ArrowRight, TrendingDown, TrendingUp, ChevronRight } from 'lucide-react';

interface FlaggedItemsTableProps {
  items: FlaggedItemSummary[];
  maxItems?: number;
  showViewAll?: boolean;
}

// Severity order for sorting
const discriminationSeverity: Record<DiscriminationFlag, number> = {
  [DiscriminationFlag.NEGATIVE]: 4,
  [DiscriminationFlag.CRITICAL]: 3,
  [DiscriminationFlag.WARNING]: 2,
  [DiscriminationFlag.NONE]: 1,
};

// Color mapping for discrimination flags - badges
const discriminationColorMap: Record<DiscriminationFlag, string> = {
  [DiscriminationFlag.NEGATIVE]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  [DiscriminationFlag.CRITICAL]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  [DiscriminationFlag.WARNING]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  [DiscriminationFlag.NONE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
};

// Severity strip colors for left border indicator
const severityStripColors: Record<DiscriminationFlag, string> = {
  [DiscriminationFlag.NEGATIVE]: 'bg-red-500 dark:bg-red-400',
  [DiscriminationFlag.CRITICAL]: 'bg-orange-500 dark:bg-orange-400',
  [DiscriminationFlag.WARNING]: 'bg-amber-500 dark:bg-amber-400',
  [DiscriminationFlag.NONE]: 'bg-emerald-500 dark:bg-emerald-400',
};

function DiscriminationBadge({ flag }: { flag: DiscriminationFlag | null }) {
  if (!flag) return <span className="text-muted-foreground">-</span>;
  const display = DiscriminationFlagDisplay[flag];

  return (
    <Badge variant="outline" className={discriminationColorMap[flag]} title={display.description}>
      {display.label}
    </Badge>
  );
}

function DifficultyBadge({ flag }: { flag: DifficultyFlag | null }) {
  if (!flag || flag === DifficultyFlag.NONE) {
    return <span className="text-muted-foreground">-</span>;
  }
  const display = DifficultyFlagDisplay[flag];

  return (
    <Badge
      variant="outline"
      className={
        flag === DifficultyFlag.TOO_HARD
          ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
      }
      title={display.description}
    >
      {flag === DifficultyFlag.TOO_HARD ? (
        <TrendingDown className="h-3 w-3 mr-1" />
      ) : (
        <TrendingUp className="h-3 w-3 mr-1" />
      )}
      {display.label}
    </Badge>
  );
}

function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Mobile flagged item card - ultra-compact with severity strip
function MobileFlaggedItemCard({ item }: { item: FlaggedItemSummary }) {
  const discriminationDisplay = item.discriminationFlag
    ? DiscriminationFlagDisplay[item.discriminationFlag]
    : null;
  const severityFlag = item.discriminationFlag ?? DiscriminationFlag.NONE;
  const severityLabel = discriminationDisplay?.label ?? 'Normal';

  return (
    <Link
      href={`/psychometrics/items/${item.questionId}`}
      className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      aria-label={`${item.questionText?.slice(0, 50) ?? 'Вопрос'}, сложность: ${item.difficultyIndex?.toFixed(2) ?? 'н/д'}, различение: ${item.discriminationIndex?.toFixed(2) ?? 'н/д'}, статус: ${severityLabel}`}
    >
      <div className="flex items-center min-h-[44px] rounded-md border bg-card hover:bg-muted/50 active:scale-[0.98] transition-all overflow-hidden w-full">
        {/* Severity indicator strip */}
        <div className={cn("w-1 self-stretch shrink-0", severityStripColors[severityFlag])} aria-hidden="true" />

        {/* Content */}
        <div className="flex-1 min-w-0 px-2 py-1.5 overflow-hidden">
          <p className="text-sm font-medium leading-normal line-clamp-2">
            {item.questionText}
          </p>

          <div className="flex items-center gap-1.5 mt-0.5 min-w-0 overflow-hidden">
            <span className="text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
              p:{item.difficultyIndex?.toFixed(2) ?? '-'}
            </span>
            <span className={cn(
              "text-[11px] font-mono tabular-nums shrink-0",
              item.discriminationIndex != null && item.discriminationIndex < 0
                ? "text-red-600 dark:text-red-400 font-medium"
                : item.discriminationIndex != null && item.discriminationIndex < 0.25
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground"
            )}>
              rpb:{item.discriminationIndex?.toFixed(2) ?? '-'}
            </span>
            {item.discriminationFlag && item.discriminationFlag !== DiscriminationFlag.NONE && (
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1 py-0 h-4 ml-auto shrink-0 truncate max-w-[60px]", discriminationColorMap[item.discriminationFlag])}
              >
                {discriminationDisplay?.label}
              </Badge>
            )}
          </div>
        </div>

        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0 mr-2" />
      </div>
    </Link>
  );
}

export function FlaggedItemsTable({
  items,
  maxItems = 10,
  showViewAll = true
}: FlaggedItemsTableProps) {
  const isMobile = useIsMobile();

  // Sort by severity (NEGATIVE first, then CRITICAL, then WARNING)
  const sortedItems = [...items].sort((a, b) => {
    const severityA = a.discriminationFlag ? discriminationSeverity[a.discriminationFlag] : 0;
    const severityB = b.discriminationFlag ? discriminationSeverity[b.discriminationFlag] : 0;
    return severityB - severityA;
  });

  // Show only 3 items on mobile for compact layout, maxItems on desktop
  const mobileMaxItems = 3;
  const displayItems = sortedItems.slice(0, isMobile ? mobileMaxItems : maxItems);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Нет проблемных элементов</p>
            <p className="text-sm">Все элементы оценки работают корректно</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile card list view - ultra-compact with severity-sorted display
  if (isMobile) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-1.5 px-2.5 pt-2.5">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            Flagged
          </CardTitle>
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 text-[10px] px-1.5 py-0 h-4">
            {items.length}
          </Badge>
        </CardHeader>
        <CardContent className="px-2.5 pb-2.5 pt-0 overflow-hidden">
          <div
            className="space-y-1.5 w-full"
            role="list"
            aria-label="Проблемные элементы"
          >
            {displayItems.map((item) => (
              <div key={item.questionId} role="listitem">
                <MobileFlaggedItemCard item={item} />
              </div>
            ))}
          </div>
          {showViewAll && items.length > mobileMaxItems && (
            <Link href="/psychometrics/flagged">
              <Button variant="ghost" size="sm" className="w-full mt-1.5 min-h-[44px] text-xs gap-1">
                View all {items.length}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  // Desktop table view
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Проблемные элементы
        </CardTitle>
        {showViewAll && items.length > maxItems && (
          <Link href="/psychometrics/flagged">
            <Button variant="ghost" size="sm" className="gap-1">
              Все ({items.length})
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Вопрос</TableHead>
              <TableHead>Компетенция</TableHead>
              <TableHead className="text-center">
                <TableHeaderWithHelp label="p" helpKey="difficulty" />
              </TableHead>
              <TableHead className="text-center">
                <TableHeaderWithHelp label="rpb" helpKey="discrimination" />
              </TableHead>
              <TableHead>
                <TableHeaderWithHelp label="Статус" helpKey="validityStatus" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((item) => (
              <TableRow
                key={item.questionId}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <UiLink
                    href={`/psychometrics/items/${item.questionId}`}
                    variant="primary"
                  >
                    <span title={item.questionText ?? ''}>
                      {truncateText(item.questionText)}
                    </span>
                  </UiLink>
                  {item.difficultyFlag && item.difficultyFlag !== DifficultyFlag.NONE && (
                    <div className="mt-1">
                      <DifficultyBadge flag={item.difficultyFlag} />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{item.competencyName}</span>
                  {item.indicatorTitle && (
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={item.indicatorTitle}>
                      {item.indicatorTitle}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {item.difficultyIndex != null ? item.difficultyIndex.toFixed(2) : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-sm">
                      {item.discriminationIndex != null ? item.discriminationIndex.toFixed(2) : '-'}
                    </span>
                    <DiscriminationBadge flag={item.discriminationFlag} />
                  </div>
                </TableCell>
                <TableCell>
                  <ValidityStatusBadge status={item.validityStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
