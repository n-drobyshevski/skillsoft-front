'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { teamsApi } from '@/services/teams-api';
import type { CreateTeamRequest, ManagedTeam, TeamStats } from '@/types/team';

// ============================================
// TYPES
// ============================================

export type ActionSuccessResult<T = undefined> = {
  success: true;
  message: string;
  data?: T;
};

export type ActionErrorResult = {
  success: false;
  message: string;
};

export type ActionResult<T = undefined> = ActionSuccessResult<T> | ActionErrorResult;

const UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate team list cache.
 * Used for operations that affect the teams list.
 */
export async function revalidateTeamListTags() {
  try {
    revalidatePath('/admin/teams');
    revalidateTag('teams', 'max');
    revalidateTag('team-stats', 'max');
    revalidateTag('my-teams', 'max');
  } catch {
    // Silently fail
  }
}

// ============================================
// TEAM LIST ACTIONS
// ============================================

/**
 * Create a new team from the teams list page.
 * Redirects to the new team's detail page on success.
 */
export async function createTeamFromListAction(
  data: CreateTeamRequest
): Promise<ActionResult<ManagedTeam>> {
  try {
    const newTeam = await teamsApi.createTeam(data);

    if (!newTeam) {
      return { success: false, message: 'Failed to create team. No response from server.' };
    }

    await revalidateTeamListTags();

    // Redirect to the new team
    redirect(`/admin/teams/${newTeam.id}`);
  } catch (error) {
    // redirect() throws a special error
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[createTeamFromListAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to create team: ${errorMessage}` };
  }
}

/**
 * Quick create: Create a team with just a name.
 * Useful for rapid team creation from the list page.
 */
export async function quickCreateTeamAction(
  name: string,
  description?: string
): Promise<ActionResult<ManagedTeam>> {
  try {
    const newTeam = await teamsApi.createTeam({
      name,
      description,
      activateImmediately: false,
    });

    if (!newTeam) {
      return { success: false, message: 'Failed to create team.' };
    }

    await revalidateTeamListTags();

    return {
      success: true,
      message: `Team "${name}" created successfully.`,
      data: newTeam,
    };
  } catch (error) {
    console.error('[quickCreateTeamAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to create team: ${errorMessage}` };
  }
}

/**
 * Bulk archive teams.
 * Used for batch operations from the teams table.
 */
export async function bulkArchiveTeamsAction(
  teamIds: string[]
): Promise<ActionResult<{ archived: string[]; failed: string[] }>> {
  if (!teamIds.length) {
    return { success: false, message: 'No teams selected.' };
  }

  const archived: string[] = [];
  const failed: string[] = [];

  for (const teamId of teamIds) {
    try {
      await teamsApi.archiveTeam(teamId);
      archived.push(teamId);
    } catch {
      failed.push(teamId);
    }
  }

  await revalidateTeamListTags();

  // Invalidate individual team caches
  for (const teamId of archived) {
    try {
      revalidateTag(`team-${teamId}`, 'max');
    } catch {
      // Ignore
    }
  }

  if (failed.length === teamIds.length) {
    return { success: false, message: 'Failed to archive any teams.' };
  }

  if (failed.length > 0) {
    return {
      success: true,
      message: `Archived ${archived.length} team(s). ${failed.length} failed.`,
      data: { archived, failed },
    };
  }

  return {
    success: true,
    message: `Successfully archived ${archived.length} team(s).`,
    data: { archived, failed },
  };
}

/**
 * Refresh team statistics.
 * Forces a refetch of team stats.
 */
export async function refreshTeamStatsAction(): Promise<ActionResult<TeamStats>> {
  try {
    const stats = await teamsApi.getStats();

    if (!stats) {
      return { success: false, message: 'Failed to fetch team statistics.' };
    }

    revalidateTag('team-stats', 'max');

    return {
      success: true,
      message: 'Statistics refreshed.',
      data: stats,
    };
  } catch (error) {
    console.error('[refreshTeamStatsAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to refresh stats: ${errorMessage}` };
  }
}
