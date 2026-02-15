'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, Info, CheckCircle, XCircle } from 'lucide-react';
import type { CompetencyPassport as DomainPassport } from '@/types/domain';
import type { BigFiveProfile } from '@/hooks/useBigFiveProjection';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { LazyBigFiveChart as BigFiveRadarChart } from '@/lib/lazy-charts';

interface AdminPassportSectionProps {
  passport: DomainPassport | null;
  userName?: string;
}

/**
 * Transform backend BigFiveProfileScores to frontend BigFiveProfile format.
 * Backend uses lowercase (openness), frontend chart expects uppercase (OPENNESS).
 */
function transformBigFiveProfile(profile?: {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
}): BigFiveProfile | null {
  if (!profile) return null;

  return {
    OPENNESS: profile.openness,
    CONSCIENTIOUSNESS: profile.conscientiousness,
    EXTRAVERSION: profile.extraversion,
    AGREEABLENESS: profile.agreeableness,
    EMOTIONAL_STABILITY: profile.emotionalStability,
  };
}

/**
 * Get top competencies from passport scores.
 * Returns up to 5 highest scoring competencies.
 */
function getTopCompetencies(scores: Record<string, number>, limit = 5): Array<{
  id: string;
  score: number;
}> {
  return Object.entries(scores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Big Five trait labels in Russian
 */
const BIG_FIVE_INFO: Record<keyof BigFiveProfile, { short: string; description: string }> = {
  OPENNESS: { short: 'Открытость', description: 'Креативность и любознательность' },
  CONSCIENTIOUSNESS: { short: 'Добросовестность', description: 'Организованность и дисциплина' },
  EXTRAVERSION: { short: 'Экстраверсия', description: 'Общительность и энергичность' },
  AGREEABLENESS: { short: 'Доброжелательность', description: 'Сотрудничество и эмпатия' },
  EMOTIONAL_STABILITY: { short: 'Эмоц. стабильность', description: 'Устойчивость и спокойствие' },
};

/**
 * Admin Passport Section
 *
 * Displays a user's competency passport with Big Five personality profile.
 * Read-only view for administrators to inspect user profiles.
 */
export function AdminPassportSection({ passport, userName }: AdminPassportSectionProps) {
  const t = useTranslations('users.profile');

  // Empty state - no passport exists
  if (!passport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            {t('sections.competencyPassport')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('passport.empty')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t('passport.emptyDesc', { name: userName || t('passport.thisUser') })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bigFiveProfile = transformBigFiveProfile(passport.bigFiveProfile);
  const topCompetencies = getTopCompetencies(passport.scores);
  const competencyCount = Object.keys(passport.scores).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              {t('sections.competencyPassport')}
            </CardTitle>
            <CardDescription className="mt-1">
              {competencyCount} {t('passport.competenciesAssessed')}
            </CardDescription>
          </div>
          <PassportStatusBadge isValid={passport.isValid} expiresAt={passport.expiresAt} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bigfive" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bigfive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">{t('passport.bigFiveProfile')}</span>
              <span className="sm:hidden">Big Five</span>
            </TabsTrigger>
            <TabsTrigger value="competencies" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">{t('passport.topCompetencies')}</span>
              <span className="sm:hidden">{t('passport.top')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bigfive" className="space-y-4">
            {bigFiveProfile ? (
              <BigFiveProfileView profile={bigFiveProfile} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('passport.noBigFive')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="competencies" className="space-y-4">
            <TopCompetenciesView competencies={topCompetencies} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function PassportStatusBadge({ isValid, expiresAt }: { isValid: boolean; expiresAt?: string }) {
  const t = useTranslations('users.profile.passport');

  if (!isValid) {
    return (
      <Badge className="text-xs text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30">
        <XCircle className="h-3 w-3 mr-1" />
        {t('expired')}
      </Badge>
    );
  }

  // Check if expiring soon (within 30 days)
  if (expiresAt) {
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return (
        <Badge className="text-xs text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30">
          <Info className="h-3 w-3 mr-1" />
          {t('expiringSoon', { days: daysUntilExpiry })}
        </Badge>
      );
    }
  }

  return (
    <Badge className="text-xs text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30">
      <CheckCircle className="h-3 w-3 mr-1" />
      {t('valid')}
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
          const info = BIG_FIVE_INFO[trait];
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

function TopCompetenciesView({ competencies }: { competencies: Array<{ id: string; score: number }> }) {
  const t = useTranslations('users.profile.passport');

  if (competencies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noCompetencies')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {competencies.map((competency, index) => (
        <div
          key={competency.id}
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

          {/* Competency ID (truncated for display) */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate" title={competency.id}>
              {competency.id.length > 20 ? `${competency.id.slice(0, 8)}...` : competency.id}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="font-bold tabular-nums">{Math.round(competency.score)}%</div>
              {/* Score bar */}
              <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden mt-1 hidden sm:block">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    competency.score >= 80
                      ? 'bg-emerald-500'
                      : competency.score >= 60
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                  )}
                  style={{ width: `${competency.score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminPassportSection;
