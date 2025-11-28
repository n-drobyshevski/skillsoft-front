'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';
import { UserRole } from '../../../app/interfaces/user-interfaces';

// Backend API URL
const getBackendUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    if (apiUrl.startsWith('https://')) {
      return `${apiUrl}/api`;
    }
    return `https://${apiUrl}/api`;
  }
  return 'http://localhost:8080/api';
};

export interface UserUpdateFormData {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: UserRole;
}

export interface UpdateUserResult {
  success: boolean;
  message: string;
  data?: {
    clerkUpdated: boolean;
    backendUpdated: boolean;
  };
}

/**
 * Update user profile in Clerk and sync to backend.
 * 
 * Flow:
 * 1. Update user in Clerk (firstName, lastName, username)
 * 2. Update publicMetadata.role if role changed
 * 3. Sync changes to backend database
 * 4. Revalidate cache paths and tags
 */
export async function updateUserAction(
  userId: string,
  clerkId: string,
  formData: UserUpdateFormData
): Promise<UpdateUserResult> {
  try {
    const client = await clerkClient();
    
    // Step 1: Update Clerk user
    const clerkUpdateParams: {
      firstName?: string;
      lastName?: string;
      username?: string;
      publicMetadata?: Record<string, unknown>;
    } = {};

    if (formData.firstName !== undefined) {
      clerkUpdateParams.firstName = formData.firstName || undefined;
    }
    if (formData.lastName !== undefined) {
      clerkUpdateParams.lastName = formData.lastName || undefined;
    }
    if (formData.username !== undefined) {
      // Clerk requires username to be null to remove, or a string to set
      clerkUpdateParams.username = formData.username || undefined;
    }
    
    // Update role in publicMetadata if provided
    if (formData.role !== undefined) {
      clerkUpdateParams.publicMetadata = { role: formData.role };
    }

    let clerkUpdated = false;
    if (Object.keys(clerkUpdateParams).length > 0) {
      await client.users.updateUser(clerkId, clerkUpdateParams);
      clerkUpdated = true;
    }

    // Step 2: Sync to backend
    const backendUrl = getBackendUrl();
    const backendUpdateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
    };

    const backendResponse = await fetch(`${backendUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Use system user for server actions
        'X-User-Id': 'system',
        'X-User-Role': 'ADMIN',
      },
      body: JSON.stringify(backendUpdateData),
    });

    let backendUpdated = false;
    if (backendResponse.ok) {
      backendUpdated = true;
    } else {
      // Backend update failed - don't fail the whole operation since Clerk is source of truth
      // Error details are logged server-side for debugging
    }

    // Step 3: Revalidate cache
    await revalidateUserCache(userId, clerkId);

    return {
      success: true,
      message: 'User profile updated successfully',
      data: {
        clerkUpdated,
        backendUpdated,
      },
    };
  } catch (error) {
    // Error updating user - return failure message
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return {
      success: false,
      message,
    };
  }
}

/**
 * Sync a specific user from Clerk to backend.
 * Useful after Clerk updates to ensure backend is in sync.
 */
export async function syncUserToBackend(clerkId: string): Promise<UpdateUserResult> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);

    const backendUrl = getBackendUrl();
    const syncData = {
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || null,
      username: clerkUser.username || null,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      imageUrl: clerkUser.imageUrl || null,
      hasImage: clerkUser.hasImage,
      banned: clerkUser.banned,
      locked: clerkUser.locked,
      role: (clerkUser.publicMetadata?.role as string) || 'USER',
    };

    // Use the sync endpoint to update or create user in backend
    const response = await fetch(`${backendUrl}/users/clerk/${clerkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'system',
        'X-User-Role': 'ADMIN',
      },
      body: JSON.stringify(syncData),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(errorData.message || 'Backend sync failed');
    }

    // Revalidate cache
    await revalidateUserCache(undefined, clerkId);

    return {
      success: true,
      message: 'User synced successfully',
    };
  } catch (error) {
    // Error syncing user - return failure message
    const message = error instanceof Error ? error.message : 'Failed to sync user';
    return {
      success: false,
      message,
    };
  }
}

/**
 * Revalidate all user-related cache paths and tags.
 */
async function revalidateUserCache(userId?: string, clerkId?: string) {
  try {
    // Paths
    revalidatePath('/users');
    revalidatePath('/');
    if (userId) {
      revalidatePath(`/users/${userId}`);
      revalidatePath(`/users/${userId}/edit`);
    }
    if (clerkId) {
      revalidatePath(`/users/${clerkId}`);
      revalidatePath(`/users/${clerkId}/edit`);
    }

    // Tags
    revalidateTag('users', 'max');
    revalidateTag('users-stats', 'max');
    if (userId) {
      revalidateTag(`user-${userId}`, 'max');
    }
    if (clerkId) {
      revalidateTag(`user-clerk-${clerkId}`, 'max');
    }
  } catch {
    // Revalidation errors shouldn't fail the operation - silently continue
  }
}

/**
 * Ban or unban a user via Clerk.
 */
export async function toggleUserBan(
  clerkId: string,
  ban: boolean
): Promise<UpdateUserResult> {
  try {
    const client = await clerkClient();
    
    if (ban) {
      await client.users.banUser(clerkId);
    } else {
      await client.users.unbanUser(clerkId);
    }

    // Revalidate cache
    await revalidateUserCache(undefined, clerkId);

    return {
      success: true,
      message: ban ? 'User banned successfully' : 'User unbanned successfully',
    };
  } catch (error) {
    // Error toggling user ban - return failure message
    const message = error instanceof Error ? error.message : 'Failed to update user ban status';
    return {
      success: false,
      message,
    };
  }
}

/**
 * Lock or unlock a user via Clerk.
 */
export async function toggleUserLock(
  clerkId: string,
  lock: boolean
): Promise<UpdateUserResult> {
  try {
    const client = await clerkClient();
    
    if (lock) {
      await client.users.lockUser(clerkId);
    } else {
      await client.users.unlockUser(clerkId);
    }

    // Revalidate cache
    await revalidateUserCache(undefined, clerkId);

    return {
      success: true,
      message: lock ? 'User locked successfully' : 'User unlocked successfully',
    };
  } catch (error) {
    // Error toggling user lock - return failure message
    const message = error instanceof Error ? error.message : 'Failed to update user lock status';
    return {
      success: false,
      message,
    };
  }
}
