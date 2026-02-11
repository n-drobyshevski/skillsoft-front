# Integration Guide: CompactTestResults Component

## Quick Start

### Step 1: Import the Component

```tsx
import { CompactTestResults } from '@/components/test-player/CompactTestResults';
```

### Step 2: Use in Your Results Page

```tsx
// app/tests/results/[resultId]/page.tsx
import { CompactTestResults } from '@/components/test-player/CompactTestResults';
import { testResultsApi } from '@/services/api';

export default async function TestResultsPage({
  params,
}: {
  params: { resultId: string };
}) {
  // Fetch result data (server component)
  const result = await testResultsApi.getResultById(params.resultId);

  return (
    <CompactTestResults
      result={result}
      onBack={() => router.push('/tests')}
      onRetry={() => router.push(`/tests/${result.templateId}/start`)}
      onViewDetails={() => router.push(`/tests/results/${result.id}/detailed`)}
    />
  );
}
```

---

## Integration with ImmersivePlayer

### Scenario: Redirect to Results After Test Completion

**Current Flow (CompletionDialog):**
```tsx
// ImmersivePlayer.tsx
const handleComplete = async () => {
  try {
    const result = await testSessionsClientApi.completeTestSession(
      session.id,
      authHeaders
    );

    // Redirect to compact results
    router.push(`/tests/results/${result.id}`);
  } catch (error) {
    console.error('Failed to complete test:', error);
  }
};
```

**New Results Page:**
```tsx
// app/tests/results/[resultId]/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { CompactTestResults } from '@/components/test-player/CompactTestResults';
import { useTestResult } from '@/hooks/useTestResult';

export default function TestResultsPage({ params }: { params: { resultId: string } }) {
  const router = useRouter();
  const { data: result, isLoading, error } = useTestResult(params.resultId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Unable to Load Results</h2>
          <p className="text-muted-foreground">
            We couldn't retrieve your test results. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <CompactTestResults
      result={result}
      onBack={() => router.push('/tests')}
      onRetry={() => router.push(`/tests/${result.templateId}/start`)}
      onViewDetails={() => router.push(`/tests/results/${result.id}/detailed`)}
    />
  );
}
```

---

## Creating the Detailed Results Page (Optional)

If you want a separate detailed view accessible via "View Detailed Analysis":

