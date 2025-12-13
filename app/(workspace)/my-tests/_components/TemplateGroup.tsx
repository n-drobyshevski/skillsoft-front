'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedTestSession } from './MyTestsContent';
import { TestCard } from './TestCard';
import { HistoryTestCard } from './HistoryTestCard';
import { TemplateHeader, TemplateStats, calculateTemplateStats } from './TemplateHeader';

export interface TemplateGroupData {
  templateId: string;
  templateName: string;
  sessions: EnrichedTestSession[];
  stats: TemplateStats;
  latestSession: EnrichedTestSession;
  previousSessions: EnrichedTestSession[];
}

interface TemplateGroupProps {
  group: TemplateGroupData;
  defaultExpanded?: boolean;
}

/**
 * Template Group Component
 * Groups test sessions by template with latest attempt prominently displayed
 * and previous attempts in a collapsible section
 */
export function TemplateGroup({ group, defaultExpanded = false }: TemplateGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const hasPreviousAttempts = group.previousSessions.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <TemplateHeader stats={group.stats} />
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Latest Attempt - Always Visible */}
        <div className="relative">
          <TestCard session={group.latestSession} compact />
        </div>

        {/* Previous Attempts - Collapsible */}
        {hasPreviousAttempts && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between h-9 px-3 text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2 text-xs">
                  <History className="size-3.5" />
                  {getPreviousAttemptsLabel(group.previousSessions.length)}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="space-y-2 pt-2">
                {group.previousSessions.map((session) => (
                  <HistoryTestCard key={session.id} session={session} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Group sessions by template and prepare data for rendering
 */
export function groupSessionsByTemplate(
  sessions: EnrichedTestSession[]
): TemplateGroupData[] {
  // Group by templateId
  const groupsMap = new Map<string, EnrichedTestSession[]>();

  for (const session of sessions) {
    const existing = groupsMap.get(session.templateId) || [];
    existing.push(session);
    groupsMap.set(session.templateId, existing);
  }

  // Convert to array and sort sessions within each group
  const groups: TemplateGroupData[] = [];

  for (const [templateId, templateSessions] of groupsMap) {
    // Sort sessions: IN_PROGRESS first, then NOT_STARTED, then by date (newest first)
    const sorted = [...templateSessions].sort((a, b) => {
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
      const dateA = new Date(a.completedAt || a.startedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.startedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    const [latestSession, ...previousSessions] = sorted;

    groups.push({
      templateId,
      templateName: latestSession.templateName,
      sessions: sorted,
      stats: calculateTemplateStats(sorted),
      latestSession,
      previousSessions,
    });
  }

  // Sort groups by priority: has IN_PROGRESS first, then NOT_STARTED, then by latest date
  groups.sort((a, b) => {
    // Priority: groups with in-progress sessions first
    if (a.stats.hasInProgress !== b.stats.hasInProgress) {
      return a.stats.hasInProgress ? -1 : 1;
    }

    // Then groups with pending sessions
    if (a.stats.hasPending !== b.stats.hasPending) {
      return a.stats.hasPending ? -1 : 1;
    }

    // Then by latest activity date
    return new Date(b.stats.latestDate).getTime() - new Date(a.stats.latestDate).getTime();
  });

  return groups;
}

/**
 * Get Russian plural form for previous attempts label
 */
function getPreviousAttemptsLabel(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} предыдущих попыток`;
  if (lastOne === 1) return `${count} предыдущая попытка`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} предыдущие попытки`;
  return `${count} предыдущих попыток`;
}
