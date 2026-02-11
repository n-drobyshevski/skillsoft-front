'use client';

/**
 * SimulatedResultsTab
 *
 * Displays a preview of what assessment results would look like for a candidate
 * based on the selected persona profile. Adapts the display to the current strategy:
 * - UNIVERSAL_BASELINE: Competency passport / profile view with radar chart
 * - TARGETED_FIT: Job alignment score with fit indicators
 * - DYNAMIC_GAP_ANALYSIS: Team comparison with gap visualization
 */

import React, { memo, useMemo, useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Shuffle,
  Target,
  Users,
  Briefcase,
  FileCheck,
  AlertCircle,
  Radar as RadarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Strategy, STRATEGY_CONFIG, personaConfig } from '../strategy-context';
import { SimulationResult, SimulationProfile } from '../types';
import {
  generateSimulatedResults,
  SimulatedResultsData,
  SimulatedCompetencyScore,
  getScoreColorClass,
  getProgressBarColor,
} from '../utils/generateSimulatedResults';
import { BigFiveProfile, getBigFiveLabels } from '@/hooks/useBigFiveProjection';

// ============================================
// TYPES
// ============================================

interface SimulatedResultsTabProps {
  result: SimulationResult;
  strategy: Strategy;
  persona: SimulationProfile;
  passingScore: number;
  onetSocCode?: string;
  teamId?: string;
}

// ============================================
// COMPUTED COLORS HOOK
// ============================================

