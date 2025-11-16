import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', // Allow access to homepage
  '/api(.*)', // Allow API routes
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/competencies(.*)',
  '/behavioral-indicators(.*)',
  '/assessment-questions(.*)',
  '/stats-demo(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without protection
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Get response from Next.js
  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};