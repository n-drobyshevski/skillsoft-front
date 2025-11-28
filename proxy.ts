import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/app/types/globals.d';

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/competencies(.*)',
  '/behavioral-indicators(.*)',
  '/assessment-questions(.*)',
  '/stats-demo(.*)',
  '/users(.*)',
]);

// Routes that require ADMIN role
const isAdminRoute = createRouteMatcher([
  '/users(.*)',
]);

// Routes that require ADMIN or EDITOR role (content management)
const isEditorRoute = createRouteMatcher([
  '/competencies/new',
  '/competencies/(.*)/edit',
  '/behavioral-indicators/new',
  '/behavioral-indicators/(.*)/edit',
  '/assessment-questions/new',
  '/assessment-questions/(.*)/edit',
]);

// Public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

/**
 * Get user role from Clerk auth object.
 * 
 * IMPORTANT: Clerk provides `orgRole` directly on the auth object (e.g., "org:admin"),
 * NOT in sessionClaims. The sessionClaims contain abbreviated org info as `o.rol`.
 */
function getUserRoleFromAuthObject(orgRole: string | undefined, sessionClaims: Record<string, unknown> | null): UserRole {
  // Priority 1: Organization role from auth object (this is the correct source)
  if (orgRole === 'org:admin') return 'ADMIN';
  if (orgRole === 'org:editor') return 'EDITOR';
  if (orgRole === 'org:member') return 'USER';
  
  // Priority 2: publicMetadata.role (set manually or via sync)
  if (sessionClaims) {
    const metadata = sessionClaims.metadata as { role?: string } | undefined;
    const metadataRole = metadata?.role;
    if (metadataRole && ['ADMIN', 'EDITOR', 'USER'].includes(metadataRole)) {
      return metadataRole as UserRole;
    }
  }
  
  // Default to USER
  return 'USER';
}

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();
  const { userId, sessionClaims, orgRole } = authObject;
  
  // Get user's role from auth object (not sessionClaims)
  // Clerk provides orgRole directly on auth object, not in sessionClaims
  const userRole = getUserRoleFromAuthObject(orgRole as string | undefined, sessionClaims as Record<string, unknown> | null);
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('🔍 Middleware Debug:', {
      path: req.nextUrl.pathname,
      isProtected: isProtectedRoute(req),
      isAdmin: isAdminRoute(req),
      isEditor: isEditorRoute(req),
      userId: userId,
      userRole: userRole,
      orgRole: orgRole,  // from auth object directly
      metadataRole: ((sessionClaims as Record<string, unknown>)?.metadata as { role?: string })?.role,
    });
  }

  // Skip public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Check if route requires authentication
  if (isProtectedRoute(req)) {
    // Require authentication for all protected routes
    if (!userId) {
      await auth.protect();
      return;
    }
    
    // Check ADMIN routes
    if (isAdminRoute(req)) {
      if (userRole !== 'ADMIN') {
        // eslint-disable-next-line no-console
        console.log(`🚫 Access denied to admin route: ${req.nextUrl.pathname} (role: ${userRole})`);
        const url = new URL('/dashboard', req.url);
        url.searchParams.set('error', 'unauthorized');
        url.searchParams.set('message', 'Admin access required');
        return NextResponse.redirect(url);
      }
    }
    
    // Check EDITOR routes (ADMIN or EDITOR can access)
    if (isEditorRoute(req)) {
      if (!['ADMIN', 'EDITOR'].includes(userRole)) {
        // eslint-disable-next-line no-console
        console.log(`🚫 Access denied to editor route: ${req.nextUrl.pathname} (role: ${userRole})`);
        const url = new URL('/dashboard', req.url);
        url.searchParams.set('error', 'unauthorized');
        url.searchParams.set('message', 'Editor access required');
        return NextResponse.redirect(url);
      }
    }
  }
}, { debug: process.env.NODE_ENV === 'development' });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};