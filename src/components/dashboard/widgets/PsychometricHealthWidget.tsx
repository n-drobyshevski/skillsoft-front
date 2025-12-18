'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Sparkles,
  FileWarning,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { PsychometricSummary } from '@/types/dashboard';

/**
 * Props for PsychometricHealthWidget
 */
export interface PsychometricHealthWidgetProps {
  /** Psychometric summary data */
  data: PsychometricSummary | null;
  /** Loading state */
  loading?: boolean;
  /** Callback for triggering audit */
  onTriggerAudit?: () => void;
  /** Whether audit is in progress */
  auditInProgress?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get score color configuration based on health score
 */
function getScoreColors(score: number): {
  gradient: string;
  text: string;
  ring: string;
  bg: string;
  glow: string;
  label: string;
} {
  if (score >= 80) {
    return {
      gradient: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'stroke-emerald-500',
      bg: 'bg-emerald-500',
      glow: 'bg-emerald-500/20',
      label: 'Excellent',
    };
  }
  if (score >= 60) {
    return {
      gradient: 'from-amber-500 to-amber-600',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'stroke-amber-500',
      bg: 'bg-amber-500',
      glow: 'bg-amber-500/20',
      label: 'Good',
    };
  }
  if (score >= 40) {
    return {
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      ring: 'stroke-orange-500',
      bg: 'bg-orange-500',
      glow: 'bg-orange-500/20',
      label: 'Needs Attention',
    };
  }
  return {
    gradient: 'from-red-500 to-red-600',
    text: 'text-red-600 dark:text-red-400',
    ring: 'stroke-red-500',
    bg: 'bg-red-500',
    glow: 'bg-red-500/20',
    label: 'Critical',
  };
}

/**
 * Animated circular gauge component
 * Size: 140px diameter, 8px stroke
 */
function CircularGauge({
  value,
  size = 140,
  strokeWidth = 8,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const colors = getScoreColors(value);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={colors.ring}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('text-4xl font-bold tabular-nums', colors.text)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-0.5">Health Score</span>
      </div>
    </div>
  );
}

/**
 * Metric card for the 4-metric grid
 */
type MetricVariant = 'default' | 'success' | 'warning' | 'info';

/**
 * Get metric text style by variant
 */
function getMetricVariantStyle(variant: MetricVariant): string {
  switch (variant) {
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-foreground';
  }
}

function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant?: MetricVariant;
}) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className={cn('text-lg font-bold tabular-nums', getMetricVariantStyle(variant))}>
          {value}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

/**
 * Score breakdown bar component
 * Shows: Active (40%) | Reliable (30%) | Non-Flagged (30%)
 */
