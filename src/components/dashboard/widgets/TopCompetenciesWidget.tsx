'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useHelpTranslation, useHelpText } from '@/hooks/useHelpTranslation';
import type { AggregatedCompetency } from '@/types/user-dashboard';

interface TopCompetenciesWidgetProps {
  competencies: AggregatedCompetency[];
  className?: string;
}

function getBarColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-blue-500';
  return 'bg-amber-500';
}

function getTextColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

export function TopCompetenciesWidget({ competencies, className }: TopCompetenciesWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');
  const { getHelp } = useHelpTranslation('dashboard');
  const helpT = useHelpText();

  if (competencies.length === 0) return null;

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' as const } };

  return (
    <motion.div {...motionProps} className={className}>
      <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">
              {t('userDashboard.topCompetencies')}
              <HelpTooltip content={getHelp('topCompetencies')} variant="info" size="sm" side="right" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {competencies.map((comp) => (
            <TooltipProvider key={comp.competencyName} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 cursor-default">
                    <span className="text-xs text-muted-foreground w-24 truncate shrink-0">
                      {comp.competencyName}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${getBarColor(comp.avgPercentage)}`}
                        style={{ width: `${comp.avgPercentage}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold tabular-nums w-9 text-right ${getTextColor(comp.avgPercentage)}`}>
                      {comp.avgPercentage}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs leading-relaxed max-w-[260px]">
                  <p className="font-medium">{comp.competencyName}</p>
                  <p className="text-muted-foreground">
                    {comp.avgPercentage}% · {helpT('dashboard.competencyBar' as Parameters<typeof helpT>[0], { count: comp.resultCount })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
