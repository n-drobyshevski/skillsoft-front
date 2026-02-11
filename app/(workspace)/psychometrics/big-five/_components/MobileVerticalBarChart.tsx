'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BigFiveReliability, BigFiveTrait } from '@/types/psychometrics';
import { TRAIT_COLORS } from './BigFiveTraitCard';
import { cn } from '@/lib/utils';

// Map BigFiveTrait enum to translation keys
const getTraitKey = (trait: BigFiveTrait): string => {
  const mapping: Record<BigFiveTrait, string> = {
    [BigFiveTrait.OPENNESS]: 'openness',
    [BigFiveTrait.CONSCIENTIOUSNESS]: 'conscientiousness',
    [BigFiveTrait.EXTRAVERSION]: 'extraversion',
    [BigFiveTrait.AGREEABLENESS]: 'agreeableness',
    [BigFiveTrait.EMOTIONAL_STABILITY]: 'emotionalStability',
  };
  return mapping[trait];
};

interface MobileVerticalBarChartProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

// Trait order for consistent display (OCEAN)
const TRAIT_ORDER: BigFiveTrait[] = [
  BigFiveTrait.OPENNESS,
  BigFiveTrait.CONSCIENTIOUSNESS,
  BigFiveTrait.EXTRAVERSION,
  BigFiveTrait.AGREEABLENESS,
  BigFiveTrait.EMOTIONAL_STABILITY,
];

/**
 * Mobile-optimized vertical bar chart for Big Five comparison.
 * Features:
 * - Vertical bars (portrait-friendly)
 * - Values displayed above bars
 * - Reference threshold lines
 * - Touch-friendly tooltips
 */
export function MobileVerticalBarChart({ reliabilityData, className }: MobileVerticalBarChartProps) {
  const t = useTranslations('psychometrics.bigFivePage');

  // Transform data for display
  const chartData = useMemo(() => {
    const dataMap = new Map(reliabilityData.map(r => [r.trait, r]));

    return TRAIT_ORDER.map(trait => {
      const data = dataMap.get(trait);
      const traitKey = getTraitKey(trait);
      const colors = TRAIT_COLORS[trait];

      return {
        trait,
        traitKey,
        label: t(`traits.${traitKey}.label`),
        abbrev: t(`chart.abbrev.${traitKey}`),
        alpha: data?.cronbachAlpha ?? 0,
        color: colors.accent,
        hasData: data?.cronbachAlpha !== null && data?.cronbachAlpha !== undefined,
      };
    });
  }, [reliabilityData, t]);

  // Calculate average
  const averageAlpha = useMemo(() => {
    const validValues = chartData.filter(d => d.hasData && d.alpha > 0);
    if (validValues.length === 0) return null;
    return validValues.reduce((sum, d) => sum + d.alpha, 0) / validValues.length;
  }, [chartData]);

  // Get status color based on alpha value
  const getStatusColor = (alpha: number): string => {
    if (alpha >= 0.8) return 'bg-emerald-500';
    if (alpha >= 0.7) return 'bg-amber-500';
    if (alpha >= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('chart.comparisonTitle')}
        </CardTitle>
        <CardDescription className="text-[13px]">
          {t('chart.comparisonDescription')}
          {averageAlpha !== null && (
            <span className="ml-2 font-medium text-foreground">
              ({t('chart.average')}: {averageAlpha.toFixed(2)})
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Chart Container */}
        <div className="relative h-[220px]" role="img" aria-label={t('chart.ariaLabel')}>
          {/* Reference Lines */}
          <div className="absolute inset-x-0 h-full">
            {/* 0.6 - Minimum threshold */}
            <div
              className="absolute inset-x-0 border-t-2 border-dashed border-red-400/50"
              style={{ bottom: '60%' }}
            >
              <span className="absolute -right-1 -top-3 text-[10px] text-red-500 font-medium">
                0.6
              </span>
            </div>

            {/* 0.7 - Good threshold */}
            <div
              className="absolute inset-x-0 border-t-2 border-dashed border-amber-400/50"
              style={{ bottom: '70%' }}
            >
              <span className="absolute -right-1 -top-3 text-[10px] text-amber-500 font-medium">
                0.7
              </span>
            </div>

            {/* 0.8 - Excellent threshold */}
            <div
              className="absolute inset-x-0 border-t-2 border-dashed border-emerald-400/50"
              style={{ bottom: '80%' }}
            >
              <span className="absolute -right-1 -top-3 text-[10px] text-emerald-500 font-medium">
                0.8
              </span>
            </div>
          </div>

          {/* Bars Container */}
          <div className="relative h-full flex items-end justify-between gap-2 px-4">
            {chartData.map((item) => (
              <div
                key={item.trait}
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                {/* Value Label */}
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums mb-1.5',
                    !item.hasData && 'text-muted-foreground'
                  )}
                  style={{ color: item.hasData ? item.color : undefined }}
                >
                  {item.hasData ? item.alpha.toFixed(2) : '-'}
                </span>

                {/* Bar */}
                <div
                  className={cn(
                    'w-full max-w-[44px] rounded-t-lg transition-all duration-500',
                    !item.hasData && 'bg-muted'
                  )}
                  style={{
                    height: item.hasData ? `${item.alpha * 100}%` : '10%',
                    backgroundColor: item.hasData ? item.color : undefined,
                    minHeight: '20px',
                  }}
                  role="progressbar"
                  aria-valuenow={item.hasData ? Math.round(item.alpha * 100) : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.label}: ${item.hasData ? item.alpha.toFixed(2) : t('chart.noData')}`}
                />

                {/* Trait Abbreviation */}
                <span className="text-[11px] font-medium text-muted-foreground mt-2">
                  {item.abbrev}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-5 pt-4 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded bg-red-400" />
            <span className="text-[11px] text-muted-foreground">0.6 {t('chart.thresholds.minimum')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded bg-amber-400" />
            <span className="text-[11px] text-muted-foreground">0.7 {t('chart.thresholds.good')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded bg-emerald-400" />
            <span className="text-[11px] text-muted-foreground">0.8 {t('chart.thresholds.excellent')}</span>
          </div>
        </div>

        {/* Trait Full Names (expandable on mobile) */}
        <details className="mt-4 sm:hidden">
          <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            {t('chart.viewTraitNames')}
          </summary>
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] text-muted-foreground">
            {chartData.map((item) => (
              <div key={item.trait} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">
                  <strong>{item.abbrev}</strong> = {item.label}
                </span>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
