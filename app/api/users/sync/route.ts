import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Backend API URL
const getBackendUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // If API_URL is set, use it directly (it should be the full base URL like "backend.railway.app")
  // Otherwise, fall back to localhost for development
  if (apiUrl) {
    // If it already has a protocol, use it as-is with /api suffix
    if (apiUrl.startsWith('https://')) {
      return `${apiUrl}/api`;
    }
    // Otherwise, add https protocol
    return `https://${apiUrl}/api`;
  }
  // Local development
  return 'http://localhost:8080/api';
};

/**
 * Map Clerk organization role to our application role
 */
function mapOrgRole(orgRole: string | undefined | null): 'ADMIN' | 'EDITOR' | 'USER' {
  if (!orgRole) return 'USER';
  if (orgRole === 'org:admin') return 'ADMIN';
  if (orgRole === 'org:editor') return 'EDITOR';
  return 'USER';
}

interface ClerkUserForSync {
  clerkId: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  hasImage: boolean;
  banned: boolean;
  locked: boolean;
  clerkCreatedAt: number | null;  // Unix timestamp in milliseconds
  lastSignInAt: number | null;    // Unix timestamp in milliseconds
  role: string;
}

interface BackendSyncResult {
  success: boolean;
  created?: number;
  updated?: number;
  failed?: number;
  total?: number;
  errors?: string[];
}

/**
 * POST /api/users/sync
 * Fetches all users from Clerk and syncs them to the backend database.
 * This is a manual sync endpoint for administrators.
 */
export async function POST() {
  try {
    // Verify the user is authenticated
    const authResult = await auth();
    const { userId, orgRole } = authResult;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role - allow ADMIN, EDITOR, or if no role system is set up yet
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const userRole = currentUser.publicMetadata?.role as string | undefined;
    
    // In development or if no roles are configured, allow sync
    // In production, restrict to ADMIN and EDITOR roles
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasRequiredRole = !userRole || userRole === 'ADMIN' || userRole === 'EDITOR';
    
    if (!isDevelopment && userRole && !hasRequiredRole) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin or Editor access required' },
        { status: 403 }
      );
    }

    // Determine the role to use for backend authentication
    // Priority: Organization role > metadata role > default ADMIN (for sync operations)
    const backendRole = mapOrgRole(orgRole) || (userRole as 'ADMIN' | 'EDITOR' | 'USER') || 'ADMIN';

    // Fetch all users from Clerk with pagination
    const allUsers: ClerkUserForSync[] = [];
    let offset = 0;
    const limit = 100; // Max per request
    let hasMore = true;

    // Get the organization ID - from env or fetch the first organization (we have only one)
    let organizationId = process.env.CLERK_ORGANIZATION_ID;
    
    if (!organizationId) {
      try {
        const orgs = await client.organizations.getOrganizationList({ limit: 1 });
        if (orgs.data.length > 0) {
          organizationId = orgs.data[0].id;
        }
      } catch {
        // Organization fetch failed — roles will fall back to publicMetadata
      }
    }
    
    // Build a map of user roles from organization memberships
    const userRolesMap = new Map<string, string>();
    
    if (organizationId) {
      try {
        // Fetch organization memberships to get accurate roles
        let memberOffset = 0;
        let hasMoreMembers = true;
        
        while (hasMoreMembers) {
          const memberships = await client.organizations.getOrganizationMembershipList({
            organizationId,
            limit: 100,
            offset: memberOffset,
          });
          
          for (const membership of memberships.data) {
            // Map Clerk org roles to our application roles
            // org:admin -> ADMIN, org:editor -> EDITOR (custom), org:member -> USER
            const orgRole = membership.role;
            let appRole = 'USER';
            
            if (orgRole === 'org:admin') {
              appRole = 'ADMIN';
            } else if (orgRole === 'org:editor') {
              appRole = 'EDITOR';
            } else if (orgRole === 'org:member') {
              appRole = 'USER';
            }
            
            userRolesMap.set(membership.publicUserData?.userId || '', appRole);
          }
          
          if (memberships.data.length < 100) {
            hasMoreMembers = false;
          } else {
            memberOffset += 100;
          }
        }
      } catch {
        // Membership fetch failed — roles will fall back to publicMetadata
      }
    }

    while (hasMore) {
      const response = await client.users.getUserList({
        limit,
        offset,
        orderBy: '-created_at',
      });

      const users = response.data.map((user) => {
        // Priority: 1) Organization membership role, 2) publicMetadata.role, 3) default USER
        const orgMembershipRole = userRolesMap.get(user.id);
        const publicMetadataRole = user.publicMetadata?.role as string | undefined;
        
        let role = orgMembershipRole || publicMetadataRole || 'USER';
        
        // Normalize role to uppercase
        role = role.toUpperCase();
        
        // Validate role is one of our known roles
        if (!['ADMIN', 'EDITOR', 'USER'].includes(role)) {
          role = 'USER';
        }
        
        return {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || null,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          hasImage: user.hasImage,
          banned: user.banned,
          locked: user.locked,
          clerkCreatedAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          role,
        };
      });

      allUsers.push(...users);

      // Check if there are more users
      if (response.data.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    if (allUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in Clerk to sync',
        created: 0,
        updated: 0,
        failed: 0,
        total: 0,
      });
    }

    const backendUrl = `${getBackendUrl()}/users/clerk/sync-all`;
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'X-User-Role': backendRole,
      },
      body: JSON.stringify(allUsers),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend sync failed: ${backendResponse.status}`,
          details: errorText 
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json() as BackendSyncResult;

    // Revalidate the users cache so the UI updates
    revalidatePath('/users');
    revalidatePath('/');
    revalidateTag('users', 'max');
    revalidateTag('users-stats', 'max');

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allUsers.length} users from Clerk`,
      created: result.created,
      updated: result.updated,
      failed: result.failed,
      total: result.total,
      errors: result.errors,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync users from Clerk',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/sync
 * Returns sync status/info (optional utility endpoint)
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return basic info about the sync capability
    return NextResponse.json({
      success: true,
      message: 'Use POST to sync users from Clerk to the backend',
      endpoint: '/api/users/sync',
      method: 'POST',
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
