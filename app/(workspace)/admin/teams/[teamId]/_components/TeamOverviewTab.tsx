"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { BigFiveRadarSimple } from "@/components/charts/BigFiveRadar";
import type { BigFiveProfile } from "@/hooks/useBigFiveProjection";
import type { ManagedTeam, ManagedTeamProfile } from "@/types/team";
import {
  Users,
  Target,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Clock,
  UserPlus,
  Plus,
  Activity,
  Archive,
  Crown,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

interface TeamStats {
  memberCount: number;
  leaderCount: number;
  competencyCount: number;
  avgSaturation: number;
  gapsCount: number;
}

interface TeamOverviewTabProps {
  team: ManagedTeam;
  profile: ManagedTeamProfile | null;
  stats: TeamStats;
  onTabChange?: (tab: string) => void;
}

// ============================================================
// Activity feed helpers
// ============================================================

type ActivityEventType =
  | "teamCreated"
  | "teamActivated"
  | "teamArchived"
  | "memberJoined"
  | "leaderSet";

interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  date: Date;
  label: string;
}

function deriveActivityEvents(team: ManagedTeam): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  events.push({
    id: "team-created",
    type: "teamCreated",
    date: new Date(team.createdAt),
    label: team.name,
  });

  if (team.activatedAt) {
    events.push({
      id: "team-activated",
      type: "teamActivated",
      date: new Date(team.activatedAt),
      label: team.name,
    });
  }

  if (team.archivedAt) {
    events.push({
      id: "team-archived",
      type: "teamArchived",
      date: new Date(team.archivedAt),
      label: team.name,
    });
  }

  team.members.forEach((member) => {
    events.push({
      id: `member-joined-${member.userId}`,
      type: "memberJoined",
      date: new Date(member.joinedAt),
      label: member.fullName,
    });
  });

  if (team.leader) {
    const leaderDate = team.activatedAt
      ? new Date(team.activatedAt)
      : new Date(team.createdAt);
    events.push({
      id: `leader-set-${team.leader.id}`,
      type: "leaderSet",
      date: leaderDate,
      label: team.leader.fullName,
    });
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear >= 1) return `${diffYear}y ago`;
  if (diffMonth >= 1) return `${diffMonth}mo ago`;
  if (diffDay >= 1) return `${diffDay}d ago`;
  if (diffHour >= 1) return `${diffHour}h ago`;
  if (diffMin >= 1) return `${diffMin}m ago`;
  return "just now";
}

const ACTIVITY_ICON_CONFIG: Record<
  ActivityEventType,
  { Icon: React.ElementType; bg: string; color: string }
