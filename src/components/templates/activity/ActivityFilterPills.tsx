'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterSheet } from '@/components/mobile/BottomSheet';
import {
  Filter,
  ChevronDown,
  CircleDot,
  Trophy,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import type { ActivityEventType } from '@/types/activity';
import type { DateRangeValue } from './useActivityFilters';

export interface ActivityFilterPillsProps {
  /** Current status filter value */
  statusValue: ActivityEventType | 'all';
  /** Status filter change handler */
  onStatusChange: (value: ActivityEventType | 'all') => void;
  /** Current passed filter value */
  passedValue: 'all' | 'true' | 'false';
  /** Passed filter change handler */
  onPassedChange: (value: 'all' | 'true' | 'false') => void;
  /** Current date range filter value */
  dateRangeValue: DateRangeValue;
  /** Date range filter change handler */
  onDateRangeChange: (value: DateRangeValue) => void;
  /** Whether there are active filters */
  hasActiveFilters?: boolean;
  /** Reset all filters callback */
  onResetFilters?: () => void;
  /** Optional className */
  className?: string;
  /** Show date range filter (default: true) */
  showDateRange?: boolean;
}

// Color styles for filter buttons
const colorStyles = {
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  amber: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  red: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  blue: 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  gray: 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
};

// Filter option button for mobile sheet
interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: keyof typeof colorStyles;
}

