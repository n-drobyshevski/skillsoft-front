/**
 * Next.js 16 Proxy Configuration
 * 
 * In Next.js 16, middleware.ts was renamed to proxy.ts with the function
 * named `proxy` instead of `middleware`. This file handles:
 * - Authentication checks (optimistic, cookie-based)
 * - Role-based route protection
 * - Redirect logic for unauthorized access
 * 
 * Note: This uses Clerk's clerkMiddleware which wraps the proxy pattern.
 * For secure checks, use the Data Access Layer (DAL) in Server Components.
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { UserRole } from '@/types/user';

// ============================================================================
// Route Matchers - Define which routes require authentication/authorization
// ============================================================================

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/test-templates(.*)',
  '/hr/competencies(.*)',
  '/hr/behavioral-indicators(.*)',
  '/hr/assessment-questions(.*)',
  '/admin/users(.*)',
  '/skill-mapper(.*)',
  '/stats-demo(.*)',
]);

// Routes that require ADMIN role only
const isAdminRoute = createRouteMatcher([
  '/admin/users(.*)',
]);

// Routes that require ADMIN or EDITOR role (content management - Library section)
const isEditorRoute = createRouteMatcher([
  // Competencies - write operations
  '/hr/competencies/new',
  '/hr/competencies/(.*)/edit',
  // Behavioral Indicators - write operations
  '/hr/behavioral-indicators/new',
  '/hr/behavioral-indicators/(.*)/edit',
  // Assessment Questions - write operations
  '/hr/assessment-questions/new',
  '/hr/assessment-questions/(.*)/edit',
  // Skill Mapper (tool for editors/admins)
  '/skill-mapper(.*)',
]);

// Routes that ADMIN/EDITOR can view (read-only access for library content)
const isLibraryRoute = createRouteMatcher([
  '/hr/competencies(.*)',
  '/hr/behavioral-indicators(.*)',
  '/hr/assessment-questions(.*)',
]);

// Public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/docs(.*)',  // Documentation is publicly accessible
]);

// ============================================================================
// Constants
// ============================================================================

const DASHBOARD_PATH = '/dashboard';
const ALLOWED_ROLES = ['ADMIN', 'EDITOR'] as const;
const VALID_ROLES = ['ADMIN', 'EDITOR', 'USER'] as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get user role from Clerk auth object.
 * 
 * IMPORTANT: Clerk provides `orgRole` directly on the auth object (e.g., "org:admin"),
 * NOT in sessionClaims. The sessionClaims contain abbreviated org info as `o.rol`.
 * 
 * This is an "optimistic check" - we read from the session/cookie only.
 * For secure authorization, use the Data Access Layer (DAL) in Server Components.
 */
function getUserRoleFromAuthObject(
  orgRole: string | undefined, 
  sessionClaims: Record<string, unknown> | null
): UserRole {
  // Priority 1: Organization role from auth object (this is the correct source)
  if (orgRole === 'org:admin') return UserRole.ADMIN;
  if (orgRole === 'org:editor') return UserRole.EDITOR;
  if (orgRole === 'org:member') return UserRole.USER;
  
  // Priority 2: publicMetadata.role (set manually or via sync)
  if (sessionClaims) {
    const metadata = sessionClaims.metadata as { role?: string } | undefined;
    const metadataRole = metadata?.role;
    if (metadataRole && VALID_ROLES.includes(metadataRole as typeof VALID_ROLES[number])) {
      return metadataRole as UserRole;
    }
  }
  
  // Default to USER
  return UserRole.USER;
}

/**
 * Check if user has required role for content management routes
 */
function hasContentManagementAccess(role: UserRole): boolean {
  return ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number]);
}

/**
 * Create unauthorized redirect URL
 */
function createUnauthorizedRedirect(baseUrl: string, message: string): URL {
  const url = new URL(DASHBOARD_PATH, baseUrl);
  url.searchParams.set('error', 'unauthorized');
  url.searchParams.set('message', message);
  return url;
}

// ============================================================================
// Proxy Function (Next.js 16)
// ============================================================================

/**
 * Next.js 16 Proxy using Clerk middleware
 * 
 * This proxy performs optimistic authorization checks based on session cookies.
 * It provides the first layer of protection, but actual authorization should
 * be verified in Server Components using the Data Access Layer (DAL).
 * 
 * Pattern: Optimistic checks in proxy, secure checks in DAL
 */
export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();
  const { userId, sessionClaims, orgRole } = authObject;
  
  // Get user's role from auth object (optimistic check from cookie/session)
  const userRole = getUserRoleFromAuthObject(
    orgRole as string | undefined, 
    sessionClaims as Record<string, unknown> | null
  );

  // Skip public routes - no auth needed
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
    
    // Check ADMIN routes (only ADMIN can access)
    if (isAdminRoute(req) && userRole !== 'ADMIN') {
      const redirectUrl = createUnauthorizedRedirect(req.url, 'Admin access required');
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check Library routes (ADMIN or EDITOR can access)
    if (isLibraryRoute(req) && !hasContentManagementAccess(userRole)) {
      const redirectUrl = createUnauthorizedRedirect(req.url, 'Editor access required');
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check EDITOR routes for write operations (ADMIN or EDITOR can access)
    if (isEditorRoute(req) && !hasContentManagementAccess(userRole)) {
      const redirectUrl = createUnauthorizedRedirect(req.url, 'Editor access required');
      return NextResponse.redirect(redirectUrl);
    }
  }
}, { debug: false });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};