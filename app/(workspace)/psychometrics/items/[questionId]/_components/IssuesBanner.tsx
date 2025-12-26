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
 * Get issue messages based on flags
 */
function getIssueMessages(
  discriminationFlag: DiscriminationFlag | null,
  difficultyFlag: DifficultyFlag | null
): string[] {
  const messages: string[] = [];

  if (discriminationFlag != null) {
    if (discriminationFlag === DiscriminationFlag.NEGATIVE) {
      messages.push('Негативный индекс различения - элемент работает в обратном направлении');
    } else if (discriminationFlag === DiscriminationFlag.CRITICAL) {
      messages.push('Критически низкий индекс различения');
    } else if (discriminationFlag === DiscriminationFlag.WARNING) {
      messages.push('Слабый индекс различения');
    }
  }

  if (difficultyFlag != null) {
    if (difficultyFlag === DifficultyFlag.TOO_HARD) {
      messages.push('Вопрос слишком сложный');
    } else if (difficultyFlag === DifficultyFlag.TOO_EASY) {
      messages.push('Вопрос слишком легкий');
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
  const issues = getIssueMessages(discriminationFlag, difficultyFlag);
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
                {issues.length > 0 ? issues[0] : 'Требует проверки'}
              </p>
              {issues.length > 1 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  +{issues.length - 1} ещё
                </p>
              )}
            </div>
            {validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
              <UiLink
                href={`/psychometrics/flagged/${questionId}`}
                variant="ghost"
                className="shrink-0 text-amber-700 dark:text-amber-300 p-2 -mr-2"
                aria-label="Подробнее"
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
              Обнаружены проблемы с психометрикой
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-400 mt-1 space-y-0.5">
              {issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
              {issues.length === 0 && validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                <li>• Элемент помечен для проверки</li>
              )}
              {issues.length === 0 && validityStatus === ItemValidityStatus.RETIRED && (
                <li>• Элемент выведен из использования</li>
              )}
            </ul>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              Рекомендуется пересмотреть формулировку или варианты ответов.
            </p>
            {validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
              <div className="mt-3">
                <UiLink
                  href={`/psychometrics/flagged/${questionId}`}
                  variant="underline"
                  className="text-amber-700 dark:text-amber-300 decoration-amber-500/50 hover:decoration-amber-500"
                  trailingIcon={<ExternalLink className="h-3 w-3" />}
                >
                  Перейти к детальному анализу проблемы
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
