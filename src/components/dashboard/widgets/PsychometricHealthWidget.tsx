'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  FileWarning,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { PsychometricSummary } from '@/types/dashboard';
import { useTranslations } from 'next-intl';

// ============================================
// TYPES & PROPS
// ============================================

export interface PsychometricHealthWidgetProps {
  data: PsychometricSummary | null;
  loading?: boolean;
  onTriggerAudit?: () => void;
  auditInProgress?: boolean;
  className?: string;
}

type ScoreLevel = 'excellent' | 'good' | 'needsAttention' | 'critical';

interface ScoreColors {
  gradient: string;
  text: string;
  stroke: string;
  bg: string;
  labelKey: ScoreLevel;
}

// ============================================
// SCORE COLOR MAPPING
// ============================================

function getScoreColors(score: number): ScoreColors {
  if (score >= 80) {
    return {
      gradient: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      stroke: 'stroke-emerald-500',
      bg: 'bg-emerald-500',
      labelKey: 'excellent',
    };
  }
  if (score >= 60) {
    return {
      gradient: 'from-amber-500 to-amber-600',
      text: 'text-amber-600 dark:text-amber-400',
      stroke: 'stroke-amber-500',
      bg: 'bg-amber-500',
      labelKey: 'good',
    };
  }
  if (score >= 40) {
    return {
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      stroke: 'stroke-orange-500',
      bg: 'bg-orange-500',
      labelKey: 'needsAttention',
    };
  }
  return {
    gradient: 'from-red-500 to-red-600',
    text: 'text-red-600 dark:text-red-400',
    stroke: 'stroke-red-500',
    bg: 'bg-red-500',
    labelKey: 'critical',
  };
}

// ============================================
// GAUGE COMPONENTS
// ============================================

/**
 * Circular gauge with gradient arc track, center score, and label.
 * Uses SVG linearGradient for the progress arc.
 */
function GaugeSVG({
  value,
  size,
  strokeWidth,
  colors,
  label,
}: {
  value: number;
  size: number;
  strokeWidth: number;
  colors: ScoreColors;
  label: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted/30"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={colors.stroke}
          {...(prefersReducedMotion
            ? { strokeDashoffset: offset }
            : {
                initial: { strokeDashoffset: circumference },
                animate: { strokeDashoffset: offset },
                transition: { duration: 0.8, ease: 'easeOut', delay: 0.15 },
              })}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('font-bold tabular-nums', size <= 110 ? 'text-2xl' : 'text-3xl', colors.text)}
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, scale: 0.85 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.35, delay: 0.25 },
              })}
        >
          {value}
        </motion.span>
        <span className="text-[10px] text-muted-foreground mt-0.5">/100</span>
      </div>
    </div>
  );
}

/**
 * Compact horizontal health bar for mobile.
 */
