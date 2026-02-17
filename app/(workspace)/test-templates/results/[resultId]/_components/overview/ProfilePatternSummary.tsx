'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, AlertTriangle, Layers } from 'lucide-react';
import type { OverviewExtendedMetrics } from '@/types/domain';
import { isOverviewMetrics } from '@/types/domain';

/**
 * Profile pattern category keys as emitted by the backend.
 * Ordered from highest to lowest for display priority.
 */
const PATTERN_CATEGORIES = [
  'SIGNATURE_STRENGTH',
  'STRENGTH',
  'AVERAGE',
  'DEVELOPING',
  'CRITICAL_GAP',
] as const;

type PatternCategory = (typeof PATTERN_CATEGORIES)[number];

interface CategoryStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon?: React.ReactNode;
}

/**
 * Visual styling per profile pattern category.
 * Uses Tailwind v4 utility classes consistent with the rest of the results views.
 */
function getCategoryStyle(category: PatternCategory): CategoryStyle {
  switch (category) {
    case 'SIGNATURE_STRENGTH':
      return {
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        borderColor: 'border-emerald-500/30',
        icon: <Star className="h-3 w-3 shrink-0" />,
      };
    case 'STRENGTH':
      return {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-500/30',
      };
    case 'AVERAGE':
      return {
        bgColor: 'bg-slate-500/10',
        textColor: 'text-slate-600 dark:text-slate-400',
        borderColor: 'border-slate-500/20',
      };
    case 'DEVELOPING':
      return {
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-500/30',
      };
    case 'CRITICAL_GAP':
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-500/30',
        icon: <AlertTriangle className="h-3 w-3 shrink-0" />,
      };
  }
}

interface ProfilePatternSummaryProps {
  extendedMetrics: OverviewExtendedMetrics | Record<string, unknown> | null | undefined;
}

/**
 * ProfilePatternSummary displays competencies grouped by backend-computed
 * profile pattern categories (SIGNATURE_STRENGTH through CRITICAL_GAP).
 *
 * Renders as a Card section within OverviewResultView, positioned between
 * Key Insights and CompetencyProfile.
 */
export function ProfilePatternSummary({ extendedMetrics }: ProfilePatternSummaryProps) {
  const t = useTranslations('template.resultsView.overview');

  // Type-guard check: only render if profilePattern data exists
  const profilePattern = useMemo(() => {
    if (!isOverviewMetrics(extendedMetrics)) return null;
    return extendedMetrics.profilePattern ?? null;
  }, [extendedMetrics]);

  // Filter to categories that have at least one competency
  const activeCategories = useMemo(() => {
    if (!profilePattern) return [];
    return PATTERN_CATEGORIES.filter(
      (cat) => profilePattern[cat] && profilePattern[cat].length > 0
    );
  }, [profilePattern]);

  // Don't render if no profile pattern data
  if (!profilePattern || activeCategories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          {t('profilePattern.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t('profilePattern.description')}
        </p>

        {activeCategories.map((category) => {
          const competencies = profilePattern[category] ?? [];
          const style = getCategoryStyle(category);

          return (
            <div key={category} className="space-y-1.5">
              <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span
                  className={`w-1 h-4 rounded-full ${
                    category === 'SIGNATURE_STRENGTH' || category === 'STRENGTH'
                      ? 'bg-emerald-500/60'
                      : category === 'CRITICAL_GAP'
                        ? 'bg-red-500/60'
                        : category === 'DEVELOPING'
                          ? 'bg-amber-500/60'
                          : 'bg-slate-400/60'
                  }`}
                />
                {t(`profilePattern.categories.${category}`)}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  {competencies.length}
                </Badge>
              </h5>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {competencies.map((name) => (
                  <span
                    key={name}
                    className={`inline-flex items-center gap-1 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border ${style.bgColor} ${style.textColor} ${style.borderColor}`}
                  >
                    {style.icon}
                    {name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
