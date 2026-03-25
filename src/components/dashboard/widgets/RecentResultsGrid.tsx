'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { TestResult } from '@/types/domain';

interface RecentResultsGridProps {
  results: TestResult[];
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

function getPassBadgeClasses(passed: boolean): string {
  return passed
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function RecentResultsGrid({ results }: RecentResultsGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');

  if (results.length === 0) return null;

  const recent = results.slice(0, 3);

  const motionProps = prefersReducedMotion
    ? { initial: 'visible' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <motion.div {...motionProps} variants={staggerContainer}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('userDashboard.recentResults.title')}
          </h3>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 min-h-[44px] sm:min-h-0">
            <Link href="/my-tests?tab=completed">
              {t('userDashboard.recentResults.viewAll')}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recent.map((result) => (
            <motion.div key={result.id} variants={fadeInUp}>
              <Link href={`/test-templates/results/${result.id}`} className="block group">
                <div className="p-3 rounded-lg border bg-card hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none h-full">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors min-w-0">
                      {result.templateName}
                    </p>
                    {result.passed != null && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${getPassBadgeClasses(result.passed)}`}>
                        {result.passed
                          ? t('userDashboard.recentResults.pass')
                          : t('userDashboard.recentResults.fail')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    {result.overallPercentage != null && (
                      <p className={`text-lg font-bold tracking-tight tabular-nums ${getScoreColor(result.overallPercentage)}`}>
                        {result.overallPercentage.toFixed(1)}%
                      </p>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(result.completedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
