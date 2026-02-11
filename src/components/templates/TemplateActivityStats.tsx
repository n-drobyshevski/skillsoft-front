'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Info,
} from 'lucide-react';
import { StatsDetailSheet } from './activity/StatsDetailSheet';
import type { TemplateActivityStats as TemplateActivityStatsType } from '@/types/activity';

export interface TemplateActivityStatsProps {
  stats: TemplateActivityStatsType | null;
  loading?: boolean;
  className?: string;
}

/** Stat card focus type for detail sheet */
type StatFocus = 'sessions' | 'completion' | 'passRate' | 'avgScore';

/**
 * TemplateActivityStats - Displays aggregated activity statistics for a template.
 *
 * Features:
 * - 4 compact stat cards in a responsive grid
 * - Shows total sessions, completion rate, pass rate, average score
 * - Mobile: tap to expand details in bottom sheet
 * - Desktop: shows sub-stats inline
 * - Loading skeleton state
 */
export function TemplateActivityStats({
  stats,
  loading = false,
  className,
}: TemplateActivityStatsProps) {
  const t = useTranslations('activity.stats');
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusedStat, setFocusedStat] = useState<StatFocus | undefined>();

  if (loading) {
    return <TemplateActivityStatsSkeleton className={className} />;
  }

  if (!stats) {
    return null;
  }

  // Handle stat card tap on mobile
  const handleStatTap = (statKey: StatFocus) => {
    if (isMobile) {
      setFocusedStat(statKey);
      setSheetOpen(true);
    }
  };

  const statCards: StatCardData[] = [
    {
      key: 'sessions',
      label: t('totalSessions'),
      value: stats.totalSessions.toString(),
      icon: BarChart3,
      subStats: [
        { label: t('completedSessions'), value: stats.completedCount, color: 'text-emerald-600' },
        { label: t('abandonedSessions'), value: stats.abandonedCount, color: 'text-amber-600' },
        { label: t('timedOutSessions'), value: stats.timedOutCount, color: 'text-red-600' },
      ],
    },
    {
      key: 'completion',
      label: t('completionRate'),
      value: `${Math.round(stats.completionRate)}%`,
      icon: CheckCircle,
      color: getColorClass(stats.completionRate, 80, 50),
      trend: stats.completionRate >= 70 ? 'positive' : 'neutral',
    },
    {
      key: 'passRate',
      label: t('passRate'),
      value: `${Math.round(stats.passRate)}%`,
      icon: Target,
      color: getColorClass(stats.passRate, 80, 50),
      trend: stats.passRate >= 70 ? 'positive' : 'neutral',
    },
    {
      key: 'avgScore',
      label: t('averageScore'),
      value: `${Math.round(stats.averageScore)}%`,
      icon: TrendingUp,
      color: getColorClass(stats.averageScore, 80, 50),
      subValue: stats.averageTimeSeconds
        ? formatDuration(stats.averageTimeSeconds)
        : undefined,
      subLabel: t('averageTime'),
    },
  ];

  return (
    <>
      <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4', className)}>
        {statCards.map(({ key, ...rest }) => (
          <StatCard
            key={key}
            {...rest}
            isMobile={isMobile}
            onTap={() => handleStatTap(key)}
          />
        ))}
      </div>

      {/* Mobile Stats Detail Sheet */}
      <StatsDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        stats={stats}
        focusedStat={focusedStat}
      />
    </>
  );
}

/**
 * Stat card data type
 */
interface StatCardData {
  key: StatFocus;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  subStats?: Array<{ label: string; value: number; color?: string }>;
  subValue?: string;
  subLabel?: string;
}

/**
 * Individual stat card props
 */
interface StatCardProps extends StatCardData {
  isMobile?: boolean;
  onTap?: () => void;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-foreground',
  trend,
  subStats,
  subValue,
  subLabel,
  isMobile = false,
  onTap,
}: StatCardProps) {
  const t = useTranslations('activity.stats');

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-colors',
        isMobile && 'cursor-pointer active:bg-muted/50 touch-manipulation'
      )}
      onClick={isMobile ? onTap : undefined}
      role={isMobile ? 'button' : undefined}
      tabIndex={isMobile ? 0 : undefined}
      onKeyDown={isMobile ? (e) => e.key === 'Enter' && onTap?.() : undefined}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={cn('text-xl md:text-2xl font-bold', color)}>{value}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Sub-stats (for total sessions breakdown) - hidden on mobile */}
        {subStats && !isMobile && (
          <div className="flex gap-3 mt-3 text-xs">
            {subStats.map((sub, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className={cn('font-semibold', sub.color)}>{sub.value}</span>
                <span className="text-muted-foreground truncate">{sub.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sub-value (for average time) - hidden on mobile */}
        {subValue && subLabel && !isMobile && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{subLabel}:</span>
            <span className="font-medium text-foreground">{subValue}</span>
          </div>
        )}

        {/* Mobile tap hint */}
        {isMobile && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>{t('tapForDetails')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get color class based on value thresholds
 */
function getColorClass(value: number, good: number, warning: number): string {
  if (value >= good) return 'text-emerald-600 dark:text-emerald-400';
  if (value >= warning) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Loading skeleton for TemplateActivityStats
 */
function TemplateActivityStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
