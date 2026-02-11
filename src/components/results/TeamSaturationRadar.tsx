'use client';

import React, { useMemo, useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Users, User, Target, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import type {
  TeamSaturationRadarProps,
  TeamSaturationDataPoint,
  TeamFitAnalysis,
  TeamContributionType,
} from '@/types/results';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Analyze team fit based on saturation data
 */
export function analyzeTeamFit(
  data: TeamSaturationDataPoint[],
  gapThreshold: number = 20
): TeamFitAnalysis {
  // Find gaps the candidate fills
  const gapsFilledCompetencies = data.filter(
    (d) => d.fillsGap && d.gapMagnitude && d.gapMagnitude >= gapThreshold
  );

  // Find redundant competencies (team already saturated)
  const redundantCompetencies = data.filter(
    (d) => d.teamSaturation >= 80 && d.candidateScore >= 70
  );

  // Calculate compatibility score
  const gapsFilled = gapsFilledCompetencies.length;
  const redundancies = redundantCompetencies.length;
  const total = data.length;

  // Score formula: value gaps filled, penalize redundancies slightly
  const baseScore =
    (data.reduce((sum, d) => sum + d.candidateScore, 0) / total) * 0.4 +
    (gapsFilled / total) * 100 * 0.4 +
    ((total - redundancies) / total) * 100 * 0.2;

  const compatibilityScore = Math.min(Math.round(baseScore), 100);

  // Determine contribution type based on score distribution
  const avgScore = data.reduce((sum, d) => sum + d.candidateScore, 0) / total;
  const variance =
    data.reduce((sum, d) => sum + Math.pow(d.candidateScore - avgScore, 2), 0) /
    total;

  let contributionType: TeamContributionType = 'generalist';
  if (variance > 400) {
    contributionType = 'specialist';
  } else if (avgScore >= 75) {
    contributionType = 'leader';
  } else if (gapsFilled >= 3) {
    contributionType = 'collaborator';
  }

  // Development areas - low candidate scores where team needs help
  const developmentAreas = data
    .filter((d) => d.candidateScore < 50 && d.teamSaturation < 60)
    .map((d) => d.competencyName);

  // Relative strengths - high candidate scores
  const relativeStrengths = data
    .filter((d) => d.candidateScore >= 70)
    .sort((a, b) => b.candidateScore - a.candidateScore)
    .slice(0, 3)
    .map((d) => d.competencyName);

  return {
    compatibilityScore,
    contributionType,
    gapsFilledCompetencies,
    redundantCompetencies,
    developmentAreas,
    relativeStrengths,
  };
}

// ============================================================================
// Contribution Type Badges
// ============================================================================

const CONTRIBUTION_CONFIG: Record<
  TeamContributionType,
  { label: string; description: string; color: string }
> = {
  leader: {
    label: 'Leader',
    description: 'High scores across leadership competencies',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  specialist: {
    label: 'Specialist',
    description: 'Deep expertise in specific areas',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  generalist: {
    label: 'Generalist',
    description: 'Balanced skills across areas',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  collaborator: {
    label: 'Collaborator',
    description: 'Strong in interpersonal skills',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  innovator: {
    label: 'Innovator',
    description: 'High in creativity and openness',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  },
};

// ============================================================================
// Custom Tooltip
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold tabular-nums">{Math.round(entry.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Gap Fill Indicator
// ============================================================================

interface GapFillListProps {
  gapsFilledCompetencies: TeamSaturationDataPoint[];
  className?: string;
}

function GapFillList({ gapsFilledCompetencies, className }: GapFillListProps) {
  if (gapsFilledCompetencies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
        Gaps You Fill
      </div>
      <div className="flex flex-wrap gap-1.5">
        {gapsFilledCompetencies.map((comp) => (
          <Badge
            key={comp.competencyId}
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs"
          >
            <ArrowUp className="w-3 h-3 mr-1" />
            {comp.competencyName}
            <span className="ml-1 opacity-70">
              +{Math.round(comp.gapMagnitude || 0)}%
            </span>
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TeamSaturationRadar({
  data,
  showCandidate = true,
  showTeam = true,
  showTarget = false,
  animate = true,
  size = 'responsive',
  colorScheme = {
    candidate: 'hsl(var(--primary))',
    team: 'hsl(220 70% 50%)',
    target: 'hsl(var(--muted-foreground))',
    fill: 'hsl(var(--primary) / 0.2)',
  },
  showLabels = true,
  onPointClick,
  className,
}: TeamSaturationRadarProps) {
  const isMobile = useIsMobile();
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Calculate team fit analysis
  const analysis = useMemo(() => analyzeTeamFit(data), [data]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map((d) => ({
      subject: isMobile && d.competencyName.length > 12
        ? `${d.competencyName.slice(0, 12)}...`
        : d.competencyName,
      fullName: d.competencyName,
      candidate: d.candidateScore,
      team: d.teamSaturation,
      target: d.targetSaturation ?? 70,
      fillsGap: d.fillsGap,
      competencyId: d.competencyId,
    }));
  }, [data, isMobile]);

  // Determine chart size
  const chartSize = size === 'responsive' ? '100%' : size;
  const chartHeight = isMobile ? 260 : 340;

  // Contribution badge config
  const contribConfig = CONTRIBUTION_CONFIG[analysis.contributionType];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with contribution type */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Team Fit Analysis</span>
        </div>
        <Badge variant="outline" className={cn('text-xs', contribConfig.color)}>
          {contribConfig.label}
        </Badge>
      </div>

      {/* Radar Chart */}
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.95 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height: chartHeight }}
      >
        <ResponsiveContainer width={chartSize} height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
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

            {/* Team saturation area */}
            {showTeam && (
              <Radar
                name="Team"
                dataKey="team"
                stroke={colorScheme.team}
                fill={colorScheme.team}
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={false}
              />
            )}

            {/* Target line */}
            {showTarget && (
              <Radar
                name="Target"
                dataKey="target"
                stroke={colorScheme.target}
                fill="transparent"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {/* Candidate area */}
            {showCandidate && (
              <Radar
                name="You"
                dataKey="candidate"
                stroke={colorScheme.candidate}
                fill={colorScheme.fill}
                fillOpacity={0.4}
                strokeWidth={2}
                dot={{
                  r: isMobile ? 3 : 4,
                  fill: colorScheme.candidate,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: isMobile ? 5 : 6,
                  fill: colorScheme.candidate,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                }}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              iconSize={isMobile ? 8 : 10}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Gaps filled section */}
      <GapFillList gapsFilledCompetencies={analysis.gapsFilledCompetencies} />

      {/* Quick stats */}
      <div className={cn(
        'grid gap-2 pt-3 border-t',
        isMobile ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        <div className="text-center p-2.5 bg-primary/5 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Compatibility
          </div>
          <div className="text-base font-bold tabular-nums text-primary">
            {analysis.compatibilityScore}%
          </div>
        </div>
        <div className="text-center p-2.5 bg-emerald-500/10 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Gaps Filled
          </div>
          <div className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {analysis.gapsFilledCompetencies.length}
          </div>
        </div>
        {!isMobile && (
          <div className="text-center p-2.5 bg-muted/50 rounded-lg">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              Strengths
            </div>
            <div className="text-base font-bold tabular-nums text-foreground">
              {analysis.relativeStrengths.length}
            </div>
          </div>
        )}
      </div>

      {/* Development areas if any */}
      {analysis.developmentAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-3 bg-muted/30 rounded-lg border border-border/50"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <Target className="w-3.5 h-3.5" />
            Growth Areas for Team Fit
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.developmentAreas.slice(0, 3).map((area) => (
              <Badge
                key={area}
                variant="outline"
                className="text-xs bg-background"
              >
                {area}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TeamSaturationRadar;
