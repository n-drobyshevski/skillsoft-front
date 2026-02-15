'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { LazyRadialReliabilityChart as RadialReliabilityChart } from '@/lib/lazy-charts';
import { CompactReliabilityList } from './CompactReliabilityList';
import { Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CompetencyReliability } from '@/types/psychometrics';

interface ReliabilityGaugesGridProps {
  competencies: CompetencyReliability[];
}

/**
 * Client-side wrapper for reliability gauges with responsive layout:
 * - Desktop: 3-column grid of radial charts (6 items max)
 * - Mobile: Exception-first compact list with quick stats filtering
 */
export function ReliabilityGaugesGrid({ competencies }: ReliabilityGaugesGridProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  if (competencies.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[120px] md:h-[200px]">
        <div className="text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No reliability data available</p>
        </div>
      </Card>
    );
  }

  // Mobile: Use the new CompactReliabilityList with exception-first design
  if (isMobile) {
    return <CompactReliabilityList competencies={competencies} maxItems={3} />;
  }

  // Desktop: Show radial charts in 3-column grid
  // Sort by reliability (best to worst for a balanced view on desktop)
  const sortedCompetencies = [...competencies].sort((a, b) => {
    const aValue = a.cronbachAlpha ?? -1;
    const bValue = b.cronbachAlpha ?? -1;
    return bValue - aValue; // Descending - best first on desktop
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Test Reliability Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 3-column grid of radial charts */}
        <div className="grid grid-cols-3 gap-4 min-w-0">
          {sortedCompetencies.slice(0, 6).map((comp) => (
            <RadialReliabilityChart
              key={comp.competencyId}
              value={comp.cronbachAlpha}
              competencyName={comp.competencyName}
              sampleSize={comp.sampleSize}
              itemCount={comp.itemCount}
              size="sm"
              onClick={() => router.push(`/psychometrics/competencies/${comp.competencyId}`)}
            />
          ))}
        </div>

        {/* View All link */}
        {competencies.length > 6 && (
          <Link href="/psychometrics/competencies">
            <Button variant="ghost" size="sm" className="w-full mt-4">
              View all {competencies.length} competencies
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// Loading skeleton for SSR
export function ReliabilityGaugesGridSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-24 h-16 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded mt-2 animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded mt-1 animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
