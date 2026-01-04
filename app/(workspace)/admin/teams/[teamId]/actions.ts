'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { teamsApi } from '@/services/teams-api';
import type {
  CreateTeamRequest,
  UpdateTeamRequest,
  ManagedTeam,
  MemberAdditionResult,
  LeaderChangeResult,
  ActivationResult,
} from '@/types/team';

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
  code?: string;
};

export type ActionResult<T = undefined> = ActionSuccessResult<T> | ActionErrorResult;

const UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate all team-related cache tags and paths.
 * Call this after any team mutation.
 */
export async function revalidateTeamTags(teamId?: string) {
  try {
    // Invalidate list pages
    revalidatePath('/admin/teams');

    // Invalidate cache tags (using 'max' profile for stale-while-revalidate in Next.js 16)
    revalidateTag('teams', 'max');
    revalidateTag('team-stats', 'max');
    revalidateTag('my-teams', 'max');

    if (teamId) {
      // Invalidate specific team pages
      revalidatePath(`/admin/teams/${teamId}`);
      revalidatePath(`/admin/teams/${teamId}/edit`);

      // Invalidate team-specific cache tags
      revalidateTag(`team-${teamId}`, 'max');
      revalidateTag(`team-${teamId}-members`, 'max');
      revalidateTag(`team-${teamId}-profile`, 'max');
      revalidateTag(`team-${teamId}-gaps`, 'max');
    }
  } catch {
    // Silently fail - revalidation errors shouldn't break the action
  }
}

// ============================================
// TEAM CRUD ACTIONS
// ============================================

/**
 * Create a new team.
 * Optionally add initial members and set a leader.
 * Redirects to the new team page on success.
 */
export async function createTeamAction(
  data: CreateTeamRequest
): Promise<ActionResult<ManagedTeam>> {
  try {
    const newTeam = await teamsApi.createTeam(data);

    if (!newTeam) {
      return { success: false, message: 'Failed to create team. No response from server.' };
    }

    await revalidateTeamTags();

    // Redirect to the new team
    redirect(`/admin/teams/${newTeam.id}`);
  } catch (error) {
    // redirect() throws a special error that we need to rethrow
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[createTeamAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to create team: ${errorMessage}` };
  }
}

/**
 * Update team basic information (name, description).
 */
export async function updateTeamAction(
  teamId: string,
  data: UpdateTeamRequest
): Promise<ActionResult<ManagedTeam>> {
  try {
    const updatedTeam = await teamsApi.updateTeam(teamId, data);

    if (!updatedTeam) {
      return { success: false, message: 'Failed to update team. No response from server.' };
    }

    await revalidateTeamTags(teamId);

    return {
      success: true,
      message: 'Team updated successfully.',
      data: updatedTeam,
    };
  } catch (error) {
    console.error('[updateTeamAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to update team: ${errorMessage}` };
  }
}

/**
 * Archive (soft delete) a team.
 * Redirects to the teams list on success.
 */
export async function archiveTeamAction(teamId: string): Promise<ActionResult> {
  try {
    await teamsApi.archiveTeam(teamId);

    await revalidateTeamTags(teamId);

    // Redirect to teams list
    redirect('/admin/teams');
  } catch (error) {
    // redirect() throws a special error that we need to rethrow
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[archiveTeamAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to archive team: ${errorMessage}` };
  }
}

// ============================================
// TEAM LIFECYCLE ACTIONS
// ============================================

/**
 * Activate a team (DRAFT → ACTIVE).
 * May fail if team doesn't meet activation requirements.
 */
export async function activateTeamAction(
  teamId: string
): Promise<ActionResult<ActivationResult>> {
  try {
    const result = await teamsApi.activateTeam(teamId);

    if (!result) {
      return { success: false, message: 'Failed to activate team. No response from server.' };
    }

    if (!result.success) {
      return {
        success: false,
        message: result.errors?.join(', ') || 'Failed to activate team due to validation errors.',
      };
    }

    await revalidateTeamTags(teamId);

    return {
      success: true,
      message: 'Team activated successfully.',
      data: result,
    };
  } catch (error) {
    console.error('[activateTeamAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to activate team: ${errorMessage}` };
  }
}

