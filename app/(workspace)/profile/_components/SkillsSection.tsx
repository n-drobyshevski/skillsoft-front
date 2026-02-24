'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { CompetencyRow } from './TopCompetenciesCard';
import { ProfileEmptyState } from './ProfileEmptyState';
import type { TopCompetency } from '@/types/profile';

// ============================================
// PROPS
// ============================================

interface SkillsSectionProps {
  competencies: TopCompetency[];
  totalAssessments: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * SkillsSection - Linear/Notion-style skills section.
 *
 * Replaces the "skills" tab of the old SkillsPersonalityCard.
 * Flat section layout: no Card wrapper, no Tabs.
 * Reuses CompetencyRow from TopCompetenciesCard as-is.
 */
export function SkillsSection({ competencies, totalAssessments }: SkillsSectionProps) {
  const t = useTranslations('profile');
  const tComp = useTranslations('profile.competencies');
  const tAccessibility = useTranslations('profile.accessibility');

  return (
    <section className="py-6" role="region" aria-label={tAccessibility('competenciesSection')}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('sections.skills')}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 touch-manipulation group"
        >
          <Link href="/my-tests">
            {tComp('viewAll')}
            <ChevronRight className="h-3.5 w-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-muted-foreground mb-3">
        {tComp('basedOn', { count: totalAssessments })}
      </p>

      {/* Content */}
      {competencies.length === 0 ? (
        <ProfileEmptyState variant="no-competencies" showCta ctaHref="/test-templates" />
      ) : (
        <div className="space-y-2" role="list" aria-label={tComp('title')}>
          {competencies.map((competency, index) => (
            <CompetencyRow key={competency.competencyId} competency={competency} rank={index + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

/**
 * SkillsSectionSkeleton - Loading placeholder for SkillsSection.
 *
 * Matches the flat section layout: heading row + 5 competency rows.
 */
export function SkillsSectionSkeleton() {
  return (
    <section className="py-6" aria-busy="true" aria-label="Loading skills">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-1">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-8 w-14 rounded" />
      </div>

      {/* Subtitle skeleton */}
      <Skeleton className="h-3 w-32 rounded mb-3" />

      {/* Competency row skeletons */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-xl bg-muted/30"
          >
            {/* Rank circle */}
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />

            {/* Name and category */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>

            {/* Score */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Skeleton className="h-5 w-10 rounded" />
              <Skeleton className="h-1 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
