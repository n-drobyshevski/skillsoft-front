'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from './strategy-context';

// ============================================
// TYPES
// ============================================

interface StrategyLoadingSkeletonProps {
  strategy: Strategy;
  className?: string;
}

// ============================================
// STRATEGY-SPECIFIC SKELETONS
// ============================================

function UniversalBaselineSkeleton({ config }: { config: typeof STRATEGY_CONFIG.UNIVERSAL_BASELINE }) {
  return (
    <div className={cn('p-4 rounded-xl border', config.border, config.bg)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-48 mt-3" />
    </div>
  );
}

function TargetedFitSkeleton({ config }: { config: typeof STRATEGY_CONFIG.TARGETED_FIT }) {
  return (
    <div className={cn('p-4 rounded-xl border', config.border, config.bg)}>
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-3" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-28 mt-3" />
    </div>
  );
}

function DynamicGapSkeleton({ config }: { config: typeof STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS }) {
  return (
    <div className={cn('p-4 rounded-xl border', config.border, config.bg)}>
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-24 mt-3" />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function StrategyLoadingSkeleton({
  strategy,
  className,
}: StrategyLoadingSkeletonProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];

  return (
    <div
      className={cn('space-y-4 animate-pulse', className)}
      role="status"
      aria-label={t('loadingResults')}
    >
      {/* Strategy badge skeleton */}
      <div className={cn('p-3 rounded-xl border', config.border, config.bg)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Score display skeleton - varies by strategy */}
      {strategy === 'UNIVERSAL_BASELINE' && (
        <UniversalBaselineSkeleton config={STRATEGY_CONFIG.UNIVERSAL_BASELINE} />
      )}
      {strategy === 'TARGETED_FIT' && (
        <TargetedFitSkeleton config={STRATEGY_CONFIG.TARGETED_FIT} />
      )}
      {strategy === 'DYNAMIC_GAP_ANALYSIS' && (
        <DynamicGapSkeleton config={STRATEGY_CONFIG.DYNAMIC_GAP_ANALYSIS} />
      )}

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>

      {/* Content skeleton */}
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Screen reader text */}
      <span className="sr-only">{t('loadingResultsText')}</span>
    </div>
  );
}

export default StrategyLoadingSkeleton;
