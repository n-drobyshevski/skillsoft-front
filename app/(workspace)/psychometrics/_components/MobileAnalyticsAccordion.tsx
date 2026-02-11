'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Target,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type { ItemStatistics } from '@/types/psychometrics';

interface MobileAnalyticsAccordionProps {
  items: ItemStatistics[];
  className?: string;
  children?: React.ReactNode;
}

// Zone calculation for item quality
interface ZoneSummary {
  optimal: number;
  tooEasy: number;
  tooHard: number;
  toxic: number;
  total: number;
}

function calculateZoneCounts(items: ItemStatistics[]): ZoneSummary {
  const counts: ZoneSummary = { optimal: 0, tooEasy: 0, tooHard: 0, toxic: 0, total: 0 };

  items.forEach(item => {
    if (item.difficultyIndex == null || item.discriminationIndex == null) return;
    counts.total++;

    const p = item.difficultyIndex;
    const rpb = item.discriminationIndex;

    if (rpb < 0) {
      counts.toxic++;
    } else if (p >= 0.2 && p <= 0.8 && rpb >= 0.25) {
      counts.optimal++;
    } else if (p > 0.9) {
      counts.tooEasy++;
    } else if (p < 0.2) {
      counts.tooHard++;
    }
  });

  return counts;
}

// Distribution calculation
interface DistributionSummary {
  difficulty: { hard: number; optimal: number; easy: number };
  discrimination: { negative: number; critical: number; warning: number; good: number };
  stats: { avgDifficulty: number | null; avgDiscrimination: number | null };
}

function calculateDistributions(items: ItemStatistics[]): DistributionSummary {
  const difficulty = { hard: 0, optimal: 0, easy: 0 };
  const discrimination = { negative: 0, critical: 0, warning: 0, good: 0 };
  let sumP = 0, sumRpb = 0, countP = 0, countRpb = 0;

  items.forEach(item => {
    if (item.difficultyIndex != null) {
      const p = item.difficultyIndex;
      sumP += p;
      countP++;
      if (p < 0.2) difficulty.hard++;
      else if (p > 0.8) difficulty.easy++;
      else difficulty.optimal++;
    }

    if (item.discriminationIndex != null) {
      const rpb = item.discriminationIndex;
      sumRpb += rpb;
      countRpb++;
      if (rpb < 0) discrimination.negative++;
      else if (rpb < 0.1) discrimination.critical++;
      else if (rpb < 0.25) discrimination.warning++;
      else discrimination.good++;
    }
  });

  return {
    difficulty,
    discrimination,
    stats: {
      avgDifficulty: countP > 0 ? sumP / countP : null,
      avgDiscrimination: countRpb > 0 ? sumRpb / countRpb : null,
    },
  };
}

// Segmented progress bar component
interface SegmentedProgressProps {
  segments: { value: number; color: string; label: string }[];
  total: number;
  className?: string;
}

