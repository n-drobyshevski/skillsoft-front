'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  EnhancedSheet,
  EnhancedSheetHeader,
} from '@/components/ui/enhanced-sheet';
import {
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { TemplateActivityStats } from '@/types/activity';

export interface StatsDetailSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Stats data to display */
  stats: TemplateActivityStats | null;
  /** Which stat card was tapped (determines initial content focus) */
  focusedStat?: 'sessions' | 'completion' | 'passRate' | 'avgScore';
}

/**
 * StatsDetailSheet - Bottom sheet for displaying detailed stats on mobile.
 *
 * Features:
 * - Uses EnhancedSheet with 'half' snap point
 * - Shows full breakdown for all stats
 * - Sessions breakdown: completed/abandoned/timed-out
 * - Average time detail
 * - Color-coded values based on thresholds
 */
export function StatsDetailSheet({
  open,
  onOpenChange,
  stats,
  focusedStat,
}: StatsDetailSheetProps) {
  const t = useTranslations('activity.stats');

  if (!stats) return null;

  return (
    <EnhancedSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={['half', 'full']}
      defaultSnapPoint="half"
      title={t('detailsTitle')}
      description={t('detailsDescription')}
    >
      <EnhancedSheetHeader
        title={t('detailsTitle')}
        description={t('detailsDescription')}
      />

      <div className="px-4 space-y-6 pb-6">
        {/* Total Sessions Breakdown */}
        <StatSection
          icon={BarChart3}
          title={t('totalSessions')}
          value={stats.totalSessions.toString()}
          highlighted={focusedStat === 'sessions'}
        >
          <div className="grid grid-cols-3 gap-3 mt-3">
            <StatBadge
              icon={CheckCircle}
              label={t('completedSessions')}
              value={stats.completedCount}
              color="emerald"
            />
            <StatBadge
              icon={XCircle}
              label={t('abandonedSessions')}
              value={stats.abandonedCount}
              color="amber"
            />
            <StatBadge
              icon={Timer}
              label={t('timedOutSessions')}
              value={stats.timedOutCount}
              color="red"
            />
          </div>
        </StatSection>

        {/* Completion Rate */}
        <StatSection
          icon={CheckCircle}
          title={t('completionRate')}
          value={`${Math.round(stats.completionRate)}%`}
          valueColor={getColorClass(stats.completionRate, 80, 50)}
          highlighted={focusedStat === 'completion'}
        >
          <ProgressBar value={stats.completionRate} color="emerald" />
          <p className="text-xs text-muted-foreground mt-2">
            {t('completionRateDescription')}
          </p>
        </StatSection>

        {/* Pass Rate */}
        <StatSection
          icon={Target}
          title={t('passRate')}
          value={`${Math.round(stats.passRate)}%`}
          valueColor={getColorClass(stats.passRate, 80, 50)}
          highlighted={focusedStat === 'passRate'}
        >
          <ProgressBar value={stats.passRate} color="blue" />
          <p className="text-xs text-muted-foreground mt-2">
            {t('passRateDescription')}
          </p>
        </StatSection>

        {/* Average Score & Time */}
        <StatSection
          icon={TrendingUp}
          title={t('averageScore')}
          value={`${Math.round(stats.averageScore)}%`}
          valueColor={getColorClass(stats.averageScore, 80, 50)}
          highlighted={focusedStat === 'avgScore'}
        >
          <ProgressBar value={stats.averageScore} color="violet" />
          <div className="flex items-center gap-2 mt-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('averageTime')}:</span>
            <span className="font-semibold">
              {formatDuration(stats.averageTimeSeconds)}
            </span>
          </div>
        </StatSection>

        {/* Last Activity */}
        {stats.lastActivity && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {t('lastActivity')}: {formatLastActivity(stats.lastActivity)}
            </p>
          </div>
        )}
      </div>
    </EnhancedSheet>
  );
}

/**
 * Stat Section Component
 */
interface StatSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  valueColor?: string;
  highlighted?: boolean;
  children?: React.ReactNode;
}

function StatSection({
  icon: Icon,
  title,
  value,
  valueColor = 'text-foreground',
  highlighted,
  children,
}: StatSectionProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-colors',
        highlighted ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className={cn('text-2xl font-bold', valueColor)}>{value}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Stat Badge Component
 */
interface StatBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'gray';
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
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800/30',
    text: 'text-gray-700 dark:text-gray-300',
    icon: 'text-gray-600 dark:text-gray-400',
  },
};

function StatBadge({ icon: Icon, label, value, color }: StatBadgeProps) {
  const colors = BADGE_COLORS[color];

  return (
    <div className={cn('rounded-lg p-2 text-center', colors.bg)}>
      <Icon className={cn('w-4 h-4 mx-auto mb-1', colors.icon)} />
      <p className={cn('text-lg font-bold', colors.text)}>{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  value: number;
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'violet';
}

const PROGRESS_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
};

function ProgressBar({ value, color }: ProgressBarProps) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
      <div
        className={cn('h-full rounded-full transition-all', PROGRESS_COLORS[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
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
 * Format last activity date
 */
function formatLastActivity(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default StatsDetailSheet;
