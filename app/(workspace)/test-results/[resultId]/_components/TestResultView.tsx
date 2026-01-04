"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BigFiveRadar } from '@/components/charts/BigFiveRadar';
import { useBigFiveProjection } from '@/hooks/useBigFiveProjection';
import { TestResult, CompetencyScore } from '@/types/domain';
import { CheckCircle2, XCircle, Clock, FileText, Target, TrendingUp, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TestResultViewProps {
  result: TestResult;
}

/**
 * Test Result View Component (Client Component)
 *
 * Modern, clean design displaying test results with:
 * - Enhanced hero section with animated score circle
 * - Color-coded stats cards with hover effects
 * - Performance-tiered competency breakdown
 * - Big Five personality radar chart
 * - Staggered animations and micro-interactions
 */
export default function TestResultView({ result }: TestResultViewProps) {
  const t = useTranslations('results');
  // Transform competency scores to Big Five profile using O*NET mapping
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
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Enhanced Hero Section */}
      <div className={cn(
        "relative overflow-hidden rounded-xl border-2 transition-all animate-fadeInUp-1",
        isPassed
          ? "border-green-500/30 bg-gradient-to-br from-green-500/5 via-emerald-400/5 to-teal-500/5"
          : "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-400/5 to-yellow-500/5"
      )}>
        {/* Animated Radial Glow */}
        <div className={cn(
          "absolute inset-0 opacity-20 animate-pulse-slow",
          isPassed
            ? "bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.3),transparent_70%)]"
            : "bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3),transparent_70%)]"
        )} />

        <div className="relative flex flex-col items-center py-12 px-6">
          {/* Animated Icon */}
          <div className={cn(
            "mb-6 rounded-full p-6 backdrop-blur-sm border-2 transition-all duration-700",
            isPassed
              ? "bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce-gentle"
              : "bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse-gentle"
          )}>
            {isPassed ? (
              <Trophy className="h-16 w-16 text-green-600 dark:text-green-400" />
            ) : (
              <Target className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          {/* Template Name */}
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold mb-2 text-center",
            isPassed ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
          )}>
            {result.templateName}
          </h1>

          <p className="text-muted-foreground text-center max-w-md mb-8">
            {t('completed')} {new Date(result.completedAt).toLocaleString()}
          </p>

          {/* Enhanced Score Circle */}
          <div className="relative mb-6">
            <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted/20"
              />
              {/* Animated progress circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 85}`}
                strokeDashoffset={`${2 * Math.PI * 85 * (1 - percentScore / 100)}`}
                className={cn(
                  "transition-all duration-[1500ms] ease-out",
                  isPassed ? "text-green-500" : "text-amber-500"
                )}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${isPassed ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)'})`
                }}
              />
            </svg>

            {/* Score text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="score-hero"
                style={{
                  background: isPassed
                    ? 'linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 46%))'
                    : 'linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 60%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {percentScore}%
              </span>
              <Badge variant={isPassed ? "default" : "secondary"} className="mt-2 text-sm font-semibold">
                {isPassed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    {t('passed')}
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    {t('notPassed')}
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Percentile callout if available */}
          {result.percentile !== undefined && result.percentile !== null && (
            <div className="px-6 py-3 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              <p className="text-sm text-muted-foreground">
                {t('betterThan', { percentage: result.percentile })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeInUp-2">
        <EnhancedStatCard
          icon={<Target className="h-5 w-5" />}
          label={t('score')}
          value={`${(result.overallScore ?? 0).toFixed(1)}`}
          subtitle={`of ${(result.competencyScores ?? []).reduce((sum, c) => sum + c.maxScore, 0).toFixed(1)}`}
          color="success"
        />
        <EnhancedStatCard
          icon={<Clock className="h-5 w-5" />}
          label={t('time')}
          value={`${timeInMinutes}:${timeInSeconds.toString().padStart(2, '0')}`}
          subtitle={t('minutes')}
          color="info"
        />
        <EnhancedStatCard
          icon={<FileText className="h-5 w-5" />}
          label={t('answered')}
          value={`${result.questionsAnswered}/${result.totalQuestions}`}
          subtitle={result.questionsSkipped > 0 ? t('skippedCount', { count: result.questionsSkipped }) : t('allAnswered')}
          color="primary"
        />
        <EnhancedStatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t('competencies')}
          value={`${(result.competencyScores ?? []).length}`}
          subtitle={t('assessed')}
          color="primary"
        />
      </div>

      {/* Two Column Layout for Competencies and Big Five */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeInUp-3">
        {/* Enhanced Competency Scores */}
        <Card>
          <CardHeader>
            <CardTitle>{t('competencyScores')}</CardTitle>
            <CardDescription>
              {t('breakdownDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCompetencies.map((competency) => (
                <EnhancedCompetencyCard key={competency.competencyId} competency={competency} t={t} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Big Five Personality Profile */}
        <BigFiveRadar
          profile={bigFiveProfile}
          title={t('personalityProfile')}
          description={t('personalityDescription')}
          showLegend={true}
        />
      </div>
    </div>
  );
}

/**
 * Enhanced Stat Card Component with color coding and hover effects
 */
function EnhancedStatCard({
  icon,
  label,
  value,
  subtitle,
  color = 'primary'
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col gap-2">
        {/* Icon with color coding */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
          colorClasses[color]
        )}>
          {icon}
        </div>

        {/* Value - primary focus */}
        <div className="flex flex-col">
          <span className="stat-value">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground mt-0.5">{subtitle}</span>
          )}
        </div>

        {/* Label - secondary */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Enhanced Competency Card with performance tiers and gradient progress bars
 */
function EnhancedCompetencyCard({ competency, t }: { competency: CompetencyScore; t: ReturnType<typeof useTranslations<'results'>> }) {
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
      "group relative rounded-lg border p-5 transition-all duration-300 hover:shadow-md",
      config.borderColor
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-base truncate">{competency.competencyName}</h4>
            <span className="text-lg">{config.icon}</span>
          </div>
          {competency.onetCode && (
            <p className="text-xs text-muted-foreground font-mono">{competency.onetCode}</p>
          )}
        </div>

        {/* Score display */}
        <div className={cn(
          "flex flex-col items-end px-4 py-2 rounded-lg border",
          config.bgColor,
          config.borderColor
        )}>
          <span className={cn("text-3xl font-bold tabular-nums", config.color)}>
            {percentage}%
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {competency.score.toFixed(1)}/{competency.maxScore.toFixed(1)}
          </span>
          <Badge variant="secondary" className="mt-1 text-xs">
            {t(config.labelKey)}
          </Badge>
        </div>
      </div>

      {/* Enhanced Progress Bar with shimmer */}
      <div className="relative h-3 w-full bg-muted/30 rounded-full overflow-hidden">
        {/* Gradient fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out relative progress-shimmer",
            config.progressColor
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {[25, 50, 75].map(mark => (
            <div
              key={mark}
              className="absolute h-full w-px bg-background/50"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>
      </div>

      {/* Questions answered info */}
      {competency.questionsAnswered && (
        <p className="text-xs text-muted-foreground mt-2">
          {t('questionsAnswered', { count: competency.questionsAnswered })}
        </p>
      )}
    </div>
  );
}
