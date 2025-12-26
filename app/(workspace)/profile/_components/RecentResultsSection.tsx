'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardCheck,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { RecentTestResult } from '@/types/profile';
import { AssessmentGoal } from '@/types/domain';
import { cn } from '@/lib/utils';
import { GoalFilterTabs, type GoalFilter } from './GoalFilterTabs';

interface RecentResultsSectionProps {
  results: RecentTestResult[];
}

/**
 * Goal labels in Russian
 */
const GOAL_LABELS: Record<AssessmentGoal, string> = {
  [AssessmentGoal.OVERVIEW]: 'Обзор',
  [AssessmentGoal.JOB_FIT]: 'Должность',
  [AssessmentGoal.TEAM_FIT]: 'Команда',
};

/**
 * Recent Results Section - Client Component
 *
 * Mobile-first redesign with visual hierarchy:
 * - Compact score circles optimized for mobile
 * - Responsive result cards
 * - Goal-based filtering
 */
export function RecentResultsSection({ results }: RecentResultsSectionProps) {
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');

  // Calculate counts for each filter
  const filterCounts = useMemo(() => {
    const counts: Record<GoalFilter, number> = {
      all: results.length,
      [AssessmentGoal.OVERVIEW]: 0,
      [AssessmentGoal.JOB_FIT]: 0,
      [AssessmentGoal.TEAM_FIT]: 0,
    };

    results.forEach((result) => {
      if (result.goal in counts) {
        counts[result.goal as AssessmentGoal]++;
      }
    });

    return counts;
  }, [results]);

  // Filter results based on selected goal
  const filteredResults = useMemo(() => {
    if (goalFilter === 'all') {
      return results;
    }
    return results.filter((result) => result.goal === goalFilter);
  }, [results, goalFilter]);

  // Empty state (no results at all)
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Последние результаты
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground/30" />
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2">Пока нет результатов</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
              Пройдите первый тест, чтобы увидеть свои результаты здесь
            </p>
            <Button asChild size="sm" className="text-xs sm:text-sm">
              <Link href="/test-templates">
                Начать тестирование
                <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 shrink-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Последние результаты
          </CardTitle>
          {/* Filter container */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1 sm:flex-initial overflow-hidden">
              <GoalFilterTabs
                value={goalFilter}
                onChange={setGoalFilter}
                counts={filterCounts}
              />
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex shrink-0 text-xs h-7 px-2">
              <Link href="/my-tests">
                Все
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6">
        {filteredResults.length === 0 ? (
          <div className="text-center py-4 sm:py-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-2 sm:mb-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/30" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Нет результатов для выбранного фильтра
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((result) => (
              <ResultRow key={result.resultId} result={result} />
            ))}
          </div>
        )}

        {/* Mobile "All results" button */}
        <div className="mt-3 sm:hidden">
          <Button variant="outline" size="sm" asChild className="w-full text-xs">
            <Link href="/my-tests">
              Все результаты
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// RESULT ROW COMPONENT
// ============================================

function ResultRow({ result }: { result: RecentTestResult }) {
  return (
    <Link
      href={`/test-templates/results/${result.resultId}`}
      className={cn(
        'flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-xl border transition-colors group touch-manipulation overflow-hidden',
        'hover:bg-muted/50',
        result.passed 
          ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' 
          : 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
      )}
    >
      {/* Score Circle - Compact on mobile */}
      <div
        className={cn(
          'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0 shadow-sm',
          result.passed
            ? 'bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-700 dark:from-emerald-900/50 dark:to-emerald-800/50 dark:text-emerald-300'
            : 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900/50 dark:to-amber-800/50 dark:text-amber-300'
        )}
      >
        {result.overallPercentage.toFixed(0)}%
      </div>

      {/* Test Info - Takes remaining space */}
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate text-xs sm:text-sm">
          {result.templateName}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(result.completedAt), {
            addSuffix: true,
            locale: ru,
          })}
        </div>
      </div>

      {/* Pass/Fail Icon */}
      {result.passed ? (
        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
      )}

      {/* Goal Badge - Hidden on mobile */}
      <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex py-0 h-5 shrink-0">
        {GOAL_LABELS[result.goal] || 'Тест'}
      </Badge>

      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function RecentResultsSectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-40" />
          </div>
          <Skeleton className="h-7 sm:h-8 w-20 sm:w-28 rounded" />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-xl border">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 sm:h-4 w-28 sm:w-40" />
                  <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-24" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
                <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
