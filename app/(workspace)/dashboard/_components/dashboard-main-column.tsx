'use client';

import { motion, useReducedMotion, Variants } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Globe2,
  LineChart,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import type { TestTemplateSummary } from '@/types/domain';
import { ClientOnly } from '@/components/common/ClientOnly';
import { LazyCompetencyByCategoryBarChart as CompetencyByCategoryBarChart } from '@/lib/lazy-charts';
import { useActiveLens } from '@/hooks/useLens';
import { useTranslations } from 'next-intl';

import {
  getGridSpanClass,
  GRID_SPANS,
  PsychometricHealthWidget,
  TestTemplatesWidget,
} from '@/components/dashboard';
import type { DashboardStats, PsychometricSummary } from '@/types/dashboard';

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

interface DashboardMainColumnProps {
  /** Dashboard statistics */
  stats: DashboardStats;
  /** Active test templates */
  testTemplates: TestTemplateSummary[];
  /** Psychometric summary (editor/admin) */
  psychometrics?: PsychometricSummary | null;
  /** Current user info */
  currentUser?: {
    firstName?: string;
    role: 'ADMIN' | 'EDITOR' | 'USER';
  };
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StandardBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * DashboardMainColumn - Left column of the dashboard grid.
 *
 * Renders psychometric health (editor/admin), category distribution chart,
 * framework progress, international standards, and test templates.
 *
 * Extracted from DashboardContent for independent Suspense streaming.
 */
export default function DashboardMainColumn({
  stats,
  testTemplates,
  psychometrics,
  currentUser,
}: DashboardMainColumnProps) {
  const prefersReducedMotion = useReducedMotion();
  const activeLens = useActiveLens();
  const isUserLens = activeLens === 'user';
  const t = useTranslations('dashboard');

  const motionProps = prefersReducedMotion
    ? { initial: 'visible' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, margin: '-40px' } };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isEditor = currentUser?.role === 'EDITOR' || isAdmin;

  // Calculate progress metrics
  const targetIndicators = stats.totalCompetencies * 5;
  const indicatorProgress = targetIndicators > 0
    ? Math.min((stats.totalIndicators / targetIndicators) * 100, 100)
    : 0;

  const targetQuestions = stats.totalIndicators * 3;
  const questionProgress = targetQuestions > 0
    ? Math.min((stats.totalQuestions / targetQuestions) * 100, 100)
    : 0;

  const activeTemplates = testTemplates.filter(t => t.isActive);

  return (
    <motion.div
      {...motionProps}
      variants={staggerContainer}
      className={getGridSpanClass(GRID_SPANS.xlarge)}
    >
      <div className="space-y-6">
        {/* Psychometric Health Widget (Editor/Admin only) */}
        {isEditor && !isUserLens && (
          <motion.div variants={fadeInUp}>
            <PsychometricHealthWidget
              data={psychometrics || null}
            />
          </motion.div>
        )}

        {/* Category Distribution Chart */}
        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t('competencyDistribution')}</CardTitle>
                    <CardDescription className="text-xs">{t('byCategory')}</CardDescription>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 min-h-[44px] sm:min-h-0">
                  <Link href="/hr/competencies">
                    {t('viewAll')}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>

              {/* Summary stats row */}
              {(() => {
                const categories = Object.entries(stats.competenciesByCategory);
                const totalComp = categories.reduce((s, [, v]) => s + v, 0);
                const topCategory = categories.length
                  ? categories.reduce((a, b) => (b[1] > a[1] ? b : a))
                  : null;
                return (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold tabular-nums leading-tight">{totalComp}</p>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground">Categories</p>
                      <p className="text-lg font-semibold tabular-nums leading-tight">{categories.length}</p>
                    </div>
                    {topCategory && (
                      <>
                        <div className="w-px h-8 bg-border/50" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-muted-foreground">Largest</p>
                          <p className="text-sm font-medium leading-tight truncate" title={topCategory[0].replace(/_/g, ' ')}>
                            {topCategory[0].replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <ClientOnly fallback={
                <div className="h-[250px] md:h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-full max-w-[280px] space-y-3 px-4">
                    <div className="flex items-end justify-between gap-2 h-[140px]">
                      {[60, 85, 45, 70, 30].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md bg-muted animate-pulse"
                          style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-1 h-2.5 rounded bg-muted animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs">{t('loadingChart')}</span>
                </div>
              }>
                <CompetencyByCategoryBarChart
                  data={Object.entries(stats.competenciesByCategory).map(([name, value]) => ({ name, value }))}
                />
              </ClientOnly>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress & Standards Row */}
        <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 gap-4">
          {/* Framework Progress */}
          <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{t('frameworkProgress')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('indicatorCoverage')}</span>
                  <span className="font-medium tabular-nums">{Math.round(indicatorProgress)}%</span>
                </div>
                <Progress value={indicatorProgress} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('questionCoverage')}</span>
                  <span className="font-medium tabular-nums">{Math.round(questionProgress)}%</span>
                </div>
                <Progress value={questionProgress} className="h-1.5" />
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {t('frameworkTarget')}
              </p>
            </CardContent>
          </Card>

          {/* International Standards */}
          <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Globe2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{t('standardsMapping')}</CardTitle>
                  <CardDescription className="text-xs">{t('globalCompatibility')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <StandardBadge icon={Target} label={t('onetCodes')} />
                <StandardBadge icon={BookOpen} label={t('escoFramework')} />
                <StandardBadge icon={Brain} label={t('bigFiveTraits')} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Test Templates */}
        {activeTemplates.length > 0 && (
          <motion.div variants={fadeInUp}>
            <TestTemplatesWidget
              templates={testTemplates}
              maxItems={6}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
