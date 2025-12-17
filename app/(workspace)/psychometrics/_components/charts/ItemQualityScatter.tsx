'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ItemStatistics,
  ItemValidityStatus,
  ItemValidityStatusDisplay,
} from '@/types/psychometrics';
import { cn } from '@/lib/utils';
import { Target, AlertTriangle } from 'lucide-react';
import {
  ItemQualityMapHelp,
  ZoneOptimalHelp,
  ZoneTooEasyHelp,
  ZoneTooHardHelp,
  ZoneToxicHelp,
} from '../PsychometricHelpTooltip';

interface ItemQualityScatterProps {
  items: ItemStatistics[];
  className?: string;
  height?: number;
}

// Color mapping for validity status
const statusColorMap: Record<ItemValidityStatus, string> = {
  [ItemValidityStatus.ACTIVE]: '#10b981', // emerald-500
  [ItemValidityStatus.PROBATION]: '#f59e0b', // amber-500
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]: '#f97316', // orange-500
  [ItemValidityStatus.RETIRED]: '#ef4444', // red-500
};

// Reference zone definitions
const referenceZones = {
  optimal: { x1: 0.2, x2: 0.8, y1: 0.25, y2: 1.0, color: '#10b981', label: 'Optimal Zone' },
  tooEasy: { x1: 0.9, x2: 1.0, y1: -0.5, y2: 1.0, color: '#8b5cf6', label: 'Too Easy' },
  tooHard: { x1: 0.0, x2: 0.2, y1: -0.5, y2: 1.0, color: '#3b82f6', label: 'Too Hard' },
  toxic: { x1: 0.0, x2: 1.0, y1: -0.5, y2: 0, color: '#ef4444', label: 'Toxic (Negative rpb)' },
};

