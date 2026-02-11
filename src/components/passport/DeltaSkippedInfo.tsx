'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface SkippedCompetency {
  /** Competency ID */
  id: string;
  /** Competency name */
  name: string;
  /** Score from passport (0-100) */
  passportScore: number;
}

export interface DeltaSkippedInfoProps {
  /** List of skipped competencies with their passport scores */
  skippedCompetencies: SkippedCompetency[];
  /** Total questions saved */
  questionsSaved: number;
  /** Estimated time saved in minutes */
  timeSaved: number;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function formatTimeSaved(minutes: number): string {
  if (minutes < 1) return '<1 мин';
  if (minutes < 60) return `~${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `~${hours} ч`;
  return `~${hours} ч ${mins} мин`;
}

// ============================================================================
// Component
// ============================================================================

export function DeltaSkippedInfo({
  skippedCompetencies,
  questionsSaved,
  timeSaved,
  className,
}: DeltaSkippedInfoProps) {
  // Don't render if no competencies skipped
  if (skippedCompetencies.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        'border-dashed border-amber-300/50 dark:border-amber-700/50',
        'bg-amber-50/30 dark:bg-amber-950/20',
        className
      )}
    >
      <CardContent className="pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Дельта-тестирование активно
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">
              Пропущено:{' '}
              <strong className="text-foreground">
                {skippedCompetencies.length}
              </strong>{' '}
              компетенций
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="text-muted-foreground">
              Экономия:{' '}
              <strong className="text-foreground">
                {formatTimeSaved(timeSaved)}
              </strong>
            </span>
          </div>
        </div>

        {/* Skipped Competencies List */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Использованы оценки из паспорта:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skippedCompetencies.slice(0, 5).map((comp) => (
              <Badge
                key={comp.id}
                variant="secondary"
                className={cn(
                  'text-xs px-2 py-0.5',
                  'bg-white dark:bg-neutral-800',
                  'border border-neutral-200 dark:border-neutral-700'
                )}
              >
                {comp.name}
                <span
                  className={cn('ml-1 font-mono', getScoreColor(comp.passportScore))}
                >
                  {comp.passportScore}%
                </span>
              </Badge>
            ))}
            {skippedCompetencies.length > 5 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 text-muted-foreground"
              >
                +{skippedCompetencies.length - 5}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeltaSkippedInfo;
