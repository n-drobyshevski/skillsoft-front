// Shared hero utilities extracted from HeroCard.tsx

import { cn } from '@/lib/utils';
import type { HeroVariant } from './types';

export { cn };

export const VARIANT_STYLES = {
  success: {
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bg: 'bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    progressTrack: 'bg-emerald-100 dark:bg-emerald-900/30',
    progressFill: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500 hover:bg-emerald-600',
    titleText: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800/50',
    bg: 'bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    progressTrack: 'bg-amber-100 dark:bg-amber-900/30',
    progressFill: 'bg-amber-500',
    badgeBg: 'bg-amber-500 hover:bg-amber-600',
    titleText: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800/50',
    bg: 'bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    progressTrack: 'bg-blue-100 dark:bg-blue-900/30',
    progressFill: 'bg-blue-500',
    badgeBg: 'bg-blue-500 hover:bg-blue-600',
    titleText: 'text-blue-700 dark:text-blue-300',
  },
  neutral: {
    border: 'border-border',
    bg: 'bg-gradient-to-br from-muted/30 to-transparent',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    ring: 'ring-primary/20',
    progressTrack: 'bg-muted',
    progressFill: 'bg-primary',
    badgeBg: 'bg-primary hover:bg-primary/90',
    titleText: 'text-foreground',
  },
} as const;

export function formatDuration(seconds: number, locale: string): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const h = locale === 'ru' ? 'ч' : 'h';
  const m = locale === 'ru' ? 'м' : 'm';
  const s = locale === 'ru' ? 'с' : 's';
  if (hours > 0) return `${hours}${h} ${mins}${m}`;
  if (mins > 0) return `${mins}${m} ${secs}${s}`;
  return `${secs}${s}`;
}

export function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// CircularScore — animated SVG ring
// ============================================================================

interface CircularScoreProps {
  percentage: number;
  variant: HeroVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function CircularScore({ percentage, variant, size = 'md' }: CircularScoreProps) {
  const styles = VARIANT_STYLES[variant];
  const sizes = {
    xs: { outer: 64, inner: 48, stroke: 5, text: 'text-sm' },
    sm: { outer: 80, inner: 64, stroke: 4, text: 'text-lg' },
    md: { outer: 100, inner: 80, stroke: 5, text: 'text-2xl' },
    lg: { outer: 120, inner: 96, stroke: 6, text: 'text-3xl' },
  };
  const s = sizes[size];
  const radius = s.inner / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative" style={{ width: s.outer, height: s.outer }}>
      <svg
        className="transform -rotate-90"
        width={s.outer}
        height={s.outer}
        viewBox={`0 0 ${s.outer} ${s.outer}`}
      >
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          className="text-muted/30"
        />
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-1000 ease-out', styles.iconText)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold tabular-nums', s.text, styles.iconText)}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MetricPill — inline stat with icon, value, and label
// ============================================================================

interface MetricPillProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
}

export function MetricPill({ icon: Icon, label, value, subValue }: MetricPillProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold tabular-nums truncate">
          {value}
          {subValue && (
            <span className="text-muted-foreground font-normal text-xs ml-0.5">{subValue}</span>
          )}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
    </div>
  );
}
