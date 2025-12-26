'use client';

import { motion, useReducedMotion, Variants } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  Globe2,
  LineChart,
  Play,
  Plus,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { TestSession, TestTemplateSummary } from "@/types/domain";
import { UserStats } from "@/types/user";
import { ClientOnly } from "@/components/common/ClientOnly";
import CompetencyByCategoryBarChart from "@/components/data-display/charts/CompetencyByCategoryBarChart";
import { useActiveLens } from "@/hooks/useLens";

// New unified dashboard components
import {
  DashboardGrid,
  getGridSpanClass,
  GRID_SPANS,
  CompactStatsRow,
  PsychometricHealthWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  TestTemplatesWidget,
} from "@/components/dashboard";
import type { DashboardStats, PsychometricSummary, RecentCompletion } from "@/types/dashboard";

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08
    }
  }
};

// ============================================
// PROPS INTERFACE
// ============================================

interface DashboardContentProps {
  /** Dashboard statistics */
  stats: {
    totalCompetencies: number;
    totalBehavioralIndicators: number;
    totalAssessmentQuestions: number;
    competenciesByCategory: { [key: string]: number };
    competenciesByLevel: { [key: string]: number };
    averageIndicatorsPerCompetency: number;
  };
  /** Test templates */
  testTemplates: TestTemplateSummary[];
  /** Pending test sessions (user lens) */
  pendingSessions?: TestSession[];
  /** User statistics (admin only) */
  userStats: UserStats | null;
  /** Current user info */
  currentUser?: {
    firstName?: string;
    role: 'ADMIN' | 'EDITOR' | 'USER';
  };
  /** Psychometric summary (editor/admin) */
  psychometrics?: PsychometricSummary | null;
  /** Recent completions (editor/admin) */
  recentCompletions?: RecentCompletion[];
}

// ============================================
// HELPER COMPONENTS
// ============================================

