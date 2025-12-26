'use client';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';
import {
  DifficultyGauge,
  DiscriminationGauge,
  DIFFICULTY_ZONES,
  DISCRIMINATION_ZONES,
  type GaugeZone,
} from '../../../_components/SemiCircularGauge';
import { LinearMetricGauge } from './LinearMetricGauge';

interface ResponsiveGaugesProps {
  /** Difficulty index value (p) */
  difficultyIndex: number | null | undefined;
  /** Discrimination index value (rpb) */
  discriminationIndex: number | null | undefined;
  /** Additional className */
  className?: string;
}

/**
 * Get quality label and description for difficulty
 */
function getDifficultyQuality(p: number | null | undefined): { label: string; color: string; description: string } {
  if (p == null) return { label: 'Нет данных', color: 'text-muted-foreground', description: 'Недостаточно данных' };
  if (p < 0.2) return { label: 'Слишком сложный', color: 'text-blue-600 dark:text-blue-400', description: 'Менее 20% правильных ответов' };
  if (p > 0.9) return { label: 'Слишком легкий', color: 'text-purple-600 dark:text-purple-400', description: 'Более 90% правильных ответов' };
  return { label: 'Оптимальный', color: 'text-emerald-600 dark:text-emerald-400', description: 'Сложность в допустимом диапазоне' };
}

/**
 * Get quality label and description for discrimination
 */
function getDiscriminationQuality(rpb: number | null | undefined): { label: string; color: string; description: string } {
  if (rpb == null) return { label: 'Нет данных', color: 'text-muted-foreground', description: 'Недостаточно данных' };
  if (rpb < 0) return { label: 'Токсичный', color: 'text-red-600 dark:text-red-400', description: 'Элемент работает в обратном направлении' };
  if (rpb < 0.1) return { label: 'Критично', color: 'text-orange-600 dark:text-orange-400', description: 'Элемент не различает респондентов' };
  if (rpb < 0.25) return { label: 'Слабый', color: 'text-amber-600 dark:text-amber-400', description: 'Маргинальное различение' };
  if (rpb < 0.35) return { label: 'Хороший', color: 'text-green-600 dark:text-green-400', description: 'Приемлемое различение' };
  return { label: 'Отличный', color: 'text-emerald-600 dark:text-emerald-400', description: 'Сильное различение' };
}

/**
 * ResponsiveGauges - Adaptive metric visualization
 *
 * Renders:
 * - **Mobile:** LinearMetricGauge in compact cards (stacked)
 * - **Desktop:** SemiCircularGauge in side-by-side cards
 *
 * This provides optimal visualization for each screen size:
 * - Mobile: Horizontal gauges fit narrow screens, save vertical space
 * - Desktop: Semi-circular gauges provide visual impact
 */
export function ResponsiveGauges({
  difficultyIndex,
  discriminationIndex,
  className,
}: ResponsiveGaugesProps) {
  const isMobile = useIsMobile();
  const diffQuality = getDifficultyQuality(difficultyIndex);
  const discQuality = getDiscriminationQuality(discriminationIndex);

  // Mobile: Compact linear gauges
  if (isMobile) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Difficulty Card - Compact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Индекс сложности (p)</span>
            </div>
            <LinearMetricGauge
              value={difficultyIndex}
              minValue={0}
              maxValue={1}
              zones={DIFFICULTY_ZONES}
              label="Индекс сложности (p)"
              shortLabel="p"
              format="decimal2"
              size="md"
              compact
              showZoneBadge
            />
            <p className="text-xs text-muted-foreground mt-2">
              {diffQuality.description}
            </p>
          </CardContent>
        </Card>

        {/* Discrimination Card - Compact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Индекс различения (rpb)</span>
            </div>
            <LinearMetricGauge
              value={discriminationIndex}
              minValue={-0.5}
              maxValue={1}
              zones={DISCRIMINATION_ZONES}
              label="Индекс различения (rpb)"
              shortLabel="rpb"
              format="decimal2"
              size="md"
              compact
              showZoneBadge
            />
            <p className="text-xs text-muted-foreground mt-2">
              {discQuality.description}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop: Semi-circular gauges side by side
  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Индекс сложности (p)
          </CardTitle>
          <CardDescription>
            Доля правильных ответов
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <DifficultyGauge value={difficultyIndex} size="lg" />
          <div className="mt-4 text-center">
            <Badge variant="outline" className={diffQuality.color}>
              {diffQuality.label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {diffQuality.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Индекс различения (rpb)
          </CardTitle>
          <CardDescription>
            Корреляция с общим баллом
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <DiscriminationGauge value={discriminationIndex} size="lg" />
          <div className="mt-4 text-center">
            <Badge variant="outline" className={discQuality.color}>
              {discQuality.label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {discQuality.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * CompactDualMetrics - Ultra-compact dual metric row for minimal space
 *
 * Shows both metrics in a single row:
 * ┌───────────────────────────────────────┐
 * │ p: 0.65 [====]  │  rpb: 0.32 [====]   │
 * │ Optimal         │  Good               │
 * └───────────────────────────────────────┘
 */
interface CompactDualMetricsProps {
  /** Difficulty index value (p) */
  difficultyIndex: number | null | undefined;
  /** Discrimination index value (rpb) */
  discriminationIndex: number | null | undefined;
  /** Additional className */
  className?: string;
}

export function CompactDualMetrics({
  difficultyIndex,
  discriminationIndex,
  className,
}: CompactDualMetricsProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Difficulty */}
          <div className="space-y-1">
            <LinearMetricGauge
              value={difficultyIndex}
              minValue={0}
              maxValue={1}
              zones={DIFFICULTY_ZONES}
              label="p"
              shortLabel="p"
              format="decimal2"
              size="sm"
              compact
              showZoneBadge={false}
            />
          </div>

          {/* Divider */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border" />

          {/* Discrimination */}
          <div className="space-y-1">
            <LinearMetricGauge
              value={discriminationIndex}
              minValue={-0.5}
              maxValue={1}
              zones={DISCRIMINATION_ZONES}
              label="rpb"
              shortLabel="rpb"
              format="decimal2"
              size="sm"
              compact
              showZoneBadge={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResponsiveGauges;
