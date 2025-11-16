"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Search,
  Bell
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useBreadcrumbContext } from "@/src/context/BreadcrumbContext";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CompactAuthModals, FullAuthModals } from "@/components/auth-modals";
import { ClientOnly } from "@/components/ClientOnly";

interface SiteHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export function SiteHeader({ title = "Dashboard", breadcrumbs }: SiteHeaderProps) {
  const pathname = usePathname();
  const { customBreadcrumbs } = useBreadcrumbContext();
  
  // Generate breadcrumbs based on pathname if not provided
  const defaultBreadcrumbs = pathname === "/" ? [] : 
    pathname.split("/").filter(Boolean).map((segment, index, array) => {
      // Check for custom breadcrumb title first
      const customTitle = customBreadcrumbs[segment as keyof typeof customBreadcrumbs];
      if (customTitle) {
        return {
          label: customTitle,
          href: "/" + array.slice(0, index + 1).join("/")
        };
      }
      
      // Handle special cases for better UX
      let label = segment;
      if (segment === "behavioral-indicators") {
        label = "Behavioral Indicators";
      } else if (segment === "assessment-questions") {
        label = "Assessment Questions";
      } else if (segment.includes("-") && segment.length < 20) {
        // Convert kebab-case to Title Case for non-ID segments
        label = segment.split("-").map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
      } else if (/^[a-f0-9-]+$/i.test(segment) && segment.length > 10) {
        // This looks like an entity ID, use generic label
        label = "Details";
      } else {
        // Regular title case
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      return {
        label,
        href: "/" + array.slice(0, index + 1).join("/")
      };
    });

  const displayBreadcrumbs = breadcrumbs || defaultBreadcrumbs;
  
  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Handle special cases for better UX
    if (lastSegment === "behavioral-indicators") {
      return "Behavioral Indicators";
    } else if (lastSegment === "assessment-questions") {
      return "Assessment Questions";
    } else if (lastSegment === "competencies") {
      return "Competencies";
    } else if (lastSegment.includes("-")) {
      // Convert kebab-case to Title Case
      return lastSegment.split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");
    } else {
      // Regular title case
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
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

            {/* Authentication for Mobile */}
            <ClientOnly>
              <SignedOut>
                <CompactAuthModals />
              </SignedOut>

              <SignedIn>
                {/* Mobile User Menu with Clerk */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                      userButtonPopoverCard: "shadow-lg",
                      userButtonPopoverActionButton: "hover:bg-accent touch-target",
                    },
                  }}
                  showName={false}
                  userProfileMode="modal"
                  afterSignOutUrl="/"
                />
              </SignedIn>
            </ClientOnly>
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

            {/* Theme Toggle */}
            <ClientOnly>
              <div className="flex items-center">
                <ModeToggle />
              </div>
            </ClientOnly>

            {/* Authentication */}
            <ClientOnly>
              <SignedOut>
                <FullAuthModals />
              </SignedOut>

              <SignedIn>
                {/* Desktop User Menu with Clerk */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "shadow-lg",
                      userButtonPopoverActionButton: "hover:bg-accent",
                    },
                  }}
                  showName={false}
                  userProfileMode="modal"
                  afterSignOutUrl="/"
                />
              </SignedIn>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>
  );
}