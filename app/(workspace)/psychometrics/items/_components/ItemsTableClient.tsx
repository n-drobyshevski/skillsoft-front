'use client';

import { useCallback, useState, useTransition, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { psychometricsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchPsychometricsItemDetail } from '@/hooks/queries';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  Page,
} from '@/types/psychometrics';
import { Competency } from '@/types/domain';
import {
  ValidityStatusBadge,
  MetricCell,
  NoItemsFound,
  PsychometricBatchToolbar,
  useBatchSelection,
  TableHeaderWithHelp,
  MobileItemCardList,
} from '../../_components';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

// Tab configuration for status filtering
type StatusTabValue = 'all' | ItemValidityStatus;

interface TabConfig {
  value: StatusTabValue;
  label: string;
  shortLabel: string; // For mobile
}

const STATUS_TABS: TabConfig[] = [
  { value: 'all', label: 'Все', shortLabel: 'Все' },
  { value: ItemValidityStatus.ACTIVE, label: 'Активные', shortLabel: 'Актив.' },
  { value: ItemValidityStatus.PROBATION, label: 'Пробационные', shortLabel: 'Проб.' },
  { value: ItemValidityStatus.FLAGGED_FOR_REVIEW, label: 'На проверке', shortLabel: 'Провер.' },
  { value: ItemValidityStatus.RETIRED, label: 'Отключенные', shortLabel: 'Откл.' },
];

interface ItemsTableClientProps {
  initialItems: Page<ItemStatistics>;
  competencies: Competency[];
  currentStatus?: ItemValidityStatus;
  currentCompetencyId?: string;
  currentSearch?: string;
}

function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

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

