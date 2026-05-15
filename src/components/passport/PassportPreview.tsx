'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormattedDates } from '@/hooks/useFormattedDates';
import { PassportStatusBadge, getPassportStatus } from './PassportStatusBadge';
import type { CompetencyPassport } from '@/types/domain';

// Types

export interface PassportPreviewProps {
  /** The passport data */
  passport: CompetencyPassport | null;
  /** Whether passport is loading */
  isLoading?: boolean;
  /** Callback when "View Full Passport" is clicked */
  onViewFullPassport?: () => void;
  /** Whether to start in expanded state */
  defaultExpanded?: boolean;
  /** Maximum number of scores to show before "show more" */
  maxVisible?: number;
  /** Additional class names */
  className?: string;
}

// Helpers

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

// Sub-components

function ScoreItem({
  name,
  score,
}: {
  name: string;
  score: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="truncate flex-1 mr-2 font-medium">{name}</span>
        <span className={cn('font-mono text-xs', getScoreTextColor(score))}>
          {score}%
        </span>
      </div>
      {/* Custom score bar since Progress doesn't support indicatorClassName */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getScoreColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-32 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyState({ onStartAssessment }: { onStartAssessment?: () => void }) {
  return (
    <Card className="w-full border-dashed">
      <CardContent className="py-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Shield className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-medium mb-1">Нет паспорта компетенций</h4>
        <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
          Пройдите обзорное тестирование, чтобы создать паспорт компетенций
        </p>
        {onStartAssessment && (
          <Button variant="outline" size="sm" onClick={onStartAssessment}>
            Начать тестирование
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Main Component

export function PassportPreview({
  passport,
  isLoading = false,
  onViewFullPassport,
  defaultExpanded = false,
  maxVisible = 5,
  className,
}: PassportPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { formatRelativeTime } = useFormattedDates();

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Empty state
  if (!passport) {
    return <EmptyState />;
  }

  // Get scores sorted by value (highest first)
  const scoreEntries = Object.entries(passport.scores).sort(
    ([, a], [, b]) => b - a
  );
  const competencyCount = scoreEntries.length;
  const visibleScores = isExpanded
    ? scoreEntries
    : scoreEntries.slice(0, maxVisible);
  const hiddenCount = Math.max(0, competencyCount - maxVisible);
  const status = getPassportStatus(passport);

  return (
    <Card
      className={cn(
        'w-full',
        status === 'valid' &&
          'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20',
        status === 'expired' &&
          'border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/20',
        className
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button
              className="flex items-start justify-between w-full text-left group"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Паспорт компетенций
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {competencyCount} компетенций
                    {passport.lastUpdated && (
                      <>
                        {' '}
                        ·{' '}
                        {formatRelativeTime(passport.lastUpdated)}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PassportStatusBadge
                  status={status}
                  expiresAt={passport.expiresAt}
                  lastUpdated={passport.lastUpdated}
                  competencyCount={competencyCount}
                  size="sm"
                  showTooltip={false}
                />
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Competency Scores */}
            <div className="space-y-3">
              {visibleScores.map(([name, score]) => (
                <ScoreItem key={name} name={name} score={score} />
              ))}
            </div>

            {/* Show More Button */}
            {hiddenCount > 0 && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Ещё {hiddenCount} компетенций
              </Button>
            )}

            {/* View Full Passport Link */}
            {onViewFullPassport && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onViewFullPassport}
              >
                Открыть полный паспорт
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default PassportPreview;
