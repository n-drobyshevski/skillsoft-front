"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  User,
  LogOut,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLensStore } from "@/store/lens-store";

/**
 * HeaderUserMenu - User avatar + dropdown for the site header.
 * Shows profile link, settings, and sign out.
 */
export function HeaderUserMenu() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const t = useTranslations("navigation");
  const tAuth = useTranslations("auth");

  const handleSignOut = () => {
    // Tear down lens state before Clerk signs out so the next login starts
    // from the role's default lens instead of inheriting the prior lens.
    useLensStore.getState().reset(); // clears cookie + in-memory state
    useLensStore.persist.clearStorage(); // removes the persisted localStorage key
    void signOut(); // default redirect (ClerkProvider afterSignOutUrl)
  };

  const userName =
    clerkUser?.fullName || clerkUser?.username || "User";
  const userEmail =
    clerkUser?.primaryEmailAddress?.emailAddress || "";
  const userImage = clerkUser?.imageUrl;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        align="end"
        sideOffset={8}
      >
        {/* User info header */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{userName}</span>
            <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={
              clerkUser
                ? `/admin/users/${clerkUser.id}`
                : "/dashboard"
            }
          >
            <User className="mr-2 h-4 w-4" />
            {t("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {tAuth("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