interface ScatterDataPoint {
  x: number;
  y: number;
  questionId: string;
  questionText: string;
  competencyName: string;
  indicatorTitle: string;
  validityStatus: ItemValidityStatus;
  responseCount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ScatterDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const statusDisplay = ItemValidityStatusDisplay[data.validityStatus];

  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 max-w-xs">
      <p className="font-medium text-sm line-clamp-2 mb-2">{data.questionText}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Question Difficulty:</span>
          <span className="font-mono font-medium">{data.x.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Question Effectiveness:</span>
          <span className="font-mono font-medium">{data.y.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Responses:</span>
          <span className="font-medium">{data.responseCount}</span>
        </div>
        <div className="pt-1 border-t">
          <p className="text-muted-foreground truncate">{data.competencyName}</p>
          <Badge
            variant="outline"
            className="mt-1"
            style={{
              backgroundColor: `${statusColorMap[data.validityStatus]}20`,
              color: statusColorMap[data.validityStatus],
              borderColor: statusColorMap[data.validityStatus]
            }}
          >
            {statusDisplay.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

interface ZoneSummary {
  optimal: number;
  tooEasy: number;
  tooHard: number;
  toxic: number;
}

function MobileSummaryCard({ zoneCounts }: { zoneCounts: ZoneSummary }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Item Quality Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
            <div className="text-2xl font-bold text-emerald-600">{zoneCounts.optimal}</div>
            <p className="text-xs text-muted-foreground">Optimal Zone</p>
          </div>
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20 text-center">
            <div className="text-2xl font-bold text-violet-600">{zoneCounts.tooEasy}</div>
            <p className="text-xs text-muted-foreground">Too Easy</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <div className="text-2xl font-bold text-blue-600">{zoneCounts.tooHard}</div>
            <p className="text-xs text-muted-foreground">Too Hard</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
            <div className="text-2xl font-bold text-red-600">{zoneCounts.toxic}</div>
            <p className="text-xs text-muted-foreground">Toxic (rpb &lt; 0)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ItemQualityScatter({ items, className, height = 400 }: ItemQualityScatterProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Transform items to scatter data points
  const scatterData = useMemo(() => {
    return items
      .filter(item => item.difficultyIndex != null && item.discriminationIndex != null)
      .map(item => ({
        x: item.difficultyIndex!,
        y: item.discriminationIndex!,
        questionId: item.questionId,
        questionText: item.questionText,
        competencyName: item.competencyName,
        indicatorTitle: item.indicatorTitle,
        validityStatus: item.validityStatus,
        responseCount: item.responseCount,
      }));
  }, [items]);

  // Calculate zone counts for summary
  const zoneCounts = useMemo(() => {
    const counts: ZoneSummary = { optimal: 0, tooEasy: 0, tooHard: 0, toxic: 0 };

    scatterData.forEach(point => {
      if (point.y < 0) {
        counts.toxic++;
      } else if (point.x >= 0.2 && point.x <= 0.8 && point.y >= 0.25) {
        counts.optimal++;
      } else if (point.x > 0.9) {
        counts.tooEasy++;
      } else if (point.x < 0.2) {
        counts.tooHard++;
      }
    });

    return counts;
  }, [scatterData]);

  // Handle click to navigate to item detail
  const handlePointClick = useCallback((data: ScatterDataPoint) => {
    router.push(`/psychometrics/items/${data.questionId}`);
  }, [router]);

  // Show mobile summary on small screens
  if (isMobile) {
    return <MobileSummaryCard zoneCounts={zoneCounts} />;
  }

  if (scatterData.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No items with calculated metrics</p>
            <p className="text-sm">Run an audit to calculate item statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Item Quality Map
              <ItemQualityMapHelp />
            </CardTitle>
            <CardDescription className="mt-1">
              Question Difficulty vs Question Effectiveness ({scatterData.length} items)
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusColorMap).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">
                  {ItemValidityStatusDisplay[status as ItemValidityStatus].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
            {/* Cartesian Grid */}
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            {/* Reference Areas - Background zones */}
            <ReferenceArea
              x1={referenceZones.optimal.x1}
              x2={referenceZones.optimal.x2}
              y1={referenceZones.optimal.y1}
              y2={referenceZones.optimal.y2}
              fill={referenceZones.optimal.color}
              fillOpacity={0.08}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={referenceZones.tooEasy.x1}
              x2={referenceZones.tooEasy.x2}
              y1={0}
              y2={referenceZones.tooEasy.y2}
              fill={referenceZones.tooEasy.color}
              fillOpacity={0.08}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={referenceZones.tooHard.x1}
              x2={referenceZones.tooHard.x2}
              y1={0}
              y2={referenceZones.tooHard.y2}
              fill={referenceZones.tooHard.color}
              fillOpacity={0.08}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={referenceZones.toxic.x1}
              x2={referenceZones.toxic.x2}
              y1={referenceZones.toxic.y1}
              y2={referenceZones.toxic.y2}
              fill={referenceZones.toxic.color}
              fillOpacity={0.1}
              strokeOpacity={0}
            />

            {/* Reference Lines */}
            <ReferenceLine
              y={0.25}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: 'Good threshold (0.25)',
                position: 'right',
                fill: '#f59e0b',
                fontSize: 11
              }}
            />
            <ReferenceLine
              y={0}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: 'Toxic',
                position: 'right',
                fill: '#ef4444',
                fontSize: 11
              }}
            />

            {/* Axes */}
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 1]}
              tickCount={6}
              tickFormatter={(value: number) => value.toFixed(1)}
              label={{
                value: 'Question Difficulty (p-value)',
                position: 'bottom',
                offset: 20,
                className: 'fill-muted-foreground text-xs'
              }}
              className="text-xs"
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-0.5, 1]}
              tickCount={7}
              tickFormatter={(value: number) => value.toFixed(1)}
              label={{
                value: 'Question Effectiveness (rpb)',
                angle: -90,
                position: 'left',
                offset: 10,
                className: 'fill-muted-foreground text-xs'
              }}
              className="text-xs"
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Scatter Plot */}
            <Scatter
              data={scatterData}
              onClick={(_, index) => {
                if (typeof index === 'number' && index >= 0 && index < scatterData.length) {
                  const item = scatterData[index];
                  if (item) {
                    handlePointClick(item);
                  }
                }
              }}
              cursor="pointer"
            >
              {scatterData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColorMap[entry.validityStatus]}
                  fillOpacity={0.8}
                  stroke={statusColorMap[entry.validityStatus]}
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Zone Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="flex items-center gap-0.5">
              Optimal (p: 0.2-0.8, rpb: 0.25+)
              <ZoneOptimalHelp />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-violet-500/20 border border-violet-500/40" />
            <span className="flex items-center gap-0.5">
              Too Easy (p &gt; 0.9)
              <ZoneTooEasyHelp />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/40" />
            <span className="flex items-center gap-0.5">
              Too Hard (p &lt; 0.2)
              <ZoneTooHardHelp />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40" />
            <span className="flex items-center gap-0.5">
              Toxic (rpb &lt; 0)
              <ZoneToxicHelp />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
