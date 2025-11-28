import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  UserRole,
  canUserAccess,
} from "../interfaces/user-interfaces";
import { 
  UserPlus, 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  Activity,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { usersApi } from "@/services/api";
import PageHeader from "../components/PageHeader";
import TableSkeleton from "../components/TableSkeleton";
import { SyncUsersButton } from "./components/SyncUsersButton";
import UsersTableWrapper from "./components/UsersTableWrapper";

async function getUsersData() {
  try {
    const users = await usersApi.getAllUsers();
    if (!Array.isArray(users)) {
      if (users === null) {
        return { users: [], error: "Backend service unavailable. Please ensure the backend is running at localhost:8080." };
      }
      return { users: [], error: "Invalid data format from server." };
    }
    return { users, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load users.";
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('CORS')) {
      return { users: [], error: "Cannot connect to backend. Please ensure the backend server is running." };
    }
    return { users: [], error: message };
  }
}

// Compact stats card component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  iconColor = "text-muted-foreground"
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  description?: string;
  iconColor?: string;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export default async function UsersPage() {
  const { users, error } = await getUsersData();

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => canUserAccess(u)).length;
  const adminCount = users.filter(u => u.role === UserRole.ADMIN).length;
  const editorCount = users.filter(u => u.role === UserRole.EDITOR).length;
  const bannedCount = users.filter(u => u.banned).length;
  const lockedCount = users.filter(u => u.locked).length;
  
  // Users with recent activity (signed in within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentlyActive = users.filter(u => {
    const signInDate = u.lastSignInAt || u.lastLogin;
    if (!signInDate) return false;
    return new Date(signInDate) > thirtyDaysAgo;
  }).length;

  const activeRate = totalUsers > 0 
    ? `${Math.round((activeUsers / totalUsers) * 100)}%` 
    : "0%";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="User Management"
        description="Manage users, roles, and access permissions"
      >
        <div className="flex gap-2">
          <SyncUsersButton />
          <Link href="/users/new">
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </PageHeader> 
      
      {/* Compact Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description={`${activeUsers} can access`}
          iconColor="text-primary"
        />
        <StatCard
          title="Active Rate"
          value={activeRate}
          icon={Activity}
          description={`${recentlyActive} active this month`}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Admins"
          value={adminCount}
          icon={ShieldAlert}
          description="Full access"
          iconColor="text-red-500"
        />
        <StatCard
          title="Editors"
          value={editorCount}
          icon={ShieldCheck}
          description="Content editors"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Restricted"
          value={bannedCount + lockedCount}
          icon={AlertTriangle}
          description={`${bannedCount} banned, ${lockedCount} locked`}
          iconColor="text-amber-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="font-medium mb-1">Error Loading Users</div>
          <div>{error}</div>
          {error.includes('backend') && (
            <div className="mt-2 text-xs text-muted-foreground">
              Tip: Start the backend with: <code className="bg-muted px-1 rounded">cd assessment-backend && ./mvnw spring-boot:run</code>
            </div>
          )}
        </div>
      )}

      {/* Users Table - wrapped in client component to avoid hydration mismatch */}
      <UsersTableWrapper users={users} />
    </div>
  );
}
