/**
 * Clerk Authentication Mocks
 * Provides mock implementations for @clerk/nextjs
 */
import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { UserRole } from '@/types/user';

// Mock user data
export const mockClerkUser = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  username: 'testuser',
  emailAddresses: [{ emailAddress: 'test@example.com', id: 'email_1' }],
  primaryEmailAddress: { emailAddress: 'test@example.com', id: 'email_1' },
  imageUrl: 'https://example.com/avatar.png',
  hasImage: true,
  publicMetadata: { role: UserRole.USER },
  privateMetadata: {},
  unsafeMetadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockClerkAuth = {
  userId: 'user_test123',
  sessionId: 'sess_test123',
  orgId: 'org_test123',
  orgRole: 'org:member',
  orgSlug: 'test-org',
  sessionClaims: {
    metadata: { role: UserRole.USER },
  },
  getToken: vi.fn().mockResolvedValue('mock-token'),
};

// Factory for different roles
export function createMockClerkUser(role: UserRole) {
  return {
    ...mockClerkUser,
    publicMetadata: { role },
  };
}

export function createMockClerkAuth(role: UserRole) {
  const orgRoleMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'org:admin',
    [UserRole.EDITOR]: 'org:editor',
    [UserRole.USER]: 'org:member',
  };

  return {
    ...mockClerkAuth,
    orgRole: orgRoleMap[role],
    sessionClaims: {
      metadata: { role },
    },
  };
}

// State for dynamic mocking
let currentRole = UserRole.USER;
let isSignedIn = true;
let isLoaded = true;

// Mock @clerk/nextjs hooks
export const mockUseAuth = vi.fn(() => ({
  isLoaded,
  isSignedIn,
  userId: isSignedIn ? mockClerkUser.id : null,
  sessionId: isSignedIn ? mockClerkAuth.sessionId : null,
  orgId: mockClerkAuth.orgId,
  orgRole: createMockClerkAuth(currentRole).orgRole,
  getToken: mockClerkAuth.getToken,
  signOut: vi.fn(),
}));

export const mockUseUser = vi.fn(() => ({
  isLoaded,
  isSignedIn,
  user: isSignedIn ? createMockClerkUser(currentRole) : null,
}));

export const mockUseClerk = vi.fn(() => ({
  signOut: vi.fn(),
  openSignIn: vi.fn(),
  openSignUp: vi.fn(),
  openUserProfile: vi.fn(),
  user: isSignedIn ? createMockClerkUser(currentRole) : null,
  session: isSignedIn ? { id: mockClerkAuth.sessionId } : null,
}));

export const mockUseSession = vi.fn(() => ({
  isLoaded,
  isSignedIn,
  session: isSignedIn ? { id: mockClerkAuth.sessionId, user: createMockClerkUser(currentRole) } : null,
}));

export const mockUseOrganization = vi.fn(() => ({
  isLoaded,
  organization: null,
  membership: null,
}));

// Mock components
export const MockClerkProvider = ({ children }: { children: ReactNode }) => children;
export const MockSignedIn = ({ children }: { children: ReactNode }) => (isSignedIn ? children : null);
export const MockSignedOut = ({ children }: { children: ReactNode }) => (isSignedIn ? null : children);
export const MockSignIn = () => null;
export const MockSignUp = () => null;
export const MockUserButton = () => null;

// Complete mock module
export const mockClerkNextjs = {
  // Server functions
  auth: vi.fn().mockResolvedValue(mockClerkAuth),
  currentUser: vi.fn().mockResolvedValue(mockClerkUser),

  // Hooks
  useAuth: mockUseAuth,
  useUser: mockUseUser,
  useClerk: mockUseClerk,
  useSession: mockUseSession,
  useOrganization: mockUseOrganization,

  // Components
  ClerkProvider: MockClerkProvider,
  SignedIn: MockSignedIn,
  SignedOut: MockSignedOut,
  SignIn: MockSignIn,
  SignUp: MockSignUp,
  UserButton: MockUserButton,

  // Redirect functions
  redirectToSignIn: vi.fn(),
  redirectToSignUp: vi.fn(),
};

// Helper to change user role during tests
export function setMockUserRole(role: UserRole) {
  currentRole = role;
  const authData = createMockClerkAuth(role);
  const userData = createMockClerkUser(role);

  mockClerkNextjs.auth.mockResolvedValue(authData);
  mockClerkNextjs.currentUser.mockResolvedValue(userData);
}

// Helper to set signed in state
export function setMockSignedIn(signedIn: boolean) {
  isSignedIn = signedIn;
}

// Helper to set loaded state
export function setMockLoaded(loaded: boolean) {
  isLoaded = loaded;
}

// Reset all mocks to defaults
export function resetClerkMocks() {
  currentRole = UserRole.USER;
  isSignedIn = true;
  isLoaded = true;
  mockClerkNextjs.auth.mockResolvedValue(mockClerkAuth);
  mockClerkNextjs.currentUser.mockResolvedValue(mockClerkUser);
}

// Setup function to be called in test setup
export function setupClerkMocks() {
  vi.mock('@clerk/nextjs', () => mockClerkNextjs);
  vi.mock('@clerk/nextjs/server', () => ({
    auth: mockClerkNextjs.auth,
    currentUser: mockClerkNextjs.currentUser,
  }));
}
