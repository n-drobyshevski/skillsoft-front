'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  anonymousResultsApi,
  type AnonymousResultSummary,
  type AnonymousSessionStats,
  type AnonymousResultFilters,
} from '@/services/api/results';
import { SessionFunnel } from './SessionFunnel';

interface AnonymousResultsListProps {
  templateId: string;
  passingScore?: number;
}

/**
 * Anonymous results list for template owners.
 * Wires the existing backend anonymous results endpoints into the UI.
 * Supports filtering by date range, score range, pass/fail, and share link.
 */
export function AnonymousResultsList({
  templateId,
  passingScore = 70,
}: AnonymousResultsListProps) {
  const [results, setResults] = useState<AnonymousResultSummary[]>([]);
  const [stats, setStats] = useState<AnonymousSessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [passedFilter, setPassedFilter] = useState<string>('all');

  const activeFilters = useMemo<AnonymousResultFilters>(() => {
    const filters: AnonymousResultFilters = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) {
      // Set to end of day
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filters.dateTo = end.toISOString();
    }
    if (minScore) filters.minScore = Number(minScore);
    if (maxScore) filters.maxScore = Number(maxScore);
    if (passedFilter === 'passed') filters.passed = true;
    if (passedFilter === 'failed') filters.passed = false;
    return filters;
  }, [dateFrom, dateTo, minScore, maxScore, passedFilter]);

  const hasActiveFilters = dateFrom || dateTo || minScore || maxScore || passedFilter !== 'all';

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setMinScore('');
    setMaxScore('');
    setPassedFilter('all');
    setPage(0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await anonymousResultsApi.exportCsv(templateId);
    } catch {
      // Export failed — silently handle
    } finally {
      setExporting(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filtersToSend = hasActiveFilters ? activeFilters : undefined;
      const [statsData, resultsData] = await Promise.all([
        anonymousResultsApi.getStats(templateId),
        anonymousResultsApi.listResults(templateId, page, 20, filtersToSend),
      ]);
      setStats(statsData);
      setResults(resultsData.content);
      setTotalPages(resultsData.totalPages);
      setTotalElements(resultsData.totalElements);
    } catch {
      // Silently handle — empty state will show
    } finally {
      setLoading(false);
    }
  }, [templateId, page, activeFilters, hasActiveFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [dateFrom, dateTo, minScore, maxScore, passedFilter]);

  if (loading && !results.length) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-lg border p-3 bg-card">
            <p className="text-muted-foreground text-xs">Total Sessions</p>
            <p className="text-lg font-bold">{stats.totalSessions}</p>
          </div>
          <div className="rounded-lg border p-3 bg-card">
            <p className="text-muted-foreground text-xs">Completed</p>
            <p className="text-lg font-bold text-green-600">{stats.completedSessions}</p>
          </div>
          <div className="rounded-lg border p-3 bg-card">
            <p className="text-muted-foreground text-xs">In Progress</p>
            <p className="text-lg font-bold text-blue-600">{stats.inProgressSessions}</p>
          </div>
          <div className="rounded-lg border p-3 bg-card">
            <p className="text-muted-foreground text-xs">Completion Rate</p>
            <p className="text-lg font-bold">{(stats.completionRate * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Funnel Chart */}
      {stats && stats.totalSessions > 0 && (
        <SessionFunnel stats={stats} />
      )}

      {/* Filter Bar + Export */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 h-8 text-xs"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
              active
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 h-8 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || totalElements === 0}
            className="gap-1.5 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border rounded-lg bg-muted/5">
          {/* Date From */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          {/* Date To */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          {/* Score Range */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Score range</label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="h-8 text-xs w-16"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <Input
                type="number"
                placeholder="100"
                min={0}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="h-8 text-xs w-16"
              />
            </div>
          </div>
          {/* Pass/Fail */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={passedFilter} onValueChange={setPassedFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/5">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-medium mb-1">
            {hasActiveFilters ? 'No results match your filters' : 'No anonymous results yet'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {hasActiveFilters
              ? 'Try adjusting your filter criteria.'
              : 'Results will appear here when anonymous test takers complete the test via share links.'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 text-xs">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="flex flex-col gap-2 md:hidden">
            {results.map((result) => (
              <div key={result.resultId} className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-medium text-sm truncate">{result.takerName}</p>
                    {result.takerEmail && (
                      <p className="text-xs text-muted-foreground truncate">{result.takerEmail}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'gap-1 text-xs py-0.5 px-2 whitespace-nowrap',
                      result.passed
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                    )}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {result.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={cn(
                      'font-semibold text-sm',
                      result.overallPercentage >= passingScore ? 'text-green-600' : 'text-red-600'
                    )}>
                      {result.overallPercentage?.toFixed(0) ?? 0}%
                    </span>
                    {result.suspiciouslyFast && (
                      <span title="Suspiciously fast — avg time per question below 15s">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      </span>
                    )}
                  </span>
                  {result.shareLinkLabel && (
                    <Badge variant="secondary" className="text-xs">{result.shareLinkLabel}</Badge>
                  )}
                  <span>
                    {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5 hover:bg-muted/5">
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.resultId}>
                    <TableCell className="pl-4 py-3 font-medium text-sm">
                      {result.takerName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {result.takerEmail || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <span className={cn(
                          'font-semibold text-sm',
                          result.overallPercentage >= passingScore ? 'text-green-600' : 'text-red-600'
                        )}>
                          {result.overallPercentage?.toFixed(0) ?? 0}%
                        </span>
                        {result.suspiciouslyFast && (
                          <span title="Suspiciously fast — avg time per question below 15s">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'gap-1 text-xs py-0.5 px-2',
                          result.passed
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                        )}
                      >
                        {result.passed ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {result.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {result.tabSwitchCount == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : result.tabSwitchCount > 3 ? (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {result.tabSwitchCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{result.tabSwitchCount}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {result.shareLinkLabel || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {result.completedAt
                        ? new Date(result.completedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {page * 20 + 1}–{Math.min((page + 1) * 20, totalElements)} of {totalElements}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{page + 1} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
