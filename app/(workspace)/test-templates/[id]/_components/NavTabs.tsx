'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Settings,
  type LucideIcon 
} from 'lucide-react';

interface NavTab {
  label: string;
  href: string;
  segment: string | null;
  icon: LucideIcon;
}

interface NavTabsProps {
  baseUrl: string;
}

/**
 * Navigation tabs for the Test Template Hub
 * Uses URL-based routing instead of client state
 * Active state determined by useSelectedLayoutSegment()
 */
export function NavTabs({ baseUrl }: NavTabsProps) {
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
    <nav className="flex border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex px-4 lg:px-6">
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
    </nav>
  );
}
