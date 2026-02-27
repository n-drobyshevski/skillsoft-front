import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { TeamStatus } from "@/types/team";
import { UserPlus } from "lucide-react";
import { getTeamsPageDataCached } from "@/services/api.cache.teams";
import PageHeader from "@/components/common/PageHeader";
import { TeamsStatsRow } from "./_components/TeamsStatsRow";
import TeamsTableWrapper from "./_components/TeamsTableWrapper";
import Loading from "./loading";

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
    const { teams, stats } = await getTeamsPageDataCached();
    if (!Array.isArray(teams)) {
      return { teams: [], stats: null, error: t('errors.invalidDataFormat') };
    }
    return { teams, stats, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : t('errors.loadingTeams');
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('CORS')) {
      return { teams: [], stats: null, error: t('errors.cannotConnect') };
    }
    return { teams: [], stats: null, error: message };
  }
}

/**
 * Async data-fetching component for teams content.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function TeamsData() {
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
    <>
      {/* Compact Stats Row */}
      <TeamsStatsRow
        totalTeams={totalTeams}
        totalMembers={totalMembers}
        avgTeamSize={avgTeamSize}
        draftTeams={draftTeams}
        activeTeams={activeTeams}
        archivedTeams={archivedTeams}
        labels={{
          totalTeams: t('stats.totalTeams'),
          totalMembers: t('stats.totalMembers', { count: totalMembers }),
          avgTeamSize: t('stats.avgTeamSize'),
          membersPerTeam: t('stats.membersPerTeam'),
          draft: t('stats.draft'),
          awaitingActivation: t('stats.awaitingActivation'),
          active: t('stats.active'),
          readyForAssessment: t('stats.readyForAssessment'),
          archived: t('stats.archived'),
          noLongerActive: t('stats.noLongerActive'),
        }}
      />

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
    </>
  );
}

// Main component
export default async function TeamsPage() {
  const t = await getTranslations('teams');

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 pt-6 sm:p-6">
      <PageHeader
        title={t('page.title')}
        description={t('page.description')}
        variant="dashboard"
      >
        <div className="flex gap-2">
          <Button asChild className="gap-2 shadow-sm min-h-[44px] sm:min-h-0 touch-manipulation active:scale-[0.98]">
            <Link href="/admin/teams/new">
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t('actions.createTeam')}</span>
              <span className="sm:hidden">{t('actions.create')}</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Suspense fallback={<Loading />}>
        <TeamsData />
      </Suspense>
    </div>
  );
}
