'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CandidateSummary, CompetencyComparisonEntry } from '@/types/domain';
import { CANDIDATE_COLORS } from './ComparisonView';

interface ComparisonRadarProps {
  candidates: CandidateSummary[];
  competencyComparison: CompetencyComparisonEntry[];
  colorMap: Map<string, number>;
}

/** Custom tooltip for the multi-candidate radar chart. */
function RadarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm max-w-[220px]">
      <p className="font-semibold mb-1.5 truncate">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate">{entry.name}:</span>
            <span className="font-bold tabular-nums ml-auto">{Math.round(entry.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Multi-candidate overlay radar chart showing competency scores.
 * Team saturation is rendered as a dim background fill area.
 * Each candidate gets a distinct color from CANDIDATE_COLORS.
 */
export function ComparisonRadar({
  candidates,
  competencyComparison,
  colorMap,
}: ComparisonRadarProps) {
  const t = useTranslations('results.comparison');
  const isMobile = useIsMobile();

  // Build chart data: one entry per competency, with team + each candidate score
  const chartData = useMemo(() => {
    return competencyComparison.map((entry) => {
      const point: Record<string, string | number> = {
        subject:
          isMobile && entry.competencyName.length > 12
            ? `${entry.competencyName.slice(0, 12)}...`
            : entry.competencyName,
        fullName: entry.competencyName,
        team: entry.teamSaturation ?? 0,
      };

      candidates.forEach((c) => {
        point[c.resultId] = entry.candidateScores[c.resultId] ?? 0;
      });

      return point;
    });
  }, [competencyComparison, candidates, isMobile]);

  const chartHeight = isMobile ? 280 : 380;

  if (competencyComparison.length < 3) {
    return (
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            {t('competencyBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex items-center justify-center min-h-[200px] text-sm text-muted-foreground">
            {t('noData')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          {t('competencyBreakdown')}
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-sm">
          {t('competencyBreakdownDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 sm:px-6">
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={chartData}
              margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
            >
              <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: 'hsl(var(--foreground))',
                  fontSize: isMobile ? 9 : 11,
                }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickCount={5}
              />

              {/* Team saturation background */}
              <Radar
                name={t('teamSaturation')}
                dataKey="team"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.08}
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* One Radar per candidate */}
              {candidates.map((candidate) => {
                const colorIdx = colorMap.get(candidate.resultId) ?? 0;
                const color = CANDIDATE_COLORS[colorIdx];

                return (
                  <Radar
                    key={candidate.resultId}
                    name={candidate.displayName}
                    dataKey={candidate.resultId}
                    stroke={color.fill}
                    fill={color.fill}
                    fillOpacity={0.12}
                    strokeWidth={2}
                    dot={{
                      r: isMobile ? 3 : 4,
                      fill: color.fill,
                      stroke: 'hsl(var(--background))',
                      strokeWidth: 2,
                    }}
                  />
                );
              })}

              <Tooltip content={<RadarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                iconSize={isMobile ? 8 : 10}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