function SegmentedProgress({ segments, total, className }: SegmentedProgressProps) {
  if (total === 0) return null;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="h-2 rounded-full overflow-hidden flex bg-muted/30">
        {segments.map((seg, idx) => {
          const width = (seg.value / total) * 100;
          if (width === 0) return null;
          return (
            <div
              key={idx}
              className={cn('h-full transition-all', seg.color)}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1 text-xs">
            <div className={cn('size-3 rounded-sm', seg.color)} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-medium tabular-nums">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Zone card for item quality
interface ZoneCardProps {
  label: string;
  count: number;
  total: number;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

function ZoneCard({ label, count, total, color, bgColor, icon: Icon }: ZoneCardProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={cn('p-2 rounded-lg text-center', bgColor)}>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Icon className={cn('size-3', color)} />
        <span className={cn('text-lg font-bold tabular-nums', color)}>{count}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xs font-medium tabular-nums', color)}>{percentage}%</p>
    </div>
  );
}

// Summary badge for accordion headers
function SummaryBadge({
  icon: Icon,
  value,
  label,
  variant = 'default'
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantClasses = {
    default: 'bg-muted/50 text-muted-foreground',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-xs', variantClasses[variant])}>
      <Icon className="size-3" />
      <span className="font-medium tabular-nums">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

/**
 * MobileAnalyticsAccordion - Progressive disclosure analytics section for mobile.
 *
 * Features:
 * - Accordion-based progressive disclosure (shadcn/ui)
 * - Summary badges in headers showing key metrics
 * - Segmented progress bars for distributions
 * - Zone cards for item quality overview
 * - Touch-optimized with 44px minimum touch targets
 */
export function MobileAnalyticsAccordion({
  items,
  className,
  children,
}: MobileAnalyticsAccordionProps) {
  const isMobile = useIsMobile();

  const zoneCounts = useMemo(() => calculateZoneCounts(items), [items]);
  const distributions = useMemo(() => calculateDistributions(items), [items]);

  // On desktop, render children directly (full charts)
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const healthScore = zoneCounts.total > 0
    ? Math.round((zoneCounts.optimal / zoneCounts.total) * 100)
    : 0;

  const goodDiscrimination = distributions.discrimination.good;
  const problemItems = distributions.discrimination.negative + distributions.discrimination.critical;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
          <BarChart3 className="size-3" />
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <Accordion type="single" collapsible className="w-full">
          {/* Item Quality Section */}
          <AccordionItem value="quality" className="border-b-0 border-t">
            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:size-3.5 min-h-[44px]">
              <div className="flex items-center justify-between w-full pr-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Target className="size-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">Item Quality</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <SummaryBadge
                    icon={CheckCircle}
                    value={`${healthScore}%`}
                    label="optimal"
                    variant={healthScore >= 70 ? 'success' : healthScore >= 50 ? 'warning' : 'danger'}
                  />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="grid grid-cols-2 gap-2">
                <ZoneCard
                  label="Optimal Zone"
                  count={zoneCounts.optimal}
                  total={zoneCounts.total}
                  color="text-emerald-600"
                  bgColor="bg-emerald-50 dark:bg-emerald-950/20"
                  icon={CheckCircle}
                />
                <ZoneCard
                  label="Too Easy"
                  count={zoneCounts.tooEasy}
                  total={zoneCounts.total}
                  color="text-violet-600"
                  bgColor="bg-violet-50 dark:bg-violet-950/20"
                  icon={Target}
                />
                <ZoneCard
                  label="Too Hard"
                  count={zoneCounts.tooHard}
                  total={zoneCounts.total}
                  color="text-blue-600"
                  bgColor="bg-blue-50 dark:bg-blue-950/20"
                  icon={Target}
                />
                <ZoneCard
                  label="Toxic (rpb < 0)"
                  count={zoneCounts.toxic}
                  total={zoneCounts.total}
                  color="text-red-600"
                  bgColor="bg-red-50 dark:bg-red-950/20"
                  icon={AlertTriangle}
                />
              </div>
              <Link href="/psychometrics/items" className="block mt-3">
                <Badge variant="outline" className="w-full justify-center py-1.5 gap-1 text-xs min-h-[36px]">
                  View all {zoneCounts.total} items
                  <ArrowRight className="size-3" />
                </Badge>
              </Link>
            </AccordionContent>
          </AccordionItem>

          {/* Difficulty Distribution Section */}
          <AccordionItem value="difficulty" className="border-b-0">
            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:size-3.5 min-h-[44px]">
              <div className="flex items-center justify-between w-full pr-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <BarChart3 className="size-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium">Difficulty</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-mono">
                    avg: {distributions.stats.avgDifficulty?.toFixed(2) ?? '-'}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <SegmentedProgress
                total={zoneCounts.total}
                segments={[
                  { value: distributions.difficulty.hard, color: 'bg-blue-500', label: 'Hard' },
                  { value: distributions.difficulty.optimal, color: 'bg-emerald-500', label: 'Optimal' },
                  { value: distributions.difficulty.easy, color: 'bg-violet-500', label: 'Easy' },
                ]}
              />
              <div className="mt-3 p-2 rounded-lg bg-muted/30">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-blue-600">{distributions.difficulty.hard}</div>
                    <div className="text-xs text-muted-foreground">p &lt; 0.2</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600">{distributions.difficulty.optimal}</div>
                    <div className="text-xs text-muted-foreground">p 0.2-0.8</div>
                  </div>
                  <div>
                    <div className="font-bold text-violet-600">{distributions.difficulty.easy}</div>
                    <div className="text-xs text-muted-foreground">p &gt; 0.8</div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Discrimination Distribution Section */}
          <AccordionItem value="discrimination" className="border-b-0">
            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:size-3.5 min-h-[44px]">
              <div className="flex items-center justify-between w-full pr-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <TrendingUp className="size-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium">Effectiveness</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <SummaryBadge
                    icon={CheckCircle}
                    value={goodDiscrimination}
                    label="good"
                    variant="success"
                  />
                  {problemItems > 0 && (
                    <SummaryBadge
                      icon={AlertTriangle}
                      value={problemItems}
                      label="issues"
                      variant="danger"
                    />
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <SegmentedProgress
                total={zoneCounts.total}
                segments={[
                  { value: distributions.discrimination.negative, color: 'bg-red-500', label: 'Negative' },
                  { value: distributions.discrimination.critical, color: 'bg-orange-500', label: 'Critical' },
                  { value: distributions.discrimination.warning, color: 'bg-amber-500', label: 'Warning' },
                  { value: distributions.discrimination.good, color: 'bg-emerald-500', label: 'Good' },
                ]}
              />
              <div className="mt-3 p-2 rounded-lg bg-muted/30">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-red-600">{distributions.discrimination.negative}</div>
                    <div className="text-xs text-muted-foreground">rpb &lt; 0</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-600">{distributions.discrimination.critical}</div>
                    <div className="text-xs text-muted-foreground">0-0.1</div>
                  </div>
                  <div>
                    <div className="font-bold text-amber-600">{distributions.discrimination.warning}</div>
                    <div className="text-xs text-muted-foreground">0.1-0.25</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600">{distributions.discrimination.good}</div>
                    <div className="text-xs text-muted-foreground">0.25+</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground">
                  Avg rpb: <span className="font-mono font-medium">{distributions.stats.avgDiscrimination?.toFixed(2) ?? '-'}</span>
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default MobileAnalyticsAccordion;
