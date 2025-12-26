'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, History, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedTestSession } from './MyTestsContent';
import { TestCard } from './TestCard';
import { HistoryTestCard } from './HistoryTestCard';
import { TemplateStats, calculateTemplateStats } from './TemplateHeader';

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
 * Template Group Component - Simplified
 *
 * Redesigned to reduce visual nesting:
 * - Removed outer Card wrapper
 * - Simplified header to just template name + key stats
 * - Cleaner collapsible history section
 */
export function TemplateGroup({ group, defaultExpanded = false }: TemplateGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const hasPreviousAttempts = group.previousSessions.length > 0;
  const showBestScore = group.stats.bestScore !== null && group.stats.completedAttempts > 0;

  return (
    <div className="space-y-2 max-w-full overflow-hidden">
      {/* Simplified Header: Template Name + Key Stats - stacks on very narrow screens */}
      <div className="flex items-center justify-between gap-2 px-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base truncate min-w-0 flex-1">
          {group.templateName}
        </h3>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Best Score (if any completed) */}
          {showBestScore && (
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-xs',
                group.stats.bestScore! >= 70
                  ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
              )}
              aria-label={`Лучший результат: ${Math.round(group.stats.bestScore!)}%`}
            >
              <Trophy className="size-3" />
              {Math.round(group.stats.bestScore!)}%
            </Badge>
          )}

          {/* Attempts count (only if multiple) - simplified on mobile */}
          {group.stats.totalAttempts > 1 && (
            <Badge variant="secondary" className="text-xs">
              <span className="sm:hidden">{group.stats.totalAttempts}x</span>
              <span className="hidden sm:inline">{group.stats.totalAttempts} {getAttemptsLabel(group.stats.totalAttempts)}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Latest Attempt - Main Card */}
      <TestCard session={group.latestSession} compact />

      {/* Previous Attempts - Collapsible */}
      {hasPreviousAttempts && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-7 sm:h-8 px-2 sm:px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <span className="flex items-center gap-1.5 sm:gap-2 text-xs">
                <History className="size-3 sm:size-3.5" />
                <span className="sm:hidden">{group.previousSessions.length} ранее</span>
                <span className="hidden sm:inline">{getPreviousAttemptsLabel(group.previousSessions.length)}</span>
              </span>
              <ChevronDown
                className={cn(
                  'size-3.5 sm:size-4 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-2 pt-2">
              {group.previousSessions.map(session => (
                <HistoryTestCard key={session.id} session={session} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

/**
 * Get Russian plural form for attempts
 */
function getAttemptsLabel(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return 'попыток';
  if (lastOne === 1) return 'попытка';
  if (lastOne >= 2 && lastOne <= 4) return 'попытки';
  return 'попыток';
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
