import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/competencies(.*)',
  '/behavioral-indicators(.*)',
  '/assessment-questions(.*)',
  '/stats-demo(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('🔍 Middleware Debug:', {
      path: req.nextUrl.pathname,
      isProtected: isProtectedRoute(req),
      userId: authObject.userId,
      isSignedIn: !!authObject.userId
    });
  }

  if (isProtectedRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('🔒 Protecting route:', req.nextUrl.pathname);
    }
    await auth.protect();
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