function useComputedColors() {
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    border: '#e5e7eb',
    foreground: '#1f2937',
    mutedForeground: '#6b7280',
    card: '#ffffff',
  });

  useEffect(() => {
    const computeColors = () => {
      if (typeof window === 'undefined') return;

      const tempEl = document.createElement('div');
      tempEl.style.display = 'none';
      document.body.appendChild(tempEl);

      const getColor = (cssVar: string, fallback: string): string => {
        tempEl.style.color = `var(${cssVar})`;
        const computed = getComputedStyle(tempEl).color;
        if (computed && computed !== 'inherit' && computed !== '') {
          return computed;
        }
        return fallback;
      };

      setColors({
        primary: getColor('--primary', '#3b82f6'),
        border: getColor('--border', '#e5e7eb'),
        foreground: getColor('--foreground', '#1f2937'),
        mutedForeground: getColor('--muted-foreground', '#6b7280'),
        card: getColor('--card', '#ffffff'),
      });

      document.body.removeChild(tempEl);
    };

    computeColors();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          computeColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => computeColors();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return colors;
}

// ============================================
// COMPETENCY RADAR CHART
// ============================================

interface CompetencyRadarProps {
  competencyScores: SimulatedCompetencyScore[];
  passingScore: number;
}

function CompetencyRadarChart({
  competencyScores,
  passingScore,
}: CompetencyRadarProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors();

  // Transform data for radar chart - show all competencies (max 8)
  const radarData = useMemo(() => {
    return competencyScores.slice(0, 8).map((c) => ({
      subject: c.competencyName.length > (isMobile ? 8 : 12)
        ? c.competencyName.slice(0, isMobile ? 8 : 12) + '...'
        : c.competencyName,
      fullName: c.competencyName,
      value: c.simulatedPercentage,
      passed: c.passed,
      questionCount: c.questionCount,
    }));
  }, [competencyScores, isMobile]);

  const chartHeight = isMobile ? 180 : 220;
  const fontSize = isMobile ? 8 : 10;

  if (competencyScores.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
        No competencies
      </div>
    );
  }

  return (
    <Card className="border-blue-200/50 dark:border-blue-800/30">
      <CardHeader className="pb-1 pt-2.5 px-3">
        <CardTitle className="text-[11px] font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Target className="h-3.5 w-3.5" />
          Competency Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? '60%' : '68%'}
              data={radarData}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <defs>
                <radialGradient id="competencyGradientSim" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.65} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </radialGradient>
              </defs>

              <PolarGrid
                stroke={colors.border}
                strokeOpacity={0.4}
                strokeWidth={0.5}
                gridType="polygon"
              />

              <PolarAngleAxis
                dataKey="subject"
                tick={({ x, y, payload, textAnchor }) => (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fill={colors.foreground}
                    fontSize={fontSize}
                    fontWeight={500}
                    className="select-none"
                  >
                    {payload.value}
                  </text>
                )}
                tickLine={false}
              />

              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: colors.mutedForeground, fontSize: isMobile ? 6 : 8 }}
                tickCount={3}
                tickFormatter={(v) => (v === 0 || v === 50 || v === 100 ? `${v}` : '')}
                axisLine={false}
              />

              <Radar
                name="Score"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#competencyGradientSim)"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const item = payload[0].payload;

                  return (
                    <div
                      className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-2.5 min-w-[130px]"
                      style={{ backgroundColor: colors.card }}
                    >
                      <p className="font-medium text-xs mb-1" style={{ color: colors.foreground }}>
                        {item.fullName}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px]" style={{ color: colors.mutedForeground }}>
                          Score:
                        </span>
                        <span className="text-base font-bold tabular-nums text-blue-600">
                          {item.value}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-border/50">
                        {item.passed ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-[10px]" style={{ color: colors.mutedForeground }}>
                          {item.passed ? 'Passed' : 'Below threshold'}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-1">
          {competencyScores.length} competencies assessed
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// BIG FIVE RADAR CHART
// ============================================

const BIG_FIVE_TRAIT_COLORS: Record<keyof BigFiveProfile, string> = {
  OPENNESS: '#8b5cf6',
  CONSCIENTIOUSNESS: '#3b82f6',
  EXTRAVERSION: '#f59e0b',
  AGREEABLENESS: '#10b981',
  EMOTIONAL_STABILITY: '#06b6d4',
};

const BIG_FIVE_SHORT_LABELS: Record<keyof BigFiveProfile, string> = {
  OPENNESS: 'Open',
  CONSCIENTIOUSNESS: 'Consc',
  EXTRAVERSION: 'Extra',
  AGREEABLENESS: 'Agree',
  EMOTIONAL_STABILITY: 'Stable',
};

interface BigFiveRadarProps {
  bigFiveProfile: BigFiveProfile;
}

function BigFiveRadarChart({ bigFiveProfile }: BigFiveRadarProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors();
  const bigFiveLabels = getBigFiveLabels();

  // Transform Big Five data for radar chart
  const radarData = useMemo(() => {
    return Object.entries(bigFiveProfile).map(([key, value]) => ({
      subject: isMobile
        ? BIG_FIVE_SHORT_LABELS[key as keyof BigFiveProfile]
        : bigFiveLabels[key as keyof BigFiveProfile],
      fullName: bigFiveLabels[key as keyof BigFiveProfile],
      value,
      traitKey: key as keyof BigFiveProfile,
      color: BIG_FIVE_TRAIT_COLORS[key as keyof BigFiveProfile],
    }));
  }, [bigFiveProfile, bigFiveLabels, isMobile]);

  const chartHeight = isMobile ? 180 : 220;
  const fontSize = isMobile ? 8 : 10;

  return (
    <Card className="border-violet-200/50 dark:border-violet-800/30">
      <CardHeader className="pb-1 pt-2.5 px-3">
        <CardTitle className="text-[11px] font-medium flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
          <Sparkles className="h-3.5 w-3.5" />
          Personality Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? '60%' : '68%'}
              data={radarData}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <defs>
                <radialGradient id="bigFiveGradientSim" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </radialGradient>
              </defs>

              <PolarGrid
                stroke={colors.border}
                strokeOpacity={0.4}
                strokeWidth={0.5}
                gridType="polygon"
              />

              <PolarAngleAxis
                dataKey="subject"
                tick={({ x, y, payload, textAnchor }) => {
                  const item = radarData.find((d) => d.subject === payload.value);
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      fill={item?.color || colors.foreground}
                      fontSize={fontSize}
                      fontWeight={600}
                      className="select-none"
                    >
                      {payload.value}
                    </text>
                  );
                }}
                tickLine={false}
              />

              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: colors.mutedForeground, fontSize: isMobile ? 6 : 8 }}
                tickCount={3}
                tickFormatter={(v) => (v === 0 || v === 50 || v === 100 ? `${v}` : '')}
                axisLine={false}
              />

              <Radar
                name="Trait"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#bigFiveGradientSim)"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-out"
                dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const item = payload[0].payload;

                  return (
                    <div
                      className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-2.5 min-w-[130px]"
                      style={{ backgroundColor: colors.card }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="font-medium text-xs" style={{ color: colors.foreground }}>
                          {item.fullName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px]" style={{ color: colors.mutedForeground }}>
                          Score:
                        </span>
                        <span
                          className="text-base font-bold tabular-nums"
                          style={{ color: item.color }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-1">
          Big Five (OCEAN) traits
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMBINED PROFILE SECTION (Two Radars)
// ============================================

interface SimulatedProfileChartsProps {
  competencyScores: SimulatedCompetencyScore[];
  bigFiveProfile: BigFiveProfile;
  passingScore: number;
}

function SimulatedProfileCharts({
  competencyScores,
  bigFiveProfile,
  passingScore,
}: SimulatedProfileChartsProps) {
  if (competencyScores.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        No competency data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <CompetencyRadarChart
        competencyScores={competencyScores}
        passingScore={passingScore}
      />
      <BigFiveRadarChart bigFiveProfile={bigFiveProfile} />
    </div>
  );
}

// ============================================
// PERSONA INDICATOR
// ============================================

interface PersonaIndicatorProps {
  persona: SimulationProfile;
}

function PersonaIndicator({ persona }: PersonaIndicatorProps) {
  const config = personaConfig[persona];
  const IconMap: Record<string, React.ElementType> = {
    Sparkles,
    Shuffle,
    TrendingDown,
  };
  const Icon = IconMap[config.icon] ?? Sparkles;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        config.bgColor
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      <span className={config.color}>{config.label} Candidate Profile</span>
    </div>
  );
}

// ============================================
// SCORE SUMMARY CARD
// ============================================

interface ScoreSummaryProps {
  data: SimulatedResultsData;
  strategy: Strategy;
}

function ScoreSummary({ data, strategy }: ScoreSummaryProps) {
  const config = STRATEGY_CONFIG[strategy];
  const passedLabel = data.passed ? 'Passed' : 'Below Threshold';
  const PassedIcon = data.passed ? CheckCircle2 : XCircle;

  return (
    <Card className={cn('border', config.border)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center h-12 w-12 rounded-xl',
                config.iconBg
              )}
            >
              <span className={cn('text-xl font-bold', config.iconText)}>
                {data.overallScore}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Overall Score</p>
              <p className="text-xs text-muted-foreground">
                Threshold: {data.passingThreshold}%
              </p>
            </div>
          </div>

          <Badge
            variant={data.passed ? 'default' : 'destructive'}
            className="gap-1"
          >
            <PassedIcon className="h-3 w-3" />
            {passedLabel}
          </Badge>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className={cn(
              'h-full transition-all',
              getProgressBarColor(data.overallScore, data.passingThreshold)
            )}
            style={{ width: `${data.overallScore}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{data.totalQuestions} questions</span>
          <span>~{data.estimatedDuration} min</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPETENCY SCORES LIST
// ============================================

interface CompetencyScoresProps {
  scores: SimulatedCompetencyScore[];
  threshold: number;
  title: string;
  showAll?: boolean;
}

function CompetencyScores({
  scores,
  threshold,
  title,
  showAll = false,
}: CompetencyScoresProps) {
  const displayScores = showAll ? scores : scores.slice(0, 5);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="space-y-2">
        {displayScores.map((score) => (
          <div
            key={score.competencyId}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/30"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {score.passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              )}
              <span className="text-sm truncate">{score.competencyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  getScoreColorClass(score.simulatedPercentage, threshold)
                )}
              >
                {score.simulatedPercentage}%
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  score.confidence === 'high' && 'border-emerald-300',
                  score.confidence === 'medium' && 'border-amber-300',
                  score.confidence === 'low' && 'border-muted-foreground'
                )}
              >
                {score.questionCount}q
              </Badge>
            </div>
          </div>
        ))}
      </div>
      {!showAll && scores.length > 5 && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          +{scores.length - 5} more competencies
        </p>
      )}
    </div>
  );
}

// ============================================
// STRENGTHS & GAPS SECTION
// ============================================

interface StrengthsGapsProps {
  strengths: SimulatedCompetencyScore[];
  gaps: SimulatedCompetencyScore[];
  threshold: number;
}

function StrengthsGaps({ strengths, gaps, threshold }: StrengthsGapsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Strengths */}
      <Card className="border-emerald-200 dark:border-emerald-800/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Top Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            {strengths.slice(0, 3).map((s) => (
              <div key={s.competencyId} className="flex justify-between text-xs">
                <span className="truncate flex-1">{s.competencyName}</span>
                <span className={getScoreColorClass(s.simulatedPercentage, threshold)}>
                  {s.simulatedPercentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps */}
      <Card className="border-amber-200 dark:border-amber-800/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Growth Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            {gaps.slice(0, 3).map((g) => (
              <div key={g.competencyId} className="flex justify-between text-xs">
                <span className="truncate flex-1">{g.competencyName}</span>
                <span className={getScoreColorClass(g.simulatedPercentage, threshold)}>
                  {g.simulatedPercentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// STRATEGY-SPECIFIC: JOB ALIGNMENT
// ============================================

interface JobAlignmentSectionProps {
  data: SimulatedResultsData;
}

function JobAlignmentSection({ data }: JobAlignmentSectionProps) {
  if (!data.jobAlignmentScore) return null;

  return (
    <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Job Alignment Score</p>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {data.jobAlignmentScore}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.onetCoverage}% of job requirements covered
            </p>
          </div>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/50 dark:bg-emerald-900/30 mt-3">
          <div
            className="h-full transition-all bg-emerald-500"
            style={{ width: `${data.jobAlignmentScore}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// STRATEGY-SPECIFIC: TEAM GAP
// ============================================

interface TeamGapSectionProps {
  data: SimulatedResultsData;
  threshold: number;
}

function TeamGapSection({ data, threshold }: TeamGapSectionProps) {
  if (data.teamGap === undefined) return null;

  const isPositive = data.teamGap >= 0;
  const GapIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-3">
      <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Team Gap Score</p>
                <div className="flex items-center gap-1">
                  <GapIcon
                    className={cn(
                      'h-4 w-4',
                      isPositive
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    )}
                  />
                  <span
                    className={cn(
                      'text-lg font-bold',
                      isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {isPositive ? '+' : ''}
                    {data.teamGap}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPositive
                  ? 'Above team average'
                  : 'Below team average - development opportunity'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complementary Skills */}
      {data.complementarySkills && data.complementarySkills.length > 0 && (
        <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/10">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Complementary Skills (Above Team)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.complementarySkills.map((s) => (
              <Badge
                key={s.competencyId}
                variant="outline"
                className="text-[10px] border-emerald-300 dark:border-emerald-700"
              >
                {s.competencyName}: {s.simulatedPercentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Growth Areas */}
      {data.growthAreas && data.growthAreas.length > 0 && (
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/10">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Development Focus (Below Team)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.growthAreas.map((g) => (
              <Badge
                key={g.competencyId}
                variant="outline"
                className="text-[10px] border-amber-300 dark:border-amber-700"
              >
                {g.competencyName}: {g.simulatedPercentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export const SimulatedResultsTab = memo(function SimulatedResultsTab({
  result,
  strategy,
  persona,
  passingScore,
  onetSocCode,
  teamId,
}: SimulatedResultsTabProps) {
  // Generate simulated results based on persona
  const simulatedData = useMemo(
    () =>
      generateSimulatedResults(
        result,
        strategy,
        persona,
        passingScore,
        onetSocCode,
        teamId
      ),
    [result, strategy, persona, passingScore, onetSocCode, teamId]
  );

  const strategyConfig = STRATEGY_CONFIG[strategy];

  return (
    <div className="space-y-4">
      {/* Persona Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className={cn('h-4 w-4', strategyConfig.iconText)} />
          <span className="text-sm font-medium">Results Preview</span>
        </div>
        <PersonaIndicator persona={persona} />
      </div>

      {/* Overall Score */}
      <ScoreSummary data={simulatedData} strategy={strategy} />

      {/* UNIVERSAL_BASELINE: Two radar charts - Competencies & Big Five */}
      {strategy === 'UNIVERSAL_BASELINE' && (
        <SimulatedProfileCharts
          competencyScores={simulatedData.competencyScores}
          bigFiveProfile={simulatedData.bigFiveProfile}
          passingScore={passingScore}
        />
      )}

      {/* Strategy-specific sections */}
      {strategy === 'TARGETED_FIT' && (
        <JobAlignmentSection data={simulatedData} />
      )}

      {strategy === 'DYNAMIC_GAP_ANALYSIS' && (
        <TeamGapSection data={simulatedData} threshold={passingScore} />
      )}

      {/* Strengths & Gaps */}
      <StrengthsGaps
        strengths={simulatedData.strengths}
        gaps={simulatedData.gaps}
        threshold={passingScore}
      />

      {/* Full Competency Breakdown */}
      {simulatedData.competencyScores.length > 0 && (
        <CompetencyScores
          scores={simulatedData.competencyScores}
          threshold={passingScore}
          title="Competency Breakdown"
          showAll={simulatedData.competencyScores.length <= 8}
        />
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center pt-2">
        Simulated results based on {personaConfig[persona].label.toLowerCase()} candidate profile.
        Actual results will vary.
      </p>
    </div>
  );
});

export default SimulatedResultsTab;
