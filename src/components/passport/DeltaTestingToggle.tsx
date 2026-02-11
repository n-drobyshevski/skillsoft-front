'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Zap, Info, Lock, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeltaAnalysis } from '@/hooks/usePassport';

// ============================================================================
// Types
// ============================================================================

export interface DeltaTestingToggleProps {
  /** Whether delta testing is enabled */
  enabled: boolean;
  /** Callback when toggle state changes */
  onToggle: (enabled: boolean) => void;
  /** Delta analysis data */
  analysis: DeltaAnalysis;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Reason why toggle is disabled */
  disabledReason?: string;
  /** Whether to show as "Coming Soon" */
  comingSoon?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function DeltaTestingToggle({
  enabled,
  onToggle,
  analysis,
  disabled = false,
  disabledReason,
  comingSoon = false,
  className,
}: DeltaTestingToggleProps) {
  const {
    skippableCount,
    skippableCompetencies,
    remainingCount,
    estimatedTimeSaved,
  } = analysis;

  const isEffectivelyDisabled = disabled || comingSoon || skippableCount === 0;
  const canEnable = skippableCount > 0 && !disabled && !comingSoon;

  // Format time saved
  const formatTime = (minutes: number): string => {
    if (minutes < 1) return '<1 мин';
    if (minutes < 60) return `~${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `~${hours} ч`;
    return `~${hours} ч ${mins} мин`;
  };

  return (
    <Card
      className={cn(
        'border-dashed transition-colors',
        enabled && canEnable
          ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-neutral-300 dark:border-neutral-700',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-lg bg-gradient-to-br transition-colors',
                enabled && canEnable
                  ? 'from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50'
                  : 'from-neutral-100 to-neutral-200 dark:from-neutral-800/50 dark:to-neutral-700/50'
              )}
            >
              <Zap
                className={cn(
                  'h-5 w-5 transition-colors',
                  enabled && canEnable
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
              />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Дельта-тестирование
                {comingSoon && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 px-1.5 text-amber-600 border-amber-300"
                  >
                    Скоро
                  </Badge>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Пропустить компетенции, которые уже измерены в паспорте
                      кандидата. Использовать существующие оценки вместо
                      повторного тестирования.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Пропустить уже измеренные компетенции
              </CardDescription>
            </div>
          </div>

          {/* Toggle Switch */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch
                  checked={enabled}
                  onCheckedChange={onToggle}
                  disabled={isEffectivelyDisabled}
                  className={cn(
                    enabled && canEnable && 'data-[state=checked]:bg-amber-500'
                  )}
                  aria-label={`Дельта-тестирование. ${
                    enabled ? 'Включено' : 'Выключено'
                  }. ${skippableCount} компетенций будет пропущено.`}
                />
              </div>
            </TooltipTrigger>
            {isEffectivelyDisabled && disabledReason && (
              <TooltipContent>
                <p>{disabledReason}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status Message */}
        {skippableCount === 0 && !comingSoon ? (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Нет компетенций для пропуска. Все требуемые компетенции отсутствуют
              в паспорте кандидата.
            </span>
          </div>
        ) : comingSoon ? (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Эта функция позволит сократить время тестирования, используя
              предыдущие результаты оценки.
            </span>
          </div>
        ) : enabled ? (
          <div className="space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-900/20">
                <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {skippableCount} пропущено
                  </p>
                  <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 truncate">
                    из {skippableCount + remainingCount} компетенций
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/20">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {formatTime(estimatedTimeSaved)}
                  </p>
                  <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 truncate">
                    экономия времени
                  </p>
                </div>
              </div>
            </div>

            {/* Skipped Competencies Preview */}
            {skippableCompetencies.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Пропущенные компетенции:
                </p>
                <div className="flex flex-wrap gap-1">
                  {skippableCompetencies.slice(0, 5).map((name) => (
                    <Badge
                      key={name}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    >
                      {name}
                    </Badge>
                  ))}
                  {skippableCompetencies.length > 5 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                      +{skippableCompetencies.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              {skippableCount} из {skippableCount + remainingCount} компетенций
              можно пропустить (экономия {formatTime(estimatedTimeSaved)})
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DeltaTestingToggle;
