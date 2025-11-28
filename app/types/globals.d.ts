/**
 * Global TypeScript definitions for Skillsoft application.
 * This file defines types for Clerk session claims and RBAC.
 */

export {};

// Define the roles available in the application
export type UserRole = 'ADMIN' | 'EDITOR' | 'USER';

// Extend Clerk's session claims to include our custom metadata
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
    // Organization membership data (if using Clerk Organizations)
    org_role?: string;
    org_id?: string;
    org_slug?: string;
  }
}

/**
 * Role hierarchy for permission checking.
 * Higher number = more permissions.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

/**
 * Route permissions configuration.
 * Defines which roles can access which routes.
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  // Admin-only routes
  '/users': ['ADMIN'],
  '/users/(.*)': ['ADMIN'],
  
  // Editor and Admin routes
  '/competencies/new': ['ADMIN', 'EDITOR'],
  '/competencies/(.*)/edit': ['ADMIN', 'EDITOR'],
  '/behavioral-indicators/new': ['ADMIN', 'EDITOR'],
  '/behavioral-indicators/(.*)/edit': ['ADMIN', 'EDITOR'],
  '/assessment-questions/new': ['ADMIN', 'EDITOR'],
  '/assessment-questions/(.*)/edit': ['ADMIN', 'EDITOR'],
  
  // All authenticated users
  '/dashboard': ['ADMIN', 'EDITOR', 'USER'],
  '/competencies': ['ADMIN', 'EDITOR', 'USER'],
  '/behavioral-indicators': ['ADMIN', 'EDITOR', 'USER'],
  '/assessment-questions': ['ADMIN', 'EDITOR', 'USER'],
  '/stats-demo': ['ADMIN', 'EDITOR', 'USER'],
};
