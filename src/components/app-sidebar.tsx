"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  Users,
  UsersRound,
  ClipboardList,
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

// This is sample data.
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
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Competencies",
      url: "/competencies",
      icon: Target,
    },
    {
      title: "Behavioral Indicators",
      url: "/behavioral-indicators",
      icon: Lightbulb,
    },
    {
      title: "Assessment Questions",
      url: "/assessment-questions",
      icon: FileQuestion,
    },
    {
      title: "Users",
      url: "/users",
      icon: UsersRound,
    },
  ],
  projects: [
    {
      name: "Leadership Skills",
      url: "#",
      icon: Users,
    },
    {
      name: "Technical Skills",
      url: "#",
      icon: BookOpen,
    },
    {
      name: "Communication",
      url: "#",
      icon: ClipboardList,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user: clerkUser, isLoaded } = useUser();
  const TeamLogo = data.teams[0].logo;

  // Get user display info from Clerk
  const userName = clerkUser?.fullName || clerkUser?.username || data.user.name;
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.username || data.user.email;
  const userInitials = clerkUser?.fullName
    ? clerkUser.fullName.split(" ").map((n) => n[0]).join("")
    : clerkUser?.username?.substring(0, 2).toUpperCase() || "AU";
  const userImageUrl = clerkUser?.imageUrl;

  return (
    <Sidebar collapsible="icon" {...props}>
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
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Skill Categories</SidebarGroupLabel>
          <SidebarMenu>
            {data.projects.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
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
                    <Link href={`/users/${clerkUser.id}`} className="flex items-center gap-2 cursor-pointer">
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
