'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  ChevronRight,
} from 'lucide-react';
import { StatsDetailSheet } from './StatsDetailSheet';
import type { TemplateActivityStats } from '@/types/activity';

export interface ActivityStatsCardProps {
  /** Stats data to display */
  stats: TemplateActivityStats | null;
  /** Loading state */
  loading?: boolean;
  /** Additional class name for grid positioning */
  className?: string;
}

/**
 * ActivityStatsCard - Sidebar-style stats card for Activity tab.
 *
 * Features:
 * - Vertical stat items with icons
 * - Progress bars for percentage metrics
 * - Mobile: "View Full Breakdown" button opens StatsDetailSheet
 * - Matches Overview/Settings tab card patterns
 */
export function ActivityStatsCard({
  stats,
  loading = false,
  className,
}: ActivityStatsCardProps) {
  const t = useTranslations('activity.stats');
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (loading) {
    return <ActivityStatsCardSkeleton className={className} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Total Sessions */}
          <StatItem
            icon={Users}
            label={t('totalSessions')}
            value={stats.totalSessions.toString()}
          >
            {/* Session breakdown - inline badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              <StatBadge
                icon={CheckCircle}
                value={stats.completedCount}
                color="emerald"
              />
              <StatBadge
                icon={XCircle}
                value={stats.abandonedCount}
                color="amber"
              />
              <StatBadge
                icon={Timer}
                value={stats.timedOutCount}
                color="red"
              />
            </div>
          </StatItem>

          <Separator />

          {/* Pass Rate */}
          <StatItem
            icon={Target}
            label={t('passRate')}
            value={`${Math.round(stats.passRate)}%`}
            valueColor={getColorClass(stats.passRate)}
          >
            <Progress value={stats.passRate} className="h-2 mt-2" />
          </StatItem>

          <Separator />

          {/* Average Score */}
          <StatItem
            icon={TrendingUp}
            label={t('averageScore')}
            value={`${Math.round(stats.averageScore)}%`}
            valueColor={getColorClass(stats.averageScore)}
          >
            <Progress value={stats.averageScore} className="h-2 mt-2" />
          </StatItem>

          <Separator />

          {/* Average Time */}
          <StatItem
            icon={Clock}
            label={t('averageTime')}
            value={formatDuration(stats.averageTimeSeconds)}
          />

          {/* Mobile: View Full Breakdown button */}
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 gap-2"
              onClick={() => setSheetOpen(true)}
            >
              {t('viewFullBreakdown')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Mobile Stats Detail Sheet */}
      <StatsDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        stats={stats}
      />
    </>
  );
}

/**
 * Stat Item Component - Single stat row
 */
interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueColor?: string;
  children?: React.ReactNode;
}

function StatItem({
  icon: Icon,
  label,
  value,
  valueColor = 'text-foreground',
  children,
}: StatItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
        </div>
        <span className={cn('text-lg font-bold', valueColor)}>{value}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * Stat Badge Component - Small inline badge for session counts
 */
interface StatBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  color: 'emerald' | 'amber' | 'red';
}

const BADGE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
  },
};

function StatBadge({ icon: Icon, value, color }: StatBadgeProps) {
  const colors = BADGE_COLORS[color];

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md', colors.bg)}>
      <Icon className={cn('w-3 h-3', colors.icon)} />
      <span className={cn('text-sm font-semibold', colors.text)}>{value}</span>
    </div>
  );
}

/**
 * Get color class based on value thresholds
 */
function getColorClass(value: number): string {
  if (value >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (value >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  if (!seconds) return '--';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Loading skeleton for ActivityStatsCard
 */
function ActivityStatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-36 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
            {i < 4 && <Skeleton className="h-2 w-full mt-2" />}
            {i < 4 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ActivityStatsCard;
