'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  CompetencyReliability,
  ReliabilityStatus,
  Page,
} from '@/types/psychometrics';
import {
  ReliabilityStatusBadge,
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Tab configuration for reliability status filtering
type StatusTabValue = 'all' | ReliabilityStatus;

interface TabConfig {
  value: StatusTabValue;
  labelKey: string;
  shortLabelKey: string;
}

const STATUS_TABS: TabConfig[] = [
  { value: 'all', labelKey: 'all', shortLabelKey: 'allShort' },
  { value: ReliabilityStatus.RELIABLE, labelKey: 'reliable', shortLabelKey: 'reliableShort' },
  { value: ReliabilityStatus.ACCEPTABLE, labelKey: 'acceptable', shortLabelKey: 'acceptableShort' },
  { value: ReliabilityStatus.UNRELIABLE, labelKey: 'unreliable', shortLabelKey: 'unreliableShort' },
  { value: ReliabilityStatus.INSUFFICIENT_DATA, labelKey: 'insufficientData', shortLabelKey: 'insufficientDataShort' },
];

// Get tab badge color based on status
function getTabBadgeClass(value: StatusTabValue, isActive: boolean): string {
  if (isActive) return 'bg-primary text-primary-foreground';

  switch (value) {
    case ReliabilityStatus.RELIABLE:
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case ReliabilityStatus.ACCEPTABLE:
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case ReliabilityStatus.UNRELIABLE:
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case ReliabilityStatus.INSUFFICIENT_DATA:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('psychometrics');

  // Optimistic tab state for instant UI feedback
  const urlTab: StatusTabValue = (currentStatus as StatusTabValue) || 'all';
  const [optimisticTab, setOptimisticTab] = useState<StatusTabValue>(urlTab);
  const activeTab = optimisticTab;

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

      const queryString = newParams.toString();
      return `${pathname}${queryString ? `?${queryString}` : ''}`;
    },
    [searchParams, pathname]
  );

  // Handle tab change with optimistic update
  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as StatusTabValue;

      // Optimistic UI update
      setOptimisticTab(newTab);

      // Background URL sync
      startTransition(() => {
        router.push(buildUrl({
          status: newTab === 'all' ? undefined : newTab,
          page: '0'
        }), { scroll: false });
      });
    },
    [router, buildUrl]
  );

  // Prefetch tab routes on hover
  const handleTabHover = useCallback(
    (tabValue: StatusTabValue) => {
      if (tabValue === activeTab) return;
      router.prefetch(buildUrl({
        status: tabValue === 'all' ? undefined : tabValue,
        page: '0'
      }));
    },
    [router, buildUrl, activeTab]
  );

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page.toString() }));
  };

  const handleClearFilters = () => {
    setOptimisticTab('all');
    router.push(pathname);
  };

  const { content: competencies, totalElements, totalPages, number: pageNumber, first, last } = initialData;

  // Determine empty state type
  const isFiltering = !!currentStatus;
  const hasNoData = totalElements === 0 && !isFiltering;
  const hasNoResults = competencies.length === 0 && isFiltering;

  return (
    <div className="space-y-4">
      {/* Status Tabs - Similar to items page */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max h-11 sm:h-10 p-1 bg-muted/50 rounded-lg gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={isPending}
                onMouseEnter={() => handleTabHover(tab.value)}
                onFocus={() => handleTabHover(tab.value)}
                className={cn(
                  'inline-flex flex-none items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5',
                  'min-h-[40px] sm:min-h-[36px]',
                  'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                  'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md',
                  isPending && 'opacity-70'
                )}
              >
                <span className="hidden sm:inline">{t(`competencyDetail.table.tabs.${tab.labelKey}`)}</span>
                <span className="sm:hidden">{t(`competencyDetail.table.tabs.${tab.shortLabelKey}`)}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'min-w-5 sm:min-w-6 h-5 justify-center text-[10px] sm:text-xs px-1 sm:px-1.5 rounded-sm',
                    getTabBadgeClass(tab.value, activeTab === tab.value)
                  )}
                >
                  {tab.value === 'all' ? totalElements : '•'}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </Tabs>

      {/* Results count */}
      <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {t('competencyDetail.table.resultsFound', { count: totalElements })}
      </div>

      {/* Loading overlay */}
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-lg">
            <div className="flex items-center gap-2 bg-background/90 px-4 py-2 rounded-full shadow-sm border">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t('competencyDetail.loading')}</span>
            </div>
          </div>
        )}

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
                  <TableHead className="w-[35%]">{t('competencyDetail.table.columns.competency')}</TableHead>
                  <TableHead className="text-center w-[20%]">
                    <TableHeaderWithHelp
                      label={t('competencyDetail.table.columns.cronbachAlpha')}
                      helpKey="cronbachAlpha"
                    />
                  </TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp
                      label={t('competencyDetail.table.columns.sample')}
                      helpKey="sampleSize"
                    />
                  </TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp
                      label={t('competencyDetail.table.columns.questions')}
                      helpKey="itemCount"
                    />
                  </TableHead>
                  <TableHead>{t('competencyDetail.table.columns.status')}</TableHead>
                  <TableHead className="w-[80px]">{t('competencyDetail.table.columns.actions')}</TableHead>
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
                        <UiLink
                          href={`/psychometrics/competencies/${comp.competencyId}`}
                          variant="primary"
                          className="font-semibold"
                        >
                          {comp.competencyName}
                        </UiLink>
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
                            title={t('competencyDetail.table.viewQuestions')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="text-xs">{t('competencyDetail.table.columns.questions')}</span>
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {t('competencyDetail.table.pagination.page')} {pageNumber + 1} / {totalPages}
          </div>
          <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(0)}
              disabled={first}
              title={t('competencyDetail.table.pagination.firstPage')}
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronsLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={first}
              title={t('competencyDetail.table.pagination.prevPage')}
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
              title={t('competencyDetail.table.pagination.nextPage')}
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={last}
              title={t('competencyDetail.table.pagination.lastPage')}
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
