import { notFound } from "next/navigation";
import { usersApi } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, AtSign } from "lucide-react";
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

// Status badge component
function StatusBadge({ user }: { user: User }) {
  const status = getUserStatus(user);
  const variantClasses = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    default: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <Badge className={`${variantClasses[status.variant]} px-2.5 py-0.5`}>
      {status.label}
    </Badge>
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={`/users/${userId}`}>
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Link>
        </Button>
      </div>

      {/* Compact Header Card - Same design as profile page */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-muted">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={fullName} />}
                <AvatarFallback className="text-lg md:text-xl font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
                  Edit: {fullName}
                </h1>
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
                    <span>@{user.username}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Cancel Button */}
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/users/${userId}`}>Cancel</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <UserEditForm user={user} userId={userId} />
    </div>
  );
}
