'use client';

import { Clock, PlayCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabValue } from './MyTestsContent';

interface SummaryStatsProps {
  counts: {
    all: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
  activeTab: TabValue;
  onTabChange: (tab: string) => void;
}

interface StatCardConfig {
  tab: TabValue;
  label: string;
  icon: typeof Clock;
  bgClass: string;
  iconBgClass: string;
  iconClass: string;
  textClass: string;
  labelClass: string;
  activeRingClass: string;
  pulseIndicator?: boolean;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    tab: 'all',
    label: 'Всего',
    icon: ClipboardList,
    bgClass: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/50',
    iconBgClass: 'bg-slate-100 dark:bg-slate-900/50',
    iconClass: 'text-slate-600 dark:text-slate-400',
    textClass: 'text-slate-700 dark:text-slate-300',
    labelClass: 'text-slate-600/80 dark:text-slate-400/80',
    activeRingClass: 'ring-slate-400 dark:ring-slate-600',
  },
  {
    tab: 'pending',
    label: 'Ожидают',
    icon: Clock,
    bgClass: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/50',
    iconClass: 'text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-700 dark:text-blue-300',
    labelClass: 'text-blue-600/80 dark:text-blue-400/80',
    activeRingClass: 'ring-blue-400 dark:ring-blue-600',
  },
  {
    tab: 'in_progress',
    label: 'В работе',
    icon: PlayCircle,
    bgClass: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/50',
    iconClass: 'text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-700 dark:text-amber-300',
    labelClass: 'text-amber-600/80 dark:text-amber-400/80',
    activeRingClass: 'ring-amber-400 dark:ring-amber-600',
    pulseIndicator: true,
  },
  {
    tab: 'completed',
    label: 'Завершены',
    icon: CheckCircle2,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    labelClass: 'text-emerald-600/80 dark:text-emerald-400/80',
    activeRingClass: 'ring-emerald-400 dark:ring-emerald-600',
  },
];

/**
 * Summary Stats Dashboard
 * Shows overview of test counts by status with clickable cards
 * that act as quick filters
 */
export function SummaryStats({ counts, activeTab, onTabChange }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STAT_CARDS.map(config => {
        const Icon = config.icon;
        const count = counts[config.tab];
        const isActive = activeTab === config.tab;
        const showPulse = config.pulseIndicator && count > 0;

        return (
          <button
            key={config.tab}
            onClick={() => onTabChange(config.tab)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none',
              config.bgClass,
              isActive && `ring-2 ${config.activeRingClass}`
            )}
            aria-pressed={isActive}
            aria-label={`${config.label}: ${count}. Нажмите для фильтрации.`}
          >
            <div className={cn('relative p-2.5 rounded-lg', config.iconBgClass)}>
              <Icon className={cn('size-5', config.iconClass)} />
              {showPulse && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 size-2.5 rounded-full',
                    'bg-amber-500 animate-pulse'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="text-left">
              <p className={cn('text-2xl font-bold tabular-nums', config.textClass)}>
                {count}
              </p>
              <p className={cn('text-xs font-medium', config.labelClass)}>{config.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
