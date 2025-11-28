import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * API Route: Create User in Clerk
 * 
 * Creates a new user in Clerk using the Backend SDK.
 * After creation, Clerk will send a webhook to /api/webhooks/clerk
 * which will sync the user to our backend database.
 * 
 * Required: ADMIN role
 */

export interface CreateUserRequest {
  email?: string;
  username?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'USER' | 'EDITOR' | 'ADMIN';
}

export interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    username?: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
  };
  error?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format
 */
function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 20) return false;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

/**
 * Validate user creation request
 */
function validateRequest(body: CreateUserRequest): string | null {
  const { email, username, password, role = 'USER' } = body;

  const hasEmail = email && email.length > 0;
  const hasUsername = username && username.length > 0;

  if (!hasEmail && !hasUsername) {
    return 'Either email or username is required';
  }

  if (hasEmail && !isValidEmail(email)) {
    return 'Invalid email format';
  }

  if (hasUsername && !isValidUsername(username)) {
    return 'Username must be 3-20 characters, letters, numbers, and underscores only';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  const validRoles = ['USER', 'EDITOR', 'ADMIN'];
  if (!validRoles.includes(role)) {
    return 'Invalid role. Must be USER, EDITOR, or ADMIN';
  }

  return null;
}

/**
 * Build Clerk user creation options
 */
function buildCreateOptions(body: CreateUserRequest) {
  const { email, username, password, firstName, lastName, role = 'USER' } = body;
  
  const options: {
    password: string;
    firstName?: string;
    lastName?: string;
    publicMetadata: { role: string };
    emailAddress?: string[];
    username?: string;
  } = {
    password,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    publicMetadata: { role },
  };

  if (email && email.length > 0) {
    options.emailAddress = [email];
  }

  if (username && username.length > 0) {
    options.username = username;
  }

  return options;
}

/**
 * Handle Clerk API errors
 */
function handleClerkError(error: Error): NextResponse<CreateUserResponse> {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('email') && errorMessage.includes('taken')) {
    return NextResponse.json(
      { success: false, error: 'A user with this email already exists' },
      { status: 409 }
    );
  }

  if (errorMessage.includes('username') && errorMessage.includes('taken')) {
    return NextResponse.json(
      { success: false, error: 'A user with this username already exists' },
      { status: 409 }
    );
  }

  if (errorMessage.includes('password')) {
    return NextResponse.json(
      { success: false, error: 'Password does not meet requirements' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}

/**
 * POST /api/users/create
 * Creates a new user in Clerk
 */
export async function POST(req: NextRequest): Promise<NextResponse<CreateUserResponse>> {
  try {
    // Check authentication
    const authResult = await auth();
    const { userId, orgRole } = authResult;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check for admin role
    if (orgRole !== 'org:admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate request
    const body = await req.json() as CreateUserRequest;
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Create user in Clerk
    const client = await clerkClient();
    const createOptions = buildCreateOptions(body);
    const newUser = await client.users.createUser(createOptions);

    // Revalidate cache to refresh user lists
    revalidatePath('/users');
    revalidatePath('/');
    revalidateTag('users', 'max');
    revalidateTag('users-stats', 'max');

    // Trigger manual sync with backend to ensure user is synced immediately
    // This is in addition to the Clerk webhook for reliability
    try {
      const syncUrl = new URL('/api/users/sync', req.url);
      await fetch(syncUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward auth cookies for authentication
          cookie: req.headers.get('cookie') || '',
        },
      });
    } catch {
      // Silently ignore - the webhook will also sync the user
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.emailAddresses[0]?.emailAddress,
        username: newUser.username || undefined,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: body.role || 'USER',
      },
    });

  } catch (error) {
    if (error instanceof Error) {
      return handleClerkError(error);
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
