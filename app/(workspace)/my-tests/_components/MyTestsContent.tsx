'use client';

import { useMemo, useCallback, useTransition, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TemplateGroup, groupSessionsByTemplate, TemplateGroupData } from './TemplateGroup';
import { EmptyState } from './EmptyState';
import { SummaryStats } from './SummaryStats';
import { TestSessionSummary, TestResult, SessionStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

// Extended session type with result
export interface EnrichedTestSession extends TestSessionSummary {
  result: TestResult | null;
}

export type TabValue = 'all' | 'pending' | 'in_progress' | 'completed';

interface MyTestsContentProps {
  sessions: EnrichedTestSession[];
  initialTab?: TabValue;
}

const TAB_CONFIG: { value: TabValue; label: string; statuses: SessionStatus[] }[] = [
  { value: 'all', label: 'Все', statuses: [] },
  { value: 'pending', label: 'Ожидают', statuses: [SessionStatus.NOT_STARTED] },
  { value: 'in_progress', label: 'В работе', statuses: [SessionStatus.IN_PROGRESS] },
  { value: 'completed', label: 'Завершены', statuses: [SessionStatus.COMPLETED, SessionStatus.ABANDONED, SessionStatus.TIMED_OUT] },
];

/**
 * Client component for My Tests page with tabs, filtering, and template grouping
 * Uses URL-based tab state for bookmarkable/shareable links
 *
 * Optimizations:
 * - Optimistic tab switching: UI updates immediately, URL syncs in background
 * - Prefetch on hover: Routes are preloaded when user hovers over tabs
 * - Lazy computation: groupSessionsByTemplate only runs for active tab
 */
export function MyTestsContent({ sessions, initialTab = 'all' }: MyTestsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Optimistic tab state - updates immediately on click
  const urlTab = (searchParams.get('tab') as TabValue) || initialTab;
  const [optimisticTab, setOptimisticTab] = useState<TabValue>(urlTab);

  // Use optimistic tab for display, URL tab as source of truth after sync
  const activeTab = optimisticTab;

  // Handle tab change - instant UI update, background URL sync
  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as TabValue;

      // Immediate UI update (optimistic)
      setOptimisticTab(newTab);

      // Background URL sync using transition (non-blocking)
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (newTab === 'all') {
          params.delete('tab'); // Clean URL for default tab
        } else {
          params.set('tab', newTab);
        }
        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
          scroll: false,
        });
      });
    },
    [router, pathname, searchParams]
  );

  // Prefetch tab routes on hover/focus for faster navigation
  const handleTabHover = useCallback(
    (tabValue: TabValue) => {
      if (tabValue === activeTab) return; // Skip current tab

      const params = new URLSearchParams(searchParams.toString());
      if (tabValue === 'all') {
        params.delete('tab');
      } else {
        params.set('tab', tabValue);
      }
      const queryString = params.toString();
      router.prefetch(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [router, pathname, searchParams, activeTab]
  );

  // Group sessions by status for tab filtering
  const sessionsByStatus = useMemo(() => {
    return {
      all: sessions,
      pending: sessions.filter(s => s.status === SessionStatus.NOT_STARTED),
      in_progress: sessions.filter(s => s.status === SessionStatus.IN_PROGRESS),
      completed: sessions.filter(s =>
        s.status === SessionStatus.COMPLETED ||
        s.status === SessionStatus.ABANDONED ||
        s.status === SessionStatus.TIMED_OUT
      ),
    };
  }, [sessions]);

  // Helper function to get sessions for a tab value (avoids object injection lint warning)
  const getSessionsForTab = useCallback((tab: TabValue) => {
    switch (tab) {
      case 'all': return sessionsByStatus.all;
      case 'pending': return sessionsByStatus.pending;
      case 'in_progress': return sessionsByStatus.in_progress;
      case 'completed': return sessionsByStatus.completed;
    }
  }, [sessionsByStatus]);

  // Lazy tab content computation - only compute grouping for active tab
  // This defers expensive groupSessionsByTemplate until tab is actually displayed
  const groupedByTabCache = useMemo(() => {
    const cache: Partial<Record<TabValue, TemplateGroupData[]>> = {};
    return cache;
  }, [sessions]); // Reset cache when sessions change

  // Get grouped data for a specific tab (lazy computation with caching)
  const getGroupedForTab = useCallback((tab: TabValue): TemplateGroupData[] => {
    // Return from cache if available
    if (groupedByTabCache[tab]) {
      return groupedByTabCache[tab]!;
    }

    // Compute and cache
    const tabSessions = getSessionsForTab(tab);
    if (tabSessions.length === 0) {
      groupedByTabCache[tab] = [];
      return [];
    }

    const grouped = groupSessionsByTemplate(tabSessions);
    groupedByTabCache[tab] = grouped;
    return grouped;
  }, [getSessionsForTab, groupedByTabCache]);

  // Only compute grouping for the currently active tab
  const groupedByTemplate = useMemo(() => {
    return getGroupedForTab(activeTab);
  }, [activeTab, getGroupedForTab]);

  // Count badges
  const counts = useMemo(() => ({
    all: sessions.length,
    pending: sessionsByStatus.pending.length,
    in_progress: sessionsByStatus.in_progress.length,
    completed: sessionsByStatus.completed.length,
  }), [sessions.length, sessionsByStatus]);

  if (sessions.length === 0) {
    return <EmptyState type="no_tests" />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Stats Dashboard */}
      <SummaryStats counts={counts} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tabs with URL-synced state */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Compact Tabs Header - 44px touch targets, hugs content, scrollable on overflow */}
        <ScrollArea className="w-full mb-4 sm:mb-6">
          <TabsList className="inline-flex w-max h-11 sm:h-10 p-1 bg-muted/50 rounded-lg gap-1">
            {TAB_CONFIG.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={isPending}
                onMouseEnter={() => handleTabHover(tab.value)}
                onFocus={() => handleTabHover(tab.value)}
                className={cn(
                  'inline-flex flex-none items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5',
                  'min-h-[40px] sm:min-h-[36px]',
                  'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                  'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md',
                  isPending && 'opacity-70'
                )}
              >
                <span>{tab.label}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'min-w-5 sm:min-w-6 h-5 justify-center text-[11px] sm:text-xs px-1 sm:px-1.5 rounded-sm',
                    activeTab === tab.value && 'bg-primary text-primary-foreground'
                  )}
                >
                  {counts[tab.value]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>

        {/* Tab Content - Renders only active tab content to avoid unnecessary computation */}
        {TAB_CONFIG.map(tab => {
          const isActive = tab.value === activeTab;
          const tabSessions = getSessionsForTab(tab.value);

          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {tabSessions.length === 0 ? (
                <EmptyState type={`no_${tab.value}` as EmptyStateType} />
              ) : (
                <div className={cn('grid gap-3 sm:gap-4', isPending && 'opacity-70 transition-opacity')}>
                  {/* Only compute grouping when tab is active (lazy evaluation) */}
                  {isActive && getGroupedForTab(tab.value).map(group => (
                    <TemplateGroup key={group.templateId} group={group} defaultExpanded={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

type EmptyStateType = 'no_tests' | 'no_all' | 'no_pending' | 'no_in_progress' | 'no_completed';
