"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, AlertTriangle, Crown, Calendar, Activity } from "lucide-react";
import type { ManagedTeam, ManagedTeamProfile } from "@/types/team";
import TeamMembersTab from "./TeamMembersTab";
import TeamProfileTab from "./TeamProfileTab";
import TeamGapsTab from "./TeamGapsTab";
import TeamStatsGrid from "./TeamStatsGrid";

interface TeamStats {
  memberCount: number;
  leaderCount: number;
  competencyCount: number;
  avgSaturation: number;
  gapsCount: number;
}

interface TeamDetailClientProps {
  team: ManagedTeam;
  profile: ManagedTeamProfile | null;
  stats: TeamStats;
}

// Info row component for desktop sidebar
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="p-2 rounded-lg bg-muted/50 shrink-0 transition-colors group-hover:bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function TeamDetailClient({ team, profile, stats }: TeamDetailClientProps) {
  const t = useTranslations('teams.detail');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
        {/* Quick Stats Card */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Target className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              {t('sections.statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                <p className="text-2xl font-bold text-primary">{stats.memberCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.members')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.leaderCount || '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.leaders')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.avgSaturation > 0 ? `${stats.avgSaturation}%` : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.saturation')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border/50">
                <p className={`text-2xl font-bold ${stats.gapsCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'}`}>
                  {stats.gapsCount || '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.gaps')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Info Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              {t('sections.teamInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={Crown}
              label={t('info.leader')}
              value={team.leader?.fullName || t('noLeader')}
            />
            <InfoRow
              icon={Users}
              label={t('info.createdBy')}
              value={team.createdBy.fullName}
            />
            <InfoRow
              icon={Calendar}
              label={t('info.createdAt')}
              value={new Date(team.createdAt).toLocaleDateString()}
            />
            {team.activatedAt && (
              <InfoRow
                icon={Activity}
                label={t('info.activatedAt')}
                value={new Date(team.activatedAt).toLocaleDateString()}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-11 p-1 bg-muted/50">
            <TabsTrigger value="members" className="gap-2 data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 hidden sm:block" />
              {t('tabs.members')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:shadow-sm">
              <Target className="h-4 w-4 hidden sm:block" />
              {t('tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="gaps" className="gap-2 data-[state=active]:shadow-sm">
              <AlertTriangle className="h-4 w-4 hidden sm:block" />
              {t('tabs.gaps')}
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            <TeamMembersTab team={team} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <TeamProfileTab profile={profile} />
          </TabsContent>

          {/* Gaps Tab */}
          <TabsContent value="gaps" className="mt-6">
            <TeamGapsTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
