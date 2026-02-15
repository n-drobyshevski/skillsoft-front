'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Layers,
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  Target,
  Heart,
} from 'lucide-react';
import type { TeamFitExtendedMetrics } from '@/types/domain';

interface TeamFitMetricsPanelProps {
  extendedMetrics: TeamFitExtendedMetrics;
}

interface MetricItem {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function TeamFitMetricsPanel({ extendedMetrics }: TeamFitMetricsPanelProps) {
  const t = useTranslations('results.teamFit.metrics');
  const {
    diversityRatio,
    saturationRatio,
    teamFitMultiplier,
    diversityCount,
    saturationCount,
    gapCount,
    personalityCompatibility,
  } = extendedMetrics;

  const multiplierIsPositive = teamFitMultiplier >= 1.0;

  const metrics: MetricItem[] = [
    {
      id: 'diversity',
      label: t('diversity'),
      value: `${Math.round(diversityRatio * 100)}%`,
      icon: <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      id: 'saturation',
      label: t('saturation'),
      value: `${Math.round(saturationRatio * 100)}%`,
      icon: <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'multiplier',
      label: t('multiplier'),
      value: `${teamFitMultiplier.toFixed(2)}x`,
      icon: <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: multiplierIsPositive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-amber-600 dark:text-amber-400',
      bgColor: multiplierIsPositive ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      borderColor: multiplierIsPositive ? 'border-emerald-500/20' : 'border-amber-500/20',
    },
    {
      id: 'diverseSkills',
      label: t('diverseSkills'),
      value: String(diversityCount),
      icon: <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'saturated',
      label: t('saturated'),
      value: String(saturationCount),
      icon: <MinusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20',
    },
    {
      id: 'gapsFilled',
      label: t('gapsFilled'),
      value: String(gapCount),
      icon: <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
    },
  ];

  // Add personality compatibility tile when data is available
  if (personalityCompatibility != null) {
    const compatPercent = Math.round(personalityCompatibility * 100);
    const isHighCompat = compatPercent >= 60;
    metrics.push({
      id: 'personality',
      label: t('personality'),
      value: `${compatPercent}%`,
      icon: <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      color: isHighCompat
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-orange-600 dark:text-orange-400',
      bgColor: isHighCompat ? 'bg-rose-500/10' : 'bg-orange-500/10',
      borderColor: isHighCompat ? 'border-rose-500/20' : 'border-orange-500/20',
    });
  }

  return (
    <Card className="animate-fadeInUp-1">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${metrics.length > 6 ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-2 sm:gap-3`}>
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-xl border ${metric.borderColor} ${metric.bgColor} transition-colors`}
            >
              <div className={`${metric.color} mb-1.5`}>
                {metric.icon}
              </div>
              <span className={`text-lg sm:text-xl font-bold tabular-nums ${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 text-center leading-tight">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