function CompactHealthBar({
  value,
  colors,
  label,
}: {
  value: number;
  colors: ScoreColors;
  label: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="flex items-center gap-3 w-full"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={cn(
          'flex-shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center',
          'bg-gradient-to-br shadow-sm',
          colors.gradient,
        )}
        {...(prefersReducedMotion
          ? {}
          : {
              initial: { scale: 0.85, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { duration: 0.35, delay: 0.15 },
            })}
      >
        <span className="text-xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-[8px] text-white/80 -mt-0.5">/100</span>
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', colors.bg)}
            {...(prefersReducedMotion
              ? { style: { width: `${value}%` } }
              : {
                  initial: { width: 0 },
                  animate: { width: `${value}%` },
                  transition: { duration: 0.6, ease: 'easeOut', delay: 0.25 },
                })}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// METRIC ROW
// ============================================

type MetricVariant = 'default' | 'success' | 'warning' | 'info';

const VARIANT_STYLES: Record<MetricVariant, string> = {
  default: 'text-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
};

function MetricItem({
  label,
  value,
  icon: Icon,
  variant = 'default',
  tooltip,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant?: MetricVariant;
  tooltip?: string;
}) {
  const content = (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className={cn('text-sm font-semibold tabular-nums leading-snug mt-0.5', VARIANT_STYLES[variant])}>
          {value}
        </p>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-[200px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ============================================
// SCORE BREAKDOWN
// ============================================

function ScoreBreakdownBar({
  activeRatio,
  reliableRatio,
  nonFlaggedRatio,
  t,
}: {
  activeRatio: number;
  reliableRatio: number;
  nonFlaggedRatio: number;
  t: ReturnType<typeof useTranslations<'dashboard'>>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const segments = [
    { ratio: activeRatio, weight: 40, color: 'bg-emerald-500', label: t('active'), pct: Math.round(activeRatio * 100) },
    { ratio: reliableRatio, weight: 30, color: 'bg-blue-500', label: t('reliable'), pct: Math.round(reliableRatio * 100) },
    { ratio: nonFlaggedRatio, weight: 30, color: 'bg-amber-500', label: t('nonFlagged'), pct: Math.round(nonFlaggedRatio * 100) },
  ];

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-muted-foreground">{t('scoreBreakdown')}</span>

      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden flex gap-px">
        {segments.map((s, i) => (
          <motion.div
            key={i}
            className={cn('h-full first:rounded-l-full last:rounded-r-full', s.color)}
            {...(prefersReducedMotion
              ? { style: { width: `${s.ratio * s.weight}%` } }
              : {
                  initial: { width: 0 },
                  animate: { width: `${s.ratio * s.weight}%` },
                  transition: { duration: 0.5, delay: 0.3 + i * 0.08 },
                })}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px]">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={cn('w-1.5 h-1.5 rounded-full', s.color)} />
            <span className="text-muted-foreground">
              {s.label} {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TOP FLAGGED ITEMS PREVIEW
// ============================================

function FlaggedItemsPreview({
  items,
  t,
}: {
  items: PsychometricSummary['topFlaggedItems'];
  t: ReturnType<typeof useTranslations<'dashboard'>>;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-muted-foreground">{t('topIssues')}</span>
      <div className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.questionId}
            className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-800/30"
          >
            <FileWarning className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium leading-tight truncate">
                {item.competencyName ?? item.indicatorTitle ?? 'Unknown'}
              </p>
              {item.questionText && (
                <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
                  {item.questionText}
                </p>
              )}
            </div>
            {item.discriminationIndex !== null && (
              <span className="text-[10px] font-mono tabular-nums text-amber-600 dark:text-amber-400 shrink-0">
                d={item.discriminationIndex.toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// AUDIT BANNER
// ============================================

function AuditBanner({
  onTriggerAudit,
  auditInProgress,
  t,
}: {
  onTriggerAudit?: () => void;
  auditInProgress?: boolean;
  t: ReturnType<typeof useTranslations<'dashboard'>>;
}) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-amber-200/70 bg-amber-50/40 dark:border-amber-800/50 dark:bg-amber-950/15">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="text-xs min-w-0">
          <span className="font-medium text-amber-700 dark:text-amber-300">
            {t('auditRecommended')}
          </span>
          <p className="text-amber-600/70 dark:text-amber-400/70 truncate">
            {t('lastRunOverWeek')}
          </p>
        </div>
      </div>
      {onTriggerAudit && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40 shrink-0 min-h-[44px] sm:min-h-0"
          onClick={onTriggerAudit}
          disabled={auditInProgress}
        >
          <RefreshCw
            className={cn('w-3 h-3 mr-1', auditInProgress && 'animate-spin')}
          />
          {t('run')}
        </Button>
      )}
    </div>
  );
}

// ============================================
// HELPER: Format last audit date
// ============================================

function formatLastAudit(
  dateStr: string | null,
  t: ReturnType<typeof useTranslations<'dashboard'>>,
): string {
  if (!dateStr) return t('never');
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return t('today');
  return t('daysAgo', { count: days });
}

// ============================================
// MAIN WIDGET
// ============================================

export function PsychometricHealthWidget({
  data,
  loading = false,
  onTriggerAudit,
  auditInProgress = false,
  className,
}: PsychometricHealthWidgetProps) {
  const t = useTranslations('dashboard');

  const metrics = useMemo(() => {
    if (!data) return null;

    const reliableCount = data.reliableCompetencies;
    const flaggedCount = data.flaggedItems;
    const alpha = data.averageAlpha ?? null;
    const lastAudit = formatLastAudit(data.lastAuditRun, t);

    // Score breakdown ratios for the weighted bar
    // These approximate the score formula in calculateHealthScore:
    // active=40%, reliable=30%, nonFlagged=20%, discrimination=10%
    const activeRatio = Math.max(0, Math.min(1, (data.healthScore / 100) * 1.1));
    const reliableRatio = reliableCount > 0 ? Math.min(1, reliableCount / (reliableCount + 3)) : 0;
    const nonFlaggedRatio = flaggedCount === 0 ? 1 : Math.max(0, 1 - flaggedCount / (flaggedCount + reliableCount * 3));

    return {
      reliableCount,
      flaggedCount,
      alpha,
      lastAudit,
      activeRatio,
      reliableRatio,
      nonFlaggedRatio,
    };
  }, [data, t]);

  if (loading) {
    return <PsychometricHealthWidgetSkeleton className={className} />;
  }

  // Empty state
  if (!data) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-base">{t('psychometricHealth')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">{t('noPsychometricData')}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{t('runFirstAudit')}</p>
          {onTriggerAudit && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 min-h-[44px] sm:min-h-0"
              onClick={onTriggerAudit}
              disabled={auditInProgress}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', auditInProgress && 'animate-spin')} />
              {t('runAudit')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const colors = getScoreColors(data.healthScore);
  const ariaLabel = `${t('psychometricHealth')}: ${data.healthScore}/100`;

  return (
    <Card className={cn('overflow-hidden hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none', className)}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{t('psychometricHealth')}</CardTitle>
            <Badge
              variant="outline"
              className={cn('mt-0.5 text-[10px] px-1.5 py-0 border-current', colors.text)}
            >
              {t(colors.labelKey)}
            </Badge>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 min-h-[44px] sm:min-h-0">
          <Link href="/psychometrics">
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">{t('viewAnalytics')}</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── MOBILE LAYOUT ── */}
        <div className="md:hidden space-y-3">
          <CompactHealthBar value={data.healthScore} colors={colors} label={ariaLabel} />

          {metrics && (
            <div className="grid grid-cols-2 gap-1.5">
              <MetricItem
                label={t('reliableCompetencies')}
                value={metrics.reliableCount}
                icon={CheckCircle2}
                variant="success"
              />
              <MetricItem
                label={t('flaggedItems')}
                value={metrics.flaggedCount}
                icon={FileWarning}
                variant={metrics.flaggedCount > 0 ? 'warning' : 'success'}
              />
              <MetricItem
                label={t('cronbachAlpha')}
                value={metrics.alpha != null ? metrics.alpha.toFixed(2) : '—'}
                icon={ShieldCheck}
                variant={metrics.alpha != null && metrics.alpha >= 0.7 ? 'success' : metrics.alpha != null && metrics.alpha >= 0.5 ? 'warning' : 'default'}
              />
              <MetricItem
                label={t('lastAudit')}
                value={metrics.lastAudit}
                icon={Clock}
              />
            </div>
          )}
        </div>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden md:flex items-start gap-5">
          {/* Gauge */}
          <div className="shrink-0">
            <GaugeSVG value={data.healthScore} size={130} strokeWidth={9} colors={colors} label={ariaLabel} />
          </div>

          {/* Metrics grid */}
          {metrics && (
            <div className="flex-1 grid grid-cols-2 gap-2 w-full">
              <MetricItem
                label={t('reliableCompetencies')}
                value={metrics.reliableCount}
                icon={CheckCircle2}
                variant="success"
                tooltip="Competencies with Cronbach's α ≥ 0.7"
              />
              <MetricItem
                label={t('flaggedItems')}
                value={metrics.flaggedCount}
                icon={FileWarning}
                variant={metrics.flaggedCount > 0 ? 'warning' : 'success'}
                tooltip="Items with poor discrimination or extreme difficulty"
              />
              <MetricItem
                label={t('cronbachAlpha')}
                value={metrics.alpha != null ? metrics.alpha.toFixed(2) : '—'}
                icon={ShieldCheck}
                variant={metrics.alpha != null && metrics.alpha >= 0.7 ? 'success' : metrics.alpha != null && metrics.alpha >= 0.5 ? 'warning' : 'default'}
                tooltip="Internal consistency reliability coefficient (≥0.7 is good)"
              />
              <MetricItem
                label={t('lastAudit')}
                value={metrics.lastAudit}
                icon={Clock}
                tooltip={data.lastAuditRun ? new Date(data.lastAuditRun).toLocaleString() : undefined}
              />
            </div>
          )}
        </div>

        {/* Score breakdown bar */}
        {metrics && (
          <ScoreBreakdownBar
            activeRatio={metrics.activeRatio}
            reliableRatio={metrics.reliableRatio}
            nonFlaggedRatio={metrics.nonFlaggedRatio}
            t={t}
          />
        )}

        {/* Top flagged items preview */}
        {data.topFlaggedItems?.length > 0 && (
          <FlaggedItemsPreview items={data.topFlaggedItems} t={t} />
        )}

        {/* Audit banner */}
        {data.auditRecommended && (
          <AuditBanner onTriggerAudit={onTriggerAudit} auditInProgress={auditInProgress} t={t} />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// SKELETON
// ============================================

function PsychometricHealthWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-full shrink-0" />
            <Skeleton className="h-2 flex-1 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[52px] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-start gap-5">
          <Skeleton className="w-[130px] h-[130px] rounded-full shrink-0" />
          <div className="grid grid-cols-2 gap-2 flex-1 w-full">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[52px] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-2.5 w-14" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
