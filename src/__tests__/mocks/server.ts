/**
 * MSW Server Setup for Node/Vitest
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

/**
 * Add a request handler during tests
 * Use this to override default handlers or add test-specific handlers
 */
export function addHandler(...newHandlers: Parameters<typeof server.use>) {
  server.use(...newHandlers);
}

/**
 * Reset handlers to defaults
 * Called automatically in afterEach by setup.ts
 */
export function resetHandlers() {
  server.resetHandlers();
}
