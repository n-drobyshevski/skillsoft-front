'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimulationProfile } from './types';

const personaColors: Record<SimulationProfile, { color: string; bgColor: string }> = {
  PERFECT_CANDIDATE: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
  },
  RANDOM_GUESSER: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
  },
  FAILING_CANDIDATE: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
  },
};

interface ScoreDisplayProps {
  score: number;
  passingScore: number;
  profile: SimulationProfile;
}

export function ScoreDisplay({ score, passingScore, profile }: ScoreDisplayProps) {
  const t = useTranslations('builder.simulator');
  const config = personaColors[profile];
  const passed = score >= passingScore;

  return (
    <div className={cn('p-4 rounded-xl border', config.bgColor)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t('score.simulatedScore')}
        </span>
        {passed ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t('score.pass')}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('score.fail')}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('text-3xl font-bold', config.color)}>{Math.round(score)}%</span>
        <span className="text-xs text-muted-foreground">
          {t('score.toPass', { score: passingScore })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden relative">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            passed ? 'bg-emerald-500' : 'bg-red-500'
          )}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
        {/* Passing threshold marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/50"
          style={{ left: `${passingScore}%` }}
        />
      </div>
    </div>
  );
}
