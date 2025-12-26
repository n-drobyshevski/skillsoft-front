'use client';

import React from 'react';
import {
  Briefcase,
  TrendingDown,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { STRATEGY_CONFIG } from './strategy-context';

// ============================================
// TYPES
// ============================================

interface JobFitGap {
  competency: string;
  gap: number; // negative = below requirement
}

interface JobFitAlignmentCardProps {
  onetSocCode?: string;
  jobTitle?: string;
  coveragePercentage: number;
  gaps: JobFitGap[];
  strengths: JobFitGap[];
  isLoading?: boolean;
  className?: string;
}

// ============================================
// LOADING SKELETON
// ============================================

function JobFitAlignmentSkeleton() {
  return (
    <div className="p-3 rounded-xl border bg-muted/30 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-12 rounded-lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================
// MISSING CONFIG WARNING
// ============================================

function MissingOnetWarning() {
  const config = STRATEGY_CONFIG.TARGETED_FIT;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border',
        'border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/50'
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-amber-500 mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            O*NET Code Not Configured
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Add an O*NET SOC code in the template settings to enable job-specific
            alignment insights.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function JobFitAlignmentCard({
  onetSocCode,
  jobTitle,
  coveragePercentage,
  gaps,
  strengths,
  isLoading,
  className,
}: JobFitAlignmentCardProps) {
  const config = STRATEGY_CONFIG.TARGETED_FIT;

  // Show loading skeleton
  if (isLoading) {
    return <JobFitAlignmentSkeleton />;
  }

  // Show warning if no O*NET code
  if (!onetSocCode) {
    return <MissingOnetWarning />;
  }

  const topGaps = gaps.slice(0, 3);
  const topStrengths = strengths.slice(0, 3);

  return (
    <div
      className={cn('p-3 rounded-xl border space-y-3', config.border, config.bg, className)}
      role="region"
      aria-label="Job Fit Alignment Analysis"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Briefcase
          className={cn('h-4 w-4', config.iconText)}
          aria-hidden="true"
        />
        <span className="text-sm font-medium">Job Fit Alignment</span>
      </div>

      {/* O*NET Info */}
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg border',
          config.iconBg,
          config.border
        )}
      >
        <Briefcase
          className={cn('h-4 w-4 shrink-0', config.iconText)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {onetSocCode}
            </Badge>
            <a
              href={`https://www.onetonline.org/link/summary/${onetSocCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="View on O*NET OnLine (opens in new tab)"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {jobTitle && (
            <p className="text-sm font-medium truncate mt-0.5">{jobTitle}</p>
          )}
        </div>
      </div>

      {/* Coverage Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Requirement Coverage</span>
          <span
            className={cn(
              'font-semibold tabular-nums',
              coveragePercentage >= 70
                ? 'text-emerald-600 dark:text-emerald-400'
                : coveragePercentage >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            )}
          >
            {coveragePercentage}%
          </span>
        </div>
        <Progress
          value={coveragePercentage}
          className="h-2"
          aria-label={`Requirement coverage: ${coveragePercentage}%`}
        />
      </div>

      {/* Development Areas (Gaps) */}
      {topGaps.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Development Areas
          </span>
          <div className="space-y-1">
            {topGaps.map((gap) => (
              <div
                key={gap.competency}
                className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30"
              >
                <span className="text-xs truncate max-w-[60%]">{gap.competency}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 tabular-nums shrink-0"
                >
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                  {gap.gap}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {topStrengths.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Strengths</span>
          <div className="flex flex-wrap gap-1.5">
            {topStrengths.map((strength) => (
              <Badge
                key={strength.competency}
                variant="outline"
                className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              >
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                {strength.competency}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobFitAlignmentCard;
