import type { FullConfig } from '@playwright/test';

/**
 * Constructs the full API URL from NEXT_PUBLIC_API_URL environment variable.
 * Handles both formats:
 * - Full URL: "http://localhost:8080/api" or "https://backend.railway.app/api"
 * - Hostname only: "localhost:8080" or "backend.railway.app" (matches src/services/api.ts)
 */
function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return 'http://localhost:8080/api';
  }

  // If it already has a protocol, use it as-is (ensure /api suffix)
  if (apiUrl.startsWith("https://") || apiUrl.startsWith('https://')) {
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }

  // Otherwise, add protocol based on hostname (matches src/services/api.ts logic)
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api`;
}

/**
 * Global setup for E2E tests.
 * Runs once before all tests to prepare the test environment.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🔧 E2E Global Setup');
  console.log('==================');

  // Get base URL from config
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  const apiURL = getApiBaseUrl();

  console.log(`📍 Frontend URL: ${baseURL}`);
  console.log(`📍 API URL: ${apiURL}`);

  // 1. Wait for backend to be ready
  console.log('\n⏳ Waiting for backend to be ready...');

  // For remote backends, check the API endpoint directly (actuator may not be exposed)
  // For local backends, try actuator/health first
  const isRemoteBackend = !apiURL.includes('localhost') && !apiURL.includes('127.0.0.1');
  const healthCheckURL = isRemoteBackend
    ? `${apiURL}/v1/competencies` // Use a known API endpoint for remote
    : `${apiURL.replace('/api', '')}/actuator/health`; // Use actuator for local

  console.log(`   Health check URL: ${healthCheckURL}`);

  const backendReady = await waitForService(healthCheckURL, 30);
  if (!backendReady) {
    console.error('❌ Backend is not available.');
    if (isRemoteBackend) {
      console.error(`   Could not reach: ${healthCheckURL}`);
      console.error('   Please verify the Railway backend is running.');
    } else {
      console.error('   Please start it with:');
      console.error('   cd assessment-backend && mvn spring-boot:run -Dspring.profiles.active=e2e-test');
    }
    throw new Error('Backend service is not available');
  }
  console.log('✅ Backend is ready');

  // 2. Wait for frontend to be ready
  console.log('\n⏳ Waiting for frontend to be ready...');
  const frontendReady = await waitForService(baseURL, 30);
  if (!frontendReady) {
    console.error('❌ Frontend is not available. It should be started by Playwright webServer config.');
    throw new Error('Frontend service is not available');
  }
  console.log('✅ Frontend is ready');

  console.log('\n✨ E2E environment is ready!');
  console.log('==================\n');
}

/**
 * Waits for a service to be available.
 * @param url - URL to check
 * @param maxRetries - Maximum number of retries
 * @returns true if service is available, false otherwise
 */
async function waitForService(url: string, maxRetries: number): Promise<boolean> {
  let lastError: string | null = null;
  let lastStatus: number | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      lastStatus = response.status;
      if (response.ok || response.status === 401 || response.status === 403) {
        // 401/403 means the service is up but requires auth
        return true;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }
    console.log(`   Attempt ${i + 1}/${maxRetries}...${lastError ? ` (${lastError})` : ''}`);
    await sleep(1000);
  }
  console.error(`   Final status: ${lastStatus ?? 'no response'}, error: ${lastError ?? 'none'}`);
  return false;
}

/**
 * Sleep helper function.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default globalSetup;
