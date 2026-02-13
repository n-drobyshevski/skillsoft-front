'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileCompetenciesCardProps } from '../shared/types';

/**
 * Competency profile card with neutral presentation.
 *
 * For Scenario A (OVERVIEW/Competency Passport):
 * - Uses neutral primary colors (no red/green pass/fail)
 * - Shows competencies as profile traits
 * - No "Excellent/Needs Improvement" badges
 * - Descriptive labels like "Strength" and "Developing"
 */
export function ProfileCompetenciesCard({
  competencies,
  showAsProfile = true
}: ProfileCompetenciesCardProps) {
  // Sort by percentage descending
  const sortedCompetencies = [...competencies].sort((a, b) => b.percentage - a.percentage);

  // Calculate stats
  const stats = competencies.length === 0
    ? { avg: 0, strongest: null as typeof competencies[0] | null, developing: null as typeof competencies[0] | null }
    : {
        avg: Math.round(competencies.reduce((sum, c) => sum + c.percentage, 0) / competencies.length),
        strongest: sortedCompetencies[0],
        developing: sortedCompetencies[sortedCompetencies.length - 1],
      };

  if (competencies.length === 0) {
    return null;
  }

  return (
    <Card className="animate-fadeInUp-2">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span className="truncate">Competency Profile</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Strengths across {competencies.length} competencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Profile summary mini-stats */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pb-2 sm:pb-3 border-b">
          <div className="text-center p-2 sm:p-2.5 bg-muted/40 rounded-lg min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              Average
            </div>
            <div className="text-sm sm:text-base font-bold tabular-nums">
              {stats.avg}%
            </div>
          </div>
          <div className="text-center p-2 sm:p-2.5 bg-primary/10 rounded-lg min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              Best
            </div>
            <div className="text-sm sm:text-base font-bold tabular-nums text-primary truncate" title={stats.strongest?.competencyName}>
              {stats.strongest ? Math.round(stats.strongest.percentage) : 0}%
            </div>
          </div>
          <div className="text-center p-2 sm:p-2.5 bg-muted/40 rounded-lg min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              Grow
            </div>
            <div className="text-sm sm:text-base font-bold tabular-nums text-muted-foreground truncate" title={stats.developing?.competencyName}>
              {stats.developing ? Math.round(stats.developing.percentage) : 0}%
            </div>
          </div>
        </div>

        {/* Competency list with neutral presentation */}
        <div className="space-y-2 sm:space-y-3">
          {sortedCompetencies.map((competency, index) => {
            const percentage = Math.round(competency.percentage);
            const isStrength = percentage >= 70;

            return (
              <div
                key={competency.competencyId}
                className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2"
              >
                {/* Rank number */}
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted/50 flex items-center justify-center text-[10px] sm:text-xs font-medium text-muted-foreground shrink-0">
                  {index + 1}
                </span>

                {/* Competency name */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-medium truncate block" title={competency.competencyName}>
                    {competency.competencyName}
                  </span>
                  {competency.competencyCategory && (
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:block">
                      {competency.competencyCategory}
                    </span>
                  )}
                </div>

                {/* Progress bar (neutral primary color) - hidden on very small screens */}
                <div className="hidden xs:block w-16 sm:w-24 md:w-32 h-1.5 sm:h-2 bg-muted/30 rounded-full overflow-hidden shrink-0">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      showAsProfile
                        ? "bg-gradient-to-r from-primary/60 to-primary"
                        : (percentage >= 70
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : percentage >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500')
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Percentage (neutral presentation) */}
                <span className={cn(
                  "text-xs sm:text-sm font-semibold tabular-nums w-10 sm:w-12 text-right shrink-0",
                  showAsProfile
                    ? "text-foreground"
                    : (percentage >= 70 ? 'text-green-600 dark:text-green-400' :
                       percentage >= 50 ? 'text-amber-600 dark:text-amber-400' :
                       'text-red-600 dark:text-red-400')
                )}>
                  {percentage}%
                </span>

                {/* Neutral label - hidden on mobile */}
                {showAsProfile && (
                  <span className={cn(
                    "hidden sm:inline-block text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full shrink-0",
                    isStrength
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isStrength ? 'Strength' : 'Developing'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
