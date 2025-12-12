"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  BookOpen,
  UsersRound,
  ClipboardCheck,
  HelpCircle,
  Settings,
  ChevronDown,
  BarChart3,
  Target,
  Lightbulb,
  FileQuestion,
  User,
  LogOut,
  LayoutDashboard,
  UserCircle,
  FileText,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { ClientOnly } from "@/components/common/ClientOnly";
import { LensSwitcher } from "@/components/layout/lens-switcher";
import { useActiveLens } from "@/hooks/useLens";
import { useFilterVisibleRoutes } from "@/hooks/useIsRouteVisible";
import { cn } from "@/lib/utils";
import { useIsImmersive } from "@/store/ui-store";

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

// Base navigation data
const baseData = {
  user: {
    name: "Admin User",
    email: "admin@skillsoft.com",
  },
  teams: [
    {
      name: "SkillSoft",
      logo: LayoutDashboard,
      plan: "Enterprise",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const activeLens = useActiveLens();
  const { setOpenMobile } = useSidebar();
  const isImmersive = useIsImmersive();
  const TeamLogo = baseData.teams[0].logo;

  // Track lens changes for temporary flash highlight
  const [showFlash, setShowFlash] = useState(false);
  const isInitialRenderRef = useRef(true);

  // Track lens changes for nav item animation
  const [isLensChanging, setIsLensChanging] = useState(false);
  const prevLensRef = useRef(activeLens);

  // Check if we're in Personal view (user lens)
  const isPersonalView = activeLens === "user";

  // Close mobile sidebar when entering immersive mode
  useEffect(() => {
    if (isImmersive) {
      setOpenMobile(false);
    }
  }, [isImmersive, setOpenMobile]);

  // Dynamic Navigation Data based on Lens
  // Memoize to prevent recreating arrays on every render (causes hook dependency changes)
  const navData = useMemo(() => ({
    ...baseData,
    navMain: isPersonalView
      ? [
          {
            title: "My Hub",
            url: "/dashboard",
            icon: BarChart3,
          },
          {
            title: "Assessment Center",
            url: "/test-templates",
            icon: ClipboardCheck,
          },
          {
            title: "My Passport",
            url: "/test-templates/results/latest-scenario-a",
            icon: FileText,
          }
        ]
      : [
          {
            title: "Hiring Overview",
            url: "/dashboard",
            icon: BarChart3,
          },
          {
            title: "Studio",
            url: "/test-templates",
            icon: ClipboardCheck,
          },
        ],
    navLibrary: [
      {
        title: "Компетенции",
        url: "/hr/competencies",
        icon: Target,
      },
      {
        title: "Индикаторы",
        url: "/hr/behavioral-indicators",
        icon: Lightbulb,
      },
      {
        title: "Вопросы",
        url: "/hr/assessment-questions",
        icon: FileQuestion,
      },
    ],
    navAdmin: [
      {
        title: "Пользователи",
        url: "/admin/users",
        icon: UsersRound,
      },
      {
        title: "Настройки",
        url: "/settings",
        icon: Settings,
      },
    ],
  }), [isPersonalView]);

  // Get user display info
  const userName = clerkUser?.fullName || clerkUser?.username || baseData.user.name;
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || baseData.user.email;
  const userImage = clerkUser?.imageUrl;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Trigger flash animation on lens change (skip initial render)
  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    if (prevLensRef.current !== activeLens) {
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

  // Stable getRoute function to prevent hook dependency changes
  const getRoute = useCallback((item: { url: string }) => item.url, []);

  // Filter visible navigation items based on lens permissions
  // useFilterVisibleRoutes hook handles route visibility checks with optimal performance
  const visibleNavItems = useFilterVisibleRoutes(navData.navMain, getRoute);
  const visibleLibraryItems = useFilterVisibleRoutes(navData.navLibrary, getRoute);
  const visibleAdminItems = useFilterVisibleRoutes(navData.navAdmin, getRoute);

  // Don't render sidebar in immersive mode
  if (isImmersive) {
    return null;
  }

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "transition-all duration-300 ease-in-out",
        showFlash && getLensGlowClass(activeLens as keyof typeof LENS_GLOW_CLASSES)
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

      <SidebarContent>
        {isPersonalView ? (
          /* Personal View - Only My Profile and Tests */
          <SidebarGroup>
            <SidebarGroupLabel
              className={cn(
                "transition-all duration-300",
                isLensChanging && "animate-in fade-in-0 slide-in-from-left-2 duration-200"
              )}
            >
              Личное
            </SidebarGroupLabel>
            <SidebarMenu>
              {visibleNavItems.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className={cn(
                    "transition-all duration-300",
                    isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                  )}
                  style={isLensChanging ? { 
                    animationDelay: `${index * 50}ms`,
                    animationDuration: "300ms",
                    animationFillMode: "both"
                  } : undefined}
                >
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem
                className={cn(
                  "transition-all duration-300",
                  isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                )}
              >
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/users/")}>
                  <Link href={clerkUser ? `/admin/users/${clerkUser.id}` : "/dashboard"}>
                    <UserCircle />
                    <span>Мой профиль</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          /* Content/Admin View - Full Navigation */
          <>
            {/* Main Platform Routes */}
            <SidebarGroup>
              <SidebarGroupLabel
                className={cn(
                  "transition-all duration-300",
                  isLensChanging && "animate-in fade-in-0 slide-in-from-left-2 duration-200"
                )}
              >
                Платформа
              </SidebarGroupLabel>
              <SidebarMenu>
                {visibleNavItems.map((item, index) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      "transition-all duration-300",
                      isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                    )}
                    style={isLensChanging ? {
                      animationDelay: `${index * 50}ms`,
                      animationDuration: "300ms",
                      animationFillMode: "both"
                    } : undefined}
                  >
                    <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Library Section */}
            {visibleLibraryItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel
                  className={cn(
                    "transition-all duration-300",
                    isLensChanging && "animate-in fade-in-0 slide-in-from-left-2 duration-200"
                  )}
                >
                  Библиотека
                </SidebarGroupLabel>
                <SidebarMenu>
                  {visibleLibraryItems.map((item, index) => (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(
                        "transition-all duration-300",
                        isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                      )}
                      style={isLensChanging ? {
                        animationDelay: `${(visibleNavItems.length + index) * 50}ms`,
                        animationDuration: "300ms",
                        animationFillMode: "both"
                      } : undefined}
                    >
                      <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* Admin Section */}
            {visibleAdminItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel
                  className={cn(
                    "transition-all duration-300",
                    isLensChanging && "animate-in fade-in-0 slide-in-from-left-2 duration-200"
                  )}
                >
                  Администрирование
                </SidebarGroupLabel>
                <SidebarMenu>
                  {visibleAdminItems.map((item, index) => (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(
                        "transition-all duration-300",
                        isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                      )}
                      style={isLensChanging ? {
                        animationDelay: `${(visibleNavItems.length + visibleLibraryItems.length + index) * 50}ms`,
                        animationDuration: "300ms",
                        animationFillMode: "both"
                      } : undefined}
                    >
                      <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}
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
            <ClientOnly fallback={
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
                  <span className="truncate font-semibold">
                    {userName}
                  </span>
                  <span className="truncate text-xs">
                    {userEmail}
                  </span>
                </div>
              </SidebarMenuButton>
            }>
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
                      <span className="truncate font-semibold">
                        {userName}
                      </span>
                      <span className="truncate text-xs">
                        {userEmail}
                      </span>
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
                    <Link href={clerkUser ? `/admin/users/${clerkUser.id}` : "/dashboard"}>
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
