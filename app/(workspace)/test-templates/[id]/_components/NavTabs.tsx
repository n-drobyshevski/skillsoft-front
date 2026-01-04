'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Settings,
  Lock,
  Info,
  GitBranch,
  Loader2,
  Activity,
  type LucideIcon
} from 'lucide-react';
import type { TemplateStatus } from './TemplateHeader';
import { createNewVersion } from '../actions';

interface NavTab {
  label: string;
  href: string;
  segment: string | null;
  icon: LucideIcon;
}

interface NavTabsProps {
  baseUrl: string;
  status: TemplateStatus;
  templateId: string;
  templateName: string;
}

/**
 * Navigation tabs for the Test Template Hub
 * * Mobile Layout: 
 * [ Title ....... Action ]
 * [ Scrollable Tabs...   ]
 * * Desktop Layout (Unchanged):
 * [ Title ... Centered Tabs ... Action ]
 */
export function NavTabs({ baseUrl, status, templateId, templateName }: NavTabsProps) {
  const segment = useSelectedLayoutSegment();
  const [isPending, startTransition] = useTransition();

  const tabs: NavTab[] = [
    {
      label: 'Overview',
      href: baseUrl,
      segment: null,
      icon: LayoutDashboard,
    },
    {
      label: 'Builder',
      href: `${baseUrl}/builder`,
      segment: 'builder',
      icon: Wrench,
    },
    {
      label: 'Candidates',
      href: `${baseUrl}/results`,
      segment: 'results',
      icon: Users,
    },
    {
      label: 'Activity',
      href: `${baseUrl}/activity`,
      segment: 'activity',
      icon: Activity,
    },
    {
      label: 'Settings',
      href: `${baseUrl}/settings`,
      segment: 'settings',
      icon: Settings,
    },
  ];

  return (
    <nav className={cn(
      "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      // Mobile: Allow wrapping so Tabs drop to next line
      "flex flex-wrap items-center", 
      // Desktop: No wrap, single row, fixed height to prevent shifting
      "md:flex-nowrap md:px-6 md:h-14"
    )}>
      
      {/* 1. Title Section */}
      <div className="flex items-center gap-3 min-w-0 pl-4 py-3 md:pl-0 md:py-0 md:order-1">
        <span className="text-lg font-semibold text-foreground truncate max-w-[180px] sm:max-w-[300px]" title={templateName}>
          {templateName}
        </span>
        {status === 'PUBLISHED' && (
          <div className="hidden lg:flex items-center gap-2 text-amber-700 dark:text-amber-200 text-sm whitespace-nowrap">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Published</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-amber-700/90 dark:text-amber-200/90"
                  aria-label="Published info"
                  suppressHydrationWarning
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm max-w-xs">
                This blueprint is locked. Create a new version to make changes.
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* 2. Actions Section (Moved here in DOM for Mobile Float Right) */}
      <div className="flex items-center gap-2 ml-auto pr-4 py-3 md:pr-0 md:py-0 md:order-3">
        {status === 'PUBLISHED' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              startTransition(async () => {
                await createNewVersion(templateId);
              });
            }}
            disabled={isPending}
            className="gap-1.5 h-8"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <GitBranch className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">New Version</span>
            <span className="inline sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* 3. Tabs Section */}
      <div className={cn(
        "w-full overflow-x-auto scrollbar-hide", // Mobile: Full width, scrollable
        "md:w-auto md:flex-1 md:flex md:justify-center md:overflow-visible md:order-2" // Desktop: Centered, flexible
      )}>
        <div className="flex px-4 md:px-0 w-max md:w-auto">
          {tabs.map((tab) => {
            const isActive = segment === tab.segment;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  'hover:text-foreground',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}