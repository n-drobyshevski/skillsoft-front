"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
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
import { ClientOnly } from "@/components/ClientOnly";
import { LensSwitcher } from "@/components/lens-switcher";
import { useLens } from "@/context/LensContext";
import { UserRole } from "../../app/interfaces/user-interfaces";
import { cn } from "@/lib/utils";

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

// This is the navigation data with new route structure
const data = {
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
  // Main navigation - organized by section
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Шаблоны тестов",
      url: "/test-templates",
      icon: ClipboardCheck,
    },
  ],
  // HR Library routes (content management)
  navHRLibrary: [
    {
      title: "Competencies",
      url: "/hr/competencies",
      icon: Target,
    },
    {
      title: "Behavioral Indicators",
      url: "/hr/behavioral-indicators",
      icon: Lightbulb,
    },
    {
      title: "Assessment Questions",
      url: "/hr/assessment-questions",
      icon: FileQuestion,
    },
  ],
  // Admin routes
  navAdmin: [
    {
      title: "Users",
      url: "/admin/users",
      icon: UsersRound,
    },
  ],
  // Tools (available for editors and admins)
  navTools: [
    {
      title: "Skill Mapper",
      url: "/skill-mapper",
      icon: BookOpen,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const { isRouteVisible, setUserRole, activeLens } = useLens();
  const TeamLogo = data.teams[0].logo;
  
  // Track lens changes for temporary flash highlight
  const [showFlash, setShowFlash] = useState(false);
  const isInitialRenderRef = useRef(true);
  
  // Track lens changes for nav item animation
  const [isLensChanging, setIsLensChanging] = useState(false);
  const prevLensRef = useRef(activeLens);
  
  // Check if we're in Personal view (user lens)
  const isPersonalView = activeLens === "user";

  // Show flash and animate items when lens changes
  useEffect(() => {
    // Skip the initial render to avoid flash on page load
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      prevLensRef.current = activeLens;
      return;
    }
    
    // Only animate if lens actually changed
    if (prevLensRef.current !== activeLens) {
      // Show the flash
      setShowFlash(true);
      // Trigger nav items animation
      setIsLensChanging(true);
      
      // Hide glow after animation completes (2s = 2000ms)
      const flashTimer = setTimeout(() => {
        setShowFlash(false);
      }, 2000);
      
      // Reset nav animation state after animation completes 
      // (50ms stagger per item * ~10 items + 300ms animation = ~1000ms)
      const animTimer = setTimeout(() => {
        setIsLensChanging(false);
      }, 1000);
      
      prevLensRef.current = activeLens;
      
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(animTimer);
      };
    }
  }, [activeLens]);

  // Sync user role from Clerk to lens context
  useEffect(() => {
    if (clerkUser?.publicMetadata?.role) {
      const role = clerkUser.publicMetadata.role as string;
      if (role === "ADMIN") setUserRole(UserRole.ADMIN);
      else if (role === "EDITOR") setUserRole(UserRole.EDITOR);
      else setUserRole(UserRole.USER);
    }
  }, [clerkUser, setUserRole]);

  // Get user display info from Clerk
  const userName = clerkUser?.fullName || clerkUser?.username || data.user.name;
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.username || data.user.email;
  const userInitials = clerkUser?.fullName
    ? clerkUser.fullName.split(" ").map((n) => n[0]).join("")
    : clerkUser?.username?.substring(0, 2).toUpperCase() || "AU";
  const userImageUrl = clerkUser?.imageUrl;

  // Filter navigation items based on active lens
  const visibleNavItems = data.navMain.filter((item) => isRouteVisible(item.url));
  const visibleHRItems = data.navHRLibrary.filter((item) => isRouteVisible(item.url));
  const visibleAdminItems = data.navAdmin.filter((item) => isRouteVisible(item.url));
  const visibleToolItems = data.navTools.filter((item) => isRouteVisible(item.url));
  
  // Get lens-specific glow animation class
  const lensGlowClass = getLensGlowClass(activeLens);

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        // Apply glow animation class when flash is active
        showFlash && lensGlowClass
      )}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TeamLogo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {data.teams[0].name}
                  </span>
                  <span className="truncate text-xs">{data.teams[0].plan}</span>
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
              Personal
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem
                className={cn(
                  "transition-all duration-300",
                  isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                )}
              >
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <BarChart3 />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem
                className={cn(
                  "transition-all duration-300",
                  isLensChanging && "animate-in fade-in-0 slide-in-from-left-3 duration-300"
                )}
              >
                <SidebarMenuButton asChild isActive={pathname.startsWith("/test-templates")}>
                  <Link href="/test-templates">
                    <ClipboardCheck />
                    <span>Мои тесты</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                Platform
              </SidebarGroupLabel>
              <SidebarMenu>
                {visibleNavItems.map((item, index) => (
                  <SidebarMenuItem 
                    key={item.title}
                    className={cn(
                      "transition-all duration-300",
                      isLensChanging && "animate-in fade-in-0 slide-in-from-left-3"
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

            {/* HR Library Section */}
            {visibleHRItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel
                  className={cn(
                    "transition-all duration-300",
                    isLensChanging && "animate-in fade-in-0 slide-in-from-left-2"
                  )}
                  style={isLensChanging ? { 
                    animationDelay: `${visibleNavItems.length * 50 + 50}ms`,
                    animationDuration: "200ms",
                    animationFillMode: "both"
                  } : undefined}
                >
                  HR Library
                </SidebarGroupLabel>
                <SidebarMenu>
                  {visibleHRItems.map((item, index) => (
                    <SidebarMenuItem 
                      key={item.title}
                      className={cn(
                        "transition-all duration-300",
                        isLensChanging && "animate-in fade-in-0 slide-in-from-left-3"
                      )}
                      style={isLensChanging ? { 
                        animationDelay: `${(visibleNavItems.length + index + 1) * 50 + 50}ms`,
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

            {/* Tools Section */}
            {visibleToolItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel
                  className={cn(
                    "transition-all duration-300",
                    isLensChanging && "animate-in fade-in-0 slide-in-from-left-2"
                  )}
                >
                  Tools
                </SidebarGroupLabel>
                <SidebarMenu>
                  {visibleToolItems.map((item) => (
                    <SidebarMenuItem 
                      key={item.title}
                      className={cn(
                        "transition-all duration-300",
                        isLensChanging && "animate-in fade-in-0 slide-in-from-left-3"
                      )}
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
                    isLensChanging && "animate-in fade-in-0 slide-in-from-left-2"
                  )}
                >
                  Administration
                </SidebarGroupLabel>
                <SidebarMenu>
                  {visibleAdminItems.map((item) => (
                    <SidebarMenuItem 
                      key={item.title}
                      className={cn(
                        "transition-all duration-300",
                        isLensChanging && "animate-in fade-in-0 slide-in-from-left-3"
                      )}
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
          <SidebarMenuItem >
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
                    {userImageUrl && <AvatarImage src={userImageUrl} alt={userName} />}
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userName}
                    </span>
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
                {clerkUser && (
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${clerkUser.id}`} className="flex items-center gap-2 cursor-pointer">
                      <UserCircle className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <User />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle />
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
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
