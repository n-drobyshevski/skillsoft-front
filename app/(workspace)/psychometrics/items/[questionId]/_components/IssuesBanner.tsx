'use client';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { UiLink } from '@/components/ui/ui-link';
import { AlertTriangle, ExternalLink, ChevronRight } from 'lucide-react';
import {
  DiscriminationFlag,
  DifficultyFlag,
  ItemValidityStatus,
} from '@/types/psychometrics';
import { useTranslations } from 'next-intl';

interface IssuesBannerProps {
  /** Question ID for link */
  questionId: string;
  /** Discrimination flag */
  discriminationFlag: DiscriminationFlag | null;
  /** Difficulty flag */
  difficultyFlag: DifficultyFlag | null;
  /** Validity status */
  validityStatus: ItemValidityStatus;
  /** Additional className */
  className?: string;
}

/**
 * Get issue messages based on flags (using translation function)
 */
function getIssueMessages(
  discriminationFlag: DiscriminationFlag | null,
  difficultyFlag: DifficultyFlag | null,
  t: ReturnType<typeof useTranslations>
): string[] {
  const messages: string[] = [];

  if (discriminationFlag != null) {
    if (discriminationFlag === DiscriminationFlag.NEGATIVE) {
      messages.push(t('issues.negativeDiscrimination'));
    } else if (discriminationFlag === DiscriminationFlag.CRITICAL) {
      messages.push(t('issues.criticalDiscrimination'));
    } else if (discriminationFlag === DiscriminationFlag.WARNING) {
      messages.push(t('issues.weakDiscrimination'));
    }
  }

  if (difficultyFlag != null) {
    if (difficultyFlag === DifficultyFlag.TOO_HARD) {
      messages.push(t('issues.tooHard'));
    } else if (difficultyFlag === DifficultyFlag.TOO_EASY) {
      messages.push(t('issues.tooEasy'));
    }
  }

  return messages;
}

/**
 * IssuesBanner - Warning banner for items with psychometric issues
 *
 * Features:
 * - Compact on mobile (icon + count + tap to expand)
 * - Full details on desktop
 * - Positioned immediately after header for critical visibility
 * - Direct link to detailed analysis
 */
export function IssuesBanner({
  questionId,
  discriminationFlag,
  difficultyFlag,
  validityStatus,
  className,
}: IssuesBannerProps) {
  const isMobile = useIsMobile();
  const t = useTranslations('psychometrics');
  const issues = getIssueMessages(discriminationFlag, difficultyFlag, t);
  const hasIssues = issues.length > 0 ||
    validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW ||
    validityStatus === ItemValidityStatus.RETIRED;

  // Don't render if no issues
  if (!hasIssues) return null;

  // Mobile: Compact banner with essential info
  if (isMobile) {
    return (
      <Card
        className={cn(
          'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20',
          className
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {issues.length > 0 ? issues[0] : t('issues.requiresReview')}
              </p>
              {issues.length > 1 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  {t('issues.moreIssues', { count: issues.length - 1 })}
                </p>
              )}
            </div>
            {validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
              <UiLink
                href={`/psychometrics/flagged/${questionId}`}
                variant="ghost"
                className="shrink-0 text-amber-700 dark:text-amber-300 p-2 -mr-2"
                aria-label={t('issues.viewDetails')}
              >
                <ChevronRight className="h-4 w-4" />
              </UiLink>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop: Full banner with all details
  return (
    <Card
      className={cn(
        'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">
              {t('issues.psychometricIssues')}
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-400 mt-1 space-y-0.5">
              {issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
              {issues.length === 0 && validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                <li>• {t('issues.itemFlagged')}</li>
              )}
              {issues.length === 0 && validityStatus === ItemValidityStatus.RETIRED && (
                <li>• {t('issues.itemRetired')}</li>
              )}
            </ul>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              {t('issues.recommendReview')}
            </p>
            {validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
              <div className="mt-3">
                <UiLink
                  href={`/psychometrics/flagged/${questionId}`}
                  variant="underline"
                  className="text-amber-700 dark:text-amber-300 decoration-amber-500/50 hover:decoration-amber-500"
                  trailingIcon={<ExternalLink className="h-3 w-3" />}
                >
                  {t('issues.viewDetailedAnalysis')}
                </UiLink>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default IssuesBanner;
