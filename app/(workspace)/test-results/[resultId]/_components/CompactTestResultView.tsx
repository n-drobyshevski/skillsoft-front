"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LazyBigFiveRadar as BigFiveRadar } from '@/lib/lazy-charts';
import { useBigFiveProjection } from '@/hooks/useBigFiveProjection';
import { TestResult, CompetencyScore } from '@/types/domain';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Target,
  Trophy,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CompactTestResultViewProps {
  result: TestResult;
}

/**
 * Compact Test Result View Component
 *
 * Redesigned for maximum information density:
 * - Horizontal hero layout fitting in minimal vertical space
 * - Inline stats bar with key metrics
 * - Compact single-row competency display
 * - Collapsible sections for detailed analysis
 * - All critical info above the fold
 */
export default function CompactTestResultView({ result }: CompactTestResultViewProps) {
  const t = useTranslations('results');
  const [chartsExpanded, setChartsExpanded] = useState(false);

  // Transform competency scores to Big Five profile
  const bigFiveProfile = useBigFiveProjection(result.competencyScores ?? undefined);

  // Sort competencies by percentage (descending)
  const sortedCompetencies = [...(result.competencyScores ?? [])].sort(
    (a, b) => b.percentage - a.percentage
  );

  const timeInMinutes = Math.floor(result.totalTimeSeconds / 60);
  const timeInSeconds = result.totalTimeSeconds % 60;
  const percentScore = Math.round(result.overallPercentage ?? 0);
  const isPassed = result.passed;

  return (
    <div className="container mx-auto py-4 space-y-3 max-w-7xl">
      {/* Compact Horizontal Hero Section */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border transition-all",
          isPassed
            ? "border-green-500/30 bg-gradient-to-r from-green-500/5 via-emerald-400/5 to-transparent"
            : "border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-orange-400/5 to-transparent"
        )}
        role="region"
        aria-label="Test result summary"
      >
        {/* Subtle glow effect */}
        <div
          className={cn(
            "absolute inset-0 opacity-10",
            isPassed
              ? "bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.2),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_20%_50%,rgba(245,158,11,0.2),transparent_50%)]"
          )}
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row items-center gap-4 p-4 md:p-5">
          {/* Left: Icon + Score Circle (Compact) */}
          <div className="flex items-center gap-4">
            {/* Compact Icon */}
            <div className={cn(
              "rounded-full p-3 backdrop-blur-sm border transition-all",
              isPassed
                ? "bg-green-500/10 border-green-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            )}>
              {isPassed ? (
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              )}
            </div>

            {/* Compact Score Display */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-5xl md:text-6xl font-bold tabular-nums",
                    isPassed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {percentScore}%
                </span>
                <Badge variant={isPassed ? "default" : "secondary"} className="mb-1">
                  {isPassed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t('passed')}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      {t('notPassed')}
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(result.overallScore ?? 0).toFixed(1)} / {(result.competencyScores ?? []).reduce((sum, c) => sum + c.maxScore, 0).toFixed(1)} {t('points')}
              </p>
            </div>
          </div>

          {/* Center: Template Name and Date */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {result.templateName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('completed')} {new Date(result.completedAt).toLocaleDateString()} at {new Date(result.completedAt).toLocaleTimeString()}
            </p>
            {result.percentile !== undefined && result.percentile !== null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-semibold">{t('percentile', { value: result.percentile })}</span> - {t('betterThan', { percentage: result.percentile })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compact Inline Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="list" aria-label="Test statistics">
        <CompactStatBadge
          icon={<Clock className="h-4 w-4" />}
          label={t('time')}
          value={`${timeInMinutes}:${timeInSeconds.toString().padStart(2, '0')}`}
          color="blue"
        />
        <CompactStatBadge
          icon={<FileText className="h-4 w-4" />}
          label={t('answered')}
          value={`${result.questionsAnswered}/${result.totalQuestions}`}
          color="purple"
        />
        <CompactStatBadge
          icon={<TrendingUp className="h-4 w-4" />}
          label={t('competencies')}
          value={`${(result.competencyScores ?? []).length}`}
          color="indigo"
        />
        <CompactStatBadge
          icon={<Target className="h-4 w-4" />}
          label={t('accuracy')}
          value={`${Math.round((result.questionsAnswered / result.totalQuestions) * 100)}%`}
          color={result.questionsSkipped === 0 ? "green" : "amber"}
        />
      </div>

      {/* Compact Competency Scores - Above the Fold */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('competencyBreakdown')}</CardTitle>
              <CardDescription className="text-xs">
                {t('performanceAcross', { count: (result.competencyScores ?? []).length })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {t('proficient', { count: sortedCompetencies.filter(c => c.percentage >= 70).length, total: sortedCompetencies.length })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedCompetencies.map((competency) => (
            <CompactCompetencyRow key={competency.competencyId} competency={competency} t={t} />
          ))}
        </CardContent>
      </Card>

      {/* Collapsible Charts & Analysis Section */}
      <Collapsible open={chartsExpanded} onOpenChange={setChartsExpanded}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all",
              "hover:bg-accent hover:border-primary/30",
              chartsExpanded ? "bg-accent border-primary/20" : "bg-card"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {chartsExpanded ? t('hideChartsAnalysis') : t('showChartsAnalysis')}
            </span>
            {chartsExpanded ? (
              <ChevronUp className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-auto" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3">
          {/* Big Five Personality Profile */}
          <BigFiveRadar
            profile={bigFiveProfile}
            title={t('personalityProfile')}
            description={t('personalityDescriptionShort')}
            showLegend={true}
          />

          {/* Detailed Competency Cards - Only show when expanded */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('detailedAnalysis')}</CardTitle>
              <CardDescription className="text-xs">
                {t('detailedAnalysisDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCompetencies.map((competency) => (
                <DetailedCompetencyCard key={competency.competencyId} competency={competency} t={t} />
              ))}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Compact Stat Badge - Inline horizontal display
 */
function CompactStatBadge({
  icon,
  label,
  value,
  color = 'gray'
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: 'blue' | 'purple' | 'indigo' | 'green' | 'amber' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    green: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    gray: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border transition-all hover:shadow-sm",
        colorClasses[color]
      )}
      role="listitem"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm md:text-base font-bold tabular-nums truncate">{value}</div>
        <div className="text-xs opacity-80 truncate">{label}</div>
      </div>
    </div>
  );
}

/**
 * Compact Competency Row - Single line with progress bar
 */
function CompactCompetencyRow({ competency, t }: { competency: CompetencyScore; t: ReturnType<typeof useTranslations<'results'>> }) {
  const percentage = Math.round(competency.percentage);

  // Determine performance tier
  const tier = percentage >= 90 ? 'excellent' :
               percentage >= 70 ? 'good' :
               percentage >= 50 ? 'average' : 'poor';

  const tierConfig = {
    excellent: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500',
      labelKey: 'tier.excellent' as const,
      icon: '🎯'
    },
    good: {
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500',
      labelKey: 'tier.good' as const,
      icon: '✓'
    },
    average: {
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500',
      labelKey: 'tier.average' as const,
      icon: '→'
    },
    poor: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500',
      labelKey: 'tier.needsWork' as const,
      icon: '↓'
    }
  };

  const config = tierConfig[tier];

  return (
    <div className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors">
      {/* Competency Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{competency.competencyName}</span>
          <span className="text-base flex-shrink-0">{config.icon}</span>
        </div>
        {competency.onetCode && (
          <p className="text-xs text-muted-foreground font-mono">{competency.onetCode}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="hidden md:block w-32 lg:w-48">
        <div className="relative h-2 w-full bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              config.bgColor
            )}
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Score Badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn("text-lg font-bold tabular-nums", config.color)}>
          {percentage}%
        </span>
        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
          {t(config.labelKey)}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Detailed Competency Card - Only shown in expanded section
 */
function DetailedCompetencyCard({ competency, t }: { competency: CompetencyScore; t: ReturnType<typeof useTranslations<'results'>> }) {
  const percentage = Math.round(competency.percentage);

  // Determine performance tier
  const tier = percentage >= 90 ? 'excellent' :
               percentage >= 70 ? 'good' :
               percentage >= 50 ? 'average' : 'poor';

  const tierConfig = {
    excellent: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      progressColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      labelKey: 'tier.excellent' as const,
      icon: '🎯'
    },
    good: {
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      progressColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      labelKey: 'tier.good' as const,
      icon: '✓'
    },
    average: {
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      progressColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      labelKey: 'tier.average' as const,
      icon: '→'
    },
    poor: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      progressColor: 'bg-gradient-to-r from-red-500 to-rose-500',
      labelKey: 'tier.needsImprovement' as const,
      icon: '↓'
    }
  };

  const config = tierConfig[tier];

  return (
    <div className={cn(
      "group relative rounded-lg border p-4 transition-all duration-300 hover:shadow-md",
      config.borderColor
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{competency.competencyName}</h4>
            <span className="text-lg">{config.icon}</span>
          </div>
          {competency.onetCode && (
            <p className="text-xs text-muted-foreground font-mono">{competency.onetCode}</p>
          )}
        </div>

        {/* Score display */}
        <div className={cn(
          "flex flex-col items-end px-3 py-1.5 rounded-md border",
          config.bgColor,
          config.borderColor
        )}>
          <span className={cn("text-2xl font-bold tabular-nums", config.color)}>
            {percentage}%
          </span>
          <span className="text-xs text-muted-foreground">
            {competency.score.toFixed(1)}/{competency.maxScore.toFixed(1)}
          </span>
          <Badge variant="secondary" className="mt-1 text-xs">
            {t(config.labelKey)}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-2 w-full bg-muted/30 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${competency.competencyName} score: ${percentage}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            config.progressColor
          )}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Questions info */}
      {competency.questionsAnswered && (
        <p className="text-xs text-muted-foreground mt-2">
          {t('questionsAnswered', { count: competency.questionsAnswered })}
        </p>
      )}
    </div>
  );
}
