'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Database,
  type LucideIcon,
} from 'lucide-react';
import {
  DiscriminationFlag,
  DifficultyFlag,
  ReliabilityStatus,
} from '@/types/psychometrics';

/**
 * Accessible Badge System
 *
 * All badges in this module are designed to be accessible:
 * - Icons provide shape-based differentiation (colorblind-friendly)
 * - sr-only text provides full descriptions for screen readers
 * - ARIA attributes for proper semantic meaning
 * - High contrast color combinations
 * - Consistent sizing with touch-friendly targets
 */

// ============================================
// SHARED TYPES AND UTILITIES
// ============================================

interface BadgeConfig {
  label: string;
  description: string;
  icon: LucideIcon;
  colorClasses: string;
  iconColorClasses: string;
}

interface AccessibleBadgeProps {
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    badge: 'text-xs px-1.5 py-0.5 min-h-[24px]',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    badge: 'text-xs px-2 py-0.5 min-h-[28px]',
    icon: 'h-3.5 w-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    badge: 'text-sm px-2.5 py-1 min-h-[32px]',
    icon: 'h-4 w-4',
    gap: 'gap-2',
  },
};

// ============================================
// DISCRIMINATION FLAG BADGE
// ============================================

const discriminationFlagConfig: Record<DiscriminationFlag, BadgeConfig> = {
  [DiscriminationFlag.NONE]: {
    label: 'Норма',
    description: 'Discrimination index is within acceptable range',
    icon: CheckCircle2,
    colorClasses: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    iconColorClasses: 'text-emerald-600 dark:text-emerald-400',
  },
  [DiscriminationFlag.WARNING]: {
    label: 'Предупреждение',
    description: 'Low discrimination (0.1-0.19) - item may need revision',
    icon: AlertCircle,
    colorClasses: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    iconColorClasses: 'text-amber-600 dark:text-amber-400',
  },
  [DiscriminationFlag.CRITICAL]: {
    label: 'Критично',
    description: 'Very low discrimination (0-0.09) - item needs immediate attention',
    icon: AlertTriangle,
    colorClasses: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    iconColorClasses: 'text-orange-600 dark:text-orange-400',
  },
  [DiscriminationFlag.NEGATIVE]: {
    label: 'Негативный',
    description: 'Negative discrimination - item is counterproductive and should be retired',
    icon: XCircle,
    colorClasses: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    iconColorClasses: 'text-red-600 dark:text-red-400',
  },
};

interface DiscriminationFlagBadgeProps extends AccessibleBadgeProps {
  flag: DiscriminationFlag | null;
}

export function DiscriminationFlagBadge({
  flag,
  className,
  showLabel = true,
  showIcon = true,
  size = 'md',
}: DiscriminationFlagBadgeProps) {
  if (!flag || flag === DiscriminationFlag.NONE) {
    return null;
  }

  const config = discriminationFlagConfig[flag];
  const Icon = config.icon;
  const styles = sizeConfig[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        config.colorClasses,
        styles.badge,
        showIcon && showLabel && styles.gap,
        'inline-flex items-center',
        className
      )}
      role="status"
      aria-label={config.description}
    >
      {showIcon && (
        <Icon
          className={cn(styles.icon, 'shrink-0')}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{config.label}</span>}
      <span className="sr-only">{config.description}</span>
    </Badge>
  );
}

// ============================================
// DIFFICULTY FLAG BADGE
// ============================================

const difficultyFlagConfig: Record<DifficultyFlag, BadgeConfig> = {
  [DifficultyFlag.NONE]: {
    label: 'Оптимальная',
    description: 'Difficulty is within optimal range (0.2-0.8)',
    icon: Minus,
    colorClasses: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    iconColorClasses: 'text-slate-600 dark:text-slate-400',
  },
  [DifficultyFlag.TOO_HARD]: {
    label: 'Слишком сложно',
    description: 'Item is too difficult (p < 0.2) - most candidates fail',
    icon: ArrowUp,
    colorClasses: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    iconColorClasses: 'text-blue-600 dark:text-blue-400',
  },
  [DifficultyFlag.TOO_EASY]: {
    label: 'Слишком просто',
    description: 'Item is too easy (p > 0.9) - most candidates pass',
    icon: ArrowDown,
    colorClasses: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    iconColorClasses: 'text-violet-600 dark:text-violet-400',
  },
};

interface DifficultyFlagBadgeProps extends AccessibleBadgeProps {
  flag: DifficultyFlag | null;
}

export function DifficultyFlagBadge({
  flag,
  className,
  showLabel = true,
  showIcon = true,
  size = 'md',
}: DifficultyFlagBadgeProps) {
  if (!flag || flag === DifficultyFlag.NONE) {
    return null;
  }

  const config = difficultyFlagConfig[flag];
  const Icon = config.icon;
  const styles = sizeConfig[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        config.colorClasses,
        styles.badge,
        showIcon && showLabel && styles.gap,
        'inline-flex items-center',
        className
      )}
      role="status"
      aria-label={config.description}
    >
      {showIcon && (
        <Icon
          className={cn(styles.icon, 'shrink-0')}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{config.label}</span>}
      <span className="sr-only">{config.description}</span>
    </Badge>
  );
}

// ============================================
// RELIABILITY STATUS BADGE
// ============================================