// ============================================
// MEMBER MANAGEMENT ACTIONS
// ============================================

/**
 * Add members to a team (bulk operation).
 * Returns partial success information if some additions fail.
 */
export async function addTeamMembersAction(
  teamId: string,
  userIds: string[]
): Promise<ActionResult<MemberAdditionResult>> {
  try {
    if (!userIds.length) {
      return { success: false, message: 'No users selected to add.' };
    }

    const result = await teamsApi.addMembers(teamId, { userIds });

    if (!result) {
      return { success: false, message: 'Failed to add members. No response from server.' };
    }

    await revalidateTeamTags(teamId);

    // Check for partial failures
    if (result.hasErrors && result.failures.length > 0) {
      const addedCount = result.addedMembers.length;
      const failedCount = result.failures.length;
      return {
        success: true,
        message: `Added ${addedCount} member(s). ${failedCount} addition(s) failed.`,
        data: result,
      };
    }

    return {
      success: true,
      message: `Successfully added ${result.addedMembers.length} member(s) to the team.`,
      data: result,
    };
  } catch (error) {
    console.error('[addTeamMembersAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to add members: ${errorMessage}` };
  }
}

/**
 * Remove a single member from a team.
 */
export async function removeTeamMemberAction(
  teamId: string,
  userId: string
): Promise<ActionResult> {
  try {
    await teamsApi.removeMember(teamId, userId);

    await revalidateTeamTags(teamId);

    return {
      success: true,
      message: 'Member removed from team successfully.',
    };
  } catch (error) {
    console.error('[removeTeamMemberAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to remove member: ${errorMessage}` };
  }
}

/**
 * Set or change the team leader.
 * Pass null as leaderId to clear the current leader.
 */
export async function setTeamLeaderAction(
  teamId: string,
  leaderId: string | null
): Promise<ActionResult<LeaderChangeResult>> {
  try {
    const result = await teamsApi.setLeader(teamId, { leaderId });

    if (!result) {
      return { success: false, message: 'Failed to set leader. No response from server.' };
    }

    if (!result.success) {
      return { success: false, message: 'Failed to set team leader.' };
    }

    await revalidateTeamTags(teamId);

    const message = leaderId
      ? 'Team leader updated successfully.'
      : 'Team leader removed successfully.';

    return {
      success: true,
      message,
      data: result,
    };
  } catch (error) {
    console.error('[setTeamLeaderAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to set leader: ${errorMessage}` };
  }
}

// ============================================
// BATCH/UTILITY ACTIONS
// ============================================

/**
 * Promote a member to leader.
 * Convenience action that calls setTeamLeaderAction.
 */
export async function promoteToLeaderAction(
  teamId: string,
  userId: string
): Promise<ActionResult<LeaderChangeResult>> {
  return setTeamLeaderAction(teamId, userId);
}

/**
 * Remove the current team leader (clear leadership).
 */
export async function clearTeamLeaderAction(
  teamId: string
): Promise<ActionResult<LeaderChangeResult>> {
  return setTeamLeaderAction(teamId, null);
}

/**
 * Quick action: Remove member and revalidate.
 * Used from member action menus.
 */
export async function quickRemoveMemberAction(
  teamId: string,
  userId: string,
  memberName: string
): Promise<ActionResult> {
  try {
    await teamsApi.removeMember(teamId, userId);
    await revalidateTeamTags(teamId);

    return {
      success: true,
      message: `${memberName} has been removed from the team.`,
    };
  } catch (error) {
    console.error('[quickRemoveMemberAction] Error:', error);
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { success: false, message: `Failed to remove ${memberName}: ${errorMessage}` };
  }
}
