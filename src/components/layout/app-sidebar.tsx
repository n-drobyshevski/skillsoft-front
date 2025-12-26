"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  UserCircle,
  // Icons used in navigation config - imported for dynamic lookup
  LayoutDashboard,
  ClipboardCheck,
  FileStack,
  BarChart3,
  Layers,
  Target,
  Lightbulb,
  FileQuestion,
  Network,
  Activity,
  UsersRound,
  Settings,
  HelpCircle,
  BookOpen,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { ClientOnly } from "@/components/common/ClientOnly";
import { LensSwitcher } from "@/components/layout/lens-switcher";
import { useNavigation, useNavigationBadgeCounts, isNavigationItemActive } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";
import { useIsImmersive } from "@/store/ui-store";
import type { NavigationItem, NavigationGroup, BadgeConfig } from "@/config/navigation-config";

// Icon lookup map - maps icon names from config to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardCheck,
  FileStack,
  BarChart3,
  Layers,
  Target,
  Lightbulb,
  FileQuestion,
  Network,
  Activity,
  UsersRound,
  Settings,
  HelpCircle,
  User,
  UserCircle,
  BookOpen,
  ExternalLink,
};

// Lens glow animation classes for ring/glow highlight on lens switch
const LENS_GLOW_CLASSES = {
  user: "animate-lens-glow-emerald",
  editor: "animate-lens-glow-blue",
  admin: "animate-lens-glow-violet",
} as const;

// Type-safe getter for lens glow animation class
function getLensGlowClass(lens: keyof typeof LENS_GLOW_CLASSES): string {
  switch (lens) {
    case "admin":
      return LENS_GLOW_CLASSES.admin;
    case "editor":
      return LENS_GLOW_CLASSES.editor;
    case "user":
    default:
      return LENS_GLOW_CLASSES.user;
  }
}

// Base data for header
const baseData = {
  teams: [
    {
      name: "SkillSoft",
      logo: LayoutDashboard,
      plan: "Enterprise",
    },
  ],
  user: {
    name: "Admin User",
    email: "admin@skillsoft.com",
  },
};

/**
 * Navigation Badge Component
 */
function NavigationBadge({ config }: { config: BadgeConfig }) {
  const counts = useNavigationBadgeCounts();

  // Static text badge
  if (typeof config.content === "string") {
    return (
      <Badge variant={config.variant} className="ml-auto">
        {config.content}
      </Badge>
    );
  }

  // Dynamic count badge
  const count = counts[config.content.key as keyof typeof counts] ?? 0;

  if (config.hideWhenZero && count === 0) {
    return null;
  }

  return (
    <Badge variant={config.variant} className="ml-auto">
      {count}
    </Badge>
  );
}

/**
 * Navigation Item Component with optional children (collapsible)
 */
