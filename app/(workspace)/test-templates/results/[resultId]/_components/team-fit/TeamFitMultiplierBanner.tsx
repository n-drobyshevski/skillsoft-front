'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TeamFitMultiplierBannerProps {
  teamFitMultiplier: number;
  diversityRatio: number;
  saturationRatio: number;
}

export function TeamFitMultiplierBanner({ teamFitMultiplier, diversityRatio, saturationRatio }: TeamFitMultiplierBannerProps) {
  const t = useTranslations('results.teamFit.multiplier');
  if (teamFitMultiplier === 1.0) return null;

  const isBonus = teamFitMultiplier > 1.0;
  const adjustmentPercent = Math.round(Math.abs(teamFitMultiplier - 1.0) * 100);

  if (isBonus) {
    return (
      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-fadeInUp-1">
        <div className="p-2 rounded-lg bg-emerald-500/15 shrink-0">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {t('boosted', { percent: adjustmentPercent })}
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            {t('boostedDescription', { diversity: Math.round(diversityRatio * 100) })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fadeInUp-1">
      <div className="p-2 rounded-lg bg-amber-500/15 shrink-0">
        <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {t('adjusted', { percent: adjustmentPercent })}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
          {t('adjustedDescription', { saturation: Math.round(saturationRatio * 100) })}
        </p>
      </div>
    </div>
  );
}
