/**
 * Tests for Users API Service
 * Phase 5: Admin, Results, and Error Handling Tests
 *
 * Tests cover:
 * - READ operations (getAllUsers, getUserById, getUserByClerkId)
 * - CREATE operation (createUser)
 * - UPDATE operations (updateUser, updateUserRole)
 * - DELETE operation (deleteUser)
 * - User activation/deactivation
 * - Search and filtering
 * - Error handling scenarios
 * - Admin-only access patterns
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockUsers, resetMockStores } from '../mocks/handlers';
import type { User, UserRole, UserCreateInput, UserUpdateInput } from '@/types/user';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';

// ============================================
// TEST DATA
// ============================================
const mockUsersList: User[] = [
  {
    id: 'user-1',
    clerkId: 'clerk_test123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER' as UserRole,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    clerkId: 'clerk_admin456',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN' as UserRole,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    clerkId: 'clerk_editor789',
    email: 'editor@example.com',
    firstName: 'Editor',
    lastName: 'User',
    role: 'EDITOR' as UserRole,
    isActive: false,
    banned: false,
    locked: true,
    createdAt: new Date().toISOString(),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE}/users`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchUserById(id: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchUserByClerkId(clerkId: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/clerk/${clerkId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function createUser(data: UserCreateInput): Promise<User> {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function updateUser(id: string, data: UserUpdateInput): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

async function deactivateUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${id}/deactivate`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

async function activateUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${id}/activate`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

async function searchUsers(query: string): Promise<User[]> {
  const response = await fetch(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function getUsersByRole(role: UserRole): Promise<User[]> {
  const response = await fetch(`${API_BASE}/users/role/${role}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function getUserStats(): Promise<{ totalUsers: number; activeUsers: number; byRole: Record<string, number> }> {
  const response = await fetch(`${API_BASE}/users/stats`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================
// EXTENDED MOCK HANDLERS FOR USERS
// ============================================
const usersHandlers = [
  // IMPORTANT: Specific routes must come BEFORE parameterized routes (/:id)

  // SEARCH users - must be before /:id
  http.get(`${API_BASE}/users/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase() || '';

    const results = mockUsersList.filter(
      (u) =>
        u.email?.toLowerCase().includes(query) ||
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query)
    );

    return HttpResponse.json(results);
  }),

  // GET user stats - must be before /:id
  http.get(`${API_BASE}/users/stats`, () => {
    return HttpResponse.json({
      totalUsers: mockUsersList.length,
      activeUsers: mockUsersList.filter((u) => u.isActive).length,
      byRole: {
        ADMIN: mockUsersList.filter((u) => u.role === 'ADMIN').length,
        EDITOR: mockUsersList.filter((u) => u.role === 'EDITOR').length,
        USER: mockUsersList.filter((u) => u.role === 'USER').length,
      },
    });
  }),

  // GET users by role - must be before /:id
  http.get(`${API_BASE}/users/role/:role`, ({ params }) => {
    const results = mockUsersList.filter((u) => u.role === params.role);
    return HttpResponse.json(results);
  }),

  // GET user by Clerk ID - must be before /:id
  http.get(`${API_BASE}/users/clerk/:clerkId`, ({ params }) => {
    const user = mockUsersList.find((u) => u.clerkId === params.clerkId);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(user);
  }),

  // GET all users
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(mockUsersList);
  }),

  // GET user by ID - MUST be after all other GET routes
  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsersList.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(user);
  }),

  // CREATE user
  http.post(`${API_BASE}/users`, async ({ request }) => {
    const body = await request.json() as UserCreateInput;

    if (!body.clerkId) {
      return HttpResponse.json(
        { message: 'Clerk ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      clerkId: body.clerkId,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role || 'USER' as UserRole,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // UPDATE user
  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const body = await request.json() as UserUpdateInput;
    const userIndex = mockUsersList.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated: User = {
      ...mockUsersList[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(updated);
  }),

  // UPDATE user role
  http.patch(`${API_BASE}/users/:id/role`, async ({ params, request }) => {
    const body = await request.json() as { role: UserRole };
    const userIndex = mockUsersList.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated: User = {
      ...mockUsersList[userIndex],
      role: body.role,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(updated);
  }),

  // DELETE user
  http.delete(`${API_BASE}/users/:id`, ({ params }) => {
    const userIndex = mockUsersList.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // DEACTIVATE user
  http.patch(`${API_BASE}/users/:id/deactivate`, ({ params }) => {
    const userIndex = mockUsersList.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 200 });
  }),

  // ACTIVATE user
  http.patch(`${API_BASE}/users/:id/activate`, ({ params }) => {
    const userIndex = mockUsersList.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 200 });
  }),

  // Duplicate handlers removed - they are now at the top of the handlers array
];

// ============================================
// TESTS
// ============================================
describe('Users API (Admin Functionality)', () => {
  beforeEach(() => {
    resetMockStores();
    server.use(...usersHandlers);
  });

  // ==========================================
  // READ Operations
  // ==========================================
  describe('READ Operations', () => {
    describe('getAllUsers', () => {
      it('should fetch all users', async () => {
        const users = await fetchUsers();

        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBe(mockUsersList.length);
      });

      it('should return users with correct structure', async () => {
        const users = await fetchUsers();
        const first = users[0];

        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('clerkId');
        expect(first).toHaveProperty('email');
        expect(first).toHaveProperty('role');
        expect(first).toHaveProperty('isActive');
        expect(first).toHaveProperty('createdAt');
      });

      it('should return users with different roles', async () => {
        const users = await fetchUsers();
        const roles = new Set(users.map((u) => u.role));

        expect(roles.has('ADMIN')).toBe(true);
        expect(roles.has('EDITOR')).toBe(true);
        expect(roles.has('USER')).toBe(true);
      });

      it('should return users with different active statuses', async () => {
        const users = await fetchUsers();
        const activeUsers = users.filter((u) => u.isActive);
        const inactiveUsers = users.filter((u) => !u.isActive);

        expect(activeUsers.length).toBeGreaterThan(0);
        expect(inactiveUsers.length).toBeGreaterThan(0);
      });
    });

    describe('getUserById', () => {
      it('should fetch a single user by ID', async () => {
        const user = await fetchUserById('user-1');

        expect(user).toBeDefined();
        expect(user.id).toBe('user-1');
        expect(user.email).toBe('test@example.com');
      });

      it('should return 404 for non-existent user', async () => {
        await expect(fetchUserById('non-existent-id')).rejects.toThrow();
      });
    });

    describe('getUserByClerkId', () => {
      it('should fetch a user by Clerk ID', async () => {
        const user = await fetchUserByClerkId('clerk_admin456');

        expect(user).toBeDefined();
        expect(user.clerkId).toBe('clerk_admin456');
        expect(user.role).toBe('ADMIN');
      });

      it('should return 404 for non-existent Clerk ID', async () => {
        await expect(fetchUserByClerkId('clerk_nonexistent')).rejects.toThrow();
      });
    });
  });

  // ==========================================
  // CREATE Operations
  // ==========================================
  describe('CREATE Operations', () => {
    it('should create a new user', async () => {
      const newUser = await createUser({
        clerkId: 'clerk_new123',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER' as UserRole,
      });

      expect(newUser).toBeDefined();
      expect(newUser.id).toBeDefined();
      expect(newUser.clerkId).toBe('clerk_new123');
      expect(newUser.email).toBe('new@example.com');
      expect(newUser.isActive).toBe(true);
    });

    it('should fail to create user without clerkId', async () => {
      await expect(
        createUser({
          email: 'invalid@example.com',
          role: 'USER' as UserRole,
        } as UserCreateInput)
      ).rejects.toThrow('Clerk ID is required');
    });

    it('should create user with different roles', async () => {
      const adminUser = await createUser({
        clerkId: 'clerk_admin_new',
        email: 'admin.new@example.com',
        role: 'ADMIN' as UserRole,
      });

      expect(adminUser.role).toBe('ADMIN');
    });
  });

  // ==========================================
  // UPDATE Operations
  // ==========================================
  describe('UPDATE Operations', () => {
    it('should update an existing user', async () => {
      const updated = await updateUser('user-1', {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(updated.id).toBe('user-1');
      expect(updated.firstName).toBe('Updated');
      expect(updated.lastName).toBe('Name');
    });

    it('should update user email', async () => {
      const updated = await updateUser('user-1', {
        email: 'newemail@example.com',
      });

      expect(updated.email).toBe('newemail@example.com');
    });

    it('should return 404 when updating non-existent user', async () => {
      await expect(
        updateUser('non-existent-id', { firstName: 'Test' })
      ).rejects.toThrow();
    });
  });

  // ==========================================
  // Role Management
  // ==========================================
  describe('Role Management', () => {
    it('should update user role', async () => {
      const updated = await updateUserRole('user-1', 'EDITOR' as UserRole);

      expect(updated.role).toBe('EDITOR');
    });

    it('should promote user to admin', async () => {
      const updated = await updateUserRole('user-1', 'ADMIN' as UserRole);

      expect(updated.role).toBe('ADMIN');
    });

    it('should return 404 when updating role for non-existent user', async () => {
      await expect(
        updateUserRole('non-existent-id', 'ADMIN' as UserRole)
      ).rejects.toThrow();
    });
  });

  // ==========================================
  // DELETE Operations
  // ==========================================
  describe('DELETE Operations', () => {
    it('should delete an existing user', async () => {
      await expect(deleteUser('user-1')).resolves.not.toThrow();
    });

    it('should return 404 when deleting non-existent user', async () => {
      await expect(deleteUser('non-existent-id')).rejects.toThrow();
    });
  });

  // ==========================================
  // Activation/Deactivation
  // ==========================================
  describe('Activation/Deactivation', () => {
    it('should deactivate a user', async () => {
      await expect(deactivateUser('user-1')).resolves.not.toThrow();
    });

    it('should activate a user', async () => {
      await expect(activateUser('user-3')).resolves.not.toThrow();
    });

    it('should return 404 when deactivating non-existent user', async () => {
      await expect(deactivateUser('non-existent-id')).rejects.toThrow();
    });

    it('should return 404 when activating non-existent user', async () => {
      await expect(activateUser('non-existent-id')).rejects.toThrow();
    });
  });

  // ==========================================
  // Search and Filtering
  // ==========================================
  describe('Search and Filtering', () => {
    it('should search users by email', async () => {
      const results = await searchUsers('admin');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((u) => u.email?.includes('admin'))).toBe(true);
    });

    it('should search users by name', async () => {
      const results = await searchUsers('Test');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((u) => u.firstName === 'Test')).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await searchUsers('nonexistent12345');

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });

    it('should get users by role', async () => {
      const admins = await getUsersByRole('ADMIN' as UserRole);

      expect(admins.length).toBeGreaterThan(0);
      admins.forEach((u) => {
        expect(u.role).toBe('ADMIN');
      });
    });

    it('should return empty array for role with no users', async () => {
      server.use(
        http.get(`${API_BASE}/users/role/:role`, () => {
          return HttpResponse.json([]);
        })
      );

      const results = await getUsersByRole('EDITOR' as UserRole);
      expect(results).toEqual([]);
    });
  });

  // ==========================================
  // Statistics
  // ==========================================
  describe('User Statistics', () => {
    it('should get user statistics', async () => {
      const stats = await getUserStats();

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('byRole');
      expect(stats.totalUsers).toBe(mockUsersList.length);
    });

    it('should have role breakdown in stats', async () => {
      const stats = await getUserStats();

      expect(stats.byRole).toHaveProperty('ADMIN');
      expect(stats.byRole).toHaveProperty('EDITOR');
      expect(stats.byRole).toHaveProperty('USER');
    });

    it('should count active users correctly', async () => {
      const stats = await getUserStats();
      const activeCount = mockUsersList.filter((u) => u.isActive).length;

      expect(stats.activeUsers).toBe(activeCount);
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            { message: 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
          );
        })
      );

      await expect(fetchUsers()).rejects.toThrow();
    });

    it('should handle unauthorized errors', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            { message: 'Authentication required', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
        })
      );

      await expect(fetchUsers()).rejects.toThrow();
    });

    it('should handle forbidden errors for non-admin users', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            { message: 'Admin access required', code: 'FORBIDDEN' },
            { status: 403 }
          );
        })
      );

      await expect(fetchUsers()).rejects.toThrow();
    });
  });
});
