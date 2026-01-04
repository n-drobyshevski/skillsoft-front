import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TeamStatus,
  ManagedTeamSummary,
  TeamStats,
} from "@/types/team";
import {
  UserPlus,
  Users,
  UsersRound,
  FileEdit,
  CheckCircle,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { teamsApi } from "@/services/teams-api";
import PageHeader from "@/components/common/PageHeader";
import TeamsTableWrapper from "./_components/TeamsTableWrapper";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.teams');
  return {
    title: `${t('title')} - SkillSoft`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} - SkillSoft`,
      description: t('description'),
    },
  };
}

async function getTeamsData(t: (key: string) => string) {
  try {
    const response = await teamsApi.getTeams({ size: 100 });
    if (!response || !Array.isArray(response.content)) {
      if (response === null) {
        return { teams: [], stats: null, error: t('errors.backendUnavailable') };
      }
      return { teams: [], stats: null, error: t('errors.invalidDataFormat') };
    }

    // Also fetch stats
    let stats: TeamStats | null = null;
    try {
      stats = await teamsApi.getStats();
    } catch {
      // Stats are optional, don't fail the page
    }

    return { teams: response.content, stats, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : t('errors.loadingTeams');
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('CORS')) {
      return { teams: [], stats: null, error: t('errors.cannotConnect') };
    }
    return { teams: [], stats: null, error: message };
  }
}

// Compact stats card component
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconColor = "text-muted-foreground"
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  iconColor?: string;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export default async function TeamsPage() {
  const t = await getTranslations('teams');
  const { teams, stats, error } = await getTeamsData(t);

  // Calculate stats from data or use fetched stats
  const totalTeams = stats?.totalTeams ?? teams.length;
  const draftTeams = stats?.draftTeams ?? teams.filter(t => t.status === TeamStatus.DRAFT).length;
  const activeTeams = stats?.activeTeams ?? teams.filter(t => t.status === TeamStatus.ACTIVE).length;
  const archivedTeams = stats?.archivedTeams ?? teams.filter(t => t.status === TeamStatus.ARCHIVED).length;

  // Calculate total members across all teams
  const totalMembers = teams.reduce((acc, team) => acc + (team.memberCount || 0), 0);

  // Average team size
  const avgTeamSize = totalTeams > 0
    ? (totalMembers / totalTeams).toFixed(1)
    : "0";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title={t('page.title')}
        description={t('page.description')}
      >
        <div className="flex gap-2">
          <Link href="/admin/teams/new">
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('actions.createTeam')}</span>
              <span className="sm:hidden">{t('actions.create')}</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Compact Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={t('stats.totalTeams')}
          value={totalTeams}
          icon={UsersRound}
          description={t('stats.totalMembers', { count: totalMembers })}
          iconColor="text-primary"
        />
        <StatCard
          title={t('stats.avgTeamSize')}
          value={avgTeamSize}
          icon={Users}
          description={t('stats.membersPerTeam')}
          iconColor="text-emerald-500"
        />
        <StatCard
          title={t('stats.draft')}
          value={draftTeams}
          icon={FileEdit}
          description={t('stats.awaitingActivation')}
          iconColor="text-amber-500"
        />
        <StatCard
          title={t('stats.active')}
          value={activeTeams}
          icon={CheckCircle}
          description={t('stats.readyForAssessment')}
          iconColor="text-emerald-500"
        />
        <StatCard
          title={t('stats.archived')}
          value={archivedTeams}
          icon={Archive}
          description={t('stats.noLongerActive')}
          iconColor="text-muted-foreground"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="font-medium mb-1">{t('errors.loadingTeams')}</div>
          <div>{error}</div>
          {error.includes('backend') && (
            <div className="mt-2 text-xs text-muted-foreground">
              {t('errors.backendTip')}<code className="bg-muted px-1 rounded">cd assessment-backend && ./mvnw spring-boot:run</code>
            </div>
          )}
        </div>
      )}

      {/* Teams Table */}
      <TeamsTableWrapper teams={teams} />
    </div>
  );
}
