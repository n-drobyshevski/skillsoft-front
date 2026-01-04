"use client";

import { useTranslations } from "next-intl";
import { Users, Crown, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStats {
  memberCount: number;
  leaderCount: number;
  competencyCount: number;
  avgSaturation: number;
  gapsCount: number;
}

interface TeamStatsGridProps {
  stats: TeamStats;
  className?: string;
}

interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color?: "primary" | "emerald" | "violet" | "amber" | "red";
  trend?: string;
}

function StatCard({ icon: Icon, value, label, color = "primary", trend }: StatCardProps) {
  const getColorClass = () => {
    switch (color) {
      case "emerald":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
      case "violet":
        return "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30";
      case "amber":
        return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
      case "red":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "primary":
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="relative p-4 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${getColorClass()}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function TeamStatsGrid({ stats, className }: TeamStatsGridProps) {
  const t = useTranslations('teams.detail.stats');

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      <StatCard
        icon={Users}
        value={stats.memberCount}
        label={t('members')}
        color="primary"
      />
      <StatCard
        icon={Crown}
        value={stats.leaderCount > 0 ? stats.leaderCount : '-'}
        label={t('leaders')}
        color="amber"
      />
      <StatCard
        icon={Target}
        value={stats.avgSaturation > 0 ? `${stats.avgSaturation}%` : '-'}
        label={t('avgSaturation')}
        color="emerald"
      />
      <StatCard
        icon={AlertTriangle}
        value={stats.gapsCount > 0 ? stats.gapsCount : '-'}
        label={t('skillGaps')}
        color={stats.gapsCount > 0 ? "red" : "violet"}
      />
    </div>
  );
}
