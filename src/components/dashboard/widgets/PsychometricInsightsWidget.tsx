'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { FlaggedItemSummary } from '@/types/psychometrics';
import type { PsychometricSummary } from '@/types/dashboard';
import { getHealthLabel, getHealthColor } from '@/types/dashboard';

/**
 * Props for PsychometricInsightsWidget
 */
export interface PsychometricInsightsWidgetProps {
  /** Psychometric summary data */
  data: PsychometricSummary | null;
  /** Loading state */
  loading?: boolean;
  /** Callback for triggering audit */
  onTriggerAudit?: () => void;
  /** Whether audit is in progress */
  auditInProgress?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PsychometricInsightsWidget - Displays psychometric health overview.
 *
 * Features:
 * - Semi-circular gauge showing health score (0-100)
 * - Flagged items count with alert badge
 * - Top flagged items preview
 * - Quick action to view all/trigger audit
 *
 * @example
 * ```tsx
 * <PsychometricInsightsWidget
 *   data={psychometricSummary}
 *   onTriggerAudit={handleAudit}
 * />
 * ```
 */
export function PsychometricInsightsWidget({
  data,
  loading = false,
  onTriggerAudit,
  auditInProgress = false,
  className,
}: PsychometricInsightsWidgetProps) {
  if (loading) {
    return <PsychometricInsightsWidgetSkeleton className={className} />;
  }

  if (!data) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Psychometric Health</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No psychometric data available.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Run your first audit to see metrics.
          </p>
          {onTriggerAudit && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onTriggerAudit}
              disabled={auditInProgress}
            >
              <RefreshCw
                className={cn('w-4 h-4 mr-2', auditInProgress && 'animate-spin')}
              />
              Run Audit
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const { healthScore, flaggedItems, reliableCompetencies, auditRecommended, topFlaggedItems } =
    data;

  const healthColors = getHealthColor(healthScore);
  const healthLabel = getHealthLabel(healthScore);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Psychometric Health</CardTitle>
          </div>
        </div>
        <Link href="/psychometrics">
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">View psychometrics dashboard</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score Gauge */}
        <div className="flex items-center justify-center">
          <HealthGauge score={healthScore} label={healthLabel} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div
              className={cn(
                'text-lg font-bold',
                flaggedItems > 5 ? 'text-amber-600' : 'text-muted-foreground'
              )}
            >
              {flaggedItems}
            </div>
            <div className="text-xs text-muted-foreground">Flagged Items</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-lg font-bold text-emerald-600">
              {reliableCompetencies}
            </div>
            <div className="text-xs text-muted-foreground">
              Reliable Competencies
            </div>
          </div>
        </div>

        {/* Flagged Items Preview */}
        {topFlaggedItems && topFlaggedItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Top Issues
              </span>
              <Link
                href="/psychometrics/flagged"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-1.5">
              {topFlaggedItems.slice(0, 3).map((item) => (
                <FlaggedItemPreview key={item.questionId} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Audit Recommendation */}
        {auditRecommended && (
          <div className="flex items-center justify-between p-2 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Audit recommended</span>
            </div>
            {onTriggerAudit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onTriggerAudit}
                disabled={auditInProgress}
              >
                <RefreshCw
                  className={cn(
                    'w-3 h-3 mr-1',
                    auditInProgress && 'animate-spin'
                  )}
                />
                Run
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Semi-circular gauge component for health score
 */
function HealthGauge({ score, label }: { score: number; label: string }) {
  // Calculate arc for semi-circle
  const normalizedScore = Math.min(100, Math.max(0, score));
  const rotation = (normalizedScore / 100) * 180 - 90; // -90 to 90 degrees
  const { bg, text } = getHealthColor(score);

  return (
    <div className="relative w-32 h-16 overflow-hidden">
      {/* Background arc */}
      <div className="absolute inset-0 border-4 border-muted rounded-t-full" />

      {/* Colored arc (progress) */}
      <div
        className={cn('absolute inset-0 border-4 rounded-t-full', text)}
        style={{
          borderColor: 'currentColor',
          clipPath: `polygon(0 100%, 0 0, ${normalizedScore}% 0, ${normalizedScore}% 100%)`,
        }}
      />

      {/* Center content */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div className="text-xl font-bold">{score}</div>
        <div className={cn('text-xs font-medium', text)}>{label}</div>
      </div>
    </div>
  );
}

/**
 * Flagged item preview row
 */
function FlaggedItemPreview({ item }: { item: FlaggedItemSummary }) {
  return (
    <Link
      href={`/psychometrics/flagged/${item.questionId}`}
      className="block p-2 rounded border border-transparent hover:border-border hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span className="text-xs truncate flex-1">
          {item.questionText || 'Question'}
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5">
          rpb: {item.discriminationIndex?.toFixed(2) ?? 'N/A'}
        </Badge>
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for PsychometricInsightsWidget
 */
function PsychometricInsightsWidgetSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn('h-full animate-pulse', className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <Skeleton className="w-32 h-16 rounded-t-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
