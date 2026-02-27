"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import type { ManagedTeam } from "@/types/team";
import { UserPlus, Plus, Activity, Archive, Crown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TeamEventType =
  | "memberJoined"
  | "teamCreated"
  | "teamActivated"
  | "teamArchived"
  | "leaderSet";

interface TeamEvent {
  id: string;
  type: TeamEventType;
  date: Date;
  actorName?: string;
}

// ---------------------------------------------------------------------------
// Event config
// ---------------------------------------------------------------------------

const EVENT_CONFIG: Record<
  TeamEventType,
  {
    icon: React.ElementType;
    bg: string;
    color: string;
  }
> = {
  memberJoined: {
    icon: UserPlus,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  teamCreated: {
    icon: Plus,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
  teamActivated: {
    icon: Activity,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
  teamArchived: {
    icon: Archive,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    color: "text-amber-600 dark:text-amber-400",
  },
  leaderSet: {
    icon: Crown,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    color: "text-amber-600 dark:text-amber-400",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateLabel(dateKey: string): string {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86_400_000));

  if (dateKey === today) return "__today__";
  if (dateKey === yesterday) return "__yesterday__";

  // Parse YYYY-MM-DD as local date to avoid UTC offset shifting the day
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TeamActivityTabProps {
  team: ManagedTeam;
}

export default function TeamActivityTab({ team }: TeamActivityTabProps) {
  const t = useTranslations("teams.detail");

  // Derive and sort events
  const events = useMemo<TeamEvent[]>(() => {
    const result: TeamEvent[] = [];

    // 1. Team created
    result.push({
      id: "teamCreated",
      type: "teamCreated",
      date: new Date(team.createdAt),
      actorName: team.createdBy.fullName,
    });

    // 2. Team activated
    if (team.activatedAt) {
      result.push({
        id: "teamActivated",
        type: "teamActivated",
        date: new Date(team.activatedAt),
      });
    }

    // 3. Team archived
    if (team.archivedAt) {
      result.push({
        id: "teamArchived",
        type: "teamArchived",
        date: new Date(team.archivedAt),
      });
    }

    // 4. Members joined
    team.members.forEach((member, idx) => {
      result.push({
        id: `memberJoined-${member.userId ?? idx}`,
        type: "memberJoined",
        date: new Date(member.joinedAt),
        actorName: member.fullName,
      });
    });

    // 5. Leader set
    if (team.leader) {
      result.push({
        id: "leaderSet",
        type: "leaderSet",
        actorName: team.leader.fullName,
        date: new Date(team.activatedAt ?? team.createdAt),
      });
    }

    // Sort descending by date
    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [team]);

  // Group events by calendar date key (YYYY-MM-DD)
  const groupedEvents = useMemo<Array<{ dateKey: string; events: TeamEvent[] }>>(
    () => {
      const map = new Map<string, TeamEvent[]>();
      for (const event of events) {
        const key = toDateKey(event.date);
        const bucket = map.get(key);
        if (bucket) {
          bucket.push(event);
        } else {
          map.set(key, [event]);
        }
      }
      // Map preserves insertion order; events are already sorted descending
      return Array.from(map.entries()).map(([dateKey, evts]) => ({
        dateKey,
        events: evts,
      }));
    },
    [events],
  );

  function getEventMessage(event: TeamEvent): string {
    switch (event.type) {
      case "memberJoined":
        return t("activity.events.memberJoined", { name: event.actorName ?? "" });
      case "teamCreated":
        return t("activity.events.teamCreated");
      case "teamActivated":
        return t("activity.events.teamActivated");
      case "teamArchived":
        return t("activity.events.teamArchived");
      case "leaderSet":
        return t("activity.events.leaderSet", { name: event.actorName ?? "" });
    }
  }

  // Empty state (safety net — teamCreated always exists)
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold mb-2">
            {t("activity.empty.title")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            {t("activity.empty.description")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section role="region" aria-label={t("activity.title")}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("activity.title")}
        </h2>
      </div>

      {/* Date groups */}
      <div className="space-y-2">
        {groupedEvents.map(({ dateKey, events: groupEvents }) => {
          const rawLabel = getDateLabel(dateKey);
          const dateLabel =
            rawLabel === "__today__"
              ? t("activity.today")
              : rawLabel === "__yesterday__"
                ? t("activity.yesterday")
                : rawLabel;

          return (
            <div key={dateKey}>
              {/* Sticky date header */}
              <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm py-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {dateLabel}
                </h3>
              </div>

              {/* Timeline for this date */}
              <div className="relative mt-1">
                {/* Vertical line */}
                <div
                  className="absolute left-[15px] sm:left-[17px] top-0 bottom-0 w-px bg-border"
                  aria-hidden="true"
                />

                {/* Events */}
                {groupEvents.map((event) => {
                  const config = EVENT_CONFIG[event.type];
                  const EventIcon = config.icon;

                  return (
                    <div
                      key={event.id}
                      className="relative flex gap-3 pb-6 last:pb-0 pl-10 sm:pl-12 hover:bg-muted/20 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      {/* Icon node */}
                      <div
                        className={cn(
                          "absolute left-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center z-10 border-2 border-background",
                          config.bg,
                        )}
                      >
                        <EventIcon
                          className={cn("h-4 w-4", config.color)}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-sm">{getEventMessage(event)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelativeTime(event.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
