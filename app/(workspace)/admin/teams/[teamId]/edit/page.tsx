import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { teamsApi } from '@/services/teams-api';
import { EditTeamClient } from './EditTeamClient';
import Loading from './loading';

interface EditTeamPageProps {
  params: Promise<{ teamId: string }>;
}

/**
 * Async data-fetching component for team edit.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function EditTeamData({ teamId }: { teamId: string }) {
  const team = await teamsApi.getTeamById(teamId);

  if (!team) {
    notFound();
  }

  return <EditTeamClient team={team} />;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { teamId } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <EditTeamData teamId={teamId} />
    </Suspense>
  );
}
