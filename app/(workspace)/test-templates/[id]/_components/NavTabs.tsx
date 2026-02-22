'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  LayoutDashboard,
  Wrench,
  Settings,
  Lock,
  Info,
  GitBranch,
  Loader2,
  Activity,
  Shield,
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
 * * Desktop Layout:
 * [ Title ............. Tabs | Action ]
 */
export function NavTabs({ baseUrl, status, templateId, templateName }: NavTabsProps) {
  const segment = useSelectedLayoutSegment();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('template.hub');

  const tabs: NavTab[] = [
    {
      label: t('tabs.overview'),
      href: baseUrl,
      segment: null,
      icon: LayoutDashboard,
    },
    {
      label: t('tabs.builder'),
      href: `${baseUrl}/builder`,
      segment: 'builder',
      icon: Wrench,
    },
    {
      label: t('tabs.activity'),
      href: `${baseUrl}/activity`,
      segment: 'activity',
      icon: Activity,
    },
    {
      label: t('tabs.access'),
      href: `${baseUrl}/access`,
      segment: 'access',
      icon: Shield,
    },
    {
      label: t('tabs.settings'),
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
      <div className="flex items-center gap-3 min-w-0 pl-4 py-3 md:pl-0 md:py-0 md:w-full md:order-1">
        <span className="text-lg font-semibold text-foreground line-clamp-2 md:truncate md:line-clamp-none" title={templateName}>
          {templateName}
        </span>
        {status === 'PUBLISHED' && (
          <div className="hidden lg:flex items-center gap-2 text-amber-700 dark:text-amber-200 text-sm whitespace-nowrap">
            <Lock className="h-4 w-4" />
            <span className="font-medium">{t('status.published')}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-amber-700/90 dark:text-amber-200/90"
                  aria-label={t('publishedWarning.info')}
                  suppressHydrationWarning
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm max-w-xs">
                {t('publishedWarning.message')}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* 2. Actions Section (Moved here in DOM for Mobile Float Right) */}
      <div className="flex items-center gap-2 ml-auto pr-4 py-3 md:pr-0 md:py-0 md:order-3">
        {status === 'PUBLISHED' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="gap-1.5 h-8"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <GitBranch className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{t('actions.newVersion')}</span>
                <span className="inline sm:hidden">{t('actions.newVersionShort')}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('versionDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('versionDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel>{t('versionDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(async () => {
                      await createNewVersion(templateId, false);
                    });
                  }}
                >
                  {t('versionDialog.keepPublished')}
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(async () => {
                      await createNewVersion(templateId, true);
                    });
                  }}
                >
                  {t('versionDialog.archiveOriginal')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* 3. Tabs Section */}
      <div className={cn(
        "w-full overflow-x-auto scrollbar-hide", // Mobile: Full width, scrollable
        "md:w-auto md:flex md:justify-end md:overflow-visible md:order-2" // Desktop: Right-aligned
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