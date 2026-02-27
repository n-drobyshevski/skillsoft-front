"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Crown, Calendar, Activity, LayoutDashboard, Clock } from "lucide-react";
import type { ManagedTeam, ManagedTeamProfile } from "@/types/team";
import TeamMembersTab from "./TeamMembersTab";
import TeamOverviewTab from "./TeamOverviewTab";
import TeamCompetenciesTab from "./TeamCompetenciesTab";
import TeamActivityTab from "./TeamActivityTab";

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
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 transition-colors group-hover:bg-muted/80">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:col-span-3 space-y-6" role="complementary" aria-label="Team sidebar">
        {/* Quick Stats Card */}
        <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              {t('sections.statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
                <p className="text-2xl font-bold tabular-nums text-primary">{stats.memberCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.members')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.leaderCount || '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.leaders')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {stats.avgSaturation > 0 ? `${stats.avgSaturation}%` : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.saturation')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 border border-border">
                <p className={`text-2xl font-bold tabular-nums ${stats.gapsCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'}`}>
                  {stats.gapsCount || '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('stats.gaps')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Info Card */}
        <Card className="hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
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
      <div className="lg:col-span-9" role="main" aria-label="Team content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-11 p-1 bg-muted/50">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 touch-manipulation">
              <LayoutDashboard className="h-4 w-4 hidden sm:block shrink-0" aria-hidden="true" />
              {t('tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 touch-manipulation">
              <Users className="h-4 w-4 hidden sm:block shrink-0" aria-hidden="true" />
              {t('tabs.members')}
            </TabsTrigger>
            <TabsTrigger value="competencies" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 touch-manipulation">
              <Target className="h-4 w-4 hidden sm:block shrink-0" aria-hidden="true" />
              <span className="sm:hidden">{t('tabs.competenciesMobile')}</span>
              <span className="hidden sm:inline">{t('tabs.competencies')}</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 touch-manipulation">
              <Clock className="h-4 w-4 hidden sm:block shrink-0" aria-hidden="true" />
              {t('tabs.activity')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <TeamOverviewTab
              team={team}
              profile={profile}
              stats={stats}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            <TeamMembersTab team={team} />
          </TabsContent>

          {/* Competencies Tab */}
          <TabsContent value="competencies" className="mt-6">
            <TeamCompetenciesTab profile={profile} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <TeamActivityTab team={team} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
