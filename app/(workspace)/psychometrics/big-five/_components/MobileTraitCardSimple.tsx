'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ReliabilityStatusBadge } from '../../_components/ReliabilityStatusBadge';
import { BigFiveReliability, BigFiveTraitDisplay } from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { TRAIT_COLORS } from './BigFiveTraitCard';

interface MobileTraitCardSimpleProps {
  reliability: BigFiveReliability;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

/**
 * Simplified mobile trait card with reduced cognitive load.
 * Shows only essential information:
 * - Trait name
 * - Alpha value (large)
 * - Status badge with icon
 * - Tap affordance
 *
 * Designed for quick scanning with tap-to-expand pattern.
 */
export function MobileTraitCardSimple({
  reliability,
  onClick,
  isActive = false,
  className
}: MobileTraitCardSimpleProps) {
  const colors = TRAIT_COLORS[reliability.trait];
  const traitInfo = BigFiveTraitDisplay[reliability.trait];

  const formatAlpha = (value: number | null): string => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all cursor-pointer',
        'hover:shadow-md active:scale-[0.98]',
        'touch-manipulation',
        colors.border,
        isActive && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${traitInfo.label}: Alpha ${formatAlpha(reliability.cronbachAlpha)}, ${reliability.reliabilityStatus}. Tap for details.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Colored accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: colors.accent }}
      />

      <CardContent className="p-4 pt-5">
        {/* Row 1: Trait name and status badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className={cn('font-semibold text-sm', colors.text)}>
            {traitInfo.label}
          </h3>
          <ReliabilityStatusBadge
            status={reliability.reliabilityStatus}
            showIcon={true}
            showLabel={false}
            iconOnly={true}
            className="shrink-0"
          />
        </div>

        {/* Row 2: Large Alpha value */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-bold tabular-nums tracking-tight"
                style={{ color: colors.accent }}
              >
                {formatAlpha(reliability.cronbachAlpha)}
              </span>
              <span className="text-xs text-muted-foreground">alpha</span>
            </div>
          </div>

          {/* Tap affordance */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="hidden xs:inline">Details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
