'use client';

import { useMemo, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TemplateGroup, groupSessionsByTemplate } from './TemplateGroup';
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
 */
export function MyTestsContent({ sessions, initialTab = 'all' }: MyTestsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get active tab from URL or use initial value
  const activeTab = (searchParams.get('tab') as TabValue) || initialTab;

  // Handle tab change - update URL without full page reload
  const handleTabChange = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
          params.delete('tab'); // Clean URL for default tab
        } else {
          params.set('tab', value);
        }
        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
          scroll: false,
        });
      });
    },
    [router, pathname, searchParams]
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
  const getSessionsForTab = (tab: TabValue) => {
    switch (tab) {
      case 'all': return sessionsByStatus.all;
      case 'pending': return sessionsByStatus.pending;
      case 'in_progress': return sessionsByStatus.in_progress;
      case 'completed': return sessionsByStatus.completed;
    }
  };

  // Group filtered sessions by template
  const groupedByTemplate = useMemo(() => {
    const currentSessions = getSessionsForTab(activeTab);
    if (currentSessions.length === 0) return [];

    return groupSessionsByTemplate(currentSessions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsByStatus, activeTab]);

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
    <div className="space-y-6">
      {/* Summary Stats Dashboard */}
      <SummaryStats counts={counts} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tabs with URL-synced state */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Tabs Header */}
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-6 flex-wrap">
          {TAB_CONFIG.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm',
                'text-sm font-medium transition-all',
                isPending && 'opacity-70'
              )}
            >
              {tab.label}
              <Badge
                variant="secondary"
                className={cn(
                  'ml-1 min-w-[1.5rem] justify-center text-xs',
                  activeTab === tab.value && 'bg-primary text-primary-foreground'
                )}
              >
                {counts[tab.value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {TAB_CONFIG.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {getSessionsForTab(tab.value).length === 0 ? (
              <EmptyState type={`no_${tab.value}` as EmptyStateType} />
            ) : (
              <div className={cn('grid gap-4', isPending && 'opacity-70 transition-opacity')}>
                {groupedByTemplate.map(group => (
                  <TemplateGroup key={group.templateId} group={group} defaultExpanded={false} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

type EmptyStateType = 'no_tests' | 'no_all' | 'no_pending' | 'no_in_progress' | 'no_completed';
