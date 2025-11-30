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
  ChevronLeft,
  Edit,
  Ban,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MoreHorizontal,
  Copy,
  ArrowUpRight,
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
} from "@/types/user";
import UserProfileClient from "./_components/UserProfileClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

/**
 * User data fetcher - uses authenticated API calls
 */
async function getUserData(userId: string): Promise<User | null> {
  // Use authenticated API calls (usersApi handles auth headers)
  if (isClerkId(userId)) {
    return await usersApi.getUserByClerkId(userId);
  }
  return await usersApi.getUserById(userId);
}

// Format date helper - compact format
function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Relative time format
function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Compact info item for inline displays
function InfoItem({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// Status badge component - compact version
function StatusBadge({ user, size = "default" }: { user: User; size?: "default" | "sm" }) {
  const status = getUserStatus(user);
  const variantClasses = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    destructive: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    default: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
  };

  const icons = {
    Active: CheckCircle2,
    Banned: Ban,
    Locked: Lock,
    Inactive: AlertTriangle,
  };

  const StatusIcon = icons[status.label as keyof typeof icons] || Activity;
  const sizeClasses = size === "sm" ? "text-xs px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${sizeClasses} ${variantClasses[status.variant]}`}>
      <StatusIcon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {status.label}
    </span>
  );
}

// Stat card component
function StatCard({ 
  label, 
  value, 
  icon: Icon,
  color = "blue"
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  color?: "blue" | "emerald" | "purple" | "amber";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  };
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
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
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      {/* Back Link */}
      <Link 
        href="/admin/users" 
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Profile Header - Compact Modern Design */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
        {/* Avatar with Status Indicator */}
        <div className="relative shrink-0">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-border shadow-sm">
            {user.imageUrl && <AvatarImage src={user.imageUrl} alt={fullName} />}
            <AvatarFallback className="text-xl md:text-2xl font-semibold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-background ${
            user.isActive && !user.banned ? 'bg-emerald-500' : 'bg-gray-400'
          }`} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name Row */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{fullName}</h1>
            <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-xs font-medium`}>
              {getRoleDisplayName(user.role)}
            </Badge>
            <StatusBadge user={user} />
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {user.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </span>
            )}
            {user.username && (
              <span className="flex items-center gap-1.5">
                <AtSign className="h-3.5 w-3.5" />
                {user.username}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Joined {formatRelativeTime(user.clerkCreatedAt || user.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${userId}/edit`}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                View in Clerk
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Ban className="h-3.5 w-3.5 mr-2" />
                {user.banned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Assessments" value={0} icon={ClipboardList} color="blue" />
        <StatCard label="Completed" value={0} icon={CheckCircle2} color="emerald" />
        <StatCard label="Competencies" value={0} icon={Target} color="purple" />
        <StatCard label="Last Active" value={formatRelativeTime(user.lastSignInAt)} icon={Clock} color="amber" />
      </div>

      {/* Main Content - Tabs */}
      <UserProfileClient user={user}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
            >
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="assessments" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Account Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{user.email || "—"}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="text-sm font-medium">{user.username ? `@${user.username}` : "—"}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Role</p>
                      <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-xs`}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <StatusBadge user={user} size="sm" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Created</span>
                      <span className="text-sm">{formatDate(user.clerkCreatedAt || user.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Last Login</span>
                      <span className="text-sm">{formatDateTime(user.lastSignInAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Updated</span>
                      <span className="text-sm">{formatDate(user.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Role-based Content */}
              <div className="lg:col-span-2 space-y-4">
                {user.role === UserRole.USER ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-muted-foreground" />
                          Assigned Assessments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <ClipboardList className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium mb-1">No Assessments</p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Assigned assessments will appear here
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          Competency Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Target className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium mb-1">No Progress Data</p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Competency tracking will appear after assessments
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        Content Contributions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                          <FileQuestion className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium mb-1">No Contributions</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Content created by this {getRoleDisplayName(user.role).toLowerCase()} will appear here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">
                  {user.role === UserRole.USER ? "Assessment History" : "Created Assessments"}
                </CardTitle>
                {user.role !== UserRole.USER && (
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                    Create
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ClipboardList className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Coming Soon</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Assessment management and history tracking is in development
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Activity Timeline */}
                  <div className="relative pl-6 pb-4 border-l-2 border-border last:pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(user.clerkCreatedAt || user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {user.lastSignInAt && (
                    <div className="relative pl-6 pb-4 border-l-2 border-border last:pb-0">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                      <div>
                        <p className="text-sm font-medium">Last Sign In</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(user.lastSignInAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                      Detailed activity logging coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </UserProfileClient>
    </div>
  );
}
