"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Search, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBreadcrumbContext } from "@/context/BreadcrumbContext";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CompactAuthModals, FullAuthModals } from "@/components/auth/auth-modals";
import { ClientOnly } from "@/components/common/ClientOnly";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { timing } from "@/lib/animation-config";
import { LanguageSwitcher, LanguageToggle } from "@/components/language-switcher";

interface SiteHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

/**
 * SiteHeader - Responsive header with mobile-optimized layout
 *
 * Mobile improvements:
 * - Reduced height from 56px (h-14) to 44px (h-11) on mobile
 * - Enhanced glassmorphism: backdrop-blur-lg, bg-background/80
 * - Simplified mobile layout with tighter padding (px-3)
 * - Smaller action buttons (36px instead of 40px)
 * - Collapsing on scroll (optional floating essential elements)
 *
 * Desktop features preserved:
 * - Full breadcrumb navigation
 * - All action buttons visible
 * - Standard spacing
 */
export function SiteHeader({ title = "Dashboard", breadcrumbs }: SiteHeaderProps) {
  const pathname = usePathname();
  const { customBreadcrumbs } = useBreadcrumbContext();
  const { isAtTop, shouldShowNav } = useScrollDirection();

  // Generate breadcrumbs based on pathname if not provided
  const defaultBreadcrumbs =
    pathname === "/"
      ? []
      : pathname
          .split("/")
          .filter(Boolean)
          .map((segment, index, array) => {
            // Check for custom breadcrumb title first
            const customTitle =
              customBreadcrumbs[segment as keyof typeof customBreadcrumbs];
            if (customTitle) {
              return {
                label: customTitle,
                href: "/" + array.slice(0, index + 1).join("/"),
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
              label = segment
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            } else if (/^[a-f0-9-]+$/i.test(segment) && segment.length > 10) {
              // This looks like an entity ID, use generic label
              label = "Details";
            } else {
              // Regular title case
              label = segment.charAt(0).toUpperCase() + segment.slice(1);
            }

            return {
              label,
              href: "/" + array.slice(0, index + 1).join("/"),
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
      return lastSegment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      // Regular title case
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
  };

  const pageTitle = title || getPageTitle();

  return (
    <motion.header
      initial={false}
      animate={{
        y: shouldShowNav ? 0 : -44, // Hide by translating up on mobile
      }}
      transition={{
        duration: timing.normal / 1000,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "@container/header flex items-center gap-2 border-b transition-[width,height] ease-linear",
        // Mobile: 44px height (h-11), enhanced glassmorphism
        "h-11 bg-background/80 backdrop-blur-lg",
        // Tablet+: 56px height (h-14), original styling
        "@md/header:h-14 @md/header:bg-background/95 @md/header:backdrop-blur",
        // Collapsed sidebar state
        "group-has-data-[collapsible=icon]/sidebar-wrapper:h-10 @md/header:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        // Safe area support
        "header-mobile-safe",
        // GPU acceleration for scroll-based transforms
        "will-change-transform md:will-change-auto"
      )}
    >
      <div className="flex w-full items-center gap-2 px-3 @md/header:px-4 mobile-container">
        {/* Mobile Layout: Sidebar trigger, title, actions */}
        <div className="flex items-center gap-2 @md/header:hidden w-full min-w-0">
          <SidebarTrigger className="-ml-1 touch-target focus-mobile" />

          {/* Truncated title with smaller font */}
          <h1 className="text-sm font-semibold truncate flex-1 min-w-0 px-1">
            {pageTitle}
          </h1>

          {/* Mobile Actions - tighter spacing, smaller buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Language Toggle - compact for mobile */}
            <ClientOnly>
              <LanguageToggle />
            </ClientOnly>

            {/* Notifications - 36px touch target */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 touch-target focus-mobile"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Authentication for Mobile */}
            <ClientOnly>
              <SignedOut>
                <CompactAuthModals />
              </SignedOut>

              <SignedIn>
                {/* Mobile User Menu with Clerk - 36px avatar */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "shadow-lg",
                      userButtonPopoverActionButton:
                        "hover:bg-accent touch-target",
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
                  <BreadcrumbLink href="/" className="text-sm">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {displayBreadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem>
                      {index === displayBreadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-sm">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href} className="text-sm">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < displayBreadcrumbs.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {/* Page title for tablets */}
          <h1 className="text-sm font-medium @lg/header:hidden truncate">
            {pageTitle}
          </h1>

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

            {/* Language Switcher */}
            <ClientOnly>
              <LanguageSwitcher />
            </ClientOnly>

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
    </motion.header>
  );
}

/**
 * FloatingHeader - Minimal floating header for scroll-collapsed state
 *
 * Shows only essential elements when main header is hidden:
 * - Page title (truncated)
 * - Back button (if applicable)
 *
 * Note: This is an optional component for pages that need persistent
 * navigation context while scrolling.
 */
interface FloatingHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

export function FloatingHeader({ title, onBack, className }: FloatingHeaderProps) {
  const { shouldShowNav } = useScrollDirection();

  // Only show when main header is hidden
  if (shouldShowNav) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: timing.fast / 1000,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "fixed top-2 left-1/2 -translate-x-1/2 z-40",
        "px-4 py-2 rounded-full",
        "bg-background/90 backdrop-blur-lg",
        "border border-border/50 shadow-sm",
        "flex items-center gap-2",
        "md:hidden", // Only on mobile
        className
      )}
    >
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-6 w-6 -ml-1"
        >
          <span className="sr-only">Go back</span>
          {/* Back arrow icon would go here */}
        </Button>
      )}
      <span className="text-xs font-medium truncate max-w-[150px]">{title}</span>
    </motion.div>
  );
}