> = {
  memberJoined: {
    Icon: UserPlus,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  teamCreated: {
    Icon: Plus,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
  teamActivated: {
    Icon: Activity,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
  teamArchived: {
    Icon: Archive,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    color: "text-amber-600 dark:text-amber-400",
  },
  leaderSet: {
    Icon: Crown,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    color: "text-amber-600 dark:text-amber-400",
  },
};

// ============================================================
// Priority dot helper
// ============================================================

function getPriorityDotColor(saturation: number): string {
  if (saturation < 0.2) return "bg-red-500";
  if (saturation < 0.3) return "bg-orange-500";
  return "bg-amber-500";
}

// ============================================================
// Widget 1: Key Metrics Row
// ============================================================

function MetricsRow({ stats, t }: { stats: TeamStats; t: ReturnType<typeof useTranslations> }) {
  const saturationVariant = stats.avgSaturation >= 50 ? "success" : "warning";
  const gapsVariant = stats.gapsCount > 0 ? "destructive" : "default";

  return (
    <div className="col-span-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          title={t("stats.members")}
          value={stats.memberCount}
          icon={Users}
          variant="info"
          size="sm"
        />
        <StatsCard
          title={t("stats.saturation")}
          value={stats.avgSaturation > 0 ? `${stats.avgSaturation}%` : "-"}
          icon={Target}
          variant={saturationVariant}
          size="sm"
        />
        <StatsCard
          title={t("stats.gaps")}
          value={stats.gapsCount > 0 ? stats.gapsCount : "-"}
          icon={AlertTriangle}
          variant={gapsVariant}
          size="sm"
        />
        <StatsCard
          title={t("stats.competenciesTracked")}
          value={stats.competencyCount > 0 ? stats.competencyCount : "-"}
          icon={BookOpen}
          variant="purple"
          size="sm"
        />
      </div>
    </div>
  );
}

// ============================================================
// Widget 2: Top 3 Critical Gaps
// ============================================================

function CriticalGapsWidget({
  profile,
  onTabChange,
  t,
}: {
  profile: ManagedTeamProfile | null;
  onTabChange?: (tab: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const topGaps = useMemo(() => {
    if (!profile || !profile.skillGaps || profile.skillGaps.length === 0) {
      return [];
    }
    return [...profile.skillGaps]
      .sort((a, b) => a.currentSaturation - b.currentSaturation)
      .slice(0, 3);
  }, [profile]);

  return (
    <div className="md:col-span-7">
      <Card className="h-full hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle
                  className="w-4 h-4 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              </div>
              <span>{t("overview.criticalGaps.title")}</span>
              <HelpTooltip
                variant="help"
                content={t("help.criticalGaps")}
                side="top"
              />
            </CardTitle>
            {topGaps.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 touch-manipulation group"
                onClick={() => onTabChange?.("competencies")}
              >
                <span>{t("overview.criticalGaps.viewAll")}</span>
                <ChevronRight
                  className="h-3.5 w-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {topGaps.length > 0 ? (
            <div className="space-y-3">
              {topGaps.map((gap) => {
                const pct = Math.round(gap.currentSaturation * 100);
                const dotColor = getPriorityDotColor(gap.currentSaturation);
                const displayName =
                  gap.competencyName || gap.competencyId.substring(0, 12);

                return (
                  <div
                    key={gap.competencyId}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}
                      aria-hidden="true"
                    />
                    <span
                      className="text-sm font-medium truncate flex-1"
                      title={displayName}
                    >
                      {displayName}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-right shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
              <CheckCircle2
                className="h-8 w-8 text-emerald-500 dark:text-emerald-400"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                {t("overview.criticalGaps.noGaps")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Widget 3: Personality Radar
// ============================================================

function PersonalityRadarWidget({
  profile,
  t,
}: {
  profile: ManagedTeamProfile | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const bigFiveProfile = useMemo<BigFiveProfile | null>(() => {
    if (!profile?.averagePersonality) return null;
    const avg = profile.averagePersonality;
    const hasData = Object.keys(avg).length > 0;
    if (!hasData) return null;

    // Backend keys use BIG_FIVE_ prefix (e.g. BIG_FIVE_OPENNESS)
    // and BIG_FIVE_NEUROTICISM instead of EMOTIONAL_STABILITY.
    // Values are already 0-100 scale.
    const get = (trait: string) => Math.round(avg[`BIG_FIVE_${trait}`] ?? avg[trait] ?? 0);
    const neuroticism = avg["BIG_FIVE_NEUROTICISM"] ?? avg["NEUROTICISM"] ?? 0;

    return {
      OPENNESS: get("OPENNESS"),
      CONSCIENTIOUSNESS: get("CONSCIENTIOUSNESS"),
      EXTRAVERSION: get("EXTRAVERSION"),
      AGREEABLENESS: get("AGREEABLENESS"),
      EMOTIONAL_STABILITY: Math.round(100 - neuroticism),
    };
  }, [profile]);

  return (
    <div className="md:col-span-5">
      <Card className="h-full hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Activity
                className="w-4 h-4 text-violet-600 dark:text-violet-400"
                aria-hidden="true"
              />
            </div>
            <span>{t("overview.personality.title")}</span>
            <HelpTooltip
              variant="info"
              content={t("help.teamPersonality")}
              side="top"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {bigFiveProfile ? (
            <BigFiveRadarSimple profile={bigFiveProfile} height={260} />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
              <BarChart3
                className="h-8 w-8 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                {t("overview.personality.noData")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Widget 4: Recent Activity Feed
// ============================================================

function RecentActivityWidget({
  team,
  onTabChange,
  t,
}: {
  team: ManagedTeam;
  onTabChange?: (tab: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const events = useMemo(() => deriveActivityEvents(team), [team]);

  return (
    <div className="col-span-full">
      <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Clock
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <span>{t("overview.recentActivity.title")}</span>
            </CardTitle>
            {events.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 touch-manipulation group"
                onClick={() => onTabChange?.("activity")}
              >
                <span>{t("overview.recentActivity.viewAll")}</span>
                <ChevronRight
                  className="h-3.5 w-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {events.length > 0 ? (
            <ol className="space-y-3" aria-label={t("overview.recentActivity.title")}>
              {events.map((event) => {
                const config = ACTIVITY_ICON_CONFIG[event.type];
                const { Icon } = config;

                return (
                  <li key={event.id} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${config.bg}`}
                      aria-hidden="true"
                    >
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {t(`activity.events.${event.type}`, {
                          name: event.label,
                        })}
                      </p>
                    </div>
                    <time
                      dateTime={event.date.toISOString()}
                      className="text-xs text-muted-foreground tabular-nums shrink-0"
                    >
                      {formatRelativeTime(event.date)}
                    </time>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("overview.recentActivity.noActivity")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Root export
// ============================================================

export default function TeamOverviewTab({
  team,
  profile,
  stats,
  onTabChange,
}: TeamOverviewTabProps) {
  const t = useTranslations("teams.detail");

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
      <MetricsRow stats={stats} t={t} />
      <CriticalGapsWidget profile={profile} onTabChange={onTabChange} t={t} />
      <PersonalityRadarWidget profile={profile} t={t} />
      <RecentActivityWidget team={team} onTabChange={onTabChange} t={t} />
    </div>
  );
}
