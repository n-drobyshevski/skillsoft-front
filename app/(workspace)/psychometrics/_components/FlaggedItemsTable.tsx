'use client';

import Link from 'next/link';
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
import {
  FlaggedItemSummary,
  DiscriminationFlag,
  DiscriminationFlagDisplay,
  DifficultyFlag,
  DifficultyFlagDisplay
} from '@/types/psychometrics';
import { ValidityStatusBadge } from './ValidityStatusBadge';
import { AlertTriangle, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

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

// Color mapping for discrimination flags
const discriminationColorMap: Record<DiscriminationFlag, string> = {
  [DiscriminationFlag.NEGATIVE]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  [DiscriminationFlag.CRITICAL]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  [DiscriminationFlag.WARNING]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  [DiscriminationFlag.NONE]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
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

function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function FlaggedItemsTable({
  items,
  maxItems = 10,
  showViewAll = true
}: FlaggedItemsTableProps) {
  // Sort by severity (NEGATIVE first, then CRITICAL, then WARNING)
  const sortedItems = [...items].sort((a, b) => {
    const severityA = a.discriminationFlag ? discriminationSeverity[a.discriminationFlag] : 0;
    const severityB = b.discriminationFlag ? discriminationSeverity[b.discriminationFlag] : 0;
    return severityB - severityA;
  });

  const displayItems = sortedItems.slice(0, maxItems);

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

  return (
    <Card>
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Вопрос</TableHead>
              <TableHead>Компетенция</TableHead>
              <TableHead className="text-center">p</TableHead>
              <TableHead className="text-center">rpb</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((item) => (
              <TableRow
                key={item.questionId}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <Link
                    href={`/psychometrics/items/${item.questionId}`}
                    className="hover:underline"
                  >
                    <span title={item.questionTextPreview}>
                      {truncateText(item.questionTextPreview)}
                    </span>
                  </Link>
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
