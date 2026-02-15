import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { usersApi, testResultsApi, passportApi } from "@/services/api";
import type { UserStatistics, TestResult } from "@/types/domain";
import type { CompetencyPassport as DomainPassport } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Mail,
  AtSign,
  Calendar,
  Clock,
  Shield,
  Activity,
  Target,
  ClipboardList,
  Edit,
  Ban,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Users,
  TrendingUp,
  Award,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  User,
  getUserFullName,
  getUserInitials,
  getUserStatusKey,
  getStatusBadgeVariant,
  UserRole,
  UserStatusKey,
} from "@/types/user";
import UserProfileClient from "./_components/UserProfileClient";
import { AdminPassportSection } from "./_components/AdminPassportSection";
import { UserAssessmentsTab } from "./_components/UserAssessmentsTab";
import { UserActivityTab } from "./_components/UserActivityTab";
import Loading from "./loading";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const t = await getTranslations('metadata.users');
  const user = await getUserData(userId);
  const name = user ? getUserFullName(user) : 'User';

  return {
    title: t('profileTitle', { name }),
    description: t('profileDescription'),
  };
}

function isClerkId(id: string): boolean {
  return id.startsWith('user_');
}

async function getUserData(userId: string): Promise<User | null> {
  try {
    if (isClerkId(userId)) {
      return await usersApi.getUserByClerkId(userId);
    }
    return await usersApi.getUserById(userId);
  } catch {
    return null;
  }
}

// Profile data interface for aggregated user data
interface UserProfileData {
  statistics: UserStatistics | null;
  passport: DomainPassport | null;
  results: {
    content: TestResult[];
    totalElements: number;
    totalPages: number;
  } | null;
}

/**
 * Fetch all profile-related data for a user in parallel.
 * Uses Promise.allSettled for graceful degradation - each section
 * can fail independently without blocking the entire page.
 */
async function getUserProfileData(clerkUserId: string): Promise<UserProfileData> {
  const [statisticsResult, passportResult, resultsResult] = await Promise.allSettled([
    testResultsApi.getUserStatistics(clerkUserId),
    passportApi.getPassport(clerkUserId),
    testResultsApi.getUserResults(clerkUserId, 0, 10),
  ]);

  return {
    statistics: statisticsResult.status === 'fulfilled' ? statisticsResult.value : null,
    passport: passportResult.status === 'fulfilled' ? passportResult.value : null,
    results: resultsResult.status === 'fulfilled' ? resultsResult.value : null,
  };
}

function formatDate(dateString?: string | null, neverLabel: string = "Never", locale: string = "en-US"): string {
  if (!dateString) return neverLabel;
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString?: string | null, neverLabel: string = "Never", locale: string = "en-US"): string {
  if (!dateString) return neverLabel;
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Enhanced role badge with icon
function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const getConfig = () => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          icon: Crown,
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
        };
      case UserRole.EDITOR:
        return {
          icon: Users,
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800",
        };
      case UserRole.USER:
      default:
        return {
          icon: UserIcon,
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} gap-1.5 px-2.5 py-1 font-medium`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Enhanced status badge with pulse animation
function StatusBadge({ statusKey, label }: { statusKey: UserStatusKey; label: string }) {
  const variant = getStatusBadgeVariant(statusKey);
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500 animate-pulse",
    },
    destructive: {
      icon: Ban,
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500",
    },
    default: {
      icon: Lock,
      bg: "bg-gray-50 dark:bg-gray-900/20",
      text: "text-gray-700 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-800",
      dot: "bg-gray-500",
    },
  };

  const config = statusConfig[variant];

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} gap-1.5 px-2.5 py-1 font-medium`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {label}
    </Badge>
  );
}

