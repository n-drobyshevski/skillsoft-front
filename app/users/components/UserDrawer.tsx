"use client";

import React, { useState } from "react";

// Create a stable timestamp that won't cause React Compiler issues
const getStableNow = () => {
  // This is only called once at module load, making it pure for React
  return Date.now();
};
const STABLE_NOW = getStableNow();
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  UserRole,
  getUserInitials,
  getUserFullName,
  getRoleBadgeColor,
  getRoleDisplayName,
  getUserStatus,
} from "@/app/interfaces/user-interfaces";
import {
  Mail,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit,
  UserX,
  UserCheck,
  Copy,
  ExternalLink,
  Check,
  Ban,
  Lock,
  MoreHorizontal,
  Info,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function UserDrawer({
  open,
  onOpenChange,
  user,
}: UserDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Never";
    const diffDays = Math.floor((STABLE_NOW - new Date(dateString).getTime()) / 86400000);
    if (diffDays < 0) return "Just now";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <ShieldAlert className="h-3 w-3" />;
      case UserRole.EDITOR:
        return <ShieldCheck className="h-3 w-3" />;
      case UserRole.USER:
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const status = getUserStatus(user);
  
  const getStatusColor = (variant: string) => {
    switch (variant) {
      case 'success': return "bg-emerald-500";
      case 'warning': return "bg-amber-500";
      case 'destructive': return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[380px] p-0 gap-0 flex flex-col">
          {/* Compact Header */}
          <div className="p-4 border-b bg-muted/30">
            <SheetHeader className="space-y-0">
              <div className="flex items-start gap-3">
                {/* Avatar with status indicator */}
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                    {user.imageUrl && (
                      <AvatarImage src={user.imageUrl} alt={getUserFullName(user)} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <span 
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(status.variant)}`}
                    title={status.label}
                  />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base font-semibold truncate">
                      {getUserFullName(user)}
                    </SheetTitle>
                    {(user.banned || user.locked) && (
                      <Tooltip>
                        <TooltipTrigger>
                          {user.banned ? (
                            <Ban className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {user.banned ? "Banned" : "Locked"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  
                  {user.email && (
                    <button
                      onClick={() => copyToClipboard(user.email!, "email")}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5 group"
                    >
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[180px]">{user.email}</span>
                      {copiedField === "email" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                      )}
                    </button>
                  )}

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge
                      variant="outline"
                      className={`gap-1 h-5 text-[10px] px-1.5 ${getRoleBadgeColor(user.role)}`}
                    >
                      {getRoleIcon(user.role)}
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    {user.username && (
                      <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
                        @{user.username}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => copyToClipboard(user.id, "id")}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy User ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(user.clerkId, "clerkId")}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Clerk ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Clerk
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetHeader>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 p-0 px-4">
              <TabsTrigger 
                value="details" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10 px-3"
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10 px-3"
              >
                <History className="h-3.5 w-3.5 mr-1.5" />
                Activity
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Details Tab */}
              <TabsContent value="details" className="m-0 p-4 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Member since"
                    value={formatDate(user.clerkCreatedAt ?? user.createdAt)}
                  />
                  <StatCard
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Last active"
                    value={formatRelativeTime(user.lastSignInAt ?? user.lastLogin)}
                  />
                </div>

                {/* Account Details */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Account
                  </p>
                  <DetailRow label="Status" value={status.label} />
                  {user.firstName && <DetailRow label="First name" value={user.firstName} />}
                  {user.lastName && <DetailRow label="Last name" value={user.lastName} />}
                  <DetailRow 
                    label="User ID" 
                    value={user.id} 
                    mono 
                    copyable 
                    onCopy={() => copyToClipboard(user.id, "id")}
                    copied={copiedField === "id"}
                  />
                </div>

                {/* Permissions */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {getPermissionTags(user.role).map((perm) => (
                      <span
                        key={perm.label}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          perm.allowed
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground line-through"
                        }`}
                      >
                        {perm.label}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="m-0 p-4">
                <div className="space-y-3">
                  {user.lastSignInAt && (
                    <ActivityItem
                      title="Last sign-in"
                      time={user.lastSignInAt ?? ""}
                      highlight
                    />
                  )}
                  {user.updatedAt && user.updatedAt !== user.createdAt && (
                    <ActivityItem
                      title="Profile updated"
                      time={user.updatedAt}
                    />
                  )}
                  {user.clerkCreatedAt && (
                    <ActivityItem
                      title="Clerk account created"
                      time={user.clerkCreatedAt ?? ""}
                    />
                  )}
                  <ActivityItem
                    title="Synced to Skillsoft"
                    time={user.createdAt}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-muted/30 space-y-2">
            <Button className="w-full h-9" size="sm">
              <Edit className="h-3.5 w-3.5 mr-2" />
              Edit Profile
            </Button>
            <div className="flex gap-2">
              {user.isActive && !user.banned ? (
                <Button variant="outline" size="sm" className="flex-1 h-8 text-orange-600 hover:text-orange-600 hover:bg-orange-50">
                  <UserX className="h-3.5 w-3.5 mr-1.5" />
                  Deactivate
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="flex-1 h-8 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Activate
                </Button>
              )}
              <Button variant="outline" size="sm" className="flex-1 h-8">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Clerk
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

// Compact stat card
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

// Detail row component
function DetailRow({ 
  label, 
  value, 
  mono = false,
  copyable = false,
  onCopy,
  copied = false,
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm group">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`${mono ? "font-mono text-xs" : ""} truncate max-w-40`} title={value}>
          {mono ? value.slice(0, 8) + "..." : value}
        </span>
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className="p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Activity item component
function ActivityItem({ 
  title, 
  time, 
  highlight = false 
}: { 
  title: string; 
  time: string; 
  highlight?: boolean;
}) {
  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${highlight ? "bg-primary" : "bg-muted-foreground/30"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${highlight ? "font-medium" : "text-muted-foreground"}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{formatDateTime(time)}</p>
      </div>
    </div>
  );
}

// Get permission tags for role
function getPermissionTags(role: UserRole) {
  const allPermissions = [
    { label: "Manage Users", roles: [UserRole.ADMIN] },
    { label: "Edit Content", roles: [UserRole.ADMIN, UserRole.EDITOR] },
    { label: "View Reports", roles: [UserRole.ADMIN, UserRole.EDITOR] },
    { label: "System Settings", roles: [UserRole.ADMIN] },
    { label: "Take Assessments", roles: [UserRole.USER, UserRole.EDITOR, UserRole.ADMIN] },
  ];

  return allPermissions.map((perm) => ({
    label: perm.label,
    allowed: perm.roles.includes(role),
  }));
}
