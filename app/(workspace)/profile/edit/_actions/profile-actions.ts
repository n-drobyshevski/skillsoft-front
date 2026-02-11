'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';

// ============================================
// TYPES
// ============================================

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  organization?: string;
}

export interface PreferencesUpdateData {
  language: 'ru' | 'en';
  emailNotifications: boolean;
  assessmentReminders: boolean;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

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

// ============================================
// ACTIONS
// ============================================

/**
 * Update user profile in Clerk and sync to backend.
 *
 * Flow:
 * 1. Update user in Clerk (firstName, lastName)
 * 2. Update publicMetadata.organization if changed
 * 3. Sync changes to backend database
 * 4. Revalidate cache paths and tags
 */
export async function updateProfileAction(
  clerkId: string,
  data: ProfileUpdateData
): Promise<ActionResult> {
  try {
    const client = await clerkClient();

    // Update Clerk user
    await client.users.updateUser(clerkId, {
      firstName: data.firstName,
      lastName: data.lastName,
      publicMetadata: {
        organization: data.organization || null,
      },
    });

    // Sync to backend
    const backendUrl = getBackendUrl();
    try {
      await fetch(`${backendUrl}/users/clerk/${clerkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'system',
          'X-User-Role': 'ADMIN',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });
    } catch {
      // Backend sync failure is non-critical - Clerk is source of truth
    }

    // Invalidate caches
    await revalidateProfileCache(clerkId);

    return {
      success: true,
      message: '', // Success message handled by client-side i18n
    };
  } catch (error) {
    // Return the actual error message for toast description
    // Client will show i18n title, this provides additional context
    const message = error instanceof Error ? error.message : '';
    return {
      success: false,
      message,
    };
  }
}

/**
 * Update user preferences in Clerk publicMetadata.
 *
 * Preferences stored:
 * - language: 'ru' | 'en'
 * - emailNotifications: boolean
 * - assessmentReminders: boolean
 */
export async function updatePreferencesAction(
  clerkId: string,
  data: PreferencesUpdateData
): Promise<ActionResult> {
  try {
    const client = await clerkClient();

    // Get current user to preserve other metadata
    const user = await client.users.getUser(clerkId);
    const currentMetadata = user.publicMetadata || {};

    // Update Clerk user with new preferences
    await client.users.updateUser(clerkId, {
      publicMetadata: {
        ...currentMetadata,
        preferences: {
          language: data.language,
          emailNotifications: data.emailNotifications,
          assessmentReminders: data.assessmentReminders,
        },
      },
    });

    // Invalidate caches
    await revalidateProfileCache(clerkId);

    return {
      success: true,
      message: '', // Success message handled by client-side i18n
    };
  } catch (error) {
    // Return the actual error message for toast description
    // Client will show i18n title, this provides additional context
    const message = error instanceof Error ? error.message : '';
    return {
      success: false,
      message,
    };
  }
}

/**
 * Revalidate all profile-related cache paths and tags.
 */
async function revalidateProfileCache(clerkId: string) {
  try {
    // Paths
    revalidatePath('/profile');
    revalidatePath('/profile/edit');
    revalidatePath('/dashboard');

    // Tags - second argument is revalidation type
    revalidateTag('users', 'max');
    revalidateTag('profile-data', 'max');
    revalidateTag(`user-clerk-${clerkId}`, 'max');
  } catch {
    // Revalidation errors shouldn't fail the operation - silently continue
  }
}
