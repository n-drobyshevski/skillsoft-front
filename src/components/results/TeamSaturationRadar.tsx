'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Users, Target, ArrowUp, Sparkles } from 'lucide-react';
import { ComparisonRadarChart } from '@/components/charts/ComparisonRadarChart';
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

const CONTRIBUTION_COLORS: Record<TeamContributionType, string> = {
  leader: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  specialist: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  generalist: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  collaborator: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  innovator: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
};

// ============================================================================
// Gap Fill Indicator
// ============================================================================

interface GapFillListProps {
  gapsFilledCompetencies: TeamSaturationDataPoint[];
  title: string;
  className?: string;
}

function GapFillList({ gapsFilledCompetencies, title, className }: GapFillListProps) {
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
        {title}
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
  const t = useTranslations('results.teamFit.radar');
  const isMobile = useIsMobile();

  // Calculate team fit analysis
  const analysis = useMemo(() => analyzeTeamFit(data), [data]);

  // Translated contribution type labels
  const contributionLabels: Record<TeamContributionType, { label: string; description: string }> = {
    leader: { label: t('leader'), description: t('leaderDescription') },
    specialist: { label: t('specialist'), description: t('specialistDescription') },
    generalist: { label: t('generalist'), description: t('generalistDescription') },
    collaborator: { label: t('collaborator'), description: t('collaboratorDescription') },
    innovator: { label: t('innovator'), description: t('innovatorDescription') },
  };

  // Transform data for ComparisonRadarChart
  const radarData = useMemo(() => data.map((d) => ({
    label: d.competencyName,
    primary: Math.round(d.candidateScore),
    secondary: Math.round(d.teamSaturation),
  })), [data]);

  // Contribution badge config
  const contribColor = CONTRIBUTION_COLORS[analysis.contributionType];
  const contribLabel = contributionLabels[analysis.contributionType];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with contribution type */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('title')}</span>
        </div>
        <Badge variant="outline" className={cn('text-xs', contribColor)}>
          {contribLabel.label}
        </Badge>
      </div>

      {/* Radar Chart */}
      {radarData.length >= 3 && (
        <ComparisonRadarChart
          data={radarData}
          className="max-w-[400px] mx-auto"
          primary={{
            label: t('you'),
            stroke: '#3b82f6',
            fill: 'rgba(59,130,246,0.10)',
            dotFill: '#60a5fa',
            dotStroke: '#212121',
          }}
          secondary={{
            label: t('team'),
          }}
        />
      )}

      {/* Gaps filled section */}
      <GapFillList gapsFilledCompetencies={analysis.gapsFilledCompetencies} title={t('gapsYouFill')} />

      {/* Quick stats */}
      <div className={cn(
        'grid gap-2 pt-3 border-t',
        isMobile ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        <div className="text-center p-2.5 bg-primary/5 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            {t('compatibility')}
          </div>
          <div className="text-base font-bold tabular-nums text-primary">
            {analysis.compatibilityScore}%
          </div>
        </div>
        <div className="text-center p-2.5 bg-emerald-500/10 rounded-lg">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
            {t('gapsFilled')}
          </div>
          <div className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {analysis.gapsFilledCompetencies.length}
          </div>
        </div>
        {!isMobile && (
          <div className="text-center p-2.5 bg-muted/50 rounded-lg">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              {t('strengths')}
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
            {t('growthAreas')}
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