// Get tab badge color based on status
function getTabBadgeClass(value: StatusTabValue, isActive: boolean): string {
  if (isActive) return 'bg-primary text-primary-foreground';

  switch (value) {
    case ItemValidityStatus.ACTIVE:
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case ItemValidityStatus.PROBATION:
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case ItemValidityStatus.FLAGGED_FOR_REVIEW:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case ItemValidityStatus.RETIRED:
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function ItemsTableClient({
  initialItems,
  competencies,
  currentStatus,
  currentCompetencyId,
  currentSearch,
}: ItemsTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Optimistic tab state for instant UI feedback
  const urlTab: StatusTabValue = (currentStatus as StatusTabValue) || 'all';
  const [optimisticTab, setOptimisticTab] = useState<StatusTabValue>(urlTab);
  const activeTab = optimisticTab;

  // Batch operation loading state
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Search state with debounce
  const [searchInput, setSearchInput] = useState(currentSearch || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync search input with URL on mount/change
  useEffect(() => {
    setSearchInput(currentSearch || '');
  }, [currentSearch]);

  // Batch selection hook
  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
  } = useBatchSelection<ItemStatistics>();

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
      clearSelection();

      // Background URL sync
      startTransition(() => {
        router.push(buildUrl({
          status: newTab === 'all' ? undefined : newTab,
          page: '0'
        }), { scroll: false });
      });
    },
    [router, buildUrl, clearSelection]
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

  const handleCompetencyChange = (value: string) => {
    clearSelection();
    router.push(buildUrl({ competencyId: value === 'all' ? undefined : value, page: '0' }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page.toString() }));
  };

  const handleClearFilters = () => {
    clearSelection();
    setOptimisticTab('all');
    setSearchInput('');
    router.push(pathname);
  };

  // Debounced search handler (300ms delay)
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce URL update
      searchTimeoutRef.current = setTimeout(() => {
        clearSelection();
        startTransition(() => {
          router.push(
            buildUrl({
              search: value.trim() || undefined,
              page: '0',
            }),
            { scroll: false }
          );
        });
      }, 300);
    },
    [router, buildUrl, clearSelection]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    clearSelection();
    router.push(buildUrl({ search: undefined, page: '0' }), { scroll: false });
  }, [router, buildUrl, clearSelection]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const { content: items, totalElements, totalPages, number: pageNumber, first, last } = initialItems;

  // Prefetch item detail on row hover for faster navigation
  const handleRowPrefetch = useCallback(
    (questionId: string) => {
      // Prefetch React Query data
      prefetchPsychometricsItemDetail(queryClient, questionId);
      // Prefetch Next.js route
      router.prefetch(`/psychometrics/items/${questionId}`);
    },
    [queryClient, router]
  );

  // Batch action handlers
  const handleRetire = async () => {
    if (selectedIds.size === 0) return;

    const questionIds = items
      .filter((item) => selectedIds.has(item.id))
      .map((item) => item.questionId);

    if (questionIds.length === 0) {
      toast.error('Не найдены элементы для отключения');
      return;
    }

    setIsBatchLoading(true);
    try {
      const results = await psychometricsApi.batchUpdateItemStatus(
        questionIds,
        ItemValidityStatus.RETIRED,
        'Массовое отключение через интерфейс управления'
      );

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount === 0) {
        toast.success(`Отключено: ${successCount} элементов`, {
          description: 'Элементы успешно переведены в статус "Отключенные"',
        });
      } else if (successCount > 0) {
        toast.warning(`Отключено: ${successCount}, ошибок: ${failCount}`, {
          description: 'Некоторые элементы не удалось обновить',
        });
      } else {
        toast.error('Не удалось отключить элементы', {
          description: results[0]?.error || 'Произошла ошибка при обновлении',
        });
      }

      clearSelection();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error('Ошибка при отключении элементов', { description: message });
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleActivate = async () => {
    if (selectedIds.size === 0) return;

    const questionIds = items
      .filter((item) => selectedIds.has(item.id))
      .map((item) => item.questionId);

    if (questionIds.length === 0) {
      toast.error('Не найдены элементы для активации');
      return;
    }

    setIsBatchLoading(true);
    try {
      const results = await psychometricsApi.batchUpdateItemStatus(
        questionIds,
        ItemValidityStatus.ACTIVE,
        'Массовая активация через интерфейс управления'
      );

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount === 0) {
        toast.success(`Активировано: ${successCount} элементов`, {
          description: 'Элементы успешно переведены в статус "Активные"',
        });
      } else if (successCount > 0) {
        toast.warning(`Активировано: ${successCount}, ошибок: ${failCount}`, {
          description: 'Некоторые элементы не удалось обновить',
        });
      } else {
        toast.error('Не удалось активировать элементы', {
          description: results[0]?.error || 'Произошла ошибка при обновлении',
        });
      }

      clearSelection();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error('Ошибка при активации элементов', { description: message });
    } finally {
      setIsBatchLoading(false);
    }
  };

  // Check if all current page items are selected
  const allSelected = items.length > 0 && items.every((item) => isSelected(item.id));
  const someSelected = items.some((item) => isSelected(item.id)) && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(items);
    }
  };

  // Determine which batch actions to show based on current filter
  const canRetire = currentStatus !== ItemValidityStatus.RETIRED;
  const canActivate = currentStatus === ItemValidityStatus.RETIRED || currentStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW;

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="space-y-3">
        {/* Status Tabs - Similar to my-tests page */}
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
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
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

        {/* Search + Competency Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Поиск по вопросам..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9 min-h-[48px] sm:min-h-[40px]"
              aria-label="Поиск по тексту вопроса"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Competency Filter */}
          <Select
            value={currentCompetencyId || 'all'}
            onValueChange={handleCompetencyChange}
          >
            <SelectTrigger
              className="w-full sm:w-[280px] min-h-[48px] sm:min-h-[40px]"
              aria-label="Фильтр по компетенции"
            >
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
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Найдено: {totalElements} элементов
        {currentSearch && (
          <span className="ml-1">
            по запросу «<span className="font-medium">{currentSearch}</span>»
          </span>
        )}
      </div>

      {/* Table / Mobile Card List */}
      <div className="relative">
        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-lg">
            <div className="flex items-center gap-2 bg-background/90 px-4 py-2 rounded-full shadow-sm border">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Загрузка...</span>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <NoItemsFound
                onClearFilters={currentStatus || currentCompetencyId || currentSearch ? handleClearFilters : undefined}
              />
            </CardContent>
          </Card>
        ) : isMobile ? (
        /* Mobile: Card List with bottom padding for batch toolbar */
        <div className={cn('space-y-3', selectedCount > 0 && 'pb-20')}>
          {/* Mobile Select All - uses Checkbox directly (it's already a button) */}
          <label
            className="flex items-center gap-3 w-full px-2 py-2 -mx-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-center w-11 h-11">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={handleSelectAll}
                aria-label={allSelected ? 'Снять выделение со всех' : 'Выбрать все на странице'}
                className="h-5 w-5"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {allSelected ? 'Снять выделение' : 'Выбрать все'}
            </span>
          </label>

          <MobileItemCardList
            items={items}
            selectedIds={selectedIds}
            onToggle={toggle}
            onPrefetch={handleRowPrefetch}
          />
        </div>
      ) : (
        /* Desktop: Table */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={handleSelectAll}
                      aria-label="Выбрать все элементы на странице"
                    />
                  </TableHead>
                  <TableHead className="w-[40%]">Вопрос</TableHead>
                  <TableHead>Компетенция</TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp label="p" helpKey="difficulty" />
                  </TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp label="rpb" helpKey="discrimination" />
                  </TableHead>
                  <TableHead className="text-center">
                    <TableHeaderWithHelp label="Ответы" helpKey="responseCount" />
                  </TableHead>
                  <TableHead>
                    <TableHeaderWithHelp label="Статус" helpKey="validityStatus" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const checked = isSelected(item.id);
                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        'border-l-4',
                        getStatusBorderColor(item.validityStatus),
                        checked
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => toggle(item.id)}
                      onMouseEnter={() => handleRowPrefetch(item.questionId)}
                      onFocus={() => handleRowPrefetch(item.questionId)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(item.id)}
                          aria-label={`Выбрать: ${truncateText(item.questionText, 30)}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/psychometrics/items/${item.questionId}`}
                          className="group inline-flex items-center gap-1 font-medium text-foreground hover:text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span title={item.questionText}>
                            {truncateText(item.questionText)}
                          </span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.competencyName}</span>
                        {item.indicatorTitle && (
                          <p
                            className="text-xs text-muted-foreground truncate max-w-[150px]"
                            title={item.indicatorTitle}
                          >
                            {item.indicatorTitle}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <MetricCell
                          value={item.difficultyIndex}
                          type="difficulty"
                          showBar
                          size="sm"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <MetricCell
                          value={item.discriminationIndex}
                          type="discrimination"
                          showBar
                          size="sm"
                        />
                      </TableCell>
                      <TableCell className="text-center text-sm tabular-nums">
                        {item.responseCount}
                      </TableCell>
                      <TableCell>
                        <ValidityStatusBadge status={item.validityStatus} />
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
        <nav
          className="flex items-center justify-between"
          role="navigation"
          aria-label="Навигация по страницам"
        >
          <div className="text-sm text-muted-foreground hidden sm:block">
            Страница {pageNumber + 1} из {totalPages}
          </div>
          <div className="flex items-center gap-1 sm:gap-1 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(0)}
              disabled={first}
              className="h-11 w-11 sm:h-9 sm:w-9"
              aria-label="Первая страница"
            >
              <ChevronsLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={first}
              className="h-11 w-11 sm:h-9 sm:w-9"
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            {/* Mobile page indicator */}
            <div className="flex items-center justify-center min-w-[60px] sm:hidden">
              <span className="text-sm font-medium tabular-nums">
                {pageNumber + 1} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={last}
              className="h-11 w-11 sm:h-9 sm:w-9"
              aria-label="Следующая страница"
            >
              <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={last}
              className="h-11 w-11 sm:h-9 sm:w-9"
              aria-label="Последняя страница"
            >
              <ChevronsRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </nav>
      )}

      {/* Batch Action Toolbar */}
      <PsychometricBatchToolbar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onRetire={handleRetire}
        onActivate={handleActivate}
        canRetire={canRetire}
        canActivate={canActivate}
        isLoading={isBatchLoading}
      />
    </div>
  );
}
