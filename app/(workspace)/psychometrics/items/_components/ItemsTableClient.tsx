'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
  StatusFilterPills,
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
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ItemsTableClientProps {
  initialItems: Page<ItemStatistics>;
  competencies: Competency[];
  currentStatus?: ItemValidityStatus;
  currentCompetencyId?: string;
  currentPage: number;
}

function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
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

export function ItemsTableClient({
  initialItems,
  competencies,
  currentStatus,
  currentCompetencyId,
  currentPage,
}: ItemsTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

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

      return `/psychometrics/items?${newParams.toString()}`;
    },
    [searchParams]
  );

  const handleStatusChange = (value: string) => {
    clearSelection();
    router.push(buildUrl({ status: value === 'all' ? undefined : value, page: '0' }));
  };

  const handleCompetencyChange = (value: string) => {
    clearSelection();
    router.push(buildUrl({ competencyId: value === 'all' ? undefined : value, page: '0' }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page.toString() }));
  };

  const handleClearFilters = () => {
    clearSelection();
    router.push('/psychometrics/items');
  };

  const { content: items, totalElements, totalPages, number: pageNumber, first, last } = initialItems;

  // Batch action handlers
  const handleRetire = async () => {
    // TODO: Implement batch retire API call
    console.log('Retiring items:', Array.from(selectedIds));
    clearSelection();
  };

  const handleActivate = async () => {
    // TODO: Implement batch activate API call
    console.log('Activating items:', Array.from(selectedIds));
    clearSelection();
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <StatusFilterPills
          value={currentStatus || 'all'}
          onChange={handleStatusChange}
        />

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

      {/* Table / Mobile Card List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoItemsFound
              onClearFilters={currentStatus || currentCompetencyId ? handleClearFilters : undefined}
            />
          </CardContent>
        </Card>
      ) : isMobile ? (
        /* Mobile: Card List */
        <div className="space-y-3">
          {/* Mobile Select All */}
          <div className="flex items-center gap-3 px-1">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={handleSelectAll}
              aria-label="Выбрать все элементы"
              className="h-5 w-5"
            />
            <span className="text-sm text-muted-foreground">
              {allSelected ? 'Снять выделение' : 'Выбрать все'}
            </span>
          </div>
          <MobileItemCardList
            items={items}
            selectedIds={selectedIds}
            onToggle={toggle}
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
                      aria-label="Выбрать все элементы"
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
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(item.id)}
                          aria-label={`Выбрать элемент "${truncateText(item.questionText, 30)}"`}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
            >
              <ChevronsLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={first}
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
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={last}
              className="h-11 w-11 sm:h-9 sm:w-9"
            >
              <ChevronsRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Batch Action Toolbar */}
      <PsychometricBatchToolbar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onRetire={handleRetire}
        onActivate={handleActivate}
        canRetire={canRetire}
        canActivate={canActivate}
      />
    </div>
  );
}
