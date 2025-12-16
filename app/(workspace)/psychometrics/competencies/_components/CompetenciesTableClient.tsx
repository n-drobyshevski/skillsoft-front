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
  CompetencyReliability,
  ReliabilityStatus,
  ReliabilityStatusDisplay,
  Page,
} from '@/types/psychometrics';
import { ReliabilityStatusBadge } from '../../_components/ReliabilityStatusBadge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shield
} from 'lucide-react';

interface CompetenciesTableClientProps {
  initialData: Page<CompetencyReliability>;
  currentStatus?: ReliabilityStatus;
  currentPage: number;
}

const statusTabs: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: ReliabilityStatus.RELIABLE, label: ReliabilityStatusDisplay[ReliabilityStatus.RELIABLE].label },
  { value: ReliabilityStatus.ACCEPTABLE, label: ReliabilityStatusDisplay[ReliabilityStatus.ACCEPTABLE].label },
  { value: ReliabilityStatus.UNRELIABLE, label: ReliabilityStatusDisplay[ReliabilityStatus.UNRELIABLE].label },
  { value: ReliabilityStatus.INSUFFICIENT_DATA, label: ReliabilityStatusDisplay[ReliabilityStatus.INSUFFICIENT_DATA].label },
];

// Alpha color helper
function getAlphaColor(alpha: number | null): string {
  if (alpha === null) return 'text-gray-500';
  if (alpha >= 0.7) return 'text-emerald-600';
  if (alpha >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}

export function CompetenciesTableClient({
  initialData,
  currentStatus,
  currentPage,
}: CompetenciesTableClientProps) {
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

  const { content: competencies, totalElements, totalPages, number: pageNumber, first, last } = initialData;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Tabs value={currentStatus || 'all'} onValueChange={handleStatusChange}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Найдено: {totalElements} компетенций
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {competencies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Компетенции не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">
                Попробуйте изменить фильтры
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Компетенция</TableHead>
                  <TableHead className="text-center">Cronbach's Alpha</TableHead>
                  <TableHead className="text-center">Выборка</TableHead>
                  <TableHead className="text-center">Вопросы</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competencies.map((comp) => (
                  <TableRow
                    key={comp.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <Link
                        href={`/psychometrics/competencies/${comp.competencyId}`}
                        className="hover:underline font-medium"
                      >
                        {comp.competencyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-mono font-bold ${getAlphaColor(comp.cronbachAlpha)}`}>
                        {comp.cronbachAlpha != null ? comp.cronbachAlpha.toFixed(2) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {comp.sampleSize ?? '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {comp.itemCount ?? '-'}
                    </TableCell>
                    <TableCell>
                      <ReliabilityStatusBadge status={comp.reliabilityStatus} />
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
