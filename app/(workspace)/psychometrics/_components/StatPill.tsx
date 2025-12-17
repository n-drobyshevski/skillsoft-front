'use client';

import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatPillProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Label text */
  label: string;
  /** Value to display */
  value: string | number;
  /** Optional suffix (e.g., '%', 'ms') */
  suffix?: string;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Optional tooltip/title */
  title?: string;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  muted: 'bg-muted text-muted-foreground',
};

const sizeStyles = {
  sm: {
    container: 'px-2 py-1 gap-1.5 rounded-md',
    icon: 'h-3 w-3',
    label: 'text-xs',
    value: 'text-xs font-semibold',
  },
  md: {
    container: 'px-3 py-1.5 gap-2 rounded-lg',
    icon: 'h-4 w-4',
    label: 'text-sm',
    value: 'text-sm font-semibold',
  },
  lg: {
    container: 'px-4 py-2 gap-2.5 rounded-lg',
    icon: 'h-5 w-5',
    label: 'text-base',
    value: 'text-base font-bold',
  },
};

/**
 * StatPill - Compact stat display with icon
 *
 * A small, pill-shaped component for displaying a single metric
 * with an icon, label, and value.
 */
export function StatPill({
  icon: Icon,
  label,
  value,
  suffix,
  variant = 'default',
  size = 'md',
  className,
  title,
}: StatPillProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={cn(
        'inline-flex items-center',
        variantStyle,
        sizeStyle.container,
        className
      )}
      title={title}
    >
      <Icon className={cn(sizeStyle.icon, 'shrink-0 opacity-70')} aria-hidden="true" />
      <span className={sizeStyle.label}>{label}:</span>
      <span className={sizeStyle.value}>
        {value}
        {suffix && <span className="opacity-70 ml-0.5">{suffix}</span>}
      </span>
    </div>
  );
}

/**
 * StatPillGroup - Container for multiple StatPills
 */
export function StatPillGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}
