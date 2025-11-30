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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Clock,
  FileText,
  Globe2,
  GraduationCap,
  LineChart,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { DashboardStats, TestTemplateSummary, AssessmentGoal, AssessmentGoalInfo } from "@/types/domain";
import { User, UserStats } from "@/types/user";
import { ClientOnly } from "@/components/common/ClientOnly";
import CompetencyByCategoryBarChart from "@/components/data-display/charts/CompetencyByCategoryBarChart";

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

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
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

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

// ============================================
// PROPS INTERFACE
// ============================================

interface DashboardContentProps {
  stats: DashboardStats;
  testTemplates: TestTemplateSummary[];
  userStats: UserStats | null;
  recentUsers: User[];
  currentUser?: {
    firstName?: string;
    role: 'ADMIN' | 'EDITOR' | 'USER';
  };
}

// ============================================
// HELPER COMPONENTS
// ============================================

// Action row for quick navigation
function ActionRow({ 
  icon: Icon, 
  title, 
  subtitle,
  href 
}: { 
  icon: React.ElementType; 
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
      >
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </Link>
  );
}

// Template preview card
function TemplatePreview({ template }: { template: TestTemplateSummary }) {
  const goalInfo = AssessmentGoalInfo[template.goal as AssessmentGoal] || {
    displayName: template.goal,
    description: 'Assessment'
  };

  return (
    <Link href={`/test-templates/${template.id}`}>
      <motion.div
        whileHover={{ y: -1 }}
        className="p-3 rounded-lg border border-border/60 hover:border-border hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{template.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{goalInfo.displayName}</p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {template.competencyCount}
          </Badge>
        </div>
      </motion.div>
    </Link>
  );
}

// Activity feed item
function ActivityFeedItem({
  initials,
  name,
  action,
  target,
  time,
  variant = "default"
}: {
  initials: string;
  name: string;
  action: string;
  target: string;
  time: string;
  variant?: "default" | "success" | "info";
}) {
  const dotColors = {
    default: "bg-muted-foreground/40",
    success: "bg-emerald-500",
    info: "bg-blue-500"
  };

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="relative">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[10px] bg-muted font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${dotColors[variant]} ring-2 ring-background`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground"> {action} </span>
          <span className="font-medium">{target}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  );
}

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
  userStats,
  recentUsers,
  currentUser,
}: DashboardContentProps) {
  const prefersReducedMotion = useReducedMotion();
  
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
            Overview of your competency framework and assessments
          </p>
        </div>
        {/* Action buttons - stack on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {isEditor && (
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
              <span>Take Assessment</span>
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* ===== BENTO GRID - Stats Cards ===== */}
      <FlexibleStatsCards
        data={{
          type: "dashboard",
          stats: {
            totalCompetencies: stats.totalCompetencies,
            totalBehavioralIndicators: stats.totalBehavioralIndicators,
            totalAssessmentQuestions: stats.totalAssessmentQuestions,
            totalTestTemplates: testTemplates.length,
            activeTestTemplates: activeTemplates.length,
            competenciesByCategory: stats.competenciesByCategory,
            averageIndicatorsPerCompetency: stats.averageIndicatorsPerCompetency,
          }
        }}
      />

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        
        {/* LEFT COLUMN - Charts & Standards */}
        <motion.div 
          {...motionProps}
          variants={staggerContainer}
          className="lg:col-span-8 space-y-6"
        >
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

          {/* Active Test Templates (if any) */}
          {activeTemplates.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Active Assessments</CardTitle>
                        <CardDescription className="text-xs">{activeTemplates.length} templates available</CardDescription>
                      </div>
                    </div>
                    <Link href="/test-templates">
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                        View All
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeTemplates.slice(0, 6).map((template) => (
                      <TemplatePreview key={template.id} template={template} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT COLUMN - Actions & Activity */}
        <motion.div 
          {...motionProps}
          variants={staggerContainer}
          className="lg:col-span-4 space-y-6"
        >
          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="space-y-0.5">
                  <ActionRow 
                    icon={Plus} 
                    title="New Competency" 
                    subtitle="Define skills and behaviors"
                    href="/hr/competencies/new" 
                  />
                  <ActionRow 
                    icon={Brain} 
                    title="Add Indicator" 
                    subtitle="Create behavioral markers"
                    href="/hr/behavioral-indicators/new" 
                  />
                  <ActionRow 
                    icon={ClipboardList} 
                    title="Create Question" 
                    subtitle="Build assessment items"
                    href="/hr/assessment-questions/new" 
                  />
                  <ActionRow 
                    icon={FileText} 
                    title="New Template" 
                    subtitle="Design an assessment"
                    href="/test-templates/new" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="space-y-0.5 divide-y divide-border/50">
                  <ActivityFeedItem
                    initials="AJ"
                    name="Alex Johnson"
                    action="updated"
                    target="Team Leadership"
                    time="2 hours ago"
                    variant="info"
                  />
                  <ActivityFeedItem
                    initials="SC"
                    name="Sarah Chen"
                    action="created"
                    target="Digital Communication"
                    time="5 hours ago"
                    variant="success"
                  />
                  <ActivityFeedItem
                    initials="JM"
                    name="John Miller"
                    action="completed"
                    target="Skills Assessment"
                    time="1 day ago"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin: User Stats */}
          {isAdmin && userStats && (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-base">Users</CardTitle>
                    </div>
                    <Link href="/admin/users">
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Settings2 className="w-4 h-4" />
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
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CircleDot className="w-3 h-3" /> Admins
                      </span>
                      <span className="font-medium">{userStats.byRole.admin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CircleDot className="w-3 h-3" /> Editors
                      </span>
                      <span className="font-medium">{userStats.byRole.editor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CircleDot className="w-3 h-3" /> Users
                      </span>
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
                    <Sparkles className="w-5 h-5 text-primary" />
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
        </motion.div>
      </div>
    </div>
  );
}
