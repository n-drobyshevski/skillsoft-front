"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Shield,
  Save,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Ban,
  Lock,
  Unlock,
} from "lucide-react";
import { User, UserRole, getRoleDisplayName } from "../../../../interfaces/user-interfaces";
import {
  updateUserAction,
  syncUserToBackend,
  toggleUserBan,
  toggleUserLock,
  UserUpdateFormData,
} from "@/app/actions/user-actions";

interface UserEditFormProps {
  user: User;
  userId: string;
}

export default function UserEditForm({ user, userId }: UserEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [username, setUsername] = useState(user.username || "");
  const [role, setRole] = useState<UserRole>(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const formData: UserUpdateFormData = {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      username: username || undefined,
      role,
    };

    startTransition(async () => {
      const result = await updateUserAction(user.id, user.clerkId, formData);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        // Redirect back to profile after short delay
        setTimeout(() => {
          router.push(`/users/${userId}`);
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      const result = await syncUserToBackend(user.clerkId);
      if (result.success) {
        setMessage({ type: "success", text: "User data synced from Clerk successfully" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to sync user data" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBanToggle = async () => {
    setMessage(null);
    startTransition(async () => {
      const result = await toggleUserBan(user.clerkId, !user.banned);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleLockToggle = async () => {
    setMessage(null);
    startTransition(async () => {
      const result = await toggleUserLock(user.clerkId, !user.locked);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Edit Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>
                  Update user profile details. Changes will be synced to Clerk and the backend.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message Alert */}
              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"} className={message.type === "success" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : ""}>
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className={message.type === "success" ? "text-emerald-700 dark:text-emerald-400" : ""}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Username must be unique across all users. Leave empty to remove.
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Users can update their email through Clerk settings.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/users/${userId}`)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Role & Actions */}
      <div className="space-y-6">
        {/* Role Management */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base">Role & Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {getRoleDisplayName(UserRole.USER)}
                    </span>
                  </SelectItem>
                  <SelectItem value={UserRole.EDITOR}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {getRoleDisplayName(UserRole.EDITOR)}
                    </span>
                  </SelectItem>
                  <SelectItem value={UserRole.ADMIN}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      {getRoleDisplayName(UserRole.ADMIN)}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Role determines what actions the user can perform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sync & Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Sync from Clerk */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSync}
              disabled={isSyncing || isPending}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync from Clerk
            </Button>

            <Separator />

            {/* Ban/Unban */}
            <Button
              variant={user.banned ? "outline" : "destructive"}
              className="w-full justify-start"
              onClick={handleBanToggle}
              disabled={isPending}
            >
              {user.banned ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unban User
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </>
              )}
            </Button>

            {/* Lock/Unlock */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLockToggle}
              disabled={isPending}
            >
              {user.locked ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock User
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock User
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground pt-2">
              Banning revokes all sessions. Locking temporarily prevents sign-in.
            </p>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Identifiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[140px]" title={user.id}>
                {user.id.substring(0, 8)}...
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clerk ID</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[140px]" title={user.clerkId}>
                {user.clerkId.substring(0, 12)}...
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
