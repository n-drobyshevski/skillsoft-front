import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { teamsApi } from "@/services/teams-api";
import type { ManagedTeam, ManagedTeamProfile } from "@/types/team";
import TeamHeroSection from "./_components/TeamHeroSection";
import TeamStatsGrid from "./_components/TeamStatsGrid";
import TeamDetailClient from "./_components/TeamDetailClient";
import Loading from "./loading";

interface TeamDetailPageProps {
  params: Promise<{ teamId: string }>;
}

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const t = await getTranslations('metadata.teams');
  const team = await teamsApi.getTeamById(teamId);
  const name = team?.name ?? 'Team';

  return {
    title: t('detailTitle', { name }),
    description: t('detailDescription'),
  };
}

// Team data with profile for aggregated view
interface TeamDetailData {
  team: ManagedTeam;
  profile: ManagedTeamProfile | null;
}

/**
 * Fetch team and profile data in parallel.
 * Uses Promise.allSettled for graceful degradation.
 */
async function getTeamDetailData(teamId: string): Promise<TeamDetailData | null> {
  const team = await teamsApi.getTeamById(teamId);

  if (!team) {
    return null;
  }

  // Fetch profile in parallel (may not exist for new teams)
  const profileResult = await Promise.allSettled([
    teamsApi.getTeamProfile(teamId),
  ]);

  return {
    team,
    profile: profileResult[0].status === 'fulfilled' ? profileResult[0].value : null,
  };
}

/**
 * Async data-fetching component for team detail.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function TeamDetailData({ teamId }: { teamId: string }) {
  const t = await getTranslations('teams.detail');
  const tStatus = await getTranslations('teams.status');

  const data = await getTeamDetailData(teamId);

  if (!data) {
    notFound();
  }

  const { team, profile } = data;

  // Calculate stats for the grid
  const stats = {
    memberCount: team.memberCount,
    leaderCount: team.members.filter(m => m.role === 'LEADER').length,
    competencyCount: profile?.competencySaturation?.length ?? 0,
    avgSaturation: profile?.competencySaturation?.length
      ? Math.round(
          (profile.competencySaturation.reduce((acc, c) => acc + c.saturation, 0) /
            profile.competencySaturation.length) *
            100
        )
      : 0,
    gapsCount: profile?.skillGaps?.length ?? 0,
  };

  return (
    <>
      {/* Hero Section with Team Info */}
      <TeamHeroSection
        team={team}
        statusLabel={tStatus(team.status.toLowerCase())}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Mobile Stats Grid */}
          <TeamStatsGrid stats={stats} className="lg:hidden" />

          {/* Tabbed Content with Desktop Stats */}
          <TeamDetailClient
            team={team}
            profile={profile}
            stats={stats}
          />
        </div>
      </div>
    </>
  );
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <Suspense fallback={<Loading />}>
        <TeamDetailData teamId={teamId} />
      </Suspense>
    </div>
  );
}
