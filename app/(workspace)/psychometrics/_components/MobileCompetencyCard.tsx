'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CompetencyReliability, ReliabilityStatus } from '@/types/psychometrics';
import { ReliabilityStatusBadge } from './ReliabilityStatusBadge';
import { ChevronRight, Users, FileText } from 'lucide-react';

interface MobileCompetencyCardProps {
  competency: CompetencyReliability;
  className?: string;
}

/**
 * Get left border color based on reliability status
 */
function getStatusBorderColor(status: ReliabilityStatus): string {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return 'border-l-emerald-500';
    case ReliabilityStatus.ACCEPTABLE:
      return 'border-l-amber-500';
    case ReliabilityStatus.UNRELIABLE:
      return 'border-l-red-500';
    case ReliabilityStatus.INSUFFICIENT_DATA:
    default:
      return 'border-l-gray-300 dark:border-l-gray-600';
  }
}

/**
 * Get alpha color classes based on value
 */
function getAlphaColorClasses(alpha: number | null): {
  text: string;
  bg: string;
  ring: string;
} {
  if (alpha === null) {
    return {
      text: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800/50',
      ring: 'ring-gray-300 dark:ring-gray-600',
    };
  }
  if (alpha >= 0.7) {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      ring: 'ring-emerald-300 dark:ring-emerald-700',
    };
  }
  if (alpha >= 0.6) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      ring: 'ring-amber-300 dark:ring-amber-700',
    };
  }
  return {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    ring: 'ring-red-300 dark:ring-red-700',
  };
}

/**
 * MobileCompetencyCard - Mobile-optimized card view for competency reliability
 * Shows competency name, alpha gauge (centered), sample/items count, and status badge.
 * Touch-friendly layout with navigation to detail page.
 */
export function MobileCompetencyCard({
  competency,
  className,
}: MobileCompetencyCardProps) {
  // Handle both null and undefined for cronbachAlpha
  const alpha = competency.cronbachAlpha ?? null;
  const alphaColors = getAlphaColorClasses(alpha);
  const alphaDisplay = alpha !== null ? alpha.toFixed(2) : '-';

  return (
    <Link href={`/psychometrics/competencies/${competency.competencyId}`} className="block w-full">
      <Card
        className={cn(
          'relative w-full transition-all border-l-4 hover:shadow-md',
          getStatusBorderColor(competency.reliabilityStatus),
          'hover:bg-muted/30 cursor-pointer group',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Alpha Gauge - Circular display */}
            <div
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center',
                'ring-2',
                alphaColors.bg,
                alphaColors.ring
              )}
            >
              <span className={cn('text-lg font-bold tabular-nums', alphaColors.text)}>
                {alphaDisplay}
              </span>
              <span className="text-xs text-muted-foreground">alpha</span>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Competency name */}
              <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {competency.competencyName}
              </h3>

              {/* Stats row */}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {/* Sample size */}
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="tabular-nums">
                    {competency.sampleSize?.toLocaleString() ?? '-'}
                  </span>
                </div>

                {/* Item count */}
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="tabular-nums">
                    {competency.itemCount ?? '-'}
                  </span>
                  <span>вопросов</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-2">
                <ReliabilityStatusBadge status={competency.reliabilityStatus} />
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * MobileCompetencyCardList - Container for mobile competency cards with proper spacing
 */
interface MobileCompetencyCardListProps {
  competencies: CompetencyReliability[];
  className?: string;
}

export function MobileCompetencyCardList({
  competencies,
  className,
}: MobileCompetencyCardListProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {competencies.map((competency) => (
        <MobileCompetencyCard
          key={competency.id}
          competency={competency}
        />
      ))}
    </div>
  );
}

export default MobileCompetencyCard;
