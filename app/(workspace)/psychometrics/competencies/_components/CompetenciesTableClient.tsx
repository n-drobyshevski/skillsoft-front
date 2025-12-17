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
import {
  CompetencyReliability,
  ReliabilityStatus,
  Page,
} from '@/types/psychometrics';
import {
  ReliabilityStatusBadge,
  ReliabilityFilterPills,
  TableHeaderWithHelp,
  NoItemsFound,
  NoDataYet,
  ReliabilityGaugeMini,
  MobileCompetencyCardList,
} from '../../_components';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CompetenciesTableClientProps {
  initialData: Page<CompetencyReliability>;
  currentStatus?: ReliabilityStatus;
  currentPage: number;
}

// Get left border color based on reliability status
function getStatusBorderColor(status: ReliabilityStatus): string {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return 'border-l-emerald-500';
    case ReliabilityStatus.ACCEPTABLE:
      return 'border-l-amber-500';
    case ReliabilityStatus.UNRELIABLE:
      return 'border-l-red-500';
    case ReliabilityStatus.INSUFFICIENT_DATA:
    default:
      return 'border-l-gray-300 dark:border-l-gray-600';
  }
}

// Alpha color helper for the progress bar
function getAlphaColorClasses(alpha: number | null): {
  bar: string;
  text: string;
  bg: string;
} {
  if (alpha === null) {
    return {
      bar: 'bg-gray-300 dark:bg-gray-600',
      text: 'text-gray-500',
      bg: 'bg-gray-100 dark:bg-gray-800',
    };
  }
  if (alpha >= 0.7) {
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    };
  }
  if (alpha >= 0.6) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    };
  }
  return {
    bar: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  };
}

export function CompetenciesTableClient({
  initialData,
  currentStatus,
  currentPage,
}: CompetenciesTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

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

      return `/psychometrics/competencies?${newParams.toString()}`;
    },
    [searchParams]
  );

  const handleStatusChange = (value: string) => {
    router.push(buildUrl({ status: value === 'all' ? undefined : value, page: '0' }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page.toString() }));
  };

  const handleClearFilters = () => {
    router.push('/psychometrics/competencies');
  };

  const { content: competencies, totalElements, totalPages, number: pageNumber, first, last } = initialData;

  // Determine empty state type
  const isFiltering = !!currentStatus;
  const hasNoData = totalElements === 0 && !isFiltering;
  const hasNoResults = competencies.length === 0 && isFiltering;

  return (
    <div className="space-y-4">
      {/* Filters - Colored Pills */}
      <ReliabilityFilterPills
        value={currentStatus || 'all'}
        onChange={handleStatusChange}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Найдено: {totalElements} компетенций
      </div>

      {/* Table / Mobile Card List */}
      {hasNoData ? (
        <Card>
          <CardContent className="p-0">
            <NoDataYet entityName="данных о надежности" />
          </CardContent>
        </Card>
      ) : hasNoResults ? (
        <Card>
          <CardContent className="p-0">
            <NoItemsFound onClearFilters={handleClearFilters} />
          </CardContent>
        </Card>
      ) : isMobile ? (
        /* Mobile: Card List */
        <MobileCompetencyCardList competencies={competencies} />
      ) : (
        /* Desktop: Table */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Компетенция</TableHead>
                  <TableHead className="text-center w-[20%]">
                    <TableHeaderWithHelp
                      label="Cronbach's Alpha"
                      helpKey="cronbachAlpha"
                    />
                  </TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp
                      label="Выборка"
                      helpKey="sampleSize"
                    />
                  </TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp
                      label="Вопросы"
                      helpKey="itemCount"
                    />
                  </TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[80px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competencies.map((comp) => {
                  const alphaColors = getAlphaColorClasses(comp.cronbachAlpha);

                  return (
                    <TableRow
                      key={comp.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        'hover:bg-muted/50',
                        'border-l-4',
                        getStatusBorderColor(comp.reliabilityStatus)
                      )}
                    >
                      <TableCell>
                        <Link
                          href={`/psychometrics/competencies/${comp.competencyId}`}
                          className="hover:underline font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {comp.competencyName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Alpha value with gauge */}
                          <ReliabilityGaugeMini value={comp.cronbachAlpha} />
                          {/* Progress bar indicator */}
                          <div className={cn('w-full max-w-[80px] h-1.5 rounded-full', alphaColors.bg)}>
                            <div
                              className={cn('h-full rounded-full transition-all', alphaColors.bar)}
                              style={{
                                width: comp.cronbachAlpha != null
                                  ? `${Math.min(comp.cronbachAlpha * 100, 100)}%`
                                  : '0%',
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {comp.sampleSize?.toLocaleString() ?? '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {comp.itemCount ?? '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ReliabilityStatusBadge status={comp.reliabilityStatus} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Link
                            href={`/psychometrics/items?competencyId=${comp.competencyId}`}
                            title="Просмотреть вопросы этой компетенции"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="text-xs">Вопросы</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Страница {pageNumber + 1} из {totalPages}
          </div>
          <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(0)}
              disabled={first}
              title="Первая страница"
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronsLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={first}
              title="Предыдущая страница"
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            {/* Mobile page indicator */}
            <div className="flex items-center justify-center min-w-[60px] sm:hidden">
              <span className="text-sm font-medium">
                {pageNumber + 1} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={last}
              title="Следующая страница"
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={last}
              title="Последняя страница"
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronsRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
