import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatActivityDate, formatDuration } from '@/lib/format-activity';

interface ActivityResultCardProps {
  id: string;
  templateName: string;
  score: number; // 0-100
  passed: boolean;
  completedAt: string;
  questionsAnswered: number;
  totalTimeSeconds: number;
  locale: string;
  labels: {
    passed: string;
    failed: string;
    questions: string;
    details: string;
  };
}

/**
 * Shared result card for activity pages.
 * Shows score circle + template name + pass/fail badge + date + stats + action link.
 * Used by /test-templates/history as a server component.
 */
export function ActivityResultCard({
  id,
  templateName,
  score,
  passed,
  completedAt,
  questionsAnswered,
  totalTimeSeconds,
  locale,
  labels,
}: ActivityResultCardProps) {
  const percentScore = Math.round(score);

  return (
    <Card className="active:scale-[0.99] transition-transform duration-200 hover:border-primary/50">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Header Row (Mobile: Top, Desktop: Left) */}
        <div className="flex items-start gap-4 flex-1">
          {/* Score Circle */}
          <div
            className={cn(
              'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 mt-1 sm:mt-0',
              passed
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            )}
          >
            {percentScore}%
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-base leading-tight">{templateName}</h4>
              <Badge
                variant={passed ? 'default' : 'secondary'}
                className="h-5 px-1.5 text-[10px]"
              >
                {passed ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {passed ? labels.passed : labels.failed}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatActivityDate(completedAt, locale)}
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span>
                {questionsAnswered} {labels.questions}
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span>{formatDuration(totalTimeSeconds, locale)}</span>
            </div>
          </div>
        </div>

        {/* Action (Mobile: Full Width Button, Desktop: Arrow) */}
        <div className="w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
          <Link href={`/test-templates/results/${id}`} className="block">
            <Button
              variant="ghost"
              className="w-full sm:w-auto justify-between sm:justify-center group"
            >
              <span className="sm:hidden">{labels.details}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
