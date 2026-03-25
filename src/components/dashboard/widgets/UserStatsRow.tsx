'use client';

import { motion, useReducedMotion } from 'motion/react';
import { ClipboardCheck, TrendingUp, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PersonalStats } from '@/types/user-dashboard';

interface UserStatsRowProps {
  stats: PersonalStats;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

export function UserStatsRow({ stats }: UserStatsRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' as const } };

  const cards = [
    {
      label: t('userDashboard.stats.testsTaken'),
      value: String(stats.testsTaken),
      icon: ClipboardCheck,
      valueClass: 'text-foreground',
    },
    {
      label: t('userDashboard.stats.avgScore'),
      value: `${stats.avgScore}%`,
      icon: TrendingUp,
      valueClass: getScoreColor(stats.avgScore),
    },
    {
      label: t('userDashboard.stats.passRate'),
      value: stats.passRate,
      icon: Award,
      valueClass: 'text-foreground',
    },
  ];

  return (
    <motion.div {...motionProps}>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 px-3 py-3 rounded-lg border bg-card hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className={`text-lg sm:text-xl font-bold tracking-tight tabular-nums ${card.valueClass}`}>
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground truncate">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