const reliabilityStatusConfig: Record<ReliabilityStatus, BadgeConfig> = {
  [ReliabilityStatus.RELIABLE]: {
    label: 'Надёжный',
    description: 'High reliability (α ≥ 0.8) - excellent internal consistency',
    icon: ShieldCheck,
    colorClasses: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    iconColorClasses: 'text-emerald-600 dark:text-emerald-400',
  },
  [ReliabilityStatus.ACCEPTABLE]: {
    label: 'Приемлемый',
    description: 'Acceptable reliability (α 0.6-0.79) - adequate for most purposes',
    icon: ShieldAlert,
    colorClasses: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    iconColorClasses: 'text-amber-600 dark:text-amber-400',
  },
  [ReliabilityStatus.UNRELIABLE]: {
    label: 'Ненадёжный',
    description: 'Low reliability (α < 0.6) - scale needs improvement',
    icon: ShieldX,
    colorClasses: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    iconColorClasses: 'text-red-600 dark:text-red-400',
  },
  [ReliabilityStatus.PRELIMINARY]: {
    label: 'Предварительный',
    description: 'Preliminary reliability estimate (20-49 sessions) - exploratory data',
    icon: HelpCircle,
    colorClasses: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    iconColorClasses: 'text-blue-600 dark:text-blue-400',
  },
  [ReliabilityStatus.INSUFFICIENT_DATA]: {
    label: 'Мало данных',
    description: 'Insufficient data to calculate reliability - need more responses',
    icon: Database,
    colorClasses: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    iconColorClasses: 'text-slate-600 dark:text-slate-400',
  },
};

interface ReliabilityStatusBadgeProps extends AccessibleBadgeProps {
  status: ReliabilityStatus;
}

export function ReliabilityStatusBadge({
  status,
  className,
  showLabel = true,
  showIcon = true,
  size = 'md',
}: ReliabilityStatusBadgeProps) {
  const config = reliabilityStatusConfig[status];
  const Icon = config.icon;
  const styles = sizeConfig[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        config.colorClasses,
        styles.badge,
        showIcon && showLabel && styles.gap,
        'inline-flex items-center',
        className
      )}
      role="status"
      aria-label={config.description}
    >
      {showIcon && (
        <Icon
          className={cn(styles.icon, 'shrink-0')}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{config.label}</span>}
      <span className="sr-only">{config.description}</span>
    </Badge>
  );
}

// ============================================
// SEVERITY BADGE (Generic)
// ============================================

export type SeverityLevel = 'success' | 'info' | 'warning' | 'error' | 'neutral';

const severityConfig: Record<SeverityLevel, BadgeConfig> = {
  success: {
    label: 'Успех',
    description: 'Operation completed successfully',
    icon: CheckCircle2,
    colorClasses: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    iconColorClasses: 'text-emerald-600 dark:text-emerald-400',
  },
  info: {
    label: 'Информация',
    description: 'Informational message',
    icon: HelpCircle,
    colorClasses: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    iconColorClasses: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    label: 'Предупреждение',
    description: 'Warning - action may be needed',
    icon: AlertTriangle,
    colorClasses: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    iconColorClasses: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    label: 'Ошибка',
    description: 'Error - action required',
    icon: XCircle,
    colorClasses: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    iconColorClasses: 'text-red-600 dark:text-red-400',
  },
  neutral: {
    label: 'Нейтрально',
    description: 'Neutral status',
    icon: Minus,
    colorClasses: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    iconColorClasses: 'text-slate-600 dark:text-slate-400',
  },
};

interface SeverityBadgeProps extends AccessibleBadgeProps {
  severity: SeverityLevel;
  label?: string;
  description?: string;
}

export function SeverityBadge({
  severity,
  label,
  description,
  className,
  showLabel = true,
  showIcon = true,
  size = 'md',
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;
  const styles = sizeConfig[size];
  const displayLabel = label || config.label;
  const displayDescription = description || config.description;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.colorClasses,
        styles.badge,
        showIcon && showLabel && styles.gap,
        'inline-flex items-center',
        className
      )}
      role="status"
      aria-label={displayDescription}
    >
      {showIcon && (
        <Icon
          className={cn(styles.icon, 'shrink-0')}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{displayLabel}</span>}
      <span className="sr-only">{displayDescription}</span>
    </Badge>
  );
}

// ============================================
// COUNT BADGE (for notifications/indicators)
// ============================================

interface CountBadgeProps {
  count: number;
  severity?: SeverityLevel;
  label: string;
  className?: string;
  max?: number;
}

export function CountBadge({
  count,
  severity = 'neutral',
  label,
  className,
  max = 99,
}: CountBadgeProps) {
  const config = severityConfig[severity];
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant="outline"
      className={cn(
        config.colorClasses,
        'text-xs px-2 py-0.5 min-w-[24px] min-h-[24px] flex items-center justify-center',
        className
      )}
      role="status"
      aria-label={`${count} ${label}`}
    >
      <span aria-hidden="true">{displayCount}</span>
      <span className="sr-only">{count} {label}</span>
    </Badge>
  );
}

export default {
  DiscriminationFlagBadge,
  DifficultyFlagBadge,
  ReliabilityStatusBadge,
  SeverityBadge,
  CountBadge,
};
