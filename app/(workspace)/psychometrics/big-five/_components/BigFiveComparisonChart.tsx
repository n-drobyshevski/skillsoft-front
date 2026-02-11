'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BigFiveReliability, BigFiveTrait } from '@/types/psychometrics';
import { TRAIT_COLORS } from './BigFiveTraitCard';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface BigFiveComparisonChartProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

// Define trait order for consistent display
const TRAIT_ORDER: BigFiveTrait[] = [
  BigFiveTrait.OPENNESS,
  BigFiveTrait.CONSCIENTIOUSNESS,
  BigFiveTrait.EXTRAVERSION,
  BigFiveTrait.AGREEABLENESS,
  BigFiveTrait.EMOTIONAL_STABILITY,
];

/**
 * Horizontal bar chart comparing Cronbach's Alpha across all 5 Big Five traits.
 * Includes reference lines for reliability thresholds (0.6, 0.7, 0.8).
 */
export function BigFiveComparisonChart({ reliabilityData, className }: BigFiveComparisonChartProps) {
  const t = useTranslations('psychometrics.bigFivePage');
  const isMobile = useIsMobile();

  // Transform and sort data for the chart
  const chartData = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map(reliabilityData.map(r => [r.trait, r]));

    return TRAIT_ORDER.map(trait => {
      const data = dataMap.get(trait);
      const traitKey = getTraitKey(trait);
      const colors = TRAIT_COLORS[trait];
      const fullLabel = t(`traits.${traitKey}.label`);

      return {
        trait,
        traitKey,
        name: isMobile ? fullLabel.split(' ')[0] : fullLabel,
        fullName: fullLabel,
        alpha: data?.cronbachAlpha ?? 0,
        color: colors.accent,
        hasData: data?.cronbachAlpha !== null && data?.cronbachAlpha !== undefined,
      };
    });
  }, [reliabilityData, isMobile, t]);

  // Calculate average alpha
  const averageAlpha = useMemo(() => {
    const validValues = chartData.filter(d => d.hasData && d.alpha > 0);
    if (validValues.length === 0) return null;
    return validValues.reduce((sum, d) => sum + d.alpha, 0) / validValues.length;
  }, [chartData]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('chart.comparisonTitle')}
        </CardTitle>
        <CardDescription>
          {t('chart.comparisonDescription')}
          {averageAlpha !== null && (
            <span className="ml-2 font-medium text-foreground">
              ({t('chart.average')}: {averageAlpha.toFixed(2)})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: isMobile ? 80 : 140, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.7, 0.8, 1]}
              tickFormatter={(value) => value.toFixed(1)}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 70 : 130}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const data = payload[0].payload as typeof chartData[0];

                const getStatusLabel = (alpha: number): string => {
                  if (alpha >= 0.8) return t('chart.status.excellent');
                  if (alpha >= 0.7) return t('chart.status.good');
                  if (alpha >= 0.6) return t('chart.status.acceptable');
                  return t('chart.status.unreliable');
                };

                return (
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium">{data.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Alpha:</span>
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color: data.color }}
                      >
                        {data.hasData ? data.alpha.toFixed(2) : '-'}
                      </span>
                    </div>
                    {data.hasData && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {getStatusLabel(data.alpha)}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Reference lines for thresholds */}
            <ReferenceLine
              x={0.6}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            <ReferenceLine
              x={0.7}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            <ReferenceLine
              x={0.8}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />

            <Bar
              dataKey="alpha"
              radius={[0, 4, 4, 0]}
              maxBarSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.hasData ? entry.color : '#d1d5db'}
                  fillOpacity={entry.hasData ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend for threshold lines */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-red-500 rounded" style={{ borderStyle: 'dashed' }} />
            <span>0.6 {t('chart.thresholds.minimum')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-amber-500 rounded" style={{ borderStyle: 'dashed' }} />
            <span>0.7 {t('chart.thresholds.good')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-500 rounded" style={{ borderStyle: 'dashed' }} />
            <span>0.8 {t('chart.thresholds.excellent')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
