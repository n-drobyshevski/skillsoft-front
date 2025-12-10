import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { testResultsApi, testTemplatesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
  UserPlus
} from 'lucide-react';
import { CompetencyRadarChart } from '@/components/data-display/charts/CompetencyRadarChart';
import { GapAnalysisBarChart } from '@/components/data-display/charts/GapAnalysisBarChart';

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
  let result = await testResultsApi.getResultById(resultId);
  
  if (!result) {
    result = await testResultsApi.getResultBySession(resultId);
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
    const targetScore = template?.passingScore || 70; // Default to 70 if not specified
    return {
      name: cs.competencyName,
      score: Math.round(cs.percentage),
      target: targetScore,
      gap: Math.round(cs.percentage) - targetScore
    };
  });

  // Determine which chart to show based on goal
  // Default to Radar for OVERVIEW/SELF_ASSESSMENT, Gap for JOB_FIT/ASSESSMENT
  const showGapAnalysis = template?.goal === 'JOB_FIT' || template?.goal === 'ASSESSMENT';

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header Card */}
        <Card className={isPassed ? 'border-green-500/50' : 'border-amber-500/50'}>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {isPassed ? (
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Target className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl sm:text-3xl">
              {isPassed ? 'Поздравляем!' : 'Попробуйте ещё раз'}
            </CardTitle>
            
            <CardDescription className="text-base mt-2">
              {isPassed 
                ? `Вы успешно прошли тест "${result.templateName}"` 
                : `Вы не набрали проходной балл по тесту "${result.templateName}"`}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Score display */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-2">
                <span className={isPassed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                  {percentScore}%
                </span>
              </div>
              <Badge variant={isPassed ? 'default' : 'secondary'} className="text-sm">
                {isPassed ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Тест пройден
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Не пройден
                  </>
                )}
              </Badge>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<Target className="h-4 w-4" />}
                label="Баллы"
                value={`${result.overallScore} / ${Math.round(result.overallScore / (result.overallPercentage / 100 || 1))}`}
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Время"
                value={formattedTime}
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Отвечено"
                value={`${result.questionsAnswered} / ${result.totalQuestions}`}
              />
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                label="Пропущено"
                value={`${result.questionsSkipped}`}
              />
            </div>

            {result.percentile && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Ваш результат лучше, чем у <span className="font-semibold text-foreground">{result.percentile}%</span> участников
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/test-templates">
                <Home className="h-4 w-4 mr-2" />
                К списку шаблонов
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/test-templates/${result.templateId}/start`}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Пройти ещё раз
              </Link>
            </Button>
            {/* Scenario A: Add to Profile Button */}
            {!showGapAnalysis && isPassed && (
              <Button className="w-full sm:w-auto ml-auto" variant="secondary">
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить в профиль
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Chart Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {showGapAnalysis ? 'Анализ разрывов' : 'Карта компетенций'}
              </CardTitle>
              <CardDescription>
                {showGapAnalysis 
                  ? 'Сравнение ваших результатов с целевыми показателями' 
                  : 'Визуализация вашего профиля компетенций'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center min-h-[300px]">
              {showGapAnalysis ? (
                <GapAnalysisBarChart data={gapData} />
              ) : (
                <CompetencyRadarChart data={radarData} />
              )}
            </CardContent>
          </Card>

          {/* Recommendations / Insights Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Ключевые выводы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPassed ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Сильные стороны</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Вы продемонстрировали высокий уровень владения ключевыми компетенциями. 
                      {radarData.some(d => d.A > 80) && " Особенно выделяются результаты по " + radarData.filter(d => d.A > 80).map(d => d.subject).join(", ") + "."}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Для дальнейшего развития рекомендуем поддерживать текущий уровень и углублять знания в смежных областях.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Зоны роста</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Обратите внимание на компетенции, где результат ниже целевого уровня.
                      {gapData.some(d => d.gap < 0) && " Наибольший разрыв наблюдается в: " + gapData.filter(d => d.gap < 0).sort((a, b) => a.gap - b.gap).slice(0, 2).map(d => d.name).join(", ") + "."}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Рекомендуем изучить дополнительные материалы по этим темам и пройти тестирование повторно.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Competency Breakdown */}
        {result.competencyScores && result.competencyScores.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Детальная статистика
              </CardTitle>
              <CardDescription>
                Подробные результаты по каждой оцениваемой компетенции
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.competencyScores.map((competency, index) => (
                <div key={competency.competencyId}>
                  {index > 0 && <Separator className="my-4" />}
                  <CompetencyScoreCard competency={competency} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1 text-muted-foreground">
        {icon}
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Competency score card
function CompetencyScoreCard({ competency }: { competency: { 
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
  const isGood = percentage >= 70;
  const isAverage = percentage >= 50 && percentage < 70;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-medium">{competency.competencyName}</h4>
          {competency.competencyCategory && (
            <Badge variant="outline" className="mt-1 text-xs">
              {competency.competencyCategory}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${
            isGood ? 'text-green-600 dark:text-green-400' : 
            isAverage ? 'text-amber-600 dark:text-amber-400' : 
            'text-red-600 dark:text-red-400'
          }`}>
            {percentage}%
          </span>
          <p className="text-xs text-muted-foreground">
            {competency.score} / {competency.maxScore} баллов
          </p>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${
          isGood ? '[&>div]:bg-green-500' : 
          isAverage ? '[&>div]:bg-amber-500' : 
          '[&>div]:bg-red-500'
        }`}
      />

      {/* Indicator breakdown if available */}
      {competency.indicatorScores && competency.indicatorScores.length > 0 && (
        <div className="mt-3 pl-4 space-y-2">
          {competency.indicatorScores.map(indicator => (
            <div key={indicator.indicatorId} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate mr-4">
                {indicator.indicatorTitle}
              </span>
              <span className={`font-medium ${
                indicator.percentage >= 70 ? 'text-green-600' :
                indicator.percentage >= 50 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {Math.round(indicator.percentage)}%
              </span>
            </div>
          ))}
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
      <div className="container max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <Skeleton className="h-16 w-32 mx-auto mb-2" />
              <Skeleton className="h-6 w-24 mx-auto" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 pt-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </CardFooter>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="min-h-[300px] flex items-center justify-center">
              <Skeleton className="h-64 w-64 rounded-full" />
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
