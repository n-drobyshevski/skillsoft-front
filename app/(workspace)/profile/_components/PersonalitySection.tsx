'use client';

import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { type BigFiveProfile } from '@/hooks/useBigFiveProjection';
import { TRAIT_COLORS, TRAIT_ORDER, ConfidenceBadge } from './PersonalityPassportCard';
import { ProfileEmptyState } from './ProfileEmptyState';
import { cn } from '@/lib/utils';
import type { ProjectionConfidence } from '@/types/profile';

// ============================================
// PROPS
// ============================================

export interface PersonalitySectionProps {
  bigFiveProfile: BigFiveProfile;
  confidence: ProjectionConfidence;
  totalAssessments: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * PersonalitySection - Linear/Notion-style personality section.
 *
 * Replaces the legacy personality tab that contained a radar chart and
 * mobile-only bars. Renders the same horizontal trait bars at all viewport
 * sizes with no Card or Tabs wrapper, keeping the profile layout flat.
 *
 * @example
 * ```tsx
 * <PersonalitySection
 *   bigFiveProfile={profile}
 *   confidence="high"
 *   totalAssessments={5}
 * />
 * ```
 */
export function PersonalitySection({
  bigFiveProfile,
  confidence,
  totalAssessments,
}: PersonalitySectionProps) {
  const t = useTranslations('profile');
  const tPassport = useTranslations('profile.passport');
  const tAccessibility = useTranslations('profile.accessibility');

  if (totalAssessments === 0) {
    return (
      <section className="py-6" role="region" aria-label={tAccessibility('passportSection')}>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          {t('sections.personality')}
        </h2>
        <ProfileEmptyState
          variant="no-passport"
          showCta
          ctaHref="/test-templates"
        />
      </section>
    );
  }

  return (
    <section className="py-6" role="region" aria-label={tAccessibility('passportSection')}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('sections.personality')}
        </h2>
        <ConfidenceBadge confidence={confidence} t={tPassport} />
      </div>

      {/* Subtitle */}
      <p className="text-xs text-muted-foreground mb-4">
        {tPassport('basedOn', { count: totalAssessments })}
      </p>

      {/* Trait bars — all viewport sizes */}
      <div className="space-y-2" role="list" aria-label={tPassport('title')}>
        {TRAIT_ORDER.map((trait) => {
          // eslint-disable-next-line security/detect-object-injection
          const score = bigFiveProfile[trait];
          // eslint-disable-next-line security/detect-object-injection
          const colors = TRAIT_COLORS[trait];

          return (
            <TooltipProvider key={trait} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="listitem"
                    className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-help min-h-[44px] touch-manipulation"
                  >
                    <span className="w-28 shrink-0 text-sm font-medium truncate">{tPassport(`traits.${trait}`)}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={cn('w-10 text-right font-bold tabular-nums text-sm shrink-0', colors.text)}>
                      {score}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">{tPassport(`traits.${trait}`)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tPassport(`traitDescriptions.${trait}`)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </section>
  );
}

// ============================================
// SKELETON
// ============================================

/**
 * PersonalitySectionSkeleton - Loading placeholder for PersonalitySection.
 *
 * Mirrors the section heading + 5 trait bar rows without any data.
 */
export function PersonalitySectionSkeleton() {
  return (
    <section className="py-6" aria-busy="true" aria-label="Loading personality section">
      {/* Header row skeleton */}
      <div className="flex items-center justify-between mb-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Subtitle skeleton */}
      <Skeleton className="h-3 w-32 mb-4" />

      {/* Trait bar skeletons */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-4 w-10 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