function FilterButton({ label, isActive, onClick, color }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium',
        'min-h-[44px] transition-all touch-manipulation',
        isActive && color
          ? colorStyles[color]
          : isActive
          ? 'border-primary/50 bg-primary/10 text-primary dark:bg-primary/20'
          : 'border-border bg-background text-muted-foreground hover:bg-muted'
      )}
    >
      {isActive && <Check className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

// Section header for mobile sheet
function FilterSection({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

// Desktop segmented control
interface FilterSegmentProps<T extends string> {
  icon: React.ElementType;
  label: string;
  value: T | 'all';
  onChange: (value: T | 'all') => void;
  options: Array<{
    value: T | 'all';
    label: string;
  }>;
}

function FilterSegment<T extends string>({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: FilterSegmentProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        <Icon className="w-4 h-4" />
        <span className="font-medium">{label}:</span>
      </div>

      <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium rounded-md transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ActivityFilterPills - Modern, mobile-first filter UI.
 *
 * Features:
 * - Mobile: Compact trigger button with FilterSheet bottom sheet
 * - Desktop: Inline segmented controls with icons
 * - Active filter count badge
 * - Color-coded filter options
 */
export function ActivityFilterPills({
  statusValue,
  onStatusChange,
  passedValue,
  onPassedChange,
  dateRangeValue,
  onDateRangeChange,
  hasActiveFilters = false,
  onResetFilters,
  className,
  showDateRange = true,
}: ActivityFilterPillsProps) {
  const t = useTranslations('activity');
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Calculate active filter count
  const activeCount = [
    statusValue !== 'all',
    passedValue !== 'all',
    showDateRange && dateRangeValue !== 'all',
  ].filter(Boolean).length;

  // Filter options
  const statusOptions = [
    { value: 'all' as const, label: t('filters.allStatuses') },
    { value: 'COMPLETED' as const, label: t('completed') },
    { value: 'ABANDONED' as const, label: t('abandoned') },
    { value: 'TIMED_OUT' as const, label: t('timedOut') },
  ];

  const resultOptions = [
    { value: 'all' as const, label: t('filters.allResults') },
    { value: 'true' as const, label: t('passed') },
    { value: 'false' as const, label: t('failed') },
  ];

  const dateOptions = [
    { value: 'all' as const, label: t('filters.allTime') },
    { value: '7d' as const, label: '7d' },
    { value: '30d' as const, label: '30d' },
    { value: '90d' as const, label: '90d' },
  ];

  const handleApply = () => {
    // Filters are already applied via state, just close
    setIsSheetOpen(false);
  };

  const handleReset = () => {
    onResetFilters?.();
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className={className}>
        {/* Trigger Button */}
        <Button
          variant="outline"
          onClick={() => setIsSheetOpen(true)}
          className={cn(
            'w-full justify-between h-11',
            hasActiveFilters && 'border-primary/50'
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>{t('filters.title')}</span>
            {activeCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-xs">
                {activeCount}
              </Badge>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>

        {/* Filter Sheet */}
        <FilterSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onApply={handleApply}
          onReset={handleReset}
          title={t('filters.title')}
          hasActiveFilters={hasActiveFilters}
        >
          <div className="space-y-6">
            {/* Status Section */}
            <FilterSection icon={CircleDot} label={t('filters.status')}>
              <FilterButton
                label={t('filters.allStatuses')}
                isActive={statusValue === 'all'}
                onClick={() => onStatusChange('all')}
              />
              <FilterButton
                label={t('completed')}
                isActive={statusValue === 'COMPLETED'}
                onClick={() => onStatusChange('COMPLETED')}
                color="emerald"
              />
              <FilterButton
                label={t('abandoned')}
                isActive={statusValue === 'ABANDONED'}
                onClick={() => onStatusChange('ABANDONED')}
                color="amber"
              />
              <FilterButton
                label={t('timedOut')}
                isActive={statusValue === 'TIMED_OUT'}
                onClick={() => onStatusChange('TIMED_OUT')}
                color="red"
              />
            </FilterSection>

            {/* Result Section */}
            <FilterSection icon={Trophy} label={t('table.result')}>
              <FilterButton
                label={t('filters.allResults')}
                isActive={passedValue === 'all'}
                onClick={() => onPassedChange('all')}
              />
              <FilterButton
                label={t('passed')}
                isActive={passedValue === 'true'}
                onClick={() => onPassedChange('true')}
                color="emerald"
              />
              <FilterButton
                label={t('failed')}
                isActive={passedValue === 'false'}
                onClick={() => onPassedChange('false')}
                color="gray"
              />
            </FilterSection>

            {/* Date Range Section */}
            {showDateRange && (
              <FilterSection icon={Calendar} label={t('filters.dateRange')}>
                <FilterButton
                  label={t('filters.allTime')}
                  isActive={dateRangeValue === 'all'}
                  onClick={() => onDateRangeChange('all')}
                />
                <FilterButton
                  label={t('filters.last7Days')}
                  isActive={dateRangeValue === '7d'}
                  onClick={() => onDateRangeChange('7d')}
                  color="blue"
                />
                <FilterButton
                  label={t('filters.last30Days')}
                  isActive={dateRangeValue === '30d'}
                  onClick={() => onDateRangeChange('30d')}
                  color="blue"
                />
                <FilterButton
                  label={t('filters.last90Days')}
                  isActive={dateRangeValue === '90d'}
                  onClick={() => onDateRangeChange('90d')}
                  color="blue"
                />
              </FilterSection>
            )}
          </div>
        </FilterSheet>
      </div>
    );
  }

  // Desktop View - Inline segmented controls
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {/* Status Filter */}
      <FilterSegment
        icon={CircleDot}
        label={t('filters.status')}
        value={statusValue}
        onChange={onStatusChange}
        options={statusOptions}
      />

      {/* Divider */}
      <div className="h-6 w-px bg-border hidden lg:block" />

      {/* Result Filter */}
      <FilterSegment
        icon={Trophy}
        label={t('table.result')}
        value={passedValue}
        onChange={onPassedChange}
        options={resultOptions}
      />

      {/* Divider */}
      {showDateRange && <div className="h-6 w-px bg-border hidden lg:block" />}

      {/* Date Range Filter */}
      {showDateRange && (
        <FilterSegment
          icon={Calendar}
          label={t('filters.dateRange')}
          value={dateRangeValue}
          onChange={onDateRangeChange}
          options={dateOptions}
        />
      )}

      {/* Clear Filters */}
      {hasActiveFilters && onResetFilters && (
        <>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear ({activeCount})
          </Button>
        </>
      )}
    </div>
  );
}

export default ActivityFilterPills;
