'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck,
  TrendingUp,
  Calendar,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useFormattedDates } from '@/hooks/useFormattedDates';
import { formatShortMonthDay } from '@/lib/date-utils';
import type { AssessmentSummary, RecentTestResult } from '@/types/profile';
import { AssessmentGoal } from '@/types/domain';
import { cn } from '@/lib/utils';

interface AssessmentSummarySectionProps {
  summary: AssessmentSummary;
}

/**
 * Assessment Summary Section
 *
 * Displays test history, quick stats, and recent results.
 */
export function AssessmentSummarySection({ summary }: AssessmentSummarySectionProps) {
  const { formatRelativeTime, locale } = useFormattedDates();

  // Empty state for new users
  if (summary.totalCompleted === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            История оценок
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет результатов</h3>
            <p className="text-muted-foreground mb-4">
              Пройдите первый тест, чтобы увидеть свои результаты
            </p>
            <Button asChild>
              <Link href="/test-templates">
                Начать тестирование
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            История оценок
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-tests">
              Все результаты
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={ClipboardCheck}
            label="Пройдено тестов"
            value={summary.totalCompleted.toString()}
          />
          <StatCard
            icon={TrendingUp}
            label="Средний балл"
            value={`${summary.averageScore.toFixed(0)}%`}
            variant={summary.averageScore >= 70 ? 'success' : 'default'}
          />
          <StatCard
            icon={Calendar}
            label="Последний тест"
            value={
              summary.lastAssessmentDate
                ? formatShortMonthDay(summary.lastAssessmentDate, locale)
                : '-'
            }
          />
        </div>

        {/* Recent Results */}
        {summary.recentResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Последние результаты
            </h4>
            <div className="space-y-2">
              {summary.recentResults.map((result) => (
                <RecentResultCard key={result.resultId} result={result} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: 'default' | 'success';
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-center">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-2 text-muted-foreground" />
      <div
        className={cn(
          'text-lg sm:text-2xl font-bold',
          variant === 'success' && 'text-emerald-600'
        )}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function RecentResultCard({ result }: { result: RecentTestResult }) {
  const { formatRelativeTime } = useFormattedDates();
  const goalLabels: Record<AssessmentGoal, string> = {
    [AssessmentGoal.OVERVIEW]: 'Обзор',
    [AssessmentGoal.JOB_FIT]: 'Должность',
    [AssessmentGoal.TEAM_FIT]: 'Команда',
  };

  return (
    <Link
      href={`/test-templates/results/${result.resultId}`}
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Score Circle */}
        <div
          className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            result.passed
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          )}
        >
          {result.overallPercentage.toFixed(0)}%
        </div>

        {/* Test Info */}
        <div className="min-w-0">
          <div className="font-medium truncate">{result.templateName}</div>
          <div className="text-xs text-muted-foreground">
            {formatRelativeTime(result.completedAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Pass/Fail Icon */}
        {result.passed ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-amber-500" />
        )}

        {/* Goal Badge */}
        <Badge variant="outline" className="text-xs hidden sm:inline-flex">
          {goalLabels[result.goal]}
        </Badge>

        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
