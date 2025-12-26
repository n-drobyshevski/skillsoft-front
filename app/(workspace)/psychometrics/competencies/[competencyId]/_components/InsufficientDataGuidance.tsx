/**
 * InsufficientDataGuidance - Guidance card for incomplete psychometric data
 *
 * Shows actionable guidance when:
 * - Cronbach's Alpha cannot be calculated
 * - Sample size is below minimum threshold
 * - Item count is below minimum threshold
 *
 * Server Component - no interactivity needed
 */

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { checkDataQuality, type DataQualityIssue } from '../_lib/competency-detail.utils';

interface InsufficientDataGuidanceProps {
  sampleSize: number | null;
  itemCount: number | null;
  cronbachAlpha: number | null;
  className?: string;
}

/**
 * Get icon for issue type
 */
function getIssueIcon(type: DataQualityIssue['type']) {
  switch (type) {
    case 'sample_size':
      return Users;
    case 'item_count':
      return FileText;
    case 'alpha_missing':
      return BarChart3;
    default:
      return AlertTriangle;
  }
}

/**
 * Get severity styles
 */
function getSeverityStyles(severity: DataQualityIssue['severity']) {
  return severity === 'error'
    ? {
        card: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
        badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
        icon: 'text-red-500',
      }
    : {
        card: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
        badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
        icon: 'text-amber-500',
      };
}

export function InsufficientDataGuidance({
  sampleSize,
  itemCount,
  cronbachAlpha,
  className,
}: InsufficientDataGuidanceProps) {
  const issues = checkDataQuality(sampleSize, itemCount, cronbachAlpha);

  // No issues - don't render
  if (issues.length === 0) {
    return null;
  }

  // Determine overall severity
  const hasErrors = issues.some((i) => i.severity === 'error');
  const overallStyles = getSeverityStyles(hasErrors ? 'error' : 'warning');

  return (
    <Card
      className={cn('border-l-4', overallStyles.card, className)}
      role="alert"
      aria-live="polite"
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={cn(
              'p-2 rounded-full shrink-0',
              hasErrors ? 'bg-red-100 dark:bg-red-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
            )}
            aria-hidden="true"
          >
            <AlertTriangle
              className={cn('h-5 w-5', overallStyles.icon)}
            />
          </div>
          <div>
            <h3 className={cn(
              'font-semibold',
              hasErrors ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
            )}>
              {hasErrors ? 'Данные недостаточны' : 'Требуется внимание'}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hasErrors
                ? 'Невозможно рассчитать надежность. Выполните следующие действия:'
                : 'Для повышения точности результатов рекомендуется:'}
            </p>
          </div>
        </div>

        {/* Issue List */}
        <div className="space-y-3">
          {issues.map((issue, index) => {
            const Icon = getIssueIcon(issue.type);
            const styles = getSeverityStyles(issue.severity);

            return (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg',
                  'bg-background/80 border',
                  issue.severity === 'error'
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-amber-200 dark:border-amber-800'
                )}
              >
                <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', styles.icon)} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{issue.message}</span>
                    <Badge variant="outline" className={cn('text-xs', styles.badge)}>
                      {issue.severity === 'error' ? 'Критично' : 'Внимание'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {issue.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        {issues.length > 0 && (
          <div className="mt-4 pt-3 border-t border-current/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Готовность к расчету</span>
              <span className="font-medium">
                {Math.max(0, 3 - issues.length)} / 3 критериев
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  hasErrors ? 'bg-red-500' : 'bg-amber-500'
                )}
                style={{ width: `${((3 - issues.length) / 3) * 100}%` }}
                role="progressbar"
                aria-valuenow={3 - issues.length}
                aria-valuemin={0}
                aria-valuemax={3}
                aria-label="Готовность к расчету надежности"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for accordion headers
 */
interface DataQualityBadgeProps {
  sampleSize: number | null;
  itemCount: number | null;
  cronbachAlpha: number | null;
  className?: string;
}

export function DataQualityBadge({
  sampleSize,
  itemCount,
  cronbachAlpha,
  className,
}: DataQualityBadgeProps) {
  const issues = checkDataQuality(sampleSize, itemCount, cronbachAlpha);

  if (issues.length === 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-emerald-100 text-emerald-700 border-emerald-200',
          'dark:bg-emerald-900/30 dark:text-emerald-400',
          className
        )}
      >
        Данные полные
      </Badge>
    );
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return (
    <Badge
      variant="outline"
      className={cn(
        hasErrors
          ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
        className
      )}
    >
      {issues.length} {issues.length === 1 ? 'проблема' : 'проблемы'}
    </Badge>
  );
}

export default InsufficientDataGuidance;
