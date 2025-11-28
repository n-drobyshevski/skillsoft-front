import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Clerk Webhook Handler
 * 
 * Receives webhook events from Clerk and syncs user data to the backend.
 * Events handled:
 * - user.created: Create new user in backend
 * - user.updated: Update user in backend
 * - user.deleted: Delete/deactivate user in backend
 * 
 * Setup:
 * 1. Go to Clerk Dashboard > Webhooks
 * 2. Add endpoint: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy the Signing Secret to CLERK_WEBHOOK_SIGNING_SECRET env var
 */

const BACKEND_API_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
const WEBHOOK_SERVICE_ID = 'webhook-service';

interface ClerkUserData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
    verification: { status: string };
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  username: string | null;
  created_at: number;
  updated_at: number;
  last_sign_in_at: number | null;
  public_metadata: {
    role?: string;
  };
  private_metadata: Record<string, unknown>;
}

interface BackendUser {
  id: string;
  clerkId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface WebhookResult {
  success: boolean;
  message: string;
}

/**
 * Map Clerk user data to backend user format
 */
function mapClerkUserToBackend(clerkUser: ClerkUserData) {
  const primaryEmail = clerkUser.email_addresses?.find(
    (email) => email.verification?.status === 'verified'
  )?.email_address || clerkUser.email_addresses?.[0]?.email_address;

  // Get role from public_metadata, default to USER
  const role = clerkUser.public_metadata?.role?.toUpperCase() || 'USER';
  const validRoles = ['USER', 'EDITOR', 'ADMIN'];
  const finalRole = validRoles.includes(role) ? role : 'USER';

  return {
    clerkId: clerkUser.id,
    email: primaryEmail,
    firstName: clerkUser.first_name,
    lastName: clerkUser.last_name,
    imageUrl: clerkUser.image_url,
    username: clerkUser.username,
    role: finalRole,
    isActive: true,
    clerkCreatedAt: clerkUser.created_at ? new Date(clerkUser.created_at).toISOString() : null,
    lastSignInAt: clerkUser.last_sign_in_at ? new Date(clerkUser.last_sign_in_at).toISOString() : null,
  };
}

/**
 * Helper to get auth headers for backend calls
 */
function getWebhookAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': process.env.CLERK_WEBHOOK_SIGNING_SECRET || '',
    'X-User-Role': 'ADMIN',
    'X-User-Id': WEBHOOK_SERVICE_ID,
  };
}

/**
 * Handle user.created event
 */
async function handleUserCreated(userData: ClerkUserData): Promise<WebhookResult> {
  const mappedUser = mapClerkUserToBackend(userData);
  
  const response = await fetch(`${BACKEND_API_URL}/users`, {
    method: 'POST',
    headers: getWebhookAuthHeaders(),
    body: JSON.stringify(mappedUser),
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Return success for duplicate users (409) to prevent Clerk retries
    if (response.status === 409) {
      return { success: true, message: 'User already exists in backend' };
    }
    
    return { success: false, message: `Backend error: ${response.status} ${errorText}` };
  }

  const createdUser = (await response.json()) as BackendUser;
  return { success: true, message: `User created: ${createdUser.id}` };
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(userData: ClerkUserData): Promise<WebhookResult> {
  const mappedUser = mapClerkUserToBackend(userData);
  
  // First try to find user by clerkId
  const findResponse = await fetch(`${BACKEND_API_URL}/users/clerk/${userData.id}`, {
    headers: getWebhookAuthHeaders(),
  });

  if (findResponse.status === 404) {
    // User doesn't exist yet, create them
    const createResponse = await fetch(`${BACKEND_API_URL}/users`, {
      method: 'POST',
      headers: getWebhookAuthHeaders(),
      body: JSON.stringify(mappedUser),
    });

    if (!createResponse.ok && createResponse.status !== 409) {
      const errorText = await createResponse.text();
      return { success: false, message: `Backend error creating user: ${createResponse.status} ${errorText}` };
    }
    return { success: true, message: 'User created (was not found for update)' };
  }
  
  if (findResponse.ok) {
    // User exists, update them
    const existingUser = (await findResponse.json()) as BackendUser;
    
    const updateResponse = await fetch(`${BACKEND_API_URL}/users/${existingUser.id}`, {
      method: 'PUT',
      headers: getWebhookAuthHeaders(),
      body: JSON.stringify({
        ...existingUser,
        ...mappedUser,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      return { success: false, message: `Backend error: ${updateResponse.status} ${errorText}` };
    }
    return { success: true, message: 'User updated' };
  }

  return { success: false, message: 'Error finding user' };
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(userData: ClerkUserData): Promise<WebhookResult> {
  // Find user by clerkId
  const findResponse = await fetch(`${BACKEND_API_URL}/users/clerk/${userData.id}`, {
    headers: getWebhookAuthHeaders(),
  });

  if (findResponse.ok) {
    // Soft delete - mark as inactive
    const deactivateResponse = await fetch(`${BACKEND_API_URL}/users/clerk/${userData.id}/deactivate`, {
      method: 'POST',
      headers: getWebhookAuthHeaders(),
    });

    if (!deactivateResponse.ok) {
      const errorText = await deactivateResponse.text();
      return { success: false, message: `Backend error deactivating user: ${deactivateResponse.status} ${errorText}` };
    }
    return { success: true, message: 'User deactivated' };
  }
  
  return { success: true, message: 'User not found in backend, nothing to deactivate' };
}

/**
 * POST handler for Clerk webhooks
 * This endpoint is public (no auth required) - verified via webhook signature
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature using Clerk's helper
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    // Type guard for user events
    if (!('id' in evt.data)) {
      return NextResponse.json({ message: 'Event data missing id' }, { status: 400 });
    }

    const userData = evt.data as unknown as ClerkUserData;

    let result: WebhookResult;

    switch (eventType) {
      case 'user.created':
        result = await handleUserCreated(userData);
        break;

      case 'user.updated':
        result = await handleUserUpdated(userData);
        break;

      case 'user.deleted':
        result = await handleUserDeleted(userData);
        break;

      default:
        result = { success: true, message: `Unhandled event type: ${eventType}` };
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (err) {
    // Return 400 for verification errors, 500 for other errors
    const isVerificationError = err instanceof Error && 
      (err.message.includes('verify') || err.message.includes('signature'));
    
    return NextResponse.json(
      { error: 'Webhook processing failed', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: isVerificationError ? 400 : 500 }
    );
  }
}

/**
 * GET handler - returns webhook status info (for debugging)
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/clerk',
    events: ['user.created', 'user.updated', 'user.deleted'],
    backendUrl: BACKEND_API_URL,
    signingSecretConfigured: !!process.env.CLERK_WEBHOOK_SIGNING_SECRET,
  });
}
