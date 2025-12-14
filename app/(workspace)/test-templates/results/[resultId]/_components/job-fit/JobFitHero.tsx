'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { JobFitHeroProps } from '../shared/types';
import { cn } from '@/lib/utils';

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Compact stat display for hero section
 */
function HeroStat({
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
 * Hero section for Job Fit Assessment (Scenario B).
 *
 * Key features:
 * - Score percentage circle (appropriate for job fit)
 * - Pass/fail badge (Qualified/Not Qualified)
 * - O*NET job context display
 * - Green/Amber color palette for pass/fail
 */
export function JobFitHero({
  templateName,
  completedAt,
  overallPercentage,
  passed,
  onetSocCode,
  questionsAnswered,
  totalQuestions,
  timeSpent,
  percentile
}: JobFitHeroProps) {
  const percentScore = Math.round(overallPercentage);
  const formattedTime = formatDuration(timeSpent);
  const formattedDate = new Date(completedAt).toLocaleString();

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all animate-fadeInUp-1",
      passed
        ? "border-green-500/30 bg-gradient-to-br from-green-500/5 via-emerald-400/5 to-teal-500/5"
        : "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-400/5 to-yellow-500/5"
    )}>
      {/* Subtle gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        passed
          ? "bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.3),transparent_70%)]"
          : "bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3),transparent_70%)]"
      )} />

      <CardContent className="p-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
          {/* LEFT: Icon + Title + Compact Score */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-4 lg:gap-3">
            {/* Animated icon */}
            <div className={cn(
              "rounded-full p-4 border-2 transition-all shrink-0",
              passed
                ? "bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                : "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            )}>
              {passed ? (
                <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
              ) : (
                <Target className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              )}
            </div>

            {/* Title and template */}
            <div className="text-center sm:text-left lg:text-center flex-1 sm:flex-initial lg:flex-1">
              <h1 className={cn(
                "text-xl sm:text-2xl font-bold mb-1",
                passed ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
              )}>
                {passed ? 'Congratulations!' : 'Keep Improving'}
              </h1>
              <p className="text-sm text-muted-foreground line-clamp-1" title={templateName}>
                {templateName}
              </p>
              {/* O*NET Job Context */}
              {onetSocCode && (
                <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-1 mt-1">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    O*NET: {onetSocCode}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground/70 mt-1">
                {formattedDate}
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
                    passed ? "text-green-500" : "text-amber-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-2xl font-bold",
                  passed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
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
                    passed ? "text-green-500" : "text-amber-500"
                  )}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 6px ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'})`
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn(
                  "text-4xl lg:text-5xl font-bold",
                  passed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {percentScore}%
                </span>
                <Badge variant={passed ? 'default' : 'secondary'} className="mt-1 text-xs">
                  {passed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Qualified
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Not Qualified
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Inline stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 flex-1 w-full">
              <HeroStat
                icon={<Target className="h-4 w-4" />}
                label="Match Score"
                value={`${percentScore}%`}
                color="success"
              />
              <HeroStat
                icon={<Clock className="h-4 w-4" />}
                label="Time"
                value={formattedTime}
                color="info"
              />
              <HeroStat
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Answered"
                value={`${questionsAnswered}`}
                subtitle={`/ ${totalQuestions}`}
                color="primary"
              />
              {percentile !== undefined && percentile !== null ? (
                <HeroStat
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Percentile"
                  value={`${percentile}th`}
                  color="success"
                />
              ) : (
                <HeroStat
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Assessment"
                  value="Job Fit"
                  color="primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile stats grid */}
        <div className="sm:hidden grid grid-cols-2 gap-3 mt-4">
          <HeroStat
            icon={<Target className="h-4 w-4" />}
            label="Match"
            value={`${percentScore}%`}
            color="success"
          />
          <HeroStat
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            value={formattedTime}
            color="info"
          />
          <HeroStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Answered"
            value={`${questionsAnswered}`}
            subtitle={`/ ${totalQuestions}`}
            color="primary"
          />
          <HeroStat
            icon={<Briefcase className="h-4 w-4" />}
            label="Type"
            value="Job Fit"
            color="primary"
          />
        </div>

        {/* Pass/Fail badge on mobile */}
        <div className="sm:hidden flex justify-center mt-4">
          <Badge
            variant={passed ? 'default' : 'secondary'}
            className={cn(
              "text-sm px-4 py-1",
              passed ? "bg-green-500" : "bg-amber-500"
            )}
          >
            {passed ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Qualified for Position
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-1" />
                Below Requirements
              </>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
