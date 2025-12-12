import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { testResultsApi, testTemplatesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Award,
  Home,
  RotateCcw,
  UserPlus,
  FileText,
  TrendingUp
} from 'lucide-react';
import CompetencyRadarChart from '@/components/data-display/charts/CompetencyRadarChart';
import GapAnalysisBarChart from '@/components/data-display/charts/GapAnalysisBarChart';
import { AssessmentGoal } from '@/types/domain';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{
    resultId: string;
  }>;
}

export default async function TestResultsPage({ params }: PageProps) {
  const { resultId } = await params;

  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsContent resultId={resultId} />
    </Suspense>
  );
}

async function ResultsContent({ resultId }: { resultId: string }) {
  // First try to get by result ID, then by session ID
  let result = null;

  try {
    result = await testResultsApi.getResultById(resultId);
  } catch (error) {
    // Continue to try by session ID
  }

  if (!result) {
    try {
      result = await testResultsApi.getResultBySession(resultId);
    } catch (error) {
      // Both attempts failed
    }
  }

  if (!result) {
    notFound();
  }

  // Fetch template details to determine visualization type
  const template = await testTemplatesApi.getTemplateById(result.templateId);

  const isPassed = result.passed;
  const percentScore = Math.round(result.overallPercentage);
  const formattedTime = formatDuration(result.totalTimeSeconds);

  // Prepare data for charts
  const radarData = result.competencyScores.map(cs => ({
    subject: cs.competencyName,
    A: Math.round(cs.percentage),
    fullMark: 100
  }));

  const gapData = result.competencyScores.map(cs => {
    const targetScore = template?.passingScore || 70;
    return {
      name: cs.competencyName,
      score: Math.round(cs.percentage),
      target: targetScore,
      gap: Math.round(cs.percentage) - targetScore
    };
  });

  const showGapAnalysis = template?.goal === AssessmentGoal.JOB_FIT || template?.goal === AssessmentGoal.TEAM_FIT;

  // Sort competencies by percentage (descending)
  const sortedCompetencies = [...result.competencyScores].sort(
    (a, b) => b.percentage - a.percentage
  );

  return (
    <div className="min-h-screen bg-muted/30 py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* COMPACT HERO SECTION - 60% smaller */}
        <Card className={cn(
          "relative overflow-hidden border-2 transition-all animate-fadeInUp-1",
          isPassed
            ? "border-green-500/30 bg-gradient-to-br from-green-500/5 via-emerald-400/5 to-teal-500/5"
            : "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-400/5 to-yellow-500/5"
        )}>
          {/* Subtle gradient overlay */}
          <div className={cn(
            "absolute inset-0 opacity-10",
            isPassed
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.3),transparent_70%)]"
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3),transparent_70%)]"
          )} />

          <CardContent className="p-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
              {/* LEFT: Icon + Title + Compact Score */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-4 lg:gap-3">
                {/* Compact animated icon */}
                <div className={cn(
                  "rounded-full p-4 border-2 transition-all shrink-0",
                  isPassed
                    ? "bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    : "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                )}>
                  {isPassed ? (
                    <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                  ) : (
                    <Target className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  )}
                </div>

                {/* Title and template */}
                <div className="text-center sm:text-left lg:text-center flex-1 sm:flex-initial lg:flex-1">
                  <h1 className={cn(
                    "text-xl sm:text-2xl font-bold mb-1",
                    isPassed ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
                  )}>
                    {isPassed ? 'Поздравляем!' : 'Продолжайте развиваться'}
                  </h1>
                  <p className="text-sm text-muted-foreground line-clamp-1" title={result.templateName}>
                    {result.templateName}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {new Date(result.completedAt).toLocaleString()}
                  </p>
                </div>

                {/* Compact score circle - only on mobile */}
                <div className="sm:hidden relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentScore / 100)}`}
                      className={cn(
                        "transition-all duration-[1500ms] ease-out",
                        isPassed ? "text-green-500" : "text-amber-500"
                      )}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn(
                      "text-2xl font-bold",
                      isPassed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {percentScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Score Circle + Stats Grid (Desktop/Tablet only) */}
              <div className="hidden sm:flex flex-col lg:flex-row items-center gap-6">
                {/* Score circle - desktop/tablet */}
                <div className="relative shrink-0">
                  <svg className="w-32 h-32 lg:w-36 lg:h-36 transform -rotate-90" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - percentScore / 100)}`}
                      className={cn(
                        "transition-all duration-[1500ms] ease-out",
                        isPassed ? "text-green-500" : "text-amber-500"
                      )}
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 6px ${isPassed ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'})`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn(
                      "text-4xl lg:text-5xl font-bold",
                      isPassed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {percentScore}%
                    </span>
                    <Badge variant={isPassed ? 'default' : 'secondary'} className="mt-1 text-xs">
                      {isPassed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Пройден
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Не пройден
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Inline stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 flex-1 w-full">
                  <CompactStatCard
                    icon={<Target className="h-4 w-4" />}
                    label="Баллы"
                    value={`${result.overallScore.toFixed(1)}`}
                    subtitle={`из ${Math.round(result.overallScore / (result.overallPercentage / 100 || 1))}`}
                    color="success"
                  />
                  <CompactStatCard
                    icon={<Clock className="h-4 w-4" />}
                    label="Время"
                    value={formattedTime}
                    color="info"
                  />
                  <CompactStatCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Отвечено"
                    value={`${result.questionsAnswered}`}
                    subtitle={`/ ${result.totalQuestions}`}
                    color="primary"
                  />
                  <CompactStatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Компетенции"
                    value={`${result.competencyScores.length}`}
                    color={result.questionsSkipped > 5 ? 'warning' : 'primary'}
                  />
                </div>
              </div>
            </div>

            {/* Mobile stats grid */}
            <div className="sm:hidden grid grid-cols-2 gap-3 mt-4">
              <CompactStatCard
                icon={<Target className="h-4 w-4" />}
                label="Баллы"
                value={`${result.overallScore.toFixed(1)}`}
                subtitle={`из ${Math.round(result.overallScore / (result.overallPercentage / 100 || 1))}`}
                color="success"
              />
              <CompactStatCard
                icon={<Clock className="h-4 w-4" />}
                label="Время"
                value={formattedTime}
                color="info"
              />
              <CompactStatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Отвечено"
                value={`${result.questionsAnswered}`}
                subtitle={`/ ${result.totalQuestions}`}
                color="primary"
              />
              <CompactStatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Компетенции"
                value={`${result.competencyScores.length}`}
                color={result.questionsSkipped > 5 ? 'warning' : 'primary'}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-6 border-t">
              <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <Link href="/test-templates">
                  <Home className="h-4 w-4 mr-2" />
                  К списку
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1 sm:flex-initial">
                <Link href={`/test-templates/${result.templateId}/start`}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Пройти ещё раз
                </Link>
              </Button>
              {!showGapAnalysis && isPassed && (
                <Button size="sm" variant="secondary" className="flex-1 sm:flex-initial sm:ml-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  В профиль
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CHARTS + INSIGHTS SECTION - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 animate-fadeInUp-2">
          {/* Chart Card */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {showGapAnalysis ? 'Анализ разрывов' : 'Карта компетенций'}
              </CardTitle>
              <CardDescription className="text-xs">
                {showGapAnalysis
                  ? 'Сравнение с целевыми показателями'
                  : 'Профиль ваших компетенций'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[280px]">
              {showGapAnalysis ? (
                <GapAnalysisBarChart data={gapData} />
              ) : (
                <CompetencyRadarChart data={radarData} />
              )}
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Ключевые выводы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPassed ? (
                <>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                    <h4 className="font-semibold text-sm text-green-800 dark:text-green-300 mb-1.5 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Сильные стороны
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                      Вы продемонстрировали высокий уровень владения ключевыми компетенциями.
                      {radarData.some(d => d.A > 80) && " Особенно выделяются результаты по " + radarData.filter(d => d.A > 80).map(d => d.subject).join(", ") + "."}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Для дальнейшего развития рекомендуем поддерживать текущий уровень и углублять знания в смежных областях.
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Зоны роста
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Обратите внимание на компетенции, где результат ниже целевого уровня.
                      {gapData.some(d => d.gap < 0) && " Наибольший разрыв наблюдается в: " + gapData.filter(d => d.gap < 0).sort((a, b) => a.gap - b.gap).slice(0, 2).map(d => d.name).join(", ") + "."}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Рекомендуем изучить дополнительные материалы по этим темам и пройти тестирование повторно.
                  </p>
                </>
              )}

              {/* Percentile if available */}
              {result.percentile !== undefined && result.percentile !== null && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground">
                    Ваш результат лучше, чем у <span className="font-semibold text-foreground">{result.percentile}%</span> участников
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLLAPSIBLE DETAILED COMPETENCY BREAKDOWN */}
        {result.competencyScores && result.competencyScores.length > 0 && (
          <Card className="mt-4 animate-fadeInUp-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Детальная статистика по компетенциям
              </CardTitle>
              <CardDescription className="text-xs">
                Раскройте для просмотра подробных результатов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {sortedCompetencies.map((competency, index) => (
                  <AccordionItem key={competency.competencyId} value={`item-${index}`}>
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {competency.competencyName}
                          </span>
                          {competency.competencyCategory && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {competency.competencyCategory}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 sm:w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                Math.round(competency.percentage) >= 90
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  : Math.round(competency.percentage) >= 70
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                  : Math.round(competency.percentage) >= 50
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                              )}
                              style={{ width: `${competency.percentage}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-bold tabular-nums w-12 text-right",
                            Math.round(competency.percentage) >= 90
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : Math.round(competency.percentage) >= 70
                              ? 'text-blue-600 dark:text-blue-400'
                              : Math.round(competency.percentage) >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                          )}>
                            {Math.round(competency.percentage)}%
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <CompactCompetencyDetails competency={competency} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Stat Card Component - minimalist design for inline display
 */
function CompactStatCard({
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
    <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
      <div className={cn(
        "w-7 h-7 rounded-md flex items-center justify-center border",
        colorClasses[color]
      )}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-lg sm:text-xl font-bold tabular-nums leading-none">
          {value}
        </span>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</span>
        )}
      </div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

/**
 * Compact Competency Details - shown in accordion
 */
function CompactCompetencyDetails({ competency }: { competency: {
  competencyId: string;
  competencyName: string;
  competencyCategory?: string;
  score: number;
  maxScore: number;
  percentage: number;
  indicatorScores?: Array<{
    indicatorId: string;
    indicatorTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
}}) {
  const percentage = Math.round(competency.percentage);

  const tier = percentage >= 90 ? 'excellent' :
               percentage >= 70 ? 'good' :
               percentage >= 50 ? 'average' : 'poor';

  const tierConfig = {
    excellent: { label: 'Отлично', icon: '🎯', color: 'text-emerald-600 dark:text-emerald-400' },
    good: { label: 'Хорошо', icon: '✓', color: 'text-blue-600 dark:text-blue-400' },
    average: { label: 'Средне', icon: '→', color: 'text-amber-600 dark:text-amber-400' },
    poor: { label: 'Требует улучшения', icon: '↓', color: 'text-red-600 dark:text-red-400' }
  };

  const config = tierConfig[tier];

  return (
    <div className="pl-4 space-y-3">
      {/* Score summary */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm font-medium">{config.label}</span>
        </div>
        <div className="text-right">
          <div className={cn("text-xl font-bold", config.color)}>
            {percentage}%
          </div>
          <div className="text-xs text-muted-foreground">
            {competency.score.toFixed(1)} / {competency.maxScore.toFixed(1)} баллов
          </div>
        </div>
      </div>

      {/* Indicator breakdown */}
      {competency.indicatorScores && competency.indicatorScores.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Показатели поведения ({competency.indicatorScores.length})
          </h5>
          <div className="space-y-2">
            {competency.indicatorScores.map(indicator => (
              <div key={indicator.indicatorId} className="flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate" title={indicator.indicatorTitle}>
                    {indicator.indicatorTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        indicator.percentage >= 70 ? 'bg-green-500' :
                        indicator.percentage >= 50 ? 'bg-amber-500' :
                        'bg-red-500'
                      )}
                      style={{ width: `${indicator.percentage}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-semibold tabular-nums w-10 text-right",
                    indicator.percentage >= 70 ? 'text-green-600 dark:text-green-400' :
                    indicator.percentage >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  )}>
                    {Math.round(indicator.percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Format duration helper
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  if (mins > 0) {
    return `${mins}м ${secs}с`;
  }
  return `${secs}с`;
}

// Loading skeleton
function ResultsSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="w-36 h-36 rounded-full" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-[360px] rounded-lg" />
          <Skeleton className="h-[360px] rounded-lg" />
        </div>

        <Card className="mt-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
