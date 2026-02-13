import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Public routes that do not require authentication.
 * Includes: landing page, auth pages, public docs, anonymous test-taking,
 * API webhooks, and static assets.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/docs(.*)',
  '/take(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
]);

/**
 * Clerk proxy for server-level authentication (Next.js 16+ convention).
 *
 * Protects all workspace routes (dashboard, admin, hr, test-templates, etc.)
 * before the app shell loads. Runs on Node.js runtime (not edge).
 */
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