```tsx
// app/tests/results/[resultId]/detailed/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTestResult } from '@/hooks/useTestResult';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DetailedResultsPage({ params }: { params: { resultId: string } }) {
  const router = useRouter();
  const { data: result } = useTestResult(params.resultId);

  if (!result) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/tests/results/${params.resultId}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Summary
      </Button>

      {/* Overall Stats */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">{result.templateName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
            <div className="text-3xl font-bold">{Math.round(result.overallPercentage)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className={`text-xl font-semibold ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
            <div className="text-xl font-mono">
              {Math.floor(result.totalTimeSeconds / 60)}:
              {(result.totalTimeSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Percentile</div>
            <div className="text-xl font-bold">{result.percentile || '—'}%</div>
          </div>
        </div>
      </Card>

      {/* Competency Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Competency Breakdown</h3>
        {result.competencyScores.map(comp => (
          <Card key={comp.competencyId} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{comp.competencyName}</h4>
              <div className="text-2xl font-bold text-primary">
                {Math.round(comp.percentage)}%
              </div>
            </div>

            {/* Indicator breakdown (if available) */}
            {comp.indicatorScores && comp.indicatorScores.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Behavioral Indicators
                </div>
                {comp.indicatorScores.map(ind => (
                  <div key={ind.indicatorId} className="flex items-center justify-between text-sm">
                    <span className="flex-1">{ind.indicatorTitle}</span>
                    <span className="font-mono">{Math.round(ind.percentage)}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => router.push(`/tests/${result.templateId}/start`)}>
          Retry Test
        </Button>
        <Button variant="outline" onClick={() => router.push('/tests')}>
          Back to Tests
        </Button>
      </div>
    </div>
  );
}
```

---

## Custom Hook: useTestResult

Create a reusable hook for fetching test results:

```tsx
// hooks/useTestResult.ts
import { useState, useEffect } from 'react';
import { TestResult } from '@/types/domain';
import { testResultsApi } from '@/services/api';

export function useTestResult(resultId: string) {
  const [data, setData] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true);
        const result = await testResultsApi.getResultById(resultId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  return { data, isLoading, error };
}
```

---

## API Service Method

Ensure your API service has the result fetching method:

```tsx
// services/api.ts
export const testResultsApi = {
  /**
   * Get test result by ID
   */
  async getResultById(resultId: string): Promise<TestResult> {
    const response = await apiClient.get<TestResult>(`/test-results/${resultId}`);
    return response.data;
  },

  /**
   * Get all results for a user
   */
  async getUserResults(clerkUserId: string): Promise<TestResult[]> {
    const response = await apiClient.get<TestResult[]>('/test-results', {
      params: { clerkUserId },
    });
    return response.data;
  },

  /**
   * Get results for a specific template
   */
  async getTemplateResults(templateId: string): Promise<TestResult[]> {
    const response = await apiClient.get<TestResult[]>('/test-results', {
      params: { templateId },
    });
    return response.data;
  },
};
```

---

## Routing Structure

```
app/
├── tests/
│   ├── page.tsx                          # Test list
│   ├── [templateId]/
│   │   ├── page.tsx                      # Test details
│   │   └── start/
│   │       └── page.tsx                  # Test player (ImmersivePlayer)
│   └── results/
│       └── [resultId]/
│           ├── page.tsx                  # Compact results (NEW)
│           └── detailed/
│               └── page.tsx              # Detailed results (OPTIONAL)
```

---

## Sample Data (for Testing)

```tsx
// Mock test result for development
const mockTestResult: TestResult = {
  id: 'result-123',
  sessionId: 'session-456',
  templateId: 'template-789',
  templateName: 'Leadership Assessment',
  clerkUserId: 'user_123',
  overallScore: 85,
  overallPercentage: 85,
  percentile: 92,
  passed: true,
  competencyScores: [
    {
      competencyId: 'comp-1',
      competencyName: 'Communication',
      competencyCategory: 'COMMUNICATION',
      score: 78,
      maxScore: 100,
      percentage: 78,
      questionsAnswered: 5,
    },
    {
      competencyId: 'comp-2',
      competencyName: 'Leadership',
      competencyCategory: 'LEADERSHIP',
      score: 92,
      maxScore: 100,
      percentage: 92,
      questionsAnswered: 6,
    },
    {
      competencyId: 'comp-3',
      competencyName: 'Problem Solving',
      competencyCategory: 'CRITICAL_THINKING',
      score: 54,
      maxScore: 100,
      percentage: 54,
      questionsAnswered: 5,
    },
    {
      competencyId: 'comp-4',
      competencyName: 'Teamwork',
      competencyCategory: 'COLLABORATION',
      score: 72,
      maxScore: 100,
      percentage: 72,
      questionsAnswered: 4,
    },
    {
      competencyId: 'comp-5',
      competencyName: 'Adaptability',
      competencyCategory: 'ADAPTABILITY',
      score: 81,
      maxScore: 100,
      percentage: 81,
      questionsAnswered: 5,
    },
    {
      competencyId: 'comp-6',
      competencyName: 'Critical Thinking',
      competencyCategory: 'CRITICAL_THINKING',
      score: 63,
      maxScore: 100,
      percentage: 63,
      questionsAnswered: 4,
    },
    {
      competencyId: 'comp-7',
      competencyName: 'Time Management',
      competencyCategory: 'TIME_MANAGEMENT',
      score: 51,
      maxScore: 100,
      percentage: 51,
      questionsAnswered: 3,
    },
    {
      competencyId: 'comp-8',
      competencyName: 'Emotional Intelligence',
      competencyCategory: 'EMOTIONAL_INTELLIGENCE',
      score: 87,
      maxScore: 100,
      percentage: 87,
      questionsAnswered: 6,
    },
  ],
  totalTimeSeconds: 765, // 12:45
  questionsAnswered: 45,
  questionsSkipped: 5,
  totalQuestions: 50,
  completedAt: new Date().toISOString(),
};
```

Use this in development:

```tsx
// app/tests/results/[resultId]/page.tsx (dev mode)
const isDev = process.env.NODE_ENV === 'development';

export default function TestResultsPage({ params }: { params: { resultId: string } }) {
  const result = isDev ? mockTestResult : useTestResult(params.resultId).data;

  if (!result) return <LoadingState />;

  return <CompactTestResults result={result} {...handlers} />;
}
```

---

## Environment Variables

If you need to configure results behavior:

```env
# .env.local

# Show retry button (default: true)
NEXT_PUBLIC_ENABLE_TEST_RETRY=true

# Show detailed analysis button (default: true)
NEXT_PUBLIC_ENABLE_DETAILED_RESULTS=true

# Enable confetti animation on pass (default: false)
NEXT_PUBLIC_ENABLE_PASS_CELEBRATION=false
```

Use in component:

```tsx
const showRetry = process.env.NEXT_PUBLIC_ENABLE_TEST_RETRY !== 'false';
const showDetails = process.env.NEXT_PUBLIC_ENABLE_DETAILED_RESULTS !== 'false';

<CompactTestResults
  result={result}
  onBack={handleBack}
  onRetry={showRetry ? handleRetry : undefined}
  onViewDetails={showDetails ? handleViewDetails : undefined}
/>
```

---

## Analytics Tracking

Track user interactions with results:

```tsx
// utils/analytics.ts
export function trackTestCompletion(result: TestResult) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'test_complete', {
      event_category: 'Assessment',
      event_label: result.templateName,
      value: result.overallPercentage,
      passed: result.passed,
    });
  }
}