// Standard badge with icon
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
export default function DashboardContent({
  stats,
  testTemplates,
  pendingSessions = [],
  userStats,
  currentUser,
  psychometrics,
  recentCompletions = [],
}: DashboardContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const activeLens = useActiveLens();
  const isUserLens = activeLens === 'user';

  const motionProps = prefersReducedMotion
    ? { initial: "visible", animate: "visible" }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-40px" } };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isEditor = currentUser?.role === 'EDITOR' || isAdmin;

  // Calculate progress metrics
  const targetIndicators = stats.totalCompetencies * 5;
  const indicatorProgress = targetIndicators > 0
    ? Math.min((stats.totalBehavioralIndicators / targetIndicators) * 100, 100)
    : 0;

  const targetQuestions = stats.totalBehavioralIndicators * 3;
  const questionProgress = targetQuestions > 0
    ? Math.min((stats.totalAssessmentQuestions / targetQuestions) * 100, 100)
    : 0;

  const activeTemplates = testTemplates.filter(t => t.isActive);

  // Transform stats to new format
  const dashboardStats: DashboardStats = {
    totalCompetencies: stats.totalCompetencies,
    totalIndicators: stats.totalBehavioralIndicators,
    totalQuestions: stats.totalAssessmentQuestions,
    activeTemplates: activeTemplates.length,
    competenciesByCategory: stats.competenciesByCategory,
    averageIndicatorsPerCompetency: stats.averageIndicatorsPerCompetency,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">

      {/* ===== HEADER ===== */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            {greeting()}{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isUserLens
              ? "Here's your personal progress and pending assessments."
              : "Overview of your competency framework and assessments"}
          </p>
        </div>
        {/* Action buttons - stack on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {isEditor && !isUserLens && (
            <Link href="/hr/competencies/new" className="w-full sm:w-auto">
              <Button variant="outline" size="default" className="w-full sm:w-auto gap-2 min-h-11 justify-center">
                <Plus className="w-4 h-4" />
                <span>Add Competency</span>
              </Button>
            </Link>
          )}
          <Link href="/test-templates" className="w-full sm:w-auto">
            <Button size="default" className="w-full sm:w-auto gap-2 min-h-11 justify-center">
              <Play className="w-4 h-4" />
              <span>{isUserLens ? "Browse Assessments" : "Take Assessment"}</span>
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Pending Assessments Widget (User Lens Only) */}
      {isUserLens && pendingSessions.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Pending Assessments
                  </CardTitle>
                  <CardDescription>
                    You have {pendingSessions.length} assessment{pendingSessions.length > 1 ? 's' : ''} in progress or waiting to start.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="border-emerald-200 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900/50">
                  <Link href="/test-templates">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingSessions.map((session) => (
                <div key={session.id} className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:p-4 shadow-sm transition-all hover:shadow-md min-h-[120px]">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">{session.templateName || "Assessment"}</h4>
                      <p className="text-xs text-muted-foreground">
                        {session.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                      </p>
                    </div>
                    <Badge variant={session.status === 'IN_PROGRESS' ? 'default' : 'secondary'} className={session.status === 'IN_PROGRESS' ? 'bg-emerald-600' : ''}>
                      {session.status === 'IN_PROGRESS' ? 'Active' : 'New'}
                    </Badge>
                  </div>

                  {session.status === 'IN_PROGRESS' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(((session.currentQuestionIndex || 0) / (session.questionOrder?.length || 1)) * 100)}%</span>
                      </div>
                      <Progress value={((session.currentQuestionIndex || 0) / (session.questionOrder?.length || 1)) * 100} className="h-1.5" />
                    </div>
                  )}

                  <Button size="sm" className="w-full mt-auto" asChild>
                    <Link href={`/test-templates/take/${session.id}`}>
                      {session.status === 'IN_PROGRESS' ? 'Resume Assessment' : 'Start Assessment'}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ===== COMPACT STATS ROW ===== */}
      <CompactStatsRow stats={dashboardStats} />

      {/* ===== MAIN CONTENT GRID ===== */}
      <DashboardGrid>

        {/* LEFT COLUMN - Psychometric Health, Charts & Standards */}
        <motion.div
          {...motionProps}
          variants={staggerContainer}
          className={getGridSpanClass(GRID_SPANS.xlarge)}
        >
          <div className="space-y-6">
            {/* Psychometric Health Widget (Editor/Admin only) - Main Content Area */}
            {isEditor && !isUserLens && (
              <motion.div variants={fadeInUp}>
                <PsychometricHealthWidget
                  data={psychometrics || null}
                />
              </motion.div>
            )}

            {/* Category Distribution Chart */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Competency Distribution</CardTitle>
                        <CardDescription className="text-xs">By category</CardDescription>
                      </div>
                    </div>
                    <Link href="/hr/competencies">
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                        View All
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ClientOnly fallback={
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <LineChart className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">Loading chart...</span>
                      </div>
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
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">Framework Progress</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Indicator coverage</span>
                      <span className="font-medium">{Math.round(indicatorProgress)}%</span>
                    </div>
                    <Progress value={indicatorProgress} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Question coverage</span>
                      <span className="font-medium">{Math.round(questionProgress)}%</span>
                    </div>
                    <Progress value={questionProgress} className="h-1.5" />
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Target: 5 indicators & 15 questions per competency
                  </p>
                </CardContent>
              </Card>

              {/* International Standards */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Globe2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Standards Mapping</CardTitle>
                      <CardDescription className="text-xs">Global compatibility</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <StandardBadge icon={Target} label="O*NET SOC Codes" />
                    <StandardBadge icon={BookOpen} label="ESCO Skills Framework" />
                    <StandardBadge icon={Brain} label="Big Five Personality Traits" />
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

        {/* RIGHT COLUMN - Actions, Activity */}
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
                        <CardTitle className="text-base">Users</CardTitle>
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
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xl font-semibold">{userStats.activeUsers}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>
                    <div className="border-t pt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Admins</span>
                        <span className="font-medium">{userStats.byRole.admin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Editors</span>
                        <span className="font-medium">{userStats.byRole.editor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users</span>
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
                        <h4 className="font-semibold">Ready to assess?</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Discover your strengths and growth areas.
                        </p>
                      </div>
                      <Link href="/test-templates">
                        <Button size="sm" className="gap-2">
                          <Play className="w-3.5 h-3.5" />
                          Start Assessment
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </DashboardGrid>
    </div>
  );
}
