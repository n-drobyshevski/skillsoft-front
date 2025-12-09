'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Settings,
  Lock,
  type LucideIcon 
} from 'lucide-react';
import type { TemplateStatus } from './TemplateHeader';

interface NavTab {
  label: string;
  href: string;
  segment: string | null;
  icon: LucideIcon;
}

interface NavTabsProps {
  baseUrl: string;
  status: TemplateStatus;
}

/**
 * Navigation tabs for the Test Template Hub
 * Uses URL-based routing instead of client state
 * Active state determined by useSelectedLayoutSegment()
 */
export function NavTabs({ baseUrl, status }: NavTabsProps) {
  const segment = useSelectedLayoutSegment();

  const tabs: NavTab[] = [
    {
      label: 'Overview',
      href: baseUrl,
      segment: null, // root page
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
      label: 'Settings',
      href: `${baseUrl}/settings`,
      segment: 'settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="flex items-center justify-between gap-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 lg:px-6">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = segment === tab.segment;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                'hover:text-foreground',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {status === 'PUBLISHED' && (
        <div className="hidden md:flex items-center gap-2 text-amber-700 dark:text-amber-200 text-sm">
          <Lock className="h-4 w-4" />
          <span className="font-medium">Published Version</span>
          <span className="text-amber-700/80 dark:text-amber-300/80">
            — This blueprint is locked. Create a new version to make changes.
          </span>
        </div>
      )}
    </nav>
  );
}