function NavItem({
  item,
  isActive,
  isLensChanging,
  animationDelay,
}: {
  item: NavigationItem;
  isActive: boolean;
  isLensChanging: boolean;
  animationDelay: number;
}) {
  const pathname = usePathname();

  // Check if any child is active
  const hasActiveChild = item.children?.some((child) =>
    isNavigationItemActive(child.path, pathname)
  );

  // Use initial state based on hasActiveChild to avoid effect
  const [isOpen, setIsOpen] = useState(() => hasActiveChild ?? false);

  // Get icon component - stable reference since ICON_MAP is constant
  const IconComponent = ICON_MAP[item.icon] ?? LayoutDashboard;

  // Simple item without children
  if (!item.children || item.children.length === 0) {
    return (
      <SidebarMenuItem
        className={cn(
          "transition-all duration-300",
          isLensChanging &&
            "animate-in fade-in-0 slide-in-from-left-3 duration-300"
        )}
        style={
          isLensChanging
            ? {
                animationDelay: `${animationDelay}ms`,
                animationDuration: "300ms",
                animationFillMode: "both",
              }
            : undefined
        }
      >
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={item.path}>
            <IconComponent />
            <span>{item.label}</span>
            {item.isNew && (
              <Badge variant="secondary" className="ml-auto text-xs">
                NEW
              </Badge>
            )}
            {item.badge && <NavigationBadge config={item.badge} />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Item with collapsible children
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <SidebarMenuItem
        className={cn(
          "transition-all duration-300",
          isLensChanging &&
            "animate-in fade-in-0 slide-in-from-left-3 duration-300"
        )}
        style={
          isLensChanging
            ? {
                animationDelay: `${animationDelay}ms`,
                animationDuration: "300ms",
                animationFillMode: "both",
              }
            : undefined
        }
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive || hasActiveChild}>
            <IconComponent />
            <span>{item.label}</span>
            {item.badge && <NavigationBadge config={item.badge} />}
            <ChevronRight
              className={cn(
                "ml-auto transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => {
              const isChildActive = isNavigationItemActive(child.path, pathname);
              const ChildIconComponent = child.icon ? (ICON_MAP[child.icon] ?? null) : null;

              return (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild isActive={isChildActive}>
                    <Link href={child.path}>
                      {ChildIconComponent && <ChildIconComponent />}
                      <span>{child.label}</span>
                      {child.badge && <NavigationBadge config={child.badge} />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

/**
 * Navigation Group Component
 */
function NavGroup({
  group,
  isLensChanging,
  itemStartIndex,
}: {
  group: NavigationGroup;
  isLensChanging: boolean;
  itemStartIndex: number;
}) {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel
          className={cn(
            "transition-all duration-300",
            isLensChanging &&
              "animate-in fade-in-0 slide-in-from-left-2 duration-200"
          )}
        >
          {group.label}
        </SidebarGroupLabel>
        <SidebarMenu>
          {group.items.map((item, index) => {
            const isActive = isNavigationItemActive(item.path, pathname);
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive}
                isLensChanging={isLensChanging}
                animationDelay={(itemStartIndex + index) * 50}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      {group.hasSeparator && <SidebarSeparator />}
    </>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const { groups, footer, activeLens, isReady } = useNavigation();
  const { setOpenMobile } = useSidebar();
  const isImmersive = useIsImmersive();
  const TeamLogo = baseData.teams[0].logo;

  // Track lens changes for temporary flash highlight
  const [showFlash, setShowFlash] = useState(false);
  const isInitialRenderRef = useRef(true);

  // Track lens changes for nav item animation
  const [isLensChanging, setIsLensChanging] = useState(false);
  const prevLensRef = useRef(activeLens);

  // Close mobile sidebar when entering immersive mode
  useEffect(() => {
    if (isImmersive) {
      setOpenMobile(false);
    }
  }, [isImmersive, setOpenMobile]);

  // Get user display info
  const userName =
    clerkUser?.fullName || clerkUser?.username || baseData.user.name;
  const userEmail =
    clerkUser?.primaryEmailAddress?.emailAddress || baseData.user.email;
  const userImage = clerkUser?.imageUrl;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Trigger flash animation on lens change (skip initial render)
  // This effect intentionally sets state to trigger visual feedback animation
  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    if (prevLensRef.current !== activeLens) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowFlash(true);
      setIsLensChanging(true);
      const flashTimer = setTimeout(() => setShowFlash(false), 700);
      const lensTimer = setTimeout(() => setIsLensChanging(false), 400);
      prevLensRef.current = activeLens;
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(lensTimer);
      };
    }
  }, [activeLens]);

  // Calculate item indices for staggered animations
  const groupItemCounts = useMemo(() => {
    const result: number[] = [];
    let runningCount = 0;
    for (const group of groups) {
      result.push(runningCount);
      runningCount += group.items.length;
    }
    return result;
  }, [groups]);

  // Don't render sidebar in immersive mode
  if (isImmersive) {
    return null;
  }

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "transition-all duration-300 ease-in-out",
        showFlash &&
          getLensGlowClass(activeLens as keyof typeof LENS_GLOW_CLASSES)
      )}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TeamLogo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {baseData.teams[0].name}
                  </span>
                  <span className="truncate text-xs">
                    {baseData.teams[0].plan}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent suppressHydrationWarning role="navigation" aria-label="Main navigation">
        {!isReady ? (
          /* Loading skeleton while lens system initializes */
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          </SidebarGroup>
        ) : (
          /* Render filtered navigation groups */
          groups.map((group, index) => {
            // eslint-disable-next-line security/detect-object-injection
            const startIndex = groupItemCounts[index] ?? 0;
            return (
              <NavGroup
                key={group.id}
                group={group}
                isLensChanging={isLensChanging}
                itemStartIndex={startIndex}
              />
            );
          })
        )}

        {/* User Profile link in Personal view */}
        {isReady && activeLens === "user" && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem
                className={cn(
                  "transition-all duration-300",
                  isLensChanging &&
                    "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                )}
              >
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/profile"}
                >
                  <Link href="/profile">
                    <UserCircle />
                    <span>Мой профиль</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Footer Navigation Items - Always visible in all lenses */}
        {isReady && footer.length > 0 && (
          <>
            <div className="mt-auto" />
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarMenu>
                {footer.map((item) => {
                  const IconComponent = ICON_MAP[item.icon] ?? HelpCircle;
                  const isActive = isNavigationItemActive(item.path, pathname);

                  if (item.isExternal) {
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <a
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconComponent />
                            <span>{item.label}</span>
                            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.path}>
                          <IconComponent />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* Lens Switcher - Role-based view selector */}
        <SidebarMenu>
          <SidebarMenuItem>
            <ClientOnly fallback={null}>
              <LensSwitcher />
            </ClientOnly>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />

        {/* User Profile Menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            <ClientOnly
              fallback={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground opacity-75"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">{userEmail}</span>
                  </div>
                </SidebarMenuButton>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback className="rounded-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs">{userEmail}</span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        clerkUser
                          ? `/admin/users/${clerkUser.id}`
                          : "/dashboard"
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Настройки
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </ClientOnly>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
