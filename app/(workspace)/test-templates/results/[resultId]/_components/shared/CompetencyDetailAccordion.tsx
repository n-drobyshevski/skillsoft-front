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
 * Competency details shown in accordion
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
    <div className="pl-4 space-y-3">
      {/* Score summary */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm font-medium">{config.label}</span>
        </div>
        <div className="text-right">
          <div className={cn("text-xl font-bold", config.color)}>
            {percentage}%
          </div>
          <div className="text-xs text-muted-foreground">
            {competency.score.toFixed(1)} / {competency.maxScore.toFixed(1)} points
          </div>
        </div>
      </div>

      {/* Indicator breakdown */}
      {competency.indicatorScores && competency.indicatorScores.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Behavioral Indicators ({competency.indicatorScores.length})
          </h5>
          <div className="space-y-2">
            {competency.indicatorScores.map(indicator => {
              const indicatorConfig = showPassFail
                ? getTierConfig(indicator.percentage)
                : getNeutralTierConfig(indicator.percentage);

              return (
                <div key={indicator.indicatorId} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate" title={indicator.indicatorTitle}>
                      {indicator.indicatorTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 bg-muted/30 rounded-full overflow-hidden">
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
                      "text-xs font-semibold tabular-nums w-10 text-right",
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Detailed Competency Breakdown
        </CardTitle>
        <CardDescription className="text-xs">
          Expand to view detailed results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sortedCompetencies.map((competency, index) => {
            const percentage = Math.round(competency.percentage);
            const config = showPassFail
              ? getTierConfig(percentage)
              : getNeutralTierConfig(percentage);

            return (
              <AccordionItem key={competency.competencyId} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {competency.competencyName}
                      </span>
                      {competency.competencyCategory && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {competency.competencyCategory}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 sm:w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
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
                <AccordionContent className="pt-2 pb-4">
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
