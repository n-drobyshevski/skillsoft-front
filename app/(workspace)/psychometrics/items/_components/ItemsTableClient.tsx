'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ItemStatistics,
  ItemValidityStatus,
  ItemValidityStatusDisplay,
  Page,
} from '@/types/psychometrics';
import { Competency } from '@/types/domain';
import { ValidityStatusBadge } from '../../_components/ValidityStatusBadge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText
} from 'lucide-react';

interface ItemsTableClientProps {
  initialItems: Page<ItemStatistics>;
  competencies: Competency[];
  currentStatus?: ItemValidityStatus;
  currentCompetencyId?: string;
  currentPage: number;
}

const statusTabs: Array<{ value: string; label: string; count?: number }> = [
  { value: 'all', label: 'Все' },
  { value: ItemValidityStatus.ACTIVE, label: ItemValidityStatusDisplay[ItemValidityStatus.ACTIVE].label },
  { value: ItemValidityStatus.PROBATION, label: ItemValidityStatusDisplay[ItemValidityStatus.PROBATION].label },
  { value: ItemValidityStatus.FLAGGED_FOR_REVIEW, label: ItemValidityStatusDisplay[ItemValidityStatus.FLAGGED_FOR_REVIEW].label },
  { value: ItemValidityStatus.RETIRED, label: ItemValidityStatusDisplay[ItemValidityStatus.RETIRED].label },
];

function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function ItemsTableClient({
  initialItems,
  competencies,
  currentStatus,
  currentCompetencyId,
  currentPage,
}: ItemsTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Build URL with search params
  const buildUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all') {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      return `/psychometrics/items?${newParams.toString()}`;
    },
    [searchParams]
  );

  const handleStatusChange = (value: string) => {
    router.push(buildUrl({ status: value === 'all' ? undefined : value, page: '0' }));
  };

  const handleCompetencyChange = (value: string) => {
    router.push(buildUrl({ competencyId: value === 'all' ? undefined : value, page: '0' }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page.toString() }));
  };

  const { content: items, totalElements, totalPages, number: pageNumber, first, last } = initialItems;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={currentStatus || 'all'} onValueChange={handleStatusChange}>
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select
          value={currentCompetencyId || 'all'}
          onValueChange={handleCompetencyChange}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Все компетенции" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все компетенции</SelectItem>
            {competencies.map((competency) => (
              <SelectItem key={competency.id} value={competency.id}>
                {competency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Найдено: {totalElements} элементов
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Элементы не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">
                Попробуйте изменить фильтры
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Вопрос</TableHead>
                  <TableHead>Компетенция</TableHead>
                  <TableHead className="text-center">p</TableHead>
                  <TableHead className="text-center">rpb</TableHead>
                  <TableHead className="text-center">Ответы</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <Link
                        href={`/psychometrics/items/${item.questionId}`}
                        className="hover:underline font-medium"
                      >
                        <span title={item.questionText}>
                          {truncateText(item.questionText)}
                        </span>
                      </Link>
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
                    <TableCell className="text-center font-mono text-sm">
                      <span
                        className={
                          item.discriminationIndex != null
                            ? item.discriminationIndex < 0
                              ? 'text-red-600'
                              : item.discriminationIndex < 0.1
                                ? 'text-orange-600'
                                : item.discriminationIndex < 0.25
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                            : ''
                        }
                      >
                        {item.discriminationIndex != null ? item.discriminationIndex.toFixed(2) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.responseCount}
                    </TableCell>
                    <TableCell>
                      <ValidityStatusBadge status={item.validityStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Страница {pageNumber + 1} из {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(0)}
              disabled={first}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={first}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={last}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={last}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
