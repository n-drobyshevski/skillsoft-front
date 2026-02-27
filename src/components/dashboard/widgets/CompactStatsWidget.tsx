'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, Target, Layers, ClipboardList, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { WidgetVariant } from '@/types/dashboard';
import { useTranslations } from 'next-intl';

/**
 * Props for individual compact stat card
 */
export interface CompactStatCardProps {
  /** Stat title */
  title: string;
  /** Primary value to display */
  value: number | string;
  /** Icon to display */
  icon: React.ElementType;
  /** Color variant */
  variant?: WidgetVariant;
  /** Link destination */
  href?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get icon style classes by variant
 */
function getIconStyles(variant: WidgetVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'warning':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'info':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'destructive':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

/**
 * Get border style classes by variant
 */
function getBorderStyles(variant: WidgetVariant): string {
  switch (variant) {
    case 'success':
      return 'border-emerald-200 dark:border-emerald-800';
    case 'warning':
      return 'border-amber-200 dark:border-amber-800';
    case 'info':
      return 'border-blue-200 dark:border-blue-800';
    case 'destructive':
      return 'border-red-200 dark:border-red-800';
    default:
      return 'border-border';
  }
}

/**
 * CompactStatCard - Inline compact metric display card.
 * Height: 64-72px, horizontal layout with icon, value, title, and arrow on hover.
 *
 * @example
 * ```tsx
 * <CompactStatCard
 *   title="Competencies"
 *   value={42}
 *   icon={Target}
 *   href="/competencies"
 * />
 * ```
 */
export function CompactStatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  href,
  loading = false,
  className,
}: CompactStatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-3 rounded-lg border bg-card',
          'h-[64px] min-h-[64px]',
          className
        )}
      >
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-lg border bg-card',
        'h-[64px] min-h-[64px]',
        'transition-all duration-200 motion-reduce:transition-none group',
        getBorderStyles(variant),
        href && 'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-px active:scale-[0.99]',
        className
      )}
    >
      {/* Icon 32x32px */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          getIconStyles(variant)
        )}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>

      {/* Value - 24px bold */}
      <span className="text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </span>

      {/* Title - 12px muted */}
      <span className="text-xs text-muted-foreground truncate">
        {title}
        <span className="sr-only">, value is {value}</span>
      </span>

      {/* Arrow on hover */}
      {href && (
        <ArrowUpRight
          className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
          aria-hidden="true"
        />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

/**
 * Mobile variant of CompactStatCard - stacked layout with title under value
 * Designed to fill available width in a 2-column grid
 */
export function CompactStatCardMobile({
  title,
  value,
  icon: Icon,
  variant = 'default',
  href,
  loading = false,
  className,
}: CompactStatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'flex flex-col items-start gap-1.5 p-3 rounded-xl border bg-card w-full',
          'min-h-[76px]',
          className
        )}
      >
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <Skeleton className="h-6 flex-1 max-w-[60px]" />
        </div>
        <Skeleton className="h-3.5 w-20" />
      </div>
    );
  }

  const content = (
    <div
      className={cn(
        // Layout - fill width, stack vertically
        'flex flex-col gap-1 p-3 rounded-xl border bg-card w-full',
        // Minimum height for consistency
        'min-h-[76px]',
        // Interactive states
        'transition-all duration-200 motion-reduce:transition-none group touch-manipulation',
        getBorderStyles(variant),
        href && 'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-px active:scale-[0.98]',
        className
      )}
    >
      {/* Top row: icon + value */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            getIconStyles(variant)
          )}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <span className="text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
        {href && (
          <ArrowUpRight
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Title below */}
      <span className="text-xs text-muted-foreground truncate font-medium">
        {title}
        <span className="sr-only">, value is {value}</span>
      </span>
    </div>
  );

  if (href) {
    return <Link href={href} className="w-full block">{content}</Link>;
  }

  return content;
}

/**
 * Props for CompactStatsRow container
 */
export interface CompactStatsRowProps {
  /** Stats data */
  stats: {
    totalCompetencies: number;
    totalIndicators: number;
    totalQuestions: number;
    activeTemplates: number;
    averageIndicatorsPerCompetency?: number;
  };
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CompactStatsRow - Responsive row of compact stats cards.
 * Desktop: 4 inline cards in a row
 * Mobile: 2x2 grid with stacked layout
 */
export function CompactStatsRow({
  stats,
  loading = false,
  className,
}: CompactStatsRowProps) {
  const t = useTranslations('dashboard');

  const cards = [
    {
      title: t('competencies'),
      value: stats.totalCompetencies,
      icon: Target,
      href: '/hr/competencies',
      variant: 'default' as WidgetVariant,
    },
    {
      title: t('indicators'),
      value: stats.totalIndicators,
      icon: Layers,
      href: '/hr/behavioral-indicators',
      variant: 'default' as WidgetVariant,
    },
    {
      title: t('questions'),
      value: stats.totalQuestions,
      icon: ClipboardList,
      href: '/hr/assessment-questions',
      variant: 'default' as WidgetVariant,
    },
    {
      title: t('activeTemplates'),
      value: stats.activeTemplates,
      icon: Activity,
      href: '/test-templates',
      variant: 'success' as WidgetVariant,
    },
  ];

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        {/* Desktop: 4 in a row */}
        <div className="hidden md:grid md:grid-cols-4 gap-3">
          {cards.map((card, i) => (
            <CompactStatCard
              key={i}
              title={card.title}
              value={0}
              icon={card.icon}
              loading={true}
            />
          ))}
        </div>
        {/* Mobile: 2x2 grid - cards fill available width */}
        <div className="grid grid-cols-2 gap-2.5 md:hidden">
          {cards.map((card, i) => (
            <CompactStatCardMobile
              key={i}
              title={card.title}
              value={0}
              icon={card.icon}
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: 4 in a row with inline layout */}
      <div className="hidden md:grid md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <CompactStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            href={card.href}
            variant={card.variant}
          />
        ))}
      </div>
      {/* Mobile: 2x2 grid with stacked layout - cards fill available width */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {cards.map((card) => (
          <CompactStatCardMobile
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            href={card.href}
            variant={card.variant}
          />
        ))}
      </div>
    </div>
  );
}
