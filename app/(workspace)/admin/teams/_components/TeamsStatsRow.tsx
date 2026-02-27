'use client';

import {
  Users,
  UsersRound,
  FileEdit,
  CheckCircle,
  Archive,
} from 'lucide-react';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';

interface TeamsStatsRowProps {
  totalTeams: number;
  totalMembers: number;
  avgTeamSize: string;
  draftTeams: number;
  activeTeams: number;
  archivedTeams: number;
  labels: {
    totalTeams: string;
    totalMembers: string;
    avgTeamSize: string;
    membersPerTeam: string;
    draft: string;
    awaitingActivation: string;
    active: string;
    readyForAssessment: string;
    archived: string;
    noLongerActive: string;
  };
}

export function TeamsStatsRow({
  totalTeams,
  totalMembers,
  avgTeamSize,
  draftTeams,
  activeTeams,
  archivedTeams,
  labels,
}: TeamsStatsRowProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
      <StatsWidget
        title={labels.totalTeams}
        value={totalTeams}
        icon={UsersRound}
        description={labels.totalMembers}
        variant="info"
      />
      <StatsWidget
        title={labels.avgTeamSize}
        value={avgTeamSize}
        icon={Users}
        description={labels.membersPerTeam}
        variant="success"
      />
      <StatsWidget
        title={labels.draft}
        value={draftTeams}
        icon={FileEdit}
        description={labels.awaitingActivation}
        variant="warning"
      />
      <StatsWidget
        title={labels.active}
        value={activeTeams}
        icon={CheckCircle}
        description={labels.readyForAssessment}
        variant="success"
      />
      <StatsWidget
        title={labels.archived}
        value={archivedTeams}
        icon={Archive}
        description={labels.noLongerActive}
      />
    </div>
  );
}
