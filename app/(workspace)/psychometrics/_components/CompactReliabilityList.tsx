'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompetencyReliability } from '@/types/psychometrics';
import { CompactReliabilityCard, CompactReliabilityCardSkeleton } from './CompactReliabilityCard';
import { ReliabilityQuickStats, type StatusCategory, categorizeReliability } from './ReliabilityQuickStats';

interface CompactReliabilityListProps {
  /** Competency reliability data */
  competencies: CompetencyReliability[];
  /** Maximum items to show initially */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Mobile-optimized reliability list with exception-first design.
 * Shows problematic competencies at the top, with quick stats for filtering.
 */
export function CompactReliabilityList({
  competencies,
  maxItems = 3,
  className,
}: CompactReliabilityListProps) {
  const [activeFilter, setActiveFilter] = useState<StatusCategory | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort competencies: worst reliability first (exception-first pattern)
  const sortedCompetencies = useMemo(() => {
    return [...competencies].sort((a, b) => {
      // Items with null alpha go first (need attention)
      if (a.cronbachAlpha == null && b.cronbachAlpha != null) return -1;
      if (a.cronbachAlpha != null && b.cronbachAlpha == null) return 1;
      if (a.cronbachAlpha == null && b.cronbachAlpha == null) return 0;
      // Sort by alpha ascending (worst first)
      return (a.cronbachAlpha ?? 0) - (b.cronbachAlpha ?? 0);
    });
  }, [competencies]);

  // Filter competencies if a filter is active
  const filteredCompetencies = useMemo(() => {
    if (!activeFilter) return sortedCompetencies;
    return sortedCompetencies.filter(comp => categorizeReliability(comp) === activeFilter);
  }, [sortedCompetencies, activeFilter]);

  // Determine visible items based on expansion state
  const visibleItems = isExpanded ? filteredCompetencies : filteredCompetencies.slice(0, maxItems);
  const hasMore = filteredCompetencies.length > maxItems;

  if (competencies.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Shield className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No reliability data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Run a psychometric audit after collecting responses
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          Reliability Scores
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2.5">
        {/* Quick Stats Filter Bar */}
        <ReliabilityQuickStats
          competencies={competencies}
          onStatusFilter={setActiveFilter}
          activeFilter={activeFilter}
        />

        {/* Active Filter Indicator */}
        {activeFilter && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing {filteredCompetencies.length} {activeFilter} competencies
            </span>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Competency Cards List */}
        <div className="space-y-2">
          {visibleItems.map((comp) => (
            <CompactReliabilityCard
              key={comp.competencyId}
              competency={comp}
            />
          ))}
        </div>

        {/* Expand/Collapse or View All */}
        {hasMore && !isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full min-h-[44px] text-xs"
            onClick={() => setIsExpanded(true)}
          >
            Show {filteredCompetencies.length - maxItems} more
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}

        {isExpanded && hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full min-h-[44px] text-xs"
            onClick={() => setIsExpanded(false)}
          >
            Show less
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}

        {/* View All Link */}
        <Link href="/psychometrics/competencies">
          <Button variant="outline" size="sm" className="w-full min-h-[44px] text-xs gap-1">
            View all {competencies.length} competencies
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
export function CompactReliabilityListSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2.5">
        {/* Quick stats skeleton */}
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Cards skeleton */}
        {[1, 2, 3].map((i) => (
          <CompactReliabilityCardSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}
