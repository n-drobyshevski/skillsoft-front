"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ManagedTeamProfile, SkillGap } from "@/types/team";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  UserPlus,
  Lightbulb,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamGapsTabProps {
  profile: ManagedTeamProfile | null;
}

function getPriorityLevel(saturation: number): "critical" | "high" | "medium" {
  if (saturation < 0.2) return "critical";
  if (saturation < 0.3) return "high";
  return "medium";
}

function GapCard({
  gap,
  index,
}: {
  gap: SkillGap;
  index: number;
}) {
  const t = useTranslations('teams.detail.gaps');

  const priority = getPriorityLevel(gap.currentSaturation);
  const percentage = Math.round(gap.currentSaturation * 100);

  const getPriorityConfig = () => {
    switch (priority) {
      case "critical":
        return {
          label: t('priority.critical'),
          icon: AlertTriangle,
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
          progress: "bg-red-500",
        };
      case "high":
        return {
          label: t('priority.high'),
          icon: AlertCircle,
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-700 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-800",
          progress: "bg-orange-500",
        };
      default:
        return {
          label: t('priority.medium'),
          icon: TrendingDown,
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800",
          progress: "bg-amber-500",
        };
    }
  };

  const config = getPriorityConfig();

  // Truncate competency ID for display
  const displayName = gap.competencyId.includes('-')
    ? gap.competencyId.split('-').pop()
    : gap.competencyId.substring(0, 8);

  return (
    <Card className={cn(
      "border-l-4 hover:shadow-md transition-all",
      priority === "critical" ? "border-l-red-500" :
      priority === "high" ? "border-l-orange-500" : "border-l-amber-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Priority Indicator */}
          <div className={cn(
            "shrink-0 p-2 rounded-lg",
            config.bg
          )}>
            <config.icon className={cn("h-5 w-5", config.text)} />
          </div>

          {/* Gap Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate" title={gap.competencyId}>
                  {displayName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('currentSaturation', { value: percentage })}
                </p>
              </div>
              <Badge className={cn("shrink-0 gap-1", config.bg, config.text, config.border)}>
                <config.icon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>

            {/* Saturation Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('saturation')}</span>
                <span>{percentage}% / {t('threshold')}</span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-2" />
                <div
                  className={cn("absolute inset-0 h-2 rounded-full transition-all", config.progress)}
                  style={{ width: `${percentage}%` }}
                />
                {/* Threshold indicator at 30% */}
                <div
                  className="absolute top-0 h-2 w-px bg-muted-foreground/50"
                  style={{ left: '30%' }}
                />
              </div>
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                {t('recommendation', {
                  needed: Math.ceil((0.3 - gap.currentSaturation) * 10)
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyGapsState() {
  const t = useTranslations('teams.detail.gaps');

  return (
    <Card className="border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-emerald-700 dark:text-emerald-400">
          {t('empty.title')}
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          {t('empty.description')}
        </p>
      </CardContent>
    </Card>
  );
}

function NoProfileState() {
  const t = useTranslations('teams.detail.gaps');

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{t('noProfile.title')}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-4">
          {t('noProfile.description')}
        </p>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('noProfile.action')}
        </Button>
      </CardContent>
    </Card>
  );
}

function GapsSummaryCard({
  gaps,
}: {
  gaps: SkillGap[];
}) {
  const t = useTranslations('teams.detail.gaps');

  const criticalCount = gaps.filter(g => getPriorityLevel(g.currentSaturation) === "critical").length;
  const highCount = gaps.filter(g => getPriorityLevel(g.currentSaturation) === "high").length;
  const mediumCount = gaps.filter(g => getPriorityLevel(g.currentSaturation) === "medium").length;

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </div>
          {t('summary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">{t('priority.critical')}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highCount}</p>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-0.5">{t('priority.high')}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{mediumCount}</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">{t('priority.medium')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamGapsTab({ profile }: TeamGapsTabProps) {
  const t = useTranslations('teams.detail.gaps');

  if (!profile) {
    return <NoProfileState />;
  }

  if (profile.skillGaps.length === 0) {
    return <EmptyGapsState />;
  }

  // Sort gaps by saturation ascending (most critical first)
  const sortedGaps = [...profile.skillGaps].sort(
    (a, b) => a.currentSaturation - b.currentSaturation
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <GapsSummaryCard gaps={profile.skillGaps} />

      {/* Gaps Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{t('list.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('list.description', { count: profile.skillGaps.length })}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          {t('actions.findCandidates')}
        </Button>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {sortedGaps.map((gap, index) => (
          <GapCard key={gap.competencyId} gap={gap} index={index} />
        ))}
      </div>
    </div>
  );
}
