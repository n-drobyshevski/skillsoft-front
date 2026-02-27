"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ManagedTeamProfile, CompetencySaturation } from "@/types/team";
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamProfileTabProps {
  profile: ManagedTeamProfile | null;
}

function SaturationBar({
  competencyId,
  competencyName,
  saturation,
  index,
}: {
  competencyId: string;
  competencyName: string;
  saturation: number;
  index: number;
}) {
  const t = useTranslations('teams.detail.profile');

  const percentage = Math.round(saturation * 100);

  // Determine status based on saturation level
  const getStatus = () => {
    if (saturation >= 0.7) return { label: t('saturation.high'), color: "emerald", icon: CheckCircle };
    if (saturation >= 0.4) return { label: t('saturation.medium'), color: "amber", icon: Activity };
    return { label: t('saturation.low'), color: "red", icon: AlertCircle };
  };

  const status = getStatus();

  const getProgressColor = () => {
    if (saturation >= 0.7) return "bg-emerald-500";
    if (saturation >= 0.4) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBadgeStyles = () => {
    if (saturation >= 0.7) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (saturation >= 0.4) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const displayName = competencyName || competencyId.substring(0, 8);

  return (
    <div className="group hover:bg-muted/30 p-3 -mx-3 rounded-lg transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-muted-foreground w-5">
            {index + 1}.
          </span>
          <span className="font-medium truncate" title={competencyId}>
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tabular-nums">{percentage}%</span>
          <Badge className={cn("text-xs gap-1", getBadgeStyles())}>
            <status.icon className="h-3 w-3" aria-hidden="true" />
            <span className="hidden sm:inline">{status.label}</span>
          </Badge>
        </div>
      </div>
      <div className="relative">
        <Progress
          value={percentage}
          className="h-2.5"
        />
        <div
          className={cn("absolute inset-0 h-2.5 rounded-full transition-all", getProgressColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EmptyProfileState() {
  const t = useTranslations('teams.detail.profile');

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 animate-in fade-in-0 zoom-in-95 duration-300">
          <BarChart3 className="h-8 w-8 text-purple-500 dark:text-purple-400" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold max-w-[280px] mb-2 animate-in fade-in-0 duration-300 delay-75">{t('empty.title')}</h3>
        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed animate-in fade-in-0 duration-300 delay-100">
          {t('empty.description')}
        </p>
      </CardContent>
    </Card>
  );
}

function ProfileSummaryCard({
  profile,
}: {
  profile: ManagedTeamProfile;
}) {
  const t = useTranslations('teams.detail.profile');

  const saturationValues = profile.competencySaturation.map(c => c.saturation);
  const avgSaturation = saturationValues.length > 0
    ? saturationValues.reduce((a, b) => a + b, 0) / saturationValues.length
    : 0;
  const maxSaturation = saturationValues.length > 0 ? Math.max(...saturationValues) : 0;
  const minSaturation = saturationValues.length > 0 ? Math.min(...saturationValues) : 0;

  const highCount = profile.competencySaturation.filter(c => c.saturation >= 0.7).length;
  const mediumCount = profile.competencySaturation.filter(c => c.saturation >= 0.4 && c.saturation < 0.7).length;
  const lowCount = profile.competencySaturation.filter(c => c.saturation < 0.4).length;

  return (
    <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          {t('summary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
            <p className="text-2xl font-bold tabular-nums text-primary">{Math.round(avgSaturation * 100)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('summary.average')}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
            <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{highCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('summary.high')}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
            <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{mediumCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('summary.medium')}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{lowCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('summary.low')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamProfileTab({ profile }: TeamProfileTabProps) {
  const t = useTranslations('teams.detail.profile');

  if (!profile || profile.competencySaturation.length === 0) {
    return <EmptyProfileState />;
  }

  // Sort by saturation descending
  const sortedCompetencies = [...profile.competencySaturation].sort(
    (a, b) => b.saturation - a.saturation
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <ProfileSummaryCard profile={profile} />

      {/* Competency Saturation List */}
      <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('competencies.title')}
          </CardTitle>
          <CardDescription>
            {t('competencies.description', { count: profile.competencySaturation.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {sortedCompetencies.map((comp, index) => (
            <SaturationBar
              key={comp.competencyId}
              competencyId={comp.competencyId}
              competencyName={comp.competencyName}
              saturation={comp.saturation}
              index={index}
            />
          ))}
        </CardContent>
      </Card>

      {/* Personality Distribution (if available) */}
      {profile.averagePersonality && Object.keys(profile.averagePersonality).length > 0 && (
        <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              {t('personality.title')}
            </CardTitle>
            <CardDescription>
              {t('personality.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(profile.averagePersonality).map(([trait, value]) => (
                <div key={trait} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{trait}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                  <Progress value={value * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
