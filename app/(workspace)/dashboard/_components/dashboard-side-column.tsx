'use client';

import { motion, useReducedMotion, Variants } from 'motion/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { UserStats } from '@/types/user';
import { useActiveLens } from '@/hooks/useLens';
import { useTranslations } from 'next-intl';

import {
  getGridSpanClass,
  GRID_SPANS,
  QuickActionsWidget,
  RecentActivityWidget,
} from '@/components/dashboard';
import type { RecentCompletion } from '@/types/dashboard';

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

// ============================================
// PROPS
// ============================================

interface DashboardSideColumnProps {
  /** User statistics (admin only) */
  userStats: UserStats | null;
  /** Recent completions (editor/admin) */
  recentCompletions?: RecentCompletion[];
  /** Current user info */
  currentUser?: {
    firstName?: string;
    role: 'ADMIN' | 'EDITOR' | 'USER';
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * DashboardSideColumn - Right column of the dashboard grid.
 *
 * Renders quick actions, recent activity, admin user stats, and CTA card.
 *
 * Extracted from DashboardContent for independent Suspense streaming.
 */
export default function DashboardSideColumn({
  userStats,
  recentCompletions = [],
  currentUser,
}: DashboardSideColumnProps) {
  const prefersReducedMotion = useReducedMotion();
  const activeLens = useActiveLens();
  const isUserLens = activeLens === 'user';
  const t = useTranslations('dashboard');

  const motionProps = prefersReducedMotion
    ? { initial: 'visible' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, margin: '-40px' } };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <motion.div
      {...motionProps}
      variants={staggerContainer}
      className={getGridSpanClass(GRID_SPANS.sidebar)}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        {!isUserLens && (
          <motion.div variants={fadeInUp}>
            <QuickActionsWidget maxActions={5} />
          </motion.div>
        )}

        {/* Recent Activity - only auto-fetch for ADMIN/EDITOR who have API access */}
        <motion.div variants={fadeInUp}>
          <RecentActivityWidget
            completions={recentCompletions}
            disableFetch={!currentUser?.role || currentUser.role === 'USER'}
          />
        </motion.div>

        {/* Admin: User Stats */}
        {isAdmin && userStats && (
          <motion.div variants={fadeInUp}>
            <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">{t('users')}</CardTitle>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 min-h-[44px] sm:min-h-0">
                    <Link href="/admin/users">
                      <ChevronRight className="w-4 h-4" />
                      <span className="sr-only">{t('users')}</span>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold tracking-tight tabular-nums">{userStats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">{t('total')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold tracking-tight tabular-nums">{userStats.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">{t('active')}</p>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('admins')}</span>
                    <span className="font-medium tabular-nums">{userStats.byRole.admin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('editors')}</span>
                    <span className="font-medium tabular-nums">{userStats.byRole.editor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('users')}</span>
                    <span className="font-medium tabular-nums">{userStats.byRole.user}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assessment CTA */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-linear-to-br from-primary/5 via-transparent to-purple-500/5 border-primary/20 hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{t('readyToAssess')}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('discoverStrengths')}
                    </p>
                  </div>
                  <Button asChild size="sm" className="gap-2 min-h-[44px] sm:min-h-0">
                    <Link href="/test-templates">
                      <Play className="w-3.5 h-3.5" />
                      {t('startAssessment')}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
