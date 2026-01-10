'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Brain, Info, HelpCircle } from 'lucide-react';
import { BIG_FIVE_INFO, type BigFiveProfile } from '@/hooks/useBigFiveProjection';
import type { ProjectionConfidence } from '@/types/profile';
import { cn } from '@/lib/utils';
import { MobileBigFiveBars } from './MobileBigFiveBars';
import { ProfileEmptyState } from './ProfileEmptyState';
import { AccessibleChart } from '@/components/accessibility/AccessibleChart';

// Dynamic import for chart to reduce initial bundle
const BigFiveRadarChart = dynamic(
  () => import('./BigFiveChart').then((mod) => mod.BigFiveChart),
  {
    loading: () => <Skeleton className="h-[200px] sm:h-[260px] w-full rounded-lg" />,
    ssr: false,
  }
);

/**
 * Trait colors matching the radar chart
 */
const TRAIT_COLORS = {
  OPENNESS: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', bar: 'bg-violet-500' },
  CONSCIENTIOUSNESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
  EXTRAVERSION: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
  AGREEABLENESS: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
  EMOTIONAL_STABILITY: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', bar: 'bg-cyan-500' },
} as const;

/**
 * Trait display order
 */
const TRAIT_ORDER: Array<keyof BigFiveProfile> = [
  'OPENNESS',
  'CONSCIENTIOUSNESS',
  'EXTRAVERSION',
  'AGREEABLENESS',
  'EMOTIONAL_STABILITY',
];

interface PersonalityPassportCardProps {
  profile: BigFiveProfile;
  confidence: ProjectionConfidence;
  totalAssessments: number;
}

/**
 * Personality Passport Card - Client Component
 *
 * Mobile-first redesign with visual hierarchy:
 * - Compact mobile layout with smaller chart
 * - Dominant trait highlight with gradient
 * - Inline trait bars optimized for mobile
 * - Responsive spacing and typography
 */
export function PersonalityPassportCard({
  profile,
  confidence,
  totalAssessments,
}: PersonalityPassportCardProps) {
  const t = useTranslations('profile.passport');
  const tAccessibility = useTranslations('profile.accessibility');

  // Empty state - no assessments to base the profile on
  if (totalAssessments === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <ProfileEmptyState
            variant="no-passport"
            showCta
            ctaHref="/test-templates"
          />
        </CardContent>
      </Card>
    );
  }

  // Find dominant trait (highest score)
  const dominantTrait = TRAIT_ORDER.reduce((max, trait) =>
    // eslint-disable-next-line security/detect-object-injection
    profile[trait] > profile[max] ? trait : max
  );
  // eslint-disable-next-line security/detect-object-injection
  const dominantInfo = BIG_FIVE_INFO[dominantTrait];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              {t('title')}
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              {t('basedOn', { count: totalAssessments })}
            </CardDescription>
          </div>
          <ConfidenceBadge confidence={confidence} t={t} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Dominant trait callout - Enhanced with gradient */}
        <div
          className={cn(
            'p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 sm:gap-3',
            'bg-linear-to-r from-primary/10 to-transparent border border-primary/15',
            // eslint-disable-next-line security/detect-object-injection
            TRAIT_COLORS[dominantTrait].bg
          )}
        >
          <div
            className={cn(
              'h-9 w-9 px-2 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg',
              // eslint-disable-next-line security/detect-object-injection
              TRAIT_COLORS[dominantTrait].text,
              'bg-white/50 dark:bg-black/20'
            )}
          >
            {/* eslint-disable-next-line security/detect-object-injection */}
            {profile[dominantTrait]}
          </div>
          <div className="min-w-0 md:min-w-0 flex-1">
            <p
              className={cn(
                'font-medium text-xs sm:text-sm',
                // eslint-disable-next-line security/detect-object-injection
                TRAIT_COLORS[dominantTrait].text
              )}
            >
              {t('dominantTrait')}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {dominantInfo.short}
            </p>
          </div>
        </div>

        {/* Mobile: Horizontal bars (more touch-friendly) */}
        <MobileBigFiveBars profile={profile} className="sm:hidden" />

        {/* Desktop: Radar Chart with Accessible Data Table */}
        <div className="hidden sm:block">
          <AccessibleChart
            title={t('title')}
            description={tAccessibility('chartDescription')}
            data={TRAIT_ORDER.map(trait => ({
              // eslint-disable-next-line security/detect-object-injection
              trait: BIG_FIVE_INFO[trait].short,
              // eslint-disable-next-line security/detect-object-injection
              value: profile[trait],
            }))}
            columns={[
              { key: 'trait', label: tAccessibility('traitColumn') },
              { key: 'value', label: tAccessibility('scoreColumn') }
            ]}
          >
            <div className="h-[260px]">
              <BigFiveRadarChart profile={profile} />
            </div>
          </AccessibleChart>
        </div>

        {/* Trait bars with tooltips - Desktop only (MobileBigFiveBars handles mobile) */}
        <div className="hidden sm:block space-y-2 overflow-hidden">
          {TRAIT_ORDER.map((trait) => {
            // eslint-disable-next-line security/detect-object-injection
            const info = BIG_FIVE_INFO[trait];
            // eslint-disable-next-line security/detect-object-injection
            const score = profile[trait];
            // eslint-disable-next-line security/detect-object-injection
            const colors = TRAIT_COLORS[trait];

            return (
              <TooltipProvider key={trait} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-help group touch-manipulation min-h-[44px]">
                      {/* Trait name */}
                      <div className="w-28 shrink-0 min-w-0">
                        <span className="text-sm font-medium flex items-center gap-1 truncate">
                          {info.short}
                          <HelpCircle className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex-1 min-w-0 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      {/* Score */}
                      <div className={cn('w-10 text-right font-bold tabular-nums text-sm shrink-0', colors.text)}>
                        {score}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium">{info.short}</p>
                    <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

interface ConfidenceBadgeProps {
  confidence: ProjectionConfidence;
  t: ReturnType<typeof useTranslations<'profile.passport'>>;
}

function ConfidenceBadge({ confidence, t }: ConfidenceBadgeProps) {
  const config = {
    low: {
      className: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    },
    medium: {
      className: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    },
    high: {
      className: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
    },
  };

  // eslint-disable-next-line security/detect-object-injection
  const { className } = config[confidence];
  const label = t(`confidence.${confidence}`);
  const description = t(`confidenceTooltip.${confidence}`);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn('text-xs cursor-help', className)}>
            <Info className="h-3 w-3 mr-1" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function PersonalityPassportCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
            </div>
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Dominant trait callout skeleton */}
        <Skeleton className="h-14 sm:h-16 w-full rounded-xl" />

        {/* Mobile: Bar skeleton */}
        <div className="sm:hidden space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 min-h-[44px]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>

        {/* Desktop: Radar chart skeleton */}
        <Skeleton className="hidden sm:block h-[260px] w-full rounded-lg" />

        {/* Desktop: Trait bars skeleton */}
        <div className="hidden sm:block space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
