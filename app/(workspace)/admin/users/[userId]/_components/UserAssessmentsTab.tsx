'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { TestResult, AssessmentGoal } from '@/types/domain';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserAssessmentsTabProps {
  results: {
    content: TestResult[];
    totalElements: number;
    totalPages: number;
  } | null;
  userName?: string;
}

/**
 * Format duration from seconds to human-readable string.
 */
function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '--';
  }
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format date to localized string.
 */
function formatDate(dateString?: string | null, locale = 'en-US'): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get badge variant based on goal type.
 */
function getGoalBadgeClass(goal: AssessmentGoal): string {
  switch (goal) {
    case 'OVERVIEW':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
    case 'JOB_FIT':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'TEAM_FIT':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

/**
 * Goal labels in Russian
 */
const GOAL_LABELS: Record<AssessmentGoal, string> = {
  OVERVIEW: 'Обзор',
  JOB_FIT: 'Работа',
  TEAM_FIT: 'Команда',
};

/**
 * User Assessments Tab
 *
 * Displays a paginated list of test results for a user.
 * Shows template name, goal type, score, pass/fail status, and date.
 */
export function UserAssessmentsTab({ results, userName }: UserAssessmentsTabProps) {
  const t = useTranslations('users.profile');
  const router = useRouter();

  // Empty state
  if (!results || results.content.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            {t('sections.assessmentHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('assessments.empty')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('assessments.emptyDesc', { name: userName || t('assessments.thisUser') })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          {t('sections.assessmentHistory')}
          <Badge variant="secondary" className="ml-2">
            {results.totalElements}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('assessments.template')}</TableHead>
                <TableHead className="w-[100px]">{t('assessments.goal')}</TableHead>
                <TableHead className="w-[100px] text-center">{t('assessments.score')}</TableHead>
                <TableHead className="w-[100px] text-center">{t('assessments.status')}</TableHead>
                <TableHead className="w-[100px] text-center">{t('assessments.duration')}</TableHead>
                <TableHead className="w-[150px]">{t('assessments.completedAt')}</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.content.map((result) => {
                const href = `/test-templates/results/${result.id}`;
                const rowLabel = `${result.templateName} — ${t('assessments.viewDetails')}`;
                return (
                <TableRow
                  key={result.id}
                  role="link"
                  tabIndex={0}
                  aria-label={rowLabel}
                  className="cursor-pointer hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  onClick={() => router.push(href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      router.push(href);
                    }
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="truncate max-w-[200px]" title={result.templateName}>
                      {result.templateName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getGoalBadgeClass(result.templateName as AssessmentGoal))}
                    >
                      {GOAL_LABELS[result.templateName as AssessmentGoal] || result.templateName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        'font-bold tabular-nums',
                        result.overallPercentage != null && result.overallPercentage >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : result.overallPercentage != null && result.overallPercentage >= 50
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {result.overallPercentage != null && Number.isFinite(result.overallPercentage) ? `${Math.round(result.overallPercentage)}%` : '--'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {result.status === 'PENDING' ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('assessments.pending')}
                      </Badge>
                    ) : result.passed ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('assessments.passed')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('assessments.failed')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {formatDuration(result.totalTimeSeconds)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(result.completedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ExternalLink className="h-4 w-4 text-muted-foreground inline-block" aria-hidden="true" />
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {results.content.map((result) => (
            <Link
              key={result.id}
              href={`/test-templates/results/${result.id}`}
              aria-label={`${result.templateName} — ${t('assessments.viewDetails')}`}
              className="block p-4 rounded-lg border bg-card transition-all hover:shadow-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" title={result.templateName}>
                    {result.templateName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(result.completedAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums',
                      result.overallPercentage != null && result.overallPercentage >= 70
                        ? 'text-emerald-600'
                        : result.overallPercentage != null && result.overallPercentage >= 50
                          ? 'text-blue-600'
                          : 'text-amber-600'
                    )}
                  >
                    {result.overallPercentage != null && Number.isFinite(result.overallPercentage) ? `${Math.round(result.overallPercentage)}%` : '--'}
                  </span>
                  {result.status === 'PENDING' ? (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {t('assessments.pending')}
                    </Badge>
                  ) : result.passed ? (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t('assessments.passed')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t('assessments.failed')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(result.totalTimeSeconds)}
                  <span className="mx-1">·</span>
                  {result.questionsAnswered}/{result.totalQuestions} {t('assessments.questions')}
                </div>
                <span className="flex items-center text-xs text-primary font-medium">
                  <ExternalLink className="h-3 w-3 mr-1" aria-hidden="true" />
                  {t('assessments.view')}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination (if multiple pages) */}
        {results.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {t('assessments.page', { current: 1, total: results.totalPages })}
            </span>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserAssessmentsTab;
