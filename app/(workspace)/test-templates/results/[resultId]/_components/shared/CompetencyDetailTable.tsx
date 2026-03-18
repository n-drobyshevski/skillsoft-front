'use client';

import { forwardRef, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { CompetencyScore } from '@/types/domain';

// ============================================================================
// Status helpers
// ============================================================================

function getStatusColor(score: number, benchmark: number): {
  text: string;
  bar: string;
} {
  const gap = score - benchmark;
  if (gap > 2) return { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' };
  if (gap >= -2) return { text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' };
  return { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' };
}

function getPercentileColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500';
  if (pct >= 40) return 'bg-blue-500';
  return 'bg-amber-500';
}

// ============================================================================
// Sort logic
// ============================================================================

type SortKey = 'name' | 'score' | 'benchmark' | 'gap' | 'alpha' | 'percentile';
type SortDir = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  dir: SortDir;
}

// ============================================================================
// Props
// ============================================================================

interface CompetencyDetailTableProps {
  competencies: CompetencyScore[];
  passingScore: number;
  onRowClick?: (competencyId: string) => void;
}

// ============================================================================
// CompetencyDetailTable — collapsible sortable table matching design preview
// ============================================================================

export const CompetencyDetailTable = forwardRef<HTMLDivElement, CompetencyDetailTableProps>(
  function CompetencyDetailTable({ competencies, passingScore, onRowClick }, ref) {
    const [expanded, setExpanded] = useState(true);
    const [sort, setSort] = useState<SortState>({ key: 'score', dir: 'desc' });

    const rows = useMemo(() => {
      const mapped = competencies.map((c) => {
        const benchmark = c.benchmarkScore ?? passingScore;
        const gap = Math.round(c.percentage) - Math.round(benchmark);
        return { ...c, benchmark: Math.round(benchmark), gap };
      });

      return [...mapped].sort((a, b) => {
        let av: number | string;
        let bv: number | string;
        switch (sort.key) {
          case 'name': av = a.competencyName; bv = b.competencyName; break;
          case 'score': av = a.percentage; bv = b.percentage; break;
          case 'benchmark': av = a.benchmark; bv = b.benchmark; break;
          case 'gap': av = a.gap; bv = b.gap; break;
          case 'alpha': av = a.cronbachAlpha ?? 0; bv = b.cronbachAlpha ?? 0; break;
          case 'percentile': av = a.percentile ?? 0; bv = b.percentile ?? 0; break;
          default: av = a.percentage; bv = b.percentage;
        }
        if (typeof av === 'string' && typeof bv === 'string') {
          return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return sort.dir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
    }, [competencies, passingScore, sort]);

    function toggleSort(key: SortKey) {
      setSort((prev) =>
        prev.key === key
          ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
          : { key, dir: 'desc' }
      );
    }

    function sortIndicator(key: SortKey) {
      if (sort.key !== key) return null;
      return (
        <span className="text-emerald-400 ml-0.5">
          {sort.dir === 'asc' ? '↑' : '↓'}
        </span>
      );
    }

    const thClass = 'px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors';

    return (
      <Card className="rounded-xl shadow-sm overflow-hidden" ref={ref}>
        {/* Collapsible header */}
        <button
          type="button"
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors min-h-[44px] touch-manipulation"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="detail-table-body"
        >
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
              Detailed Breakdown
            </div>
            <div className="text-sm font-semibold text-foreground tracking-tight">
              Full Competency Table
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">{rows.length} rows</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-300',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Table body */}
        <div
          id="detail-table-body"
          className={cn(
            'overflow-hidden transition-all duration-400',
            expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse" role="table">
              <thead>
                <tr className="border-t border-border text-left">
                  <th className={cn(thClass, 'pl-6')} onClick={() => toggleSort('name')}>
                    Competency{sortIndicator('name')}
                  </th>
                  <th className={thClass} onClick={() => toggleSort('score')}>
                    Score{sortIndicator('score')}
                  </th>
                  <th className={thClass} onClick={() => toggleSort('benchmark')}>
                    Benchmark{sortIndicator('benchmark')}
                  </th>
                  <th className={thClass} onClick={() => toggleSort('gap')}>
                    Gap{sortIndicator('gap')}
                  </th>
                  <th className={cn(thClass, 'cursor-default hover:text-muted-foreground')}>
                    CI 95%
                  </th>
                  <th className={thClass} onClick={() => toggleSort('alpha')}>
                    Cronbach α{sortIndicator('alpha')}
                  </th>
                  <th className={cn(thClass, 'pr-6 text-right')} onClick={() => toggleSort('percentile')}>
                    Percentile{sortIndicator('percentile')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const colors = getStatusColor(Math.round(row.percentage), row.benchmark);
                  const gapStr = row.gap >= 0 ? `+${row.gap}` : String(row.gap);
                  const ciLower = row.ciLower != null ? Math.round(row.ciLower) : null;
                  const ciUpper = row.ciUpper != null ? Math.round(row.ciUpper) : null;
                  const alpha = row.cronbachAlpha != null ? row.cronbachAlpha.toFixed(2) : '—';
                  const pct = row.percentile ?? null;

                  return (
                    <tr
                      key={row.competencyId}
                      className="border-t border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onRowClick?.(row.competencyId)}
                    >
                      {/* Competency name */}
                      <td className="px-3 py-2.5 pl-6 font-medium text-foreground whitespace-nowrap">
                        {row.competencyName}
                      </td>
                      {/* Score */}
                      <td className={cn('px-3 py-2.5 tabular-nums font-semibold', colors.text)}>
                        {Math.round(row.percentage)}%
                      </td>
                      {/* Benchmark */}
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                        {row.benchmark}%
                      </td>
                      {/* Gap */}
                      <td className={cn('px-3 py-2.5 tabular-nums font-medium', colors.text)}>
                        {gapStr}
                      </td>
                      {/* CI 95% */}
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground/70">
                        {ciLower != null && ciUpper != null ? `${ciLower}–${ciUpper}` : '—'}
                      </td>
                      {/* Cronbach α */}
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                        {alpha}
                      </td>
                      {/* Percentile with mini bar */}
                      <td className="px-3 py-2.5 pr-6 text-right">
                        {pct != null ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-16 h-1 bg-muted rounded-full overflow-hidden inline-block">
                              <span
                                className={cn('block h-full rounded-full', getPercentileColor(pct))}
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="tabular-nums text-xs">{pct}th</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  }
);