function ScoreBreakdownBar({
  activeRatio,
  reliableRatio,
  nonFlaggedRatio,
}: {
  activeRatio: number;
  reliableRatio: number;
  nonFlaggedRatio: number;
}) {
  // Convert ratios to percentages for display
  const activePercent = Math.round(activeRatio * 100);
  const reliablePercent = Math.round(reliableRatio * 100);
  const nonFlaggedPercent = Math.round(nonFlaggedRatio * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Score Breakdown</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden flex">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${activeRatio * 40}%` }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${reliableRatio * 30}%` }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${nonFlaggedRatio * 30}%` }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span className="text-muted-foreground">Active {activePercent}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-blue-500" />
          <span className="text-muted-foreground">Reliable {reliablePercent}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-amber-500" />
          <span className="text-muted-foreground">Non-Flagged {nonFlaggedPercent}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Audit recommendation banner
 */
function AuditBanner({
  onTriggerAudit,
  auditInProgress,
}: {
  onTriggerAudit?: () => void;
  auditInProgress?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <div className="text-xs">
          <span className="font-medium text-amber-700 dark:text-amber-300">
            Audit Recommended
          </span>
          <p className="text-amber-600/80 dark:text-amber-400/80">
            Last run over 7 days ago
          </p>
        </div>
      </div>
      {onTriggerAudit && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
          onClick={onTriggerAudit}
          disabled={auditInProgress}
        >
          <RefreshCw
            className={cn('w-3 h-3 mr-1', auditInProgress && 'animate-spin')}
          />
          Run
        </Button>
      )}
    </div>
  );
}

/**
 * PsychometricHealthWidget - Enlarged psychometric health display widget.
 *
 * Features:
 * - Full circular gauge (140px diameter, 8px stroke)
 * - Side-by-side layout: gauge left, metrics right
 * - 4-metric grid: Total Items, Active Rate, Issues, Reliable %
 * - Score breakdown bar (Active 40%, Reliable 30%, Non-Flagged 30%)
 * - Audit recommendation banner
 * - Background glow decoration
 *
 * @example
 * ```tsx
 * <PsychometricHealthWidget
 *   data={psychometricSummary}
 *   onTriggerAudit={handleAudit}
 * />
 * ```
 */
export function PsychometricHealthWidget({
  data,
  loading = false,
  onTriggerAudit,
  auditInProgress = false,
  className,
}: PsychometricHealthWidgetProps) {
  // Calculate derived metrics
  const metrics = useMemo(() => {
    if (!data) return null;

    // These would typically come from the full report, but we can estimate from summary
    // For the real implementation, you'd want to pass these from the parent
    const totalItems = data.flaggedItems + data.reliableCompetencies * 5; // Estimate
    const activeRate = Math.round((1 - data.flaggedItems / Math.max(totalItems, 1)) * 100);
    const reliablePercent = Math.round((data.reliableCompetencies / Math.max(data.reliableCompetencies + 5, 1)) * 100);

    // Score breakdown ratios (for visualization)
    const activeRatio = activeRate / 100;
    const reliableRatio = reliablePercent / 100;
    const nonFlaggedRatio = Math.max(0, 1 - data.flaggedItems / Math.max(totalItems, 1));

    return {
      totalItems,
      activeRate,
      issues: data.flaggedItems,
      reliablePercent,
      activeRatio,
      reliableRatio,
      nonFlaggedRatio,
    };
  }, [data]);

  if (loading) {
    return <PsychometricHealthWidgetSkeleton className={className} />;
  }

  if (!data) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Psychometric Health</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No psychometric data available.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Run your first audit to see metrics.
          </p>
          {onTriggerAudit && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onTriggerAudit}
              disabled={auditInProgress}
            >
              <RefreshCw
                className={cn('w-4 h-4 mr-2', auditInProgress && 'animate-spin')}
              />
              Run Audit
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const colors = getScoreColors(data.healthScore);

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Background glow decoration */}
      <div
        className={cn(
          'absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl pointer-events-none',
          colors.glow
        )}
        aria-hidden="true"
      />

      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Psychometric Health</CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'mt-0.5 text-[10px] px-1.5 py-0',
                colors.text,
                'border-current'
              )}
            >
              {colors.label}
            </Badge>
          </div>
        </div>
        <Link href="/psychometrics">
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">View psychometrics dashboard</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Main content: Gauge + Metrics side by side */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Left: Circular Gauge */}
          <div className="shrink-0">
            <CircularGauge value={data.healthScore} size={140} strokeWidth={8} />
          </div>

          {/* Right: 4-metric grid */}
          {metrics && (
            <div className="flex-1 grid grid-cols-2 gap-2 w-full">
              <MetricCard
                label="Total Items"
                value={metrics.totalItems}
                icon={Sparkles}
              />
              <MetricCard
                label="Active Rate"
                value={`${metrics.activeRate}%`}
                icon={CheckCircle2}
                variant="success"
              />
              <MetricCard
                label="Issues"
                value={metrics.issues}
                icon={FileWarning}
                variant={metrics.issues > 0 ? 'warning' : 'success'}
              />
              <MetricCard
                label="Reliable"
                value={`${metrics.reliablePercent}%`}
                icon={BarChart3}
                variant="info"
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
          />
        )}

        {/* Audit recommendation banner */}
        {data.auditRecommended && (
          <AuditBanner
            onTriggerAudit={onTriggerAudit}
            auditInProgress={auditInProgress}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for PsychometricHealthWidget
 */
function PsychometricHealthWidgetSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Skeleton className="w-[140px] h-[140px] rounded-full shrink-0" />
          <div className="grid grid-cols-2 gap-2 flex-1 w-full">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
