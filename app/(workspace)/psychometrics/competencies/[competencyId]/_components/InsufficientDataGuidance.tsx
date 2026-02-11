'use client';

/**
 * InsufficientDataGuidance - Guidance card for incomplete psychometric data
 *
 * Shows actionable guidance when:
 * - Cronbach's Alpha cannot be calculated
 * - Sample size is below minimum threshold
 * - Item count is below minimum threshold
 *
 * Client Component - uses useTranslations hook for i18n
 */

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Localized data quality issue type
 */
interface LocalizedDataQualityIssue {
  type: 'sample_size' | 'item_count' | 'alpha_missing';
  severity: 'warning' | 'error';
  messageKey: string;
  messageParams?: Record<string, string | number>;
  recommendationKey: string;
}

/**
 * Check for data quality issues and return translation keys
 */
function checkDataQualityLocalized(
  sampleSize: number | null,
  itemCount: number | null,
  cronbachAlpha: number | null
): LocalizedDataQualityIssue[] {
  const issues: LocalizedDataQualityIssue[] = [];

  // Sample size checks
  if (sampleSize === null || sampleSize < 30) {
    issues.push({
      type: 'sample_size',
      severity: 'warning',
      messageKey: sampleSize === null
        ? 'issues.sampleSizeUnknown'
        : 'issues.sampleSizeLow',
      messageParams: sampleSize !== null ? { count: sampleSize } : undefined,
      recommendationKey: 'issues.sampleSizeRecommendation',
    });
  }

  // Item count checks
  if (itemCount === null || itemCount < 3) {
    issues.push({
      type: 'item_count',
      severity: 'error',
      messageKey: itemCount === null
        ? 'issues.itemCountUnknown'
        : 'issues.itemCountLow',
      messageParams: itemCount !== null ? { count: itemCount } : undefined,
      recommendationKey: 'issues.itemCountRecommendation',
    });
  }

  // Alpha missing
  if (cronbachAlpha === null) {
    issues.push({
      type: 'alpha_missing',
      severity: 'error',
      messageKey: 'issues.alphaMissing',
      recommendationKey: 'issues.alphaMissingRecommendation',
    });
  }

  return issues;
}

interface InsufficientDataGuidanceProps {
  sampleSize: number | null;
  itemCount: number | null;
  cronbachAlpha: number | null;
  className?: string;
}

/**
 * Get icon for issue type
 */
function getIssueIcon(type: LocalizedDataQualityIssue['type']) {
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
function getSeverityStyles(severity: LocalizedDataQualityIssue['severity']) {
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
  const t = useTranslations('psychometrics.competencyDetail.insufficientDataGuidance');
  const issues = checkDataQualityLocalized(sampleSize, itemCount, cronbachAlpha);

  // No issues - don't render
  if (issues.length === 0) {
    return null;
  }

  // Determine overall severity
  const hasErrors = issues.some((i) => i.severity === 'error');
  const overallStyles = getSeverityStyles(hasErrors ? 'error' : 'warning');
  const metCriteria = Math.max(0, 3 - issues.length);

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
              {hasErrors ? t('insufficientData') : t('requiresAttention')}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hasErrors
                ? t('cannotCalculate')
                : t('forImproving')}
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
                    <span className="text-sm font-medium">
                      {t(issue.messageKey, issue.messageParams)}
                    </span>
                    <Badge variant="outline" className={cn('text-xs', styles.badge)}>
                      {issue.severity === 'error' ? t('criticalBadge') : t('attentionBadge')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {t(issue.recommendationKey)}
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
              <span>{t('readinessLabel')}</span>
              <span className="font-medium">
                {t('criteriaCount', { met: metCriteria, total: 3 })}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  hasErrors ? 'bg-red-500' : 'bg-amber-500'
                )}
                style={{ width: `${(metCriteria / 3) * 100}%` }}
                role="progressbar"
                aria-valuenow={metCriteria}
                aria-valuemin={0}
                aria-valuemax={3}
                aria-label={t('readinessLabel')}
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
  const t = useTranslations('psychometrics.competencyDetail.insufficientDataGuidance');
  const issues = checkDataQualityLocalized(sampleSize, itemCount, cronbachAlpha);

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
        {t('fullData')}
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
      {t('problemCount', { count: issues.length })}
    </Badge>
  );
}

export default InsufficientDataGuidance;
