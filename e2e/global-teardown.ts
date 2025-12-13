import type { FullConfig } from '@playwright/test';

/**
 * Global teardown for E2E tests.
 * Runs once after all tests to clean up the test environment.
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 E2E Global Teardown');
  console.log('==================');

  // Add any global cleanup here if needed
  // For example:
  // - Clear test-specific data from database
  // - Reset external service mocks
  // - Clean up temporary files

  // Note: We don't need to stop the frontend server
  // as Playwright handles that automatically

  console.log('✅ E2E cleanup complete');
  console.log('==================\n');
}

export default globalTeardown;
