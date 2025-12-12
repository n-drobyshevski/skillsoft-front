import { notFound } from "next/navigation";
import { usersApi } from "@/services/api";
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
  FileQuestion,
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
  getUserStatus,
  getRoleDisplayName,
  UserRole,
} from "@/types/user";
import UserProfileClient from "./_components/UserProfileClient";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
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

function formatDate(dateString?: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Enhanced role badge with icon
function RoleBadge({ role }: { role: UserRole }) {
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
      {getRoleDisplayName(role)}
    </Badge>
  );
}

// Enhanced status badge with pulse animation
function StatusBadge({ user }: { user: User }) {
  const status = getUserStatus(user);
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

  const config = statusConfig[status.variant];

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} gap-1.5 px-2.5 py-1 font-medium`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {status.label}
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

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;
  const user = await getUserData(userId);

  if (!user) {
    notFound();
  }

  const fullName = getUserFullName(user);
  const initials = getUserInitials(user);

  return (
    <div className="flex flex-1 flex-col min-h-0">
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
                        <RoleBadge role={user.role} />
                        <StatusBadge user={user} />
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
                        <span>Joined {formatDate(user.clerkCreatedAt || user.createdAt)}</span>
                      </span>
                    </div>

                    {/* Quick Stats Row (visible on larger screens) */}
                    <div className="hidden lg:flex items-center gap-6 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">0</p>
                          <p className="text-xs text-muted-foreground">Assessments</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">0</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                          <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">--</p>
                          <p className="text-xs text-muted-foreground">Avg. Score</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2 justify-center">
                    <Button variant="default" size="sm" asChild className="shadow-sm">
                      <Link href={`/admin/users/${userId}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
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
            <StatCard icon={ClipboardList} value={0} label="Assessments" color="primary" />
            <StatCard icon={Award} value={0} label="Completed" color="emerald" />
            <StatCard icon={BarChart3} value="--" label="Avg. Score" color="violet" />
            <StatCard icon={Target} value={0} label="Competencies" color="amber" />
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
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.email && (
                    <InfoRow icon={Mail} label="Email" value={user.email} />
                  )}
                  {user.username && (
                    <InfoRow icon={AtSign} label="Username" value={`@${user.username}`} />
                  )}
                  <InfoRow
                    icon={Shield}
                    label="Role"
                    value={<RoleBadge role={user.role} />}
                  />
                  <InfoRow
                    icon={Activity}
                    label="Status"
                    value={<StatusBadge user={user} />}
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
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow
                    icon={Calendar}
                    label="Member Since"
                    value={formatDate(user.clerkCreatedAt || user.createdAt)}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Last Sign In"
                    value={formatDateTime(user.lastSignInAt || user.lastLogin)}
                  />
                  <InfoRow
                    icon={Activity}
                    label="Last Updated"
                    value={formatDateTime(user.updatedAt)}
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
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Tests</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Done</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">--</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Score</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">0</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Skills</p>
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
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="assessments" className="gap-2 data-[state=active]:shadow-sm">
                      <ClipboardList className="h-4 w-4 hidden sm:block" />
                      Assessments
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2 data-[state=active]:shadow-sm">
                      <Activity className="h-4 w-4 hidden sm:block" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {user.role === UserRole.USER ? (
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            Assigned Assessments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                              <ClipboardList className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              This user hasn&apos;t been assigned any assessments yet.
                              Assessments will appear here once assigned.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <FileQuestion className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            Content Contributions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                              <FileQuestion className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Contributions Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              Content created by this {getRoleDisplayName(user.role).toLowerCase()} will appear here.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {user.role === UserRole.USER && (
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                              <Target className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            Competency Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                              <Target className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              Competency assessments and progress tracking will be displayed here
                              once the user completes assessments.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Assessments Tab */}
                  <TabsContent value="assessments" className="mt-6 space-y-6">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {user.role === UserRole.USER ? "Assessment History" : "Created Assessments"}
                        </CardTitle>
                        {user.role !== UserRole.USER && (
                          <Button variant="outline" size="sm">
                            Create Assessment
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-16">
                          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                            <ClipboardList className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Assessment management and history tracking is currently in development.
                            Check back soon for updates!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="mt-6 space-y-6">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {/* Timeline Item - Account Created */}
                          <div className="flex gap-4 py-3">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20" />
                              <div className="w-px flex-1 bg-border mt-2" />
                            </div>
                            <div className="pb-4 flex-1">
                              <p className="text-sm font-semibold">Account Created</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDateTime(user.clerkCreatedAt || user.createdAt)}
                              </p>
                            </div>
                          </div>

                          {user.lastSignInAt && (
                            <div className="flex gap-4 py-3">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-500/20" />
                                <div className="w-px flex-1 bg-border mt-2" />
                              </div>
                              <div className="pb-4 flex-1">
                                <p className="text-sm font-semibold">Last Sign In</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDateTime(user.lastSignInAt)}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-center pt-6 pb-2">
                            <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                              More detailed activity logging coming soon
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </UserProfileClient>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
