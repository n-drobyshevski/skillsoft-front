'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Users,
  ClipboardList,
  LayoutGrid,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  JobFitHeroProps,
  TeamFitHeroProps,
  CompetencyPassportHeroProps,
} from './types';

// ============================================================================
// Shared Class Constants
// ============================================================================

const MOBILE_ICON_WRAPPER = 'rounded-xl p-2.5 shrink-0';
const DESKTOP_ICON_WRAPPER = 'rounded-xl p-3 shrink-0';
const MOBILE_TITLE = 'text-lg font-bold';
const DESKTOP_TITLE = 'text-xl font-bold';

// ============================================================================
// Shared Utilities
// ============================================================================

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number, locale: string): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const h = locale === 'ru' ? 'ч' : 'h';
  const m = locale === 'ru' ? 'м' : 'm';
  const s = locale === 'ru' ? 'с' : 's';

  if (hours > 0) return `${hours}${h} ${mins}${m}`;
  if (mins > 0) return `${mins}${m} ${secs}${s}`;
  return `${secs}${s}`;
}

/**
 * Format date to localized string
 */
function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// Hero Color Variants
// ============================================================================

type HeroVariant = 'success' | 'warning' | 'info' | 'neutral';

const VARIANT_STYLES = {
  success: {
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bg: 'bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    progressTrack: 'bg-emerald-100 dark:bg-emerald-900/30',
    progressFill: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500 hover:bg-emerald-600',
    titleText: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800/50',
    bg: 'bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    progressTrack: 'bg-amber-100 dark:bg-amber-900/30',
    progressFill: 'bg-amber-500',
    badgeBg: 'bg-amber-500 hover:bg-amber-600',
    titleText: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800/50',
    bg: 'bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    progressTrack: 'bg-blue-100 dark:bg-blue-900/30',
    progressFill: 'bg-blue-500',
    badgeBg: 'bg-blue-500 hover:bg-blue-600',
    titleText: 'text-blue-700 dark:text-blue-300',
  },
  neutral: {
    border: 'border-border',
    bg: 'bg-gradient-to-br from-muted/30 to-transparent',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    ring: 'ring-primary/20',
    progressTrack: 'bg-muted',
    progressFill: 'bg-primary',
    badgeBg: 'bg-primary hover:bg-primary/90',
    titleText: 'text-foreground',
  },
} as const;

// ============================================================================
// Metric Pill Component - Mobile optimized inline stat
// ============================================================================

interface MetricPillProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
}

function MetricPill({ icon: Icon, label, value, subValue }: MetricPillProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold tabular-nums truncate">
          {value}
          {subValue && <span className="text-muted-foreground font-normal text-xs ml-0.5">{subValue}</span>}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{label}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Circular Score Component
// ============================================================================

interface CircularScoreProps {
  percentage: number;
  variant: HeroVariant;
  size?: 'sm' | 'md' | 'lg';
}

function CircularScore({ percentage, variant, size = 'md' }: CircularScoreProps) {
  const styles = VARIANT_STYLES[variant];
  const sizes = {
    sm: { outer: 80, inner: 64, stroke: 4, text: 'text-lg' },
    md: { outer: 100, inner: 80, stroke: 5, text: 'text-2xl' },
    lg: { outer: 120, inner: 96, stroke: 6, text: 'text-3xl' },
  };
  const s = sizes[size];
  const radius = s.inner / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative" style={{ width: s.outer, height: s.outer }}>
      <svg
        className="transform -rotate-90"
        width={s.outer}
        height={s.outer}
        viewBox={`0 0 ${s.outer} ${s.outer}`}
      >
        {/* Background circle */}
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-1000 ease-out',
            styles.iconText
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold tabular-nums', s.text, styles.iconText)}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Base Hero Card Wrapper
// ============================================================================

interface HeroCardWrapperProps {
  variant: HeroVariant;
  children: React.ReactNode;
  className?: string;
}

function HeroCardWrapper({ variant, children, className }: HeroCardWrapperProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all',
      styles.border,
      styles.bg,
      className
    )}>
      {/* Subtle top accent line */}
      <div className={cn(
        'absolute top-0 inset-x-0 h-1',
        variant === 'success' && 'bg-linear-to-r from-emerald-500 via-emerald-400 to-transparent',
        variant === 'warning' && 'bg-linear-to-r from-amber-500 via-amber-400 to-transparent',
        variant === 'info' && 'bg-linear-to-r from-blue-500 via-blue-400 to-transparent',
        variant === 'neutral' && 'bg-linear-to-r from-primary via-primary/60 to-transparent'
      )} />
      {children}
    </Card>
  );
}