// Info row component
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="p-2 rounded-lg bg-muted/50 shrink-0 transition-colors group-hover:bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  color = "primary",
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  trend?: string;
  color?: "primary" | "emerald" | "violet" | "amber";
}) {
  const getColorClass = () => {
    switch (color) {
      case "emerald":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
      case "violet":
        return "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30";
      case "amber":
        return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
      case "primary":
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="relative p-4 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${getColorClass()}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/**
 * Async data-fetching component for user profile.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function UserProfileData({ userId }: { userId: string }) {
  const user = await getUserData(userId);
  const t = await getTranslations('users.profile');
  const tTime = await getTranslations('time');
  const tRole = await getTranslations('enums.userRole');
  const tStatus = await getTranslations('enums.userStatus');
  const { locale } = await import('next-intl/server').then(m => m.getLocale()).then(locale => ({ locale }));

  if (!user) {
    notFound();
  }

  // Fetch profile data (statistics, passport, results) in parallel
  const profileData = await getUserProfileData(user.clerkId);

  const fullName = getUserFullName(user);
  const initials = getUserInitials(user);
  const neverLabel = tTime('never');
  const statusKey = getUserStatusKey(user);
  const roleLabel = tRole(user.role);
  const statusLabel = tStatus(statusKey);

  // Extract stats from profile data with fallbacks
  const stats = {
    assessments: profileData.statistics?.totalTestsCompleted ?? 0,
    completed: profileData.statistics?.totalTestsCompleted ?? 0,
    avgScore: profileData.statistics?.averagePercentage != null
      ? `${Math.round(profileData.statistics.averagePercentage)}%`
      : '--',
    competencies: profileData.results?.content?.reduce((acc, result) => {
      const uniqueCompetencies = new Set(result.competencyScores?.map(c => c.competencyId) ?? []);
      uniqueCompetencies.forEach(id => acc.add(id));
      return acc;
    }, new Set<string>()).size ?? 0,
  };

  return (
    <>
      {/* Hero Header with Gradient */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-violet-500/10 dark:from-primary/10 dark:via-primary/5 dark:to-violet-500/5" />
        <div className="absolute inset-0 h-32 sm:h-40 lg:h-48 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-transparent to-background/80" />

        {/* Header Content */}
        <div className="relative px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center sm:items-start gap-3">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-violet-500/50 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity" />
                      <Avatar className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 border-4 border-background shadow-xl">
                        {user.imageUrl && <AvatarImage src={user.imageUrl} alt={fullName} />}
                        <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-primary to-violet-500 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status Indicator */}
                      <div className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[3px] border-background bg-emerald-500 shadow-sm" />
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    {/* Name and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight truncate">
                        {fullName}
                      </h1>
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <RoleBadge role={user.role} label={roleLabel} />
                        <StatusBadge statusKey={statusKey} label={statusLabel} />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      {user.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
                        </span>
                      )}
                      {user.username && (
                        <span className="flex items-center gap-1.5">
                          <AtSign className="h-4 w-4" />
                          <span>{user.username}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{t('joined', { date: formatDate(user.clerkCreatedAt || user.createdAt, neverLabel, locale) })}</span>
                      </span>
                    </div>

                    {/* Quick Stats Row (visible on larger screens) */}
                    <div className="hidden lg:flex items-center gap-6 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{stats.assessments}</p>
                          <p className="text-xs text-muted-foreground">{t('stats.assessments')}</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{stats.completed}</p>
                          <p className="text-xs text-muted-foreground">{t('stats.completed')}</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                          <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{stats.avgScore}</p>
                          <p className="text-xs text-muted-foreground">{t('stats.avgScore')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2 justify-center">
                    <Button variant="default" size="sm" asChild className="shadow-sm">
                      <Link href={`/admin/users/${userId}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('actions.editProfile')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Mobile Stats Grid (visible on smaller screens) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 lg:hidden">
            <StatCard icon={ClipboardList} value={stats.assessments} label={t('stats.assessments')} color="primary" />
            <StatCard icon={Award} value={stats.completed} label={t('stats.completed')} color="emerald" />
            <StatCard icon={BarChart3} value={stats.avgScore} label={t('stats.avgScore')} color="violet" />
            <StatCard icon={Target} value={stats.competencies} label={t('stats.competencies')} color="amber" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6 order-2 lg:order-1">
              {/* Account Information */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t('sections.accountInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.email && (
                    <InfoRow icon={Mail} label={t('info.email')} value={user.email} />
                  )}
                  {user.username && (
                    <InfoRow icon={AtSign} label={t('info.username')} value={`@${user.username}`} />
                  )}
                  <InfoRow
                    icon={Shield}
                    label={t('info.role')}
                    value={<RoleBadge role={user.role} label={roleLabel} />}
                  />
                  <InfoRow
                    icon={Activity}
                    label={t('info.status')}
                    value={<StatusBadge statusKey={statusKey} label={statusLabel} />}
                  />
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {t('sections.activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow
                    icon={Calendar}
                    label={t('info.memberSince')}
                    value={formatDate(user.clerkCreatedAt || user.createdAt, neverLabel, locale)}
                  />
                  <InfoRow
                    icon={Clock}
                    label={t('info.lastSignIn')}
                    value={formatDateTime(user.lastSignInAt || user.lastLogin, neverLabel, locale)}
                  />
                  <InfoRow
                    icon={Activity}
                    label={t('info.lastUpdated')}
                    value={formatDateTime(user.updatedAt, neverLabel, locale)}
                  />
                </CardContent>
              </Card>

              {/* Quick Stats (Desktop Sidebar) */}
              <Card className="hidden lg:block hover:shadow-md transition-shadow bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      <Target className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    {t('sections.statistics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-primary">{stats.assessments}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('stats.tests')}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('stats.done')}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.avgScore}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('stats.score')}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.competencies}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('stats.skills')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
              <UserProfileClient user={user}>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 h-11 p-1 bg-muted/50">
                    <TabsTrigger value="overview" className="gap-2 data-[state=active]:shadow-sm">
                      <Target className="h-4 w-4 hidden sm:block" />
                      {t('tabs.overview')}
                    </TabsTrigger>
                    <TabsTrigger value="assessments" className="gap-2 data-[state=active]:shadow-sm">
                      <ClipboardList className="h-4 w-4 hidden sm:block" />
                      {t('tabs.assessments')}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2 data-[state=active]:shadow-sm">
                      <Activity className="h-4 w-4 hidden sm:block" />
                      {t('tabs.activity')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Show competency passport for all users regardless of role */}
                    <AdminPassportSection
                      passport={profileData.passport}
                      userName={fullName}
                    />
                  </TabsContent>

                  {/* Assessments Tab */}
                  <TabsContent value="assessments" className="mt-6 space-y-6">
                    {/* Show test results history for all users regardless of role */}
                    <UserAssessmentsTab
                      results={profileData.results}
                      userName={fullName}
                    />
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="mt-6 space-y-6">
                    <UserActivityTab
                      results={profileData.results}
                      user={{
                        clerkCreatedAt: user.clerkCreatedAt,
                        createdAt: user.createdAt,
                        lastSignInAt: user.lastSignInAt,
                      }}
                      locale={locale}
                    />
                  </TabsContent>
                </Tabs>
              </UserProfileClient>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <Suspense fallback={<Loading />}>
        <UserProfileData userId={userId} />
      </Suspense>
    </div>
  );
}
