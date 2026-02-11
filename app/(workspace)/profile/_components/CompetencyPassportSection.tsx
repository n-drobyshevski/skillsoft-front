'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Target, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BIG_FIVE_INFO, type BigFiveProfile } from '@/hooks/useBigFiveProjection';
import type { CompetencyPassport, TopCompetency } from '@/types/profile';
import { cn } from '@/lib/utils';

// Dynamic import for chart to reduce initial bundle
const BigFiveRadarChart = dynamic(
  () => import('./BigFiveChart').then((mod) => mod.BigFiveChart),
  {
    loading: () => <Skeleton className="h-[280px] w-full" />,
    ssr: false,
  }
);

interface CompetencyPassportSectionProps {
  passport: CompetencyPassport;
}

/**
 * Competency Passport Section
 *
 * Displays Big Five personality profile and top competencies.
 */
export function CompetencyPassportSection({ passport }: CompetencyPassportSectionProps) {
  // Empty state
  if (passport.totalAssessmentsUsed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Паспорт компетенций
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Паспорт пока недоступен</h3>
            <p className="text-muted-foreground">
              Пройдите несколько тестов, чтобы сформировать ваш профиль компетенций
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Паспорт компетенций
            </CardTitle>
            <CardDescription className="mt-1">
              На основе {passport.totalAssessmentsUsed} оценок
            </CardDescription>
          </div>
          <ConfidenceBadge confidence={passport.confidence} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bigfive" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bigfive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Big Five профиль</span>
              <span className="sm:hidden">Big Five</span>
            </TabsTrigger>
            <TabsTrigger value="competencies" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Топ компетенции</span>
              <span className="sm:hidden">Топ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bigfive" className="space-y-4">
            <BigFiveProfileView profile={passport.bigFiveProfile} />
          </TabsContent>

          <TabsContent value="competencies" className="space-y-4">
            <TopCompetenciesView competencies={passport.topCompetencies} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ConfidenceBadge({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const config = {
    low: {
      label: 'Низкая достоверность',
      className: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    },
    medium: {
      label: 'Средняя достоверность',
      className: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    },
    high: {
      label: 'Высокая достоверность',
      className: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
    },
  };

  // eslint-disable-next-line security/detect-object-injection
  const { label, className } = config[confidence];

  return (
    <Badge className={cn('text-xs', className)}>
      <Info className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

function BigFiveProfileView({ profile }: { profile: BigFiveProfile }) {
  const traits = Object.keys(profile) as Array<keyof BigFiveProfile>;

  return (
    <div className="space-y-4">
      {/* Radar Chart */}
      <div className="h-[280px] sm:h-[320px]">
        <BigFiveRadarChart profile={profile} />
      </div>

      {/* Trait descriptions */}
      <div className="grid grid-cols-1 gap-2">
        {traits.map((trait) => {
          // eslint-disable-next-line security/detect-object-injection
          const info = BIG_FIVE_INFO[trait];
          // eslint-disable-next-line security/detect-object-injection
          const score = profile[trait];

          return (
            <div
              key={trait}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{info.short}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {info.description}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {/* Score bar */}
                <div className="h-2 w-16 sm:w-24 bg-muted rounded-full overflow-hidden hidden sm:block">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      score >= 70
                        ? 'bg-emerald-500'
                        : score >= 40
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums w-10 text-right',
                    score >= 70
                      ? 'text-emerald-600'
                      : score >= 40
                        ? 'text-blue-600'
                        : 'text-amber-600'
                  )}
                >
                  {score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopCompetenciesView({ competencies }: { competencies: TopCompetency[] }) {
  if (competencies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Недостаточно данных для отображения топ компетенций
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {competencies.map((competency, index) => (
        <div
          key={competency.competencyId}
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-muted/50"
        >
          {/* Rank */}
          <div
            className={cn(
              'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
              index === 0 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              index === 1 && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
              index === 2 && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
              index > 2 && 'bg-muted text-muted-foreground'
            )}
          >
            {index + 1}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{competency.competencyName}</div>
            <div className="text-xs text-muted-foreground">
              {competency.category} · {competency.assessmentCount} оценок
            </div>
          </div>

          {/* Score + Trend */}
          <div className="flex items-center gap-2 shrink-0">
            <TrendIndicator trend={competency.trend} />
            <div className="text-right">
              <div className="font-bold tabular-nums">{competency.averageScore}%</div>
              {/* Score bar */}
              <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden mt-1 hidden sm:block">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    competency.averageScore >= 80
                      ? 'bg-emerald-500'
                      : competency.averageScore >= 60
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                  )}
                  style={{ width: `${competency.averageScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const config = {
    up: { icon: TrendingUp, className: 'text-emerald-500' },
    down: { icon: TrendingDown, className: 'text-red-500' },
    stable: { icon: Minus, className: 'text-muted-foreground' },
  };

  // eslint-disable-next-line security/detect-object-injection
  const { icon: Icon, className } = config[trend];
  return <Icon className={cn('h-4 w-4', className)} />;
}
