'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Target, Brain, ChevronRight, HelpCircle } from 'lucide-react';
import { BIG_FIVE_INFO, type BigFiveProfile } from '@/hooks/useBigFiveProjection';
import { CompetencyRow } from './TopCompetenciesCard';
import {
  TRAIT_COLORS,
  TRAIT_ORDER,
  ConfidenceBadge,
} from './PersonalityPassportCard';
import { MobileBigFiveBars } from './MobileBigFiveBars';
import { ProfileEmptyState } from './ProfileEmptyState';
import { AccessibleChart } from '@/components/accessibility/AccessibleChart';
import { LazyBigFiveChart as BigFiveRadarChart } from '@/lib/lazy-charts';
import { cn } from '@/lib/utils';
import type { TopCompetency, ProjectionConfidence } from '@/types/profile';
import Link from 'next/link';

interface SkillsPersonalityCardProps {
  competencies: TopCompetency[];
  totalAssessments: number;
  bigFiveProfile: BigFiveProfile;
  confidence: ProjectionConfidence;
}

/**
 * Skills & Personality Card - Tabbed bento card
 *
 * Combines TopCompetenciesCard + PersonalityPassportCard into
 * a single card with two tabs:
 * - "Top Skills" — ranked competency list
 * - "Personality" — Big Five profile (bars on mobile, radar on desktop)
 */
export function SkillsPersonalityCard({
  competencies,
  totalAssessments,
  bigFiveProfile,
  confidence,
}: SkillsPersonalityCardProps) {
  const t = useTranslations('profile');
  const tComp = useTranslations('profile.competencies');
  const tPassport = useTranslations('profile.passport');
  const tAccessibility = useTranslations('profile.accessibility');

  // Empty state - no assessments at all
  if (totalAssessments === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="text-base sm:text-lg font-semibold">{t('bento.skillsTab')}</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <ProfileEmptyState
            variant="no-competencies"
            showCta
            ctaHref="/test-templates"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <Tabs defaultValue="skills">
        <CardHeader className="pb-0 px-4 sm:px-6">
          <TabsList className="w-full h-11">
            <TabsTrigger value="skills" className="flex-1 min-h-[44px] gap-1.5">
              <Target className="h-4 w-4" aria-hidden="true" />
              {t('bento.skillsTab')}
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex-1 min-h-[44px] gap-1.5">
              <Brain className="h-4 w-4" aria-hidden="true" />
              {t('bento.personalityTab')}
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4">
          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="flex items-center justify-between mb-3">
              <CardDescription className="text-xs sm:text-sm">
                {tComp('basedOn', { count: totalAssessments })}
              </CardDescription>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="shrink-0 text-xs h-8 px-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 transition-all duration-200 hover:bg-muted active:scale-[0.98] group"
              >
                <Link href="/my-tests" aria-label={tComp('viewAll')}>
                  <span className="hidden sm:inline mr-0.5">{tComp('viewAll')}</span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {competencies.length === 0 ? (
              <ProfileEmptyState
                variant="no-competencies"
                showCta
                ctaHref="/test-templates"
              />
            ) : (
              <div className="space-y-2 sm:space-y-3" role="list" aria-label={tComp('title')}>
                {competencies.map((competency, index) => (
                  <CompetencyRow key={competency.competencyId} competency={competency} rank={index + 1} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Personality Tab */}
          <TabsContent value="personality">
            <div className="flex items-center justify-between mb-3">
              <CardDescription className="text-xs sm:text-sm">
                {tPassport('basedOn', { count: totalAssessments })}
              </CardDescription>
              <ConfidenceBadge confidence={confidence} t={tPassport} />
            </div>

            {/* Dominant trait callout */}
            <DominantTraitCallout profile={bigFiveProfile} />

            {/* Mobile: Horizontal bars */}
            <MobileBigFiveBars profile={bigFiveProfile} className="sm:hidden mt-3" />

            {/* Desktop: Radar Chart */}
            <div className="hidden sm:block mt-4 relative z-0">
              <AccessibleChart
                title={tPassport('title')}
                description={tAccessibility('chartDescription')}
                data={TRAIT_ORDER.map(trait => ({
                  // eslint-disable-next-line security/detect-object-injection
                  trait: BIG_FIVE_INFO[trait].short,
                  // eslint-disable-next-line security/detect-object-injection
                  value: bigFiveProfile[trait],
                }))}
                columns={[
                  { key: 'trait', label: tAccessibility('traitColumn') },
                  { key: 'value', label: tAccessibility('scoreColumn') }
                ]}
              >
                <div className="h-[260px] overflow-hidden">
                  <BigFiveRadarChart profile={bigFiveProfile} />
                </div>
              </AccessibleChart>
            </div>

            {/* Desktop: Trait bars with tooltips */}
            <div className="hidden sm:block space-y-2 mt-4 overflow-hidden">
              {TRAIT_ORDER.map((trait) => {
                // eslint-disable-next-line security/detect-object-injection
                const info = BIG_FIVE_INFO[trait];
                // eslint-disable-next-line security/detect-object-injection
                const score = bigFiveProfile[trait];
                // eslint-disable-next-line security/detect-object-injection
                const colors = TRAIT_COLORS[trait];

                return (
                  <TooltipProvider key={trait} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-help group touch-manipulation min-h-[44px]">
                          <div className="w-28 shrink-0 min-w-0">
                            <span className="text-sm font-medium flex items-center gap-1 truncate">
                              {info.short}
                              <HelpCircle className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                              style={{ width: `${score}%` }}
                            />
                          </div>
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
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

// ============================================
// DOMINANT TRAIT CALLOUT
// ============================================

function DominantTraitCallout({ profile }: { profile: BigFiveProfile }) {
  const t = useTranslations('profile.passport');

  const dominantTrait = TRAIT_ORDER.reduce((max, trait) =>
    // eslint-disable-next-line security/detect-object-injection
    profile[trait] > profile[max] ? trait : max
  );
  // eslint-disable-next-line security/detect-object-injection
  const dominantInfo = BIG_FIVE_INFO[dominantTrait];

  return (
    <div className="p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 sm:gap-3 bg-muted/50 border border-border">
      <div
        className={cn(
          'h-9 w-9 px-2 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg',
          // eslint-disable-next-line security/detect-object-injection
          TRAIT_COLORS[dominantTrait].text,
          'bg-muted'
        )}
      >
        {/* eslint-disable-next-line security/detect-object-injection */}
        {profile[dominantTrait]}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-medium text-xs sm:text-sm',
            // eslint-disable-next-line security/detect-object-injection
            TRAIT_COLORS[dominantTrait].text
          )}
        >
          {t('dominantTrait')}
        </p>
        <p className="text-xs-safe text-muted-foreground truncate">
          {dominantInfo.short}
        </p>
      </div>
    </div>
  );
}

// ============================================
// SKELETON
// ============================================

export function SkillsPersonalityCardSkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-0 px-4 sm:px-6">
        {/* Tab bar skeleton */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg h-11">
          <Skeleton className="flex-1 rounded-md" />
          <Skeleton className="flex-1 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4">
        {/* Description + action */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-14 rounded" />
        </div>
        {/* Competency rows */}
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-muted/30">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 sm:h-4 w-3/4" />
                <Skeleton className="h-2.5 sm:h-3 w-1/2" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
                <Skeleton className="h-1 sm:h-1.5 w-12 sm:w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