export function trackResultAction(action: 'retry' | 'details' | 'back') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'result_action', {
      event_category: 'Assessment',
      event_label: action,
    });
  }
}
```

Use in component:

```tsx
import { trackTestCompletion, trackResultAction } from '@/utils/analytics';

export default function TestResultsPage({ params }: { params: { resultId: string } }) {
  const result = useTestResult(params.resultId).data;

  useEffect(() => {
    if (result) {
      trackTestCompletion(result);
    }
  }, [result]);

  const handleRetry = () => {
    trackResultAction('retry');
    router.push(`/tests/${result.templateId}/start`);
  };

  const handleViewDetails = () => {
    trackResultAction('details');
    router.push(`/tests/results/${result.id}/detailed`);
  };

  const handleBack = () => {
    trackResultAction('back');
    router.push('/tests');
  };

  return (
    <CompactTestResults
      result={result}
      onBack={handleBack}
      onRetry={handleRetry}
      onViewDetails={handleViewDetails}
    />
  );
}
```

---

## Testing Checklist

### Unit Tests

```tsx
// __tests__/CompactTestResults.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompactTestResults } from '@/components/test-player/CompactTestResults';
import { mockTestResult } from '@/mocks/testData';

describe('CompactTestResults', () => {
  it('renders passed state correctly', () => {
    render(<CompactTestResults result={mockTestResult} />);
    expect(screen.getByText('PASSED')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders failed state correctly', () => {
    const failedResult = { ...mockTestResult, passed: false, overallPercentage: 45 };
    render(<CompactTestResults result={failedResult} />);
    expect(screen.getByText('REVIEW')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const onRetry = jest.fn();
    render(<CompactTestResults result={mockTestResult} onRetry={onRetry} />);
    await userEvent.click(screen.getByText('Retry Test'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('displays all competency scores', () => {
    render(<CompactTestResults result={mockTestResult} />);
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('handles missing percentile gracefully', () => {
    const resultWithoutPercentile = { ...mockTestResult, percentile: undefined };
    render(<CompactTestResults result={resultWithoutPercentile} />);
    expect(screen.queryByText('%ile')).not.toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```tsx
// e2e/test-results.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Test Results Page', () => {
  test('should display results after test completion', async ({ page }) => {
    // Complete a test
    await page.goto('/tests/template-123/start');
    // ... answer questions ...
    await page.click('text=Submit Assessment');

    // Should redirect to results
    await expect(page).toHaveURL(/\/tests\/results\/result-/);

    // Verify results display
    await expect(page.locator('text=PASSED')).toBeVisible();
    await expect(page.locator('text=%')).toBeVisible();
    await expect(page.locator('text=Communication')).toBeVisible();
  });

  test('should navigate back to tests list', async ({ page }) => {
    await page.goto('/tests/results/result-123');
    await page.click('text=Back to Tests');
    await expect(page).toHaveURL('/tests');
  });

  test('should allow test retry', async ({ page }) => {
    await page.goto('/tests/results/result-123');
    await page.click('text=Retry Test');
    await expect(page).toHaveURL(/\/tests\/.*\/start/);
  });

  test('mobile layout works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tests/results/result-123');

    // Verify mobile-specific elements
    await expect(page.locator('text=Back')).toBeVisible();
    await expect(page.locator('text=Retry')).toBeVisible();
    await expect(page.locator('text=More Details')).toBeVisible();
  });
});
```

---

## Migration from Existing Results Component

If you have an existing results component:

### Step 1: Create Route

```bash
mkdir -p app/tests/results/[resultId]
```

### Step 2: Move Old Component (Backup)

```bash
mv app/tests/results/page.tsx app/tests/results/detailed/page.tsx
```

### Step 3: Create New Compact Route

```tsx
// app/tests/results/[resultId]/page.tsx
// Use CompactTestResults (see examples above)
```

### Step 4: Update ImmersivePlayer Redirect

```tsx
// Before
router.push('/tests/results');

// After
router.push(`/tests/results/${result.id}`);
```

### Step 5: Test Thoroughly

```bash
npm run dev
# Navigate through test flow
# Verify compact results render correctly
# Check mobile responsiveness
```

---

## Deployment Checklist

- [ ] Component renders on desktop (1920x1080)
- [ ] Component renders on mobile (390x844)
- [ ] Animations work smoothly
- [ ] All buttons trigger correct actions
- [ ] Loading state displays correctly
- [ ] Error state displays correctly
- [ ] Analytics events fire
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Performance metrics meet targets (LCP <1.5s)
- [ ] Dark mode works correctly
- [ ] Print stylesheet works (optional)

---

**Integration Complete** ✓

You now have everything needed to integrate the CompactTestResults component into your test flow!
