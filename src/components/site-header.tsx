"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Github,
  Search,
  Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SiteHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export function SiteHeader({ title = "Dashboard", breadcrumbs }: SiteHeaderProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs based on pathname if not provided
  const defaultBreadcrumbs = pathname === "/" ? [] : 
    pathname.split("/").filter(Boolean).map((segment, index, array) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: "/" + array.slice(0, index + 1).join("/")
    }));

  const displayBreadcrumbs = breadcrumbs || defaultBreadcrumbs;
  
  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  };
  
  const pageTitle = title || getPageTitle();

  return (
    <header className="@container/header flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 header-mobile-safe">
      <div className="flex w-full items-center gap-2 px-3 @md/header:px-4 mobile-container">
        {/* Mobile Layout: Sidebar trigger, title, actions */}
        <div className="flex items-center gap-2 @md/header:hidden w-full min-w-0">
          <SidebarTrigger className="-ml-1 touch-target focus-mobile shrink-0" />
          <h1 className="text-sm font-medium truncate flex-1 min-w-0 px-2">{pageTitle}</h1>
          
          {/* Mobile Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Notifications - always visible on mobile */}
            <Button variant="ghost" size="icon" className="h-9 w-9 touch-target focus-mobile">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full touch-target focus-mobile">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/avatars/admin.jpg" alt="Admin User" />
                    <AvatarFallback className="text-xs">AU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">Admin User</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                      admin@skillsoft.com
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {/* Mobile-specific items */}
                <DropdownMenuItem className="text-sm @md/header:hidden">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm @md/header:hidden">
                  <Github className="mr-2 h-4 w-4" />
                  <span>GitHub</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="@md/header:hidden" />
                
                <DropdownMenuItem className="text-sm touch-target">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm touch-target">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm touch-target">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm touch-target">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop Layout: Traditional header layout */}
        <div className="hidden @md/header:flex @md/header:w-full @md/header:items-center @md/header:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-1 @lg/header:mx-2 h-4"
          />
          
          {/* Breadcrumbs */}
          {displayBreadcrumbs.length > 0 && (
            <Breadcrumb className="hidden @lg/header:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-sm">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {displayBreadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem>
                      {index === displayBreadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-sm">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href} className="text-sm">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < displayBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          
          {/* Page title for tablets */}
          <h1 className="text-sm font-medium @lg/header:hidden truncate">{pageTitle}</h1>

          {/* Desktop Actions */}
          <div className="ml-auto flex items-center gap-1 @lg/header:gap-2">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="h-8 w-8 focus-mobile">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-8 w-8 focus-mobile">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* GitHub Link */}
            <Button variant="ghost" asChild size="sm" className="hidden @xl/header:flex h-8 px-3 focus-mobile">
              <Link
                href="https://github.com/shadcn-ui/ui"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 @2xl/header:mr-2" />
                <span className="hidden @2xl/header:inline">GitHub</span>
              </Link>
            </Button>

            {/* Theme Toggle */}
            <div className="flex items-center">
              <ModeToggle />
            </div>

            {/* Desktop User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full ml-1 focus-mobile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/admin.jpg" alt="Admin User" />
                    <AvatarFallback className="text-xs">AU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">Admin User</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                      admin@skillsoft.com
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}