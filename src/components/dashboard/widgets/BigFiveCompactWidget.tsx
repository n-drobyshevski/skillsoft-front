'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useHelpTranslation, useHelpText } from '@/hooks/useHelpTranslation';
import type { BigFiveSnapshot } from '@/types/user-dashboard';

interface BigFiveCompactWidgetProps {
  snapshot: BigFiveSnapshot;
  className?: string;
}

const TRAITS = [
  { key: 'openness', barColor: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
  { key: 'conscientiousness', barColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'extraversion', barColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'agreeableness', barColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'emotionalStability', barColor: 'bg-cyan-500', textColor: 'text-cyan-600 dark:text-cyan-400' },
] as const;

function getTraitValue(profile: Record<string, number>, traitKey: string): number {
  // Backend uses BIG_FIVE_OPENNESS, BIG_FIVE_AGREEABLENESS, etc.
  const snakeUpper = traitKey.replace(/([A-Z])/g, '_$1').toUpperCase();
  const variants = [
    `BIG_FIVE_${snakeUpper}`,             // BIG_FIVE_OPENNESS
    `BIG_FIVE${snakeUpper}`,              // BIG_FIVEOPENNESS (edge case)
    traitKey,                              // openness
    traitKey.toLowerCase(),                // openness
    traitKey.replace(/([A-Z])/g, '_$1').toLowerCase(), // emotional_stability
    ...(traitKey === 'emotionalStability'
      ? ['neuroticism', 'emotional_stability', 'BIG_FIVE_NEUROTICISM', 'BIG_FIVE_EMOTIONAL_STABILITY']
      : []),
  ];
  for (const v of variants) {
    if (v in profile) return Math.round(profile[v]);
  }
  return 0;
}

export function BigFiveCompactWidget({ snapshot, className }: BigFiveCompactWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');
  const { getHelp } = useHelpTranslation('dashboard');
  const helpT = useHelpText();

  function getScoreLabel(score: number): string {
    const levelKey = score <= 33 ? 'low' : score <= 66 ? 'moderate' : 'high';
    const level = helpT(`dashboard.bigFiveLevel.${levelKey}` as Parameters<typeof helpT>[0]);
    return helpT('dashboard.bigFiveScore' as Parameters<typeof helpT>[0], { value: score, level });
  }

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' as const } };

  return (
    <motion.div {...motionProps} className={className}>
      <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
                <Brain className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">
                {t('userDashboard.bigFive.title')}
                <HelpTooltip content={getHelp('bigFiveTitle')} variant="info" size="sm" side="right" />
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 min-h-[44px] sm:min-h-0">
              <Link href={`/test-templates/results/${snapshot.resultId}`}>
                {t('userDashboard.bigFive.viewDetails')}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {TRAITS.map((trait) => {
            const value = getTraitValue(snapshot.profile, trait.key);
            const labelKey = `userDashboard.bigFive.${trait.key}` as const;
            const helpKey = `bigFive.${trait.key}` as const;
            return (
              <TooltipProvider key={trait.key} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-default">
                      <span className={`text-xs font-semibold w-4 text-center ${trait.textColor}`}>
                        {t(labelKey)}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${trait.barColor}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold tabular-nums w-7 text-right ${trait.textColor}`}>
                        {value}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs leading-relaxed max-w-[240px]">
                    <p className="font-medium">{getScoreLabel(value)}</p>
                    <p className="text-muted-foreground">{getHelp(helpKey)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