// ============================================================================
// JOB FIT HERO - Scenario B
// ============================================================================

export function JobFitHero({
  templateName,
  completedAt,
  overallPercentage,
  passed,
  onetSocCode,
  questionsAnswered,
  totalQuestions,
  timeSpent,
  percentile,
}: JobFitHeroProps) {
  const t = useTranslations('template.heroCard');
  const tMetrics = useTranslations('template.heroCard.metrics');
  const locale = useLocale();
  const variant: HeroVariant = passed ? 'success' : 'warning';
  const styles = VARIANT_STYLES[variant];
  const score = Math.round(overallPercentage);

  return (
    <HeroCardWrapper variant={variant}>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout: Stacked */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Header Row */}
          <div className="flex items-start gap-3">
            <div className={cn(MOBILE_ICON_WRAPPER, styles.iconBg)}>
              {passed ? (
                <Trophy className={cn('h-6 w-6', styles.iconText)} />
              ) : (
                <Target className={cn('h-6 w-6', styles.iconText)} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={cn(MOBILE_TITLE, styles.titleText)}>
                {passed ? t('jobFit.qualified') : t('jobFit.keepGrowing')}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{templateName}</p>
              {onetSocCode && (
                <div className="flex items-center gap-1 mt-1">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('jobFit.onet')}: {onetSocCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score + Badge */}
          <div className="flex items-center justify-between">
            <CircularScore percentage={score} variant={variant} size="sm" />
            <Badge className={cn('text-xs', styles.badgeBg)}>
              {passed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('jobFit.matches')}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('jobFit.doesNotMatch')}
                </>
              )}
            </Badge>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <MetricPill icon={Clock} label={tMetrics('time')} value={formatDuration(timeSpent, locale)} />
            <MetricPill icon={CheckCircle2} label={tMetrics('questions')} value={questionsAnswered} subValue={`/${totalQuestions}`} />
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(completedAt, locale)}
          </div>
        </div>

        {/* Desktop Layout: Horizontal */}
        <div className="hidden sm:flex items-center gap-6">
          {/* Icon + Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(DESKTOP_ICON_WRAPPER, styles.iconBg)}>
              {passed ? (
                <Trophy className={cn('h-8 w-8', styles.iconText)} />
              ) : (
                <Target className={cn('h-8 w-8', styles.iconText)} />
              )}
            </div>
            <div className="min-w-0">
              <h2 className={cn(DESKTOP_TITLE, styles.titleText)}>
                {passed ? t('jobFit.qualified') : t('jobFit.keepGrowing')}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{templateName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {onetSocCode && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {t('jobFit.onet')}: {onetSocCode}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(completedAt, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Score Circle */}
          <CircularScore percentage={score} variant={variant} size="lg" />

          {/* Badge + Stats */}
          <div className="flex flex-col items-end gap-3">
            <Badge className={cn('text-xs', styles.badgeBg)}>
              {passed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('jobFit.matches')}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('jobFit.doesNotMatch')}
                </>
              )}
            </Badge>
            <div className="flex gap-2">
              <MetricPill icon={Clock} label={tMetrics('time')} value={formatDuration(timeSpent, locale)} />
              <MetricPill icon={CheckCircle2} label={tMetrics('answers')} value={questionsAnswered} subValue={`/${totalQuestions}`} />
              {percentile !== undefined && (
                <MetricPill icon={TrendingUp} label={tMetrics('percentile')} value={`${percentile}th`} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </HeroCardWrapper>
  );
}

// ============================================================================
// TEAM FIT HERO - Scenario C
// ============================================================================

