import { notFound } from 'next/navigation';
import { teamsApi } from '@/services/teams-api';
import { EditTeamClient } from './EditTeamClient';

interface EditTeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { teamId } = await params;

  // Fetch team data server-side
  const team = await teamsApi.getTeamById(teamId);

  if (!team) {
    notFound();
  }

  return <EditTeamClient team={team} />;
}
