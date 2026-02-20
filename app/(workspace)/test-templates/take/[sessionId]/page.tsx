/**
 * Test-Taking Page (Server Component)
 *
 * This page handles the test-taking experience for authenticated users.
 * It fetches session and question data server-side to eliminate the
 * client-side useEffect waterfall (auth -> session -> question) that
 * previously caused a large LCP bottleneck.
 *
 * Architecture:
 * - Server Component page: handles auth, fetches data, validates state
 * - TestTakeClient (client shell): handles interactivity (ImmersivePlayer,
 *   existing session dialog, immersive mode toggle, new session creation)
 *
 * Route: /test-templates/take/[sessionId]
 * - sessionId = 'new': client-side session creation flow (needs router.replace)
 * - sessionId = UUID: server-side data fetch, then immediate render
 */

import { connection } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { SessionStatus } from '@/types/domain';
import {
  fetchSessionServer,
  fetchCurrentQuestionServer,
} from '@/services/api.server';
import TestTakeClient from './_components/TestTakeClient';

// ============================================================================
// Types
// ============================================================================

interface TestTakePageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{
    template?: string;
    testDrive?: string;
  }>;
}

// ============================================================================
// Server Component
// ============================================================================

export default async function TestTakePage({
  params,
  searchParams,
}: TestTakePageProps) {
  // Signal to Next.js that this page requires a real request (PPR boundary)
  await connection();

  // Server-side auth: redirects to sign-in if not authenticated
  const session = await requireAuth();
  const userId = session.userId;

  // Await dynamic route params (Next.js 16 async params)
  const { sessionId } = await params;
  const search = await searchParams;
  const templateId = search.template ?? null;
  const testDriveMode = search.testDrive === 'true';

  // --- 'new' session flow: delegate entirely to client ---
  // Creating a new session requires router.replace to redirect to the actual
  // session URL, and may show an "existing session" dialog. Both need client
  // interactivity, so we pass minimal props and let the client handle it.
  if (sessionId === 'new') {
    return (
      <TestTakeClient
        mode="new"
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  // --- Existing session flow: fetch data server-side ---

  // 1. Fetch session data
  const sessionResult = await fetchSessionServer(sessionId);

  if (!sessionResult.ok) {
    return (
      <TestTakeClient
        mode="error"
        errorMessage={sessionResult.error.message}
        errorStatus={sessionResult.error.status}
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  const sessionData = sessionResult.data;

  // 2. Validate session status before loading questions
  if (sessionData.status === SessionStatus.ABANDONED) {
    return (
      <TestTakeClient
        mode="error"
        errorMessage="Session was abandoned"
        errorStatus={400}
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  if (sessionData.status === SessionStatus.COMPLETED) {
    return (
      <TestTakeClient
        mode="error"
        errorMessage="Session is already completed"
        errorStatus={400}
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  if (sessionData.status === SessionStatus.TIMED_OUT) {
    return (
      <TestTakeClient
        mode="error"
        errorMessage="Session has timed out"
        errorStatus={400}
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  // Only proceed if session is active
  if (
    sessionData.status !== SessionStatus.NOT_STARTED &&
    sessionData.status !== SessionStatus.IN_PROGRESS
  ) {
    return (
      <TestTakeClient
        mode="error"
        errorMessage={`Invalid session status: ${sessionData.status}`}
        errorStatus={400}
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  // 3. Fetch current question
  const questionResult = await fetchCurrentQuestionServer(sessionId);

  if (!questionResult.ok) {
    return (
      <TestTakeClient
        mode="error"
        errorMessage={questionResult.error.message}
        errorStatus={questionResult.error.status}
        userId={userId}
        templateId={templateId}
        testDriveMode={testDriveMode}
      />
    );
  }

  // 4. All data fetched successfully - render the player immediately
  return (
    <TestTakeClient
      mode="ready"
      session={sessionData}
      initialQuestion={questionResult.data}
      userId={userId}
      testDriveMode={testDriveMode}
    />
  );
}
