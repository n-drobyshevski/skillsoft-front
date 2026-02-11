'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompetencyDetailAccordionProps } from './types';
import { CompetencyScore } from '@/types/domain';

/**
 * Get tier configuration based on percentage score
 */
function getTierConfig(percentage: number) {
  if (percentage >= 90) {
    return {
      tier: 'excellent' as const,
      label: 'Excellent',
      icon: '\u{1F3AF}', // Target emoji
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500'
    };
  }
  if (percentage >= 70) {
    return {
      tier: 'good' as const,
      label: 'Good',
      icon: '\u2713', // Checkmark
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      barColor: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    };
  }
  if (percentage >= 50) {
    return {
      tier: 'average' as const,
      label: 'Average',
      icon: '\u2192', // Right arrow
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      barColor: 'bg-gradient-to-r from-amber-500 to-orange-500'
    };
  }
  return {
    tier: 'poor' as const,
    label: 'Needs Improvement',
    icon: '\u2193', // Down arrow
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    barColor: 'bg-gradient-to-r from-red-500 to-rose-500'
  };
}

/**
 * Get neutral tier configuration (for profile view without pass/fail)
 */
function getNeutralTierConfig(percentage: number) {
  return {
    tier: 'neutral' as const,
    label: percentage >= 70 ? 'Strength' : 'Developing',
    icon: percentage >= 70 ? '\u2713' : '\u2192',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    barColor: 'bg-gradient-to-r from-primary/60 to-primary'
  };
}

/**
 * Competency details shown in accordion - mobile optimized
 */
function CompetencyDetails({
  competency,
  showPassFail = true
}: {
  competency: CompetencyScore;
  showPassFail?: boolean;
}) {
  const percentage = Math.round(competency.percentage);
  const config = showPassFail ? getTierConfig(percentage) : getNeutralTierConfig(percentage);

  return (
    <div className="pl-2 sm:pl-4 space-y-2 sm:space-y-3">
      {/* Score summary */}
      <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-base sm:text-lg shrink-0">{config.icon}</span>
          <span className="text-xs sm:text-sm font-medium truncate">{config.label}</span>
        </div>
        <div className="text-right shrink-0">
          <div className={cn("text-lg sm:text-xl font-bold", config.color)}>
            {percentage}%
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            {competency.score.toFixed(1)} / {competency.maxScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Indicator breakdown */}
      {competency.indicatorScores && competency.indicatorScores.length > 0 && (
        <div className="space-y-1.5 sm:space-y-2">
          <h5 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Indicators ({competency.indicatorScores.length})
          </h5>
          <div className="space-y-1.5 sm:space-y-2">
            {competency.indicatorScores.map(indicator => {
              const indicatorConfig = showPassFail
                ? getTierConfig(indicator.percentage)
                : getNeutralTierConfig(indicator.percentage);

              return (
                <div key={indicator.indicatorId} className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={indicator.indicatorTitle}>
                      {indicator.indicatorTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          showPassFail
                            ? (indicator.percentage >= 70 ? 'bg-green-500' :
                               indicator.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500')
                            : 'bg-primary'
                        )}
                        style={{ width: `${indicator.percentage}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] sm:text-xs font-semibold tabular-nums w-8 sm:w-10 text-right",
                      showPassFail ? indicatorConfig.color : 'text-primary'
                    )}>
                      {Math.round(indicator.percentage)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable competency detail accordion for test results.
 * Shows expandable details for each competency score.
 *
 * @param competencies - Array of competency scores to display
 * @param showPassFail - Whether to use pass/fail color coding (default: true)
 * @param passingScore - Optional passing score threshold
 */
export function CompetencyDetailAccordion({
  competencies,
  showPassFail = true,
  passingScore = 70
}: CompetencyDetailAccordionProps) {
  // Sort competencies by percentage (descending)
  const sortedCompetencies = [...competencies].sort(
    (a, b) => b.percentage - a.percentage
  );

  if (competencies.length === 0) {
    return null;
  }

  return (
    <Card className="animate-fadeInUp-3">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Detailed Breakdown</span>
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          Expand to view details
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {sortedCompetencies.map((competency, index) => {
            const percentage = Math.round(competency.percentage);
            const config = showPassFail
              ? getTierConfig(percentage)
              : getNeutralTierConfig(percentage);

            return (
              <AccordionItem key={competency.competencyId} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline py-2 sm:py-3 px-1 sm:px-0">
                  {/* Mobile: 3-row layout | Desktop: 1-row layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-2 sm:pr-4 gap-1 sm:gap-2">
                    {/* Mobile Row 1: Name only | Desktop: Name + Badge */}
                    <div className="flex items-center gap-2 sm:gap-3 sm:flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-medium truncate text-left">
                        {competency.competencyName}
                      </span>
                      {/* Category badge - desktop only */}
                      {competency.competencyCategory && (
                        <Badge variant="outline" className="text-[9px] sm:text-xs shrink-0 hidden sm:inline-flex">
                          {competency.competencyCategory}
                        </Badge>
                      )}
                    </div>

                    {/* Mobile Row 2: Score + Tier label */}
                    <div className="flex items-center justify-between sm:hidden">
                      <span className={cn(
                        "text-xs font-bold tabular-nums",
                        config.color
                      )}>
                        {percentage}%
                      </span>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                        config.bgColor,
                        config.color
                      )}>
                        {config.label}
                      </span>
                    </div>

                    {/* Mobile Row 3: Full-width progress bar */}
                    <div className="w-full sm:hidden h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", config.barColor)}
                        style={{ width: `${competency.percentage}%` }}
                      />
                    </div>

                    {/* Desktop: Progress bar + Score */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <div className="w-24 md:w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", config.barColor)}
                          style={{ width: `${competency.percentage}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-bold tabular-nums w-12 text-right",
                        config.color
                      )}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 sm:pt-2 pb-2 sm:pb-4">
                  <CompetencyDetails
                    competency={competency}
                    showPassFail={showPassFail}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
