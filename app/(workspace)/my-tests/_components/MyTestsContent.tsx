'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TestCard } from './TestCard';
import { EmptyState } from './EmptyState';
import { TestSessionSummary, TestResult, SessionStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

// Extended session type with result
export interface EnrichedTestSession extends TestSessionSummary {
  result: TestResult | null;
}

interface MyTestsContentProps {
  sessions: EnrichedTestSession[];
}

type TabValue = 'all' | 'pending' | 'in_progress' | 'completed';

const TAB_CONFIG: { value: TabValue; label: string; statuses: SessionStatus[] }[] = [
  { value: 'all', label: 'Все', statuses: [] },
  { value: 'pending', label: 'Ожидают', statuses: [SessionStatus.NOT_STARTED] },
  { value: 'in_progress', label: 'В работе', statuses: [SessionStatus.IN_PROGRESS] },
  { value: 'completed', label: 'Завершены', statuses: [SessionStatus.COMPLETED, SessionStatus.ABANDONED, SessionStatus.TIMED_OUT] },
];

/**
 * Client component for My Tests page with tabs and filtering
 */
export function MyTestsContent({ sessions }: MyTestsContentProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Group sessions by status
  const groupedSessions = useMemo(() => {
    const groups = {
      all: sessions,
      pending: sessions.filter(s => s.status === SessionStatus.NOT_STARTED),
      in_progress: sessions.filter(s => s.status === SessionStatus.IN_PROGRESS),
      completed: sessions.filter(s =>
        s.status === SessionStatus.COMPLETED ||
        s.status === SessionStatus.ABANDONED ||
        s.status === SessionStatus.TIMED_OUT
      ),
    };
    return groups;
  }, [sessions]);

  // Sort sessions by relevance
  const sortedSessions = useMemo(() => {
    const currentSessions = groupedSessions[activeTab];

    return [...currentSessions].sort((a, b) => {
      // IN_PROGRESS first, then NOT_STARTED, then COMPLETED
      const statusOrder: Record<string, number> = {
        'IN_PROGRESS': 0,
        'NOT_STARTED': 1,
        'COMPLETED': 2,
        'ABANDONED': 3,
        'TIMED_OUT': 4,
      };

      const orderDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      if (orderDiff !== 0) return orderDiff;

      // Within same status, sort by date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [groupedSessions, activeTab]);

  // Count badges
  const counts = useMemo(() => ({
    all: sessions.length,
    pending: groupedSessions.pending.length,
    in_progress: groupedSessions.in_progress.length,
    completed: groupedSessions.completed.length,
  }), [sessions.length, groupedSessions]);

  if (sessions.length === 0) {
    return <EmptyState type="no_tests" />;
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
      {/* Tabs Header */}
      <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-6 flex-wrap">
        {TAB_CONFIG.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm",
              "text-sm font-medium transition-all"
            )}
          >
            {tab.label}
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 min-w-[1.5rem] justify-center text-xs",
                activeTab === tab.value && "bg-primary text-primary-foreground"
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
          {groupedSessions[tab.value].length === 0 ? (
            <EmptyState type={`no_${tab.value}` as EmptyStateType} />
          ) : (
            <div className="grid gap-4">
              {sortedSessions.map((session, index) => (
                <TestCard
                  key={session.id}
                  session={session}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

type EmptyStateType = 'no_tests' | 'no_all' | 'no_pending' | 'no_in_progress' | 'no_completed';
