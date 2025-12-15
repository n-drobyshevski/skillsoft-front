/**
 * Centralized type exports for Skillsoft application.
 * Import from '@/types' for all type needs.
 */

// Domain types (competencies, indicators, questions, tests)
export * from './domain';

// User types (authentication, roles)
export * from './user';

// Skills types (ESCO, O*NET, search)
export * from './skills';

// Error types (API errors, validation errors)
export * from './errors';

// Global types (Clerk session, RBAC)
export { ROLE_HIERARCHY, ROUTE_PERMISSIONS } from './globals.d';
