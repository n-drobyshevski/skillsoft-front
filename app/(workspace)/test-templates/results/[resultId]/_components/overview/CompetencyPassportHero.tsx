'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';
import { CompetencyPassportHeroProps } from '../shared/types';
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
  subtitle
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-card/50 backdrop-blur-sm">
      <div className="w-7 h-7 rounded-md flex items-center justify-center border bg-primary/10 text-primary border-primary/20">
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
 * Hero section for Competency Passport (Scenario A).
 *
 * Key differences from Job Fit/Team Fit:
 * - NO score percentage circle
 * - NO pass/fail badge
 * - ClipboardList icon instead of Trophy
 * - "Your Competency Profile" messaging
 * - Neutral primary color palette
 */
export function CompetencyPassportHero({
  templateName,
  completedAt,
  questionsAnswered,
  totalQuestions,
  timeSpent,
  competencyCount
}: CompetencyPassportHeroProps) {
  const formattedTime = formatDuration(timeSpent);
  const formattedDate = new Date(completedAt).toLocaleString();

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all animate-fadeInUp-1",
      "border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-muted"
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.3),transparent_70%)]" />

      <CardContent className="p-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
          {/* LEFT: Icon + Title (no score) */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-4 lg:gap-3">
            {/* Clipboard/Profile icon instead of Trophy */}
            <div className={cn(
              "rounded-full p-4 border-2 transition-all shrink-0",
              "bg-primary/10 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
            )}>
              <ClipboardList className="h-10 w-10 text-primary" />
            </div>

            {/* Title and template - NO score */}
            <div className="text-center sm:text-left lg:text-center flex-1 sm:flex-initial lg:flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Your Competency Profile
              </h1>
              <p className="text-sm text-muted-foreground line-clamp-1" title={templateName}>
                {templateName}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Completed: {formattedDate}
              </p>
            </div>

            {/* NO SCORE CIRCLE on mobile - instead show profile summary */}
            <div className="sm:hidden">
              <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-center">
                <span className="text-sm font-medium text-primary">
                  {competencyCount} Competencies Assessed
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Stats Grid (Desktop/Tablet only) - NO score circle */}
          <div className="hidden sm:flex flex-col lg:flex-row items-center gap-6">
            {/* Profile summary badge instead of score circle */}
            <div className="relative shrink-0 flex flex-col items-center justify-center p-6 rounded-xl bg-primary/5 border-2 border-primary/20">
              <LayoutGrid className="h-8 w-8 text-primary mb-2" />
              <span className="text-3xl font-bold text-primary">
                {competencyCount}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Competencies
              </span>
            </div>

            {/* Inline stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 flex-1 w-full">
              <HeroStat
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Questions"
                value={`${questionsAnswered}`}
                subtitle={`of ${totalQuestions}`}
              />
              <HeroStat
                icon={<Clock className="h-4 w-4" />}
                label="Time"
                value={formattedTime}
              />
              <HeroStat
                icon={<LayoutGrid className="h-4 w-4" />}
                label="Assessment"
                value="Profile"
                subtitle="Competency Passport"
              />
            </div>
          </div>
        </div>

        {/* Mobile stats grid */}
        <div className="sm:hidden grid grid-cols-2 gap-3 mt-4">
          <HeroStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Questions"
            value={`${questionsAnswered}`}
            subtitle={`of ${totalQuestions}`}
          />
          <HeroStat
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            value={formattedTime}
          />
        </div>

        {/* NO ACTION BUTTONS IN HERO - moved to ActionButtonsBar */}
      </CardContent>
    </Card>
  );
}
