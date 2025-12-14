"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BigFiveProfile,
  BigFiveContributions,
  CompetencyContribution,
  ContributionType,
  BIG_FIVE_INFO
} from '@/hooks/useBigFiveProjection';

interface BigFiveMappingInsightsProps {
  profile: BigFiveProfile;
  contributions: BigFiveContributions;
  className?: string;
}

/**
 * Get badge styling based on contribution type
 */
function getContributionBadgeStyle(type: ContributionType): string {
  switch (type) {
    case 'primary':
      return 'bg-primary/15 text-primary border-primary/30';
    case 'secondary':
      return 'bg-muted text-muted-foreground border-muted-foreground/30';
    case 'tertiary':
      return 'bg-muted/50 text-muted-foreground/80 border-muted-foreground/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

/**
 * Format weight as percentage
 */
function formatWeight(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

/**
 * Individual contribution row component
 */
const ContributionRow = React.memo<{
  contribution: CompetencyContribution;
  maxWeightedScore: number;
}>(({ contribution, maxWeightedScore }) => {
  const progressValue = maxWeightedScore > 0
    ? (contribution.weightedScore / maxWeightedScore) * 100
    : 0;

  return (
    <div className="py-2.5 border-b border-border/50 last:border-b-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">
            {contribution.competencyName}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                  <ExternalLink className="h-3 w-3" />
                  {contribution.onetElement}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">
                  <span className="font-medium">O*NET Code:</span> {contribution.onetCode}
                </p>
                {contribution.facet && (
                  <p className="text-xs mt-1">
                    <span className="font-medium">Facet:</span> {contribution.facet}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] capitalize shrink-0",
            getContributionBadgeStyle(contribution.contributionType)
          )}
        >
          {contribution.contributionType}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Progress value={progressValue} className="h-1.5 flex-1" />
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-muted-foreground">
            {Math.round(contribution.competencyScore)}%
          </span>
          <span className="text-muted-foreground/60">x</span>
          <span className="font-medium tabular-nums">
            {formatWeight(contribution.weight)}
          </span>
        </div>
      </div>
    </div>
  );
});

ContributionRow.displayName = 'ContributionRow';

/**
 * Expandable trait card component
 */
const TraitCard = React.memo<{
  trait: keyof BigFiveProfile;
  score: number;
  contributions: CompetencyContribution[];
  isExpanded: boolean;
  onToggle: () => void;
}>(({ trait, score, contributions, isExpanded, onToggle }) => {
  const info = BIG_FIVE_INFO[trait];
  const contributionCount = contributions.length;

  // Calculate max weighted score for progress bar normalization
  const maxWeightedScore = contributions.length > 0
    ? Math.max(...contributions.map(c => c.weightedScore))
    : 0;

  return (
    <Card className={cn(
      "transition-all duration-200",
      isExpanded && "ring-1 ring-primary/20"
    )}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 sm:p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={isExpanded}
        aria-controls={`trait-content-${trait}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm sm:text-base">
                {info.short}
              </h4>
              <span className="text-sm font-bold text-primary tabular-nums">
                {score}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {info.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {contributionCount} contributing {contributionCount === 1 ? 'competency' : 'competencies'}
            </p>
          </div>
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <CardContent
          id={`trait-content-${trait}`}
          className="pt-0 pb-3 px-3 sm:px-4"
        >
          <div className="border-t pt-3">
            {contributions.length === 0 ? (
              <div className="text-center py-4">
                <Info className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No competencies mapped to this trait
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {contributions.map((contribution, index) => (
                  <ContributionRow
                    key={`${contribution.competencyId}-${contribution.contributionType}-${index}`}
                    contribution={contribution}
                    maxWeightedScore={maxWeightedScore}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

TraitCard.displayName = 'TraitCard';

/**
 * Big Five Mapping Insights Component
 *
 * Displays expandable cards for each Big Five personality trait,
 * showing how competencies contribute to each trait score.
 *
 * Features:
 * - Only one trait expanded at a time to save space
 * - Shows contribution type badges (Primary/Secondary/Tertiary)
 * - Progress bars for weighted contributions
 * - O*NET element references with tooltips
 * - Mobile responsive design
 */
export const BigFiveMappingInsights = React.memo<BigFiveMappingInsightsProps>(({
  profile,
  contributions,
  className
}) => {
  const [expandedTrait, setExpandedTrait] = useState<keyof BigFiveProfile | null>(null);

  const traits = Object.keys(profile) as Array<keyof BigFiveProfile>;

  const handleToggle = (trait: keyof BigFiveProfile) => {
    setExpandedTrait(current => current === trait ? null : trait);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {traits.map(trait => (
        <TraitCard
          key={trait}
          trait={trait}
          score={profile[trait]}
          contributions={contributions[trait]}
          isExpanded={expandedTrait === trait}
          onToggle={() => handleToggle(trait)}
        />
      ))}
    </div>
  );
});

BigFiveMappingInsights.displayName = 'BigFiveMappingInsights';

export default BigFiveMappingInsights;