export function TeamFitHero({
  templateName,
  completedAt,
  overallPercentage,
  passed,
  teamId,
  questionsAnswered,
  totalQuestions,
  timeSpent,
}: TeamFitHeroProps) {
  const t = useTranslations('template.heroCard');
  const tMetrics = useTranslations('template.heroCard.metrics');
  const locale = useLocale();
  const variant: HeroVariant = passed ? 'info' : 'neutral';
  const styles = VARIANT_STYLES[variant];
  const score = Math.round(overallPercentage);

  return (
    <HeroCardWrapper variant={variant}>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Header Row */}
          <div className="flex items-start gap-3">
            <div className={cn(MOBILE_ICON_WRAPPER, styles.iconBg)}>
              <Users className={cn('h-6 w-6', styles.iconText)} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={cn(MOBILE_TITLE, styles.titleText)}>
                {passed ? t('teamFit.greatFit') : t('teamFit.needsAdaptation')}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{templateName}</p>
              {teamId && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('teamFit.team')}: {teamId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score + Badge */}
          <div className="flex items-center justify-between">
            <CircularScore percentage={score} variant={variant} size="sm" />
            <Badge className={cn('text-xs', styles.badgeBg)}>
              {passed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('teamFit.fits')}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('teamFit.adaptation')}
                </>
              )}
            </Badge>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <MetricPill icon={Clock} label={tMetrics('time')} value={formatDuration(timeSpent, locale)} />
            <MetricPill icon={CheckCircle2} label={tMetrics('questions')} value={questionsAnswered} subValue={`/${totalQuestions}`} />
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(completedAt, locale)}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-6">
          {/* Icon + Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(DESKTOP_ICON_WRAPPER, styles.iconBg)}>
              <Users className={cn('h-8 w-8', styles.iconText)} />
            </div>
            <div className="min-w-0">
              <h2 className={cn(DESKTOP_TITLE, styles.titleText)}>
                {passed ? t('teamFit.greatFit') : t('teamFit.needsAdaptation')}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{templateName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {teamId && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {t('teamFit.team')}: {teamId}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(completedAt, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Score Circle */}
          <CircularScore percentage={score} variant={variant} size="lg" />

          {/* Badge + Stats */}
          <div className="flex flex-col items-end gap-3">
            <Badge className={cn('text-xs', styles.badgeBg)}>
              {passed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('teamFit.fits')}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('teamFit.adaptation')}
                </>
              )}
            </Badge>
            <div className="flex gap-2">
              <MetricPill icon={Clock} label={tMetrics('time')} value={formatDuration(timeSpent, locale)} />
              <MetricPill icon={CheckCircle2} label={tMetrics('answers')} value={questionsAnswered} subValue={`/${totalQuestions}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </HeroCardWrapper>
  );
}

// ============================================================================
// COMPETENCY PASSPORT HERO - Scenario A (No Score)
// ============================================================================

export function CompetencyPassportHero({
  templateName,
  completedAt,
  questionsAnswered,
  totalQuestions,
  timeSpent,
  competencyCount,
}: CompetencyPassportHeroProps) {
  const t = useTranslations('template.heroCard');
  const tMetrics = useTranslations('template.heroCard.metrics');
  const locale = useLocale();
  const variant: HeroVariant = 'neutral';
  const styles = VARIANT_STYLES[variant];

  return (
    <HeroCardWrapper variant={variant}>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Header Row */}
          <div className="flex items-start gap-3">
            <div className={cn(MOBILE_ICON_WRAPPER, styles.iconBg)}>
              <ClipboardList className={cn('h-6 w-6', styles.iconText)} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={cn(MOBILE_TITLE, styles.titleText)}>
                {t('competencyPassport.yourProfile')}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{templateName}</p>
            </div>
          </div>

          {/* Competency Count Badge */}
          <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
            <LayoutGrid className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-bold text-primary">{competencyCount}</span>
            <span className="text-sm text-muted-foreground ml-1.5">{t('competencyPassport.competencies')}</span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <MetricPill icon={Clock} label={tMetrics('time')} value={formatDuration(timeSpent, locale)} />
            <MetricPill icon={CheckCircle2} label={tMetrics('questions')} value={questionsAnswered} subValue={`/${totalQuestions}`} />
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(completedAt, locale)}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-6">
          {/* Icon + Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(DESKTOP_ICON_WRAPPER, styles.iconBg)}>
              <ClipboardList className={cn('h-8 w-8', styles.iconText)} />
            </div>
            <div className="min-w-0">
              <h2 className={cn(DESKTOP_TITLE, styles.titleText)}>
                {t('competencyPassport.yourProfile')}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{templateName}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(completedAt, locale)}
              </div>
            </div>
          </div>

          {/* Stats Row - All cards same height */}
          <div className="flex items-stretch gap-2">
            {/* Competency Count */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 min-w-0">
              <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tabular-nums text-primary truncate">
                  {competencyCount}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{t('competencyPassport.competencies')}</span>
              </div>
            </div>
            <MetricPill icon={Clock} label={tMetrics('time')} value={formatDuration(timeSpent, locale)} />
            <MetricPill icon={CheckCircle2} label={tMetrics('answers')} value={questionsAnswered} subValue={`/${totalQuestions}`} />
          </div>
        </div>
      </CardContent>
    </HeroCardWrapper>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { type HeroVariant, VARIANT_STYLES };
