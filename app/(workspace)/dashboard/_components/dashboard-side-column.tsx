'use client';

import { motion, useReducedMotion, Variants } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play } from 'lucide-react';
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

        {/* Recent Activity */}
        <motion.div variants={fadeInUp}>
          <RecentActivityWidget
            completions={recentCompletions}
          />
        </motion.div>

        {/* Admin: User Stats */}
        {isAdmin && userStats && (
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <CardTitle className="text-base">{t('users')}</CardTitle>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xl font-semibold">{userStats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">{t('total')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xl font-semibold">{userStats.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">{t('active')}</p>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('admins')}</span>
                    <span className="font-medium">{userStats.byRole.admin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('editors')}</span>
                    <span className="font-medium">{userStats.byRole.editor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('users')}</span>
                    <span className="font-medium">{userStats.byRole.user}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assessment CTA */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{t('readyToAssess')}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('discoverStrengths')}
                    </p>
                  </div>
                  <Link href="/test-templates">
                    <Button size="sm" className="gap-2">
                      <Play className="w-3.5 h-3.5" />
                      {t('startAssessment')}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
