import { notFound } from "next/navigation";
import { usersApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  Edit,
  Ban,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  User,
  getUserFullName,
  getUserInitials,
  getUserStatus,
  getRoleBadgeColor,
  getRoleDisplayName,
  UserRole,
} from "@/app/interfaces/user-interfaces";
import UserProfileClient from "./components/UserProfileClient";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

/**
 * Check if the given ID is a Clerk ID (starts with 'user_')
 * or a UUID (standard UUID format)
 */
function isClerkId(id: string): boolean {
  return id.startsWith('user_');
}

async function getUserData(userId: string): Promise<User | null> {
  try {
    // Determine if this is a Clerk ID or a database UUID
    if (isClerkId(userId)) {
      return await usersApi.getUserByClerkId(userId);
    }
    return await usersApi.getUserById(userId);
  } catch {
    return null;
  }
}

// Format date helper
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

// Info row component for consistent styling
function InfoRow({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="p-2 rounded-lg bg-muted/50 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ user }: { user: User }) {
  const status = getUserStatus(user);
  const variantClasses = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    default: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const icons = {
    Active: CheckCircle2,
    Banned: Ban,
    Locked: Lock,
    Inactive: AlertTriangle,
  };

  const StatusIcon = icons[status.label as keyof typeof icons] || Activity;

  return (
    <Badge className={`${variantClasses[status.variant]} gap-1.5 px-2.5 py-1`}>
      <StatusIcon className="h-3 w-3" />
      {status.label}
    </Badge>
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">

      {/* Compact Profile Header Card */}
      <Card className="py-2">
        <CardContent className="px-4 py-2 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-muted">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={fullName} />}
                <AvatarFallback className="text-lg md:text-xl font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
            </div>

            {/* Name and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">{fullName}</h1>
                <Badge variant="secondary" className={`${getRoleBadgeColor(user.role)} shrink-0`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                <StatusBadge user={user} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                {user.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{user.email}</span>
                  </span>
                )}
                {user.username && (
                  <span className="flex items-center gap-1.5">
                    <AtSign className="h-3.5 w-3.5" />
                    <span>{user.username}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/users/${userId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="space-y-6">
          {/* Account Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.email && (
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={user.email}
                />
              )}
              {user.username && (
                <InfoRow
                  icon={AtSign}
                  label="Username"
                  value={`@${user.username}`}
                />
              )}
              <InfoRow
                icon={Shield}
                label="Role"
                value={
                  <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-xs`}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                }
              />
              <InfoRow
                icon={Activity}
                label="Account Status"
                value={<StatusBadge user={user} />}
              />
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Activity Timeline
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

          {/* Quick Stats Card (for future) */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Assessments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-emerald-600">0</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs Content */}
        <div className="lg:col-span-2">
          <UserProfileClient user={user}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="overview" className="gap-2">
                  <Target className="h-4 w-4 hidden sm:block" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="assessments" className="gap-2">
                  <ClipboardList className="h-4 w-4 hidden sm:block" />
                  Assessments
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4 hidden sm:block" />
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Role-based Content */}
                {user.role === UserRole.USER ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                          <ClipboardList className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        Assigned Assessments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                          <ClipboardList className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium mb-1">No Assessments Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          This user hasn&apos;t been assigned any assessments yet.
                          Assessments will appear here once assigned.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <FileQuestion className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Content Contributions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                          <FileQuestion className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium mb-1">No Contributions Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Content created by this {getRoleDisplayName(user.role).toLowerCase()} will appear here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Competency Progress (for Users) */}
                {user.role === UserRole.USER && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        Competency Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                          <Target className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium mb-1">No Progress Data</h3>
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
              <TabsContent value="assessments" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {user.role === UserRole.USER ? "Assessment History" : "Created Assessments"}
                    </CardTitle>
                    {user.role !== UserRole.USER && (
                      <Button variant="outline" size="sm">
                        Create Assessment
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ClipboardList className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Assessment management and history tracking is currently in development.
                        Check back soon for updates!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Activity Timeline Items */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div className="w-px h-full bg-border" />
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium">Account Created</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(user.clerkCreatedAt || user.createdAt)}
                          </p>
                        </div>
                      </div>

                      {user.lastSignInAt && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <div className="w-px h-full bg-border" />
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium">Last Sign In</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(user.lastSignInAt)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
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
  );
}
