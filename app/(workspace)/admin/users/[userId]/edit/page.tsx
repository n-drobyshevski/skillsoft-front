import { Suspense } from "react";
import { notFound } from "next/navigation";
import { usersApi } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Mail, AtSign, CheckCircle2, Ban, Lock, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import {
  User,
  getUserFullName,
  getUserInitials,
  getUserStatus,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/types/user";
import UserEditForm from "./_components/UserEditForm";

interface UserEditPageProps {
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

// Status badge component - compact version
function StatusBadge({ user }: { user: User }) {
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

  return (
    <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 gap-1 ${variantClasses[status.variant]}`}>
      <StatusIcon className="h-3 w-3" />
      {status.label}
    </span>
  );
}

export default async function UserEditPage({ params }: UserEditPageProps) {
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
        href={`/admin/users/${userId}`} 
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-14 w-14 border-2 border-border shadow-sm">
            {user.imageUrl && <AvatarImage src={user.imageUrl} alt={fullName} />}
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Edit User</h1>
            <span className="text-muted-foreground">·</span>
            <span className="text-lg text-muted-foreground">{fullName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {user.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </span>
            )}
            <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-xs`}>
              {getRoleDisplayName(user.role)}
            </Badge>
            <StatusBadge user={user} />
          </div>
        </div>

        {/* Cancel Button */}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/users/${userId}`}>Cancel</Link>
        </Button>
      </div>

      <Separator />

      {/* Edit Form */}
      <UserEditForm user={user} userId={userId} />
    </div>
  );
}
