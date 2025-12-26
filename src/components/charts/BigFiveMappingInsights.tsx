"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BigFiveProfile,
  BigFiveContributions,
  CompetencyContribution,
  ContributionType,
  BIG_FIVE_INFO
} from '@/hooks/useBigFiveProjection';
import { BIG_FIVE_COLORS } from './BigFiveRadar';

interface BigFiveMappingInsightsProps {
  profile: BigFiveProfile;
  contributions: BigFiveContributions;
  className?: string;
}

/**
 * Get contribution type color for visual indicator
 */
function getContributionTypeColor(type: ContributionType): string {
  switch (type) {
    case 'primary':
      return 'bg-primary';
    case 'secondary':
      return 'bg-muted-foreground/60';
    case 'tertiary':
      return 'bg-muted-foreground/30';
    default:
      return 'bg-muted-foreground/40';
  }
}

/**
 * Contribution Card Component - Ultra-compact mobile design
 * No overflow possible - all text truncates
 */
const ContributionCard = React.memo<{
  contribution: CompetencyContribution;
  maxScore: number;
}>(({ contribution, maxScore }) => {
  const progressPercent = maxScore > 0
    ? (contribution.weightedScore / maxScore) * 100
    : 0;
  const score = Math.round(contribution.competencyScore);

  return (
    <div className="py-1.5 sm:py-2">
      {/* Single row: dot + name + score */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full overflow-hidden">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            getContributionTypeColor(contribution.contributionType)
          )}
        />
        <span className="flex-1 text-xs font-medium truncate min-w-0">
          {contribution.competencyName}
        </span>
        <span className="text-xs font-bold tabular-nums text-primary whitespace-nowrap">
          {score}%
        </span>
      </div>

      {/* Progress bar - full width under the row */}
      <div className="mt-1 ml-3">
        <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              contribution.contributionType === 'primary'
                ? "bg-primary"
                : "bg-muted-foreground/50"
            )}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
});

ContributionCard.displayName = 'ContributionCard';

/**
 * Trait Header - Simplified, no overflow
 */
const TraitHeader = React.memo<{
  trait: keyof BigFiveProfile;
  score: number;
  contributionCount: number;
}>(({ trait, score, contributionCount }) => {
  const info = BIG_FIVE_INFO[trait];
  const traitColor = BIG_FIVE_COLORS[trait];

  return (
    <div className="flex items-center gap-2 w-full min-w-0 overflow-hidden pr-1">
      {/* Color dot */}
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: traitColor.primary }}
      />

      {/* Name + count - truncated */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm truncate">
            {info.short}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            ({contributionCount})
          </span>
        </div>
      </div>

      {/* Score - fixed */}
      <span
        className="text-sm font-bold tabular-nums shrink-0"
        style={{ color: traitColor.primary }}
      >
        {score}%
      </span>
    </div>
  );
});

TraitHeader.displayName = 'TraitHeader';

/**
 * Trait Content - Simple list, no badges that could wrap poorly
 */
const TraitContent = React.memo<{
  contributions: CompetencyContribution[];
}>(({ contributions }) => {
  const maxScore = contributions.length > 0
    ? Math.max(...contributions.map(c => c.weightedScore))
    : 0;

  if (contributions.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-center">
        <Info className="h-4 w-4 text-muted-foreground/40 mr-2" />
        <span className="text-xs text-muted-foreground">No mappings</span>
      </div>
    );
  }

  // Sort: primary first, then secondary, then tertiary
  const sorted = [...contributions].sort((a, b) => {
    const order = { primary: 0, secondary: 1, tertiary: 2 };
    return (order[a.contributionType] ?? 3) - (order[b.contributionType] ?? 3);
  });

  // Count by type for simple summary
  const counts = {
    primary: contributions.filter(c => c.contributionType === 'primary').length,
    secondary: contributions.filter(c => c.contributionType === 'secondary').length,
    tertiary: contributions.filter(c => c.contributionType === 'tertiary').length,
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Simple count summary - single line */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2 overflow-hidden">
        {counts.primary > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {counts.primary}
          </span>
        )}
        {counts.secondary > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
            {counts.secondary}
          </span>
        )}
        {counts.tertiary > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            {counts.tertiary}
          </span>
        )}
      </div>

      {/* Contribution list */}
      <div className="divide-y divide-border/20">
        {sorted.map((contribution, index) => (
          <ContributionCard
            key={`${contribution.competencyId}-${index}`}
            contribution={contribution}
            maxScore={maxScore}
          />
        ))}
      </div>
    </div>
  );
});

TraitContent.displayName = 'TraitContent';

/**
 * Big Five Mapping Insights - Strict overflow control
 */
export const BigFiveMappingInsights = React.memo<BigFiveMappingInsightsProps>(({
  profile,
  contributions,
  className
}) => {
  const traits = Object.keys(profile) as Array<keyof BigFiveProfile>;

  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full overflow-hidden", className)}
    >
      {traits.map(trait => (
        <AccordionItem
          key={trait}
          value={trait}
          className="border-b border-border/30 last:border-b-0 overflow-hidden"
        >
          <AccordionTrigger
            className={cn(
              "py-2 sm:py-2.5 px-0 hover:no-underline gap-2",
              "touch-manipulation overflow-hidden",
              "[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground/50"
            )}
          >
            <TraitHeader
              trait={trait}
              score={profile[trait]}
              contributionCount={contributions[trait].length}
            />
          </AccordionTrigger>
          <AccordionContent className="pb-2 overflow-hidden">
            <TraitContent contributions={contributions[trait]} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
});

BigFiveMappingInsights.displayName = 'BigFiveMappingInsights';

export default BigFiveMappingInsights;
