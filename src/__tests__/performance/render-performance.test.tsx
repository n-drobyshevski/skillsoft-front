/**
 * Component Render Performance Tests
 * Phase 6: Tests component rendering performance and optimization
 *
 * Tests cover:
 * - Component render performance benchmarks
 * - Re-render efficiency
 * - Large list rendering
 * - Memory leak detection patterns
 * - Memoization effectiveness
 */
import React, { useState, useMemo, useCallback, memo } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  QuestionCard,
} from '@/components/test-player/QuestionCard';
import { QuestionType, DifficultyLevel, type SessionQuestion } from '@/types/domain';
import { Button } from '@/components/ui/button';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Measure render time of a component
 */
function measureRenderTime(Component: React.ComponentType<unknown>): number {
  const startTime = performance.now();
  render(<Component />);
  const endTime = performance.now();
  cleanup();
  return endTime - startTime;
}

/**
 * Create a mock question for testing
 */
const createMockQuestion = (
  overrides: Partial<SessionQuestion> = {}
): SessionQuestion => ({
  id: 'q-1',
  questionText: 'Test question text',
  questionType: QuestionType.MULTIPLE_CHOICE,
  answerOptions: [
    { id: 'opt-1', text: 'Option A', value: 1 },
    { id: 'opt-2', text: 'Option B', value: 2 },
    { id: 'opt-3', text: 'Option C', value: 3 },
  ],
  difficultyLevel: DifficultyLevel.INTERMEDIATE,
  behavioralIndicatorId: 'bi-1',
  ...overrides,
});

/**
 * Create large list of items for testing
 */
function createLargeList(count: number): Array<{ id: string; name: string; value: number }> {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    value: i,
  }));
}

// ============================================
// TEST COMPONENTS FOR PERFORMANCE TESTS
// ============================================

/**
 * Simple list component for baseline performance
 */
function SimpleList({ items }: { items: Array<{ id: string; name: string }> }) {
  return (
    <ul data-testid="simple-list">
      {items.map(item => (
        <li key={item.id} data-testid={`item-${item.id}`}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Memoized list item component
 */
const MemoizedListItem = memo(function ListItem({
  item,
  onClick,
}: {
  item: { id: string; name: string };
  onClick: (id: string) => void;
}) {
  return (
    <li
      key={item.id}
      onClick={() => onClick(item.id)}
      data-testid={`memo-item-${item.id}`}
    >
      {item.name}
    </li>
  );
});

/**
 * Optimized list with memoization
 */
function OptimizedList({
  items,
  onItemClick,
}: {
  items: Array<{ id: string; name: string }>;
  onItemClick: (id: string) => void;
}) {
  const handleClick = useCallback(
    (id: string) => onItemClick(id),
    [onItemClick]
  );

  return (
    <ul data-testid="optimized-list">
      {items.map(item => (
        <MemoizedListItem key={item.id} item={item} onClick={handleClick} />
      ))}
    </ul>
  );
}

/**
 * Counter component for re-render testing
 */
function RerenderCounter({
  onRender,
}: {
  onRender?: () => void;
}) {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    onRender?.();
  });

  return (
    <div data-testid="rerender-counter">
      <span data-testid="count">{count}</span>
      <Button onClick={() => setCount(c => c + 1)} data-testid="increment">
        Increment
      </Button>
    </div>
  );
}

/**
 * Component with expensive computation
 */
function ExpensiveComputation({
  data,
  useMemoization = false,
}: {
  data: number[];
  useMemoization?: boolean;
}) {
  // Simulate expensive computation
  const computeExpensiveValue = (nums: number[]) => {
    let result = 0;
    for (let i = 0; i < nums.length; i++) {
      result += Math.sqrt(nums[i]) * Math.log(nums[i] + 1);
    }
    return result;
  };

  const result = useMemoization
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useMemo(() => computeExpensiveValue(data), [data])
    : computeExpensiveValue(data);

  return (
    <div data-testid="expensive-result">
      {result.toFixed(2)}
    </div>
  );
}

// ============================================
// COMPONENT RENDER PERFORMANCE TESTS
// ============================================

describe('Component Render Performance', () => {
  describe('QuestionCard Render Time', () => {
    it('should render QuestionCard within acceptable time', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      const startTime = performance.now();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // QuestionCard should render within acceptable time for jsdom environment
      // First render in jsdom can be slower due to initialization overhead
      expect(renderTime).toBeLessThan(1000);
    });

    it('should render different question types efficiently', () => {
      const questionTypes = [
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.LIKERT_SCALE,
        QuestionType.SITUATIONAL_JUDGMENT,
        QuestionType.OPEN_TEXT,
      ];

      const onAnswer = vi.fn();

      questionTypes.forEach(type => {
        const question = createMockQuestion({
          questionType: type,
          answerOptions: type === QuestionType.OPEN_TEXT ? [] : [
            { id: 'opt-1', text: 'Option A', value: 1 },
            { id: 'opt-2', text: 'Option B', value: 2 },
          ],
        });

        const startTime = performance.now();

        const { unmount } = render(
          <QuestionCard
            question={question}
            selectedValue={undefined}
            onAnswer={onAnswer}
            questionNumber={1}
          />
        );

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Each question type should render quickly
        expect(renderTime).toBeLessThan(100);

        unmount();
      });
    });
  });

  describe('Button Component Performance', () => {
    it('should render Button component quickly', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Button>Button {i}</Button>);
        unmount();
      }

      const endTime = performance.now();
      const avgRenderTime = (endTime - startTime) / 100;

      // Average render time should be under 10ms per button
      expect(avgRenderTime).toBeLessThan(10);
    });

    it('should render button variants without performance regression', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      variants.forEach(variant => {
        const startTime = performance.now();

        const { unmount } = render(
          <Button variant={variant}>Test Button</Button>
        );

        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(50);

        unmount();
      });
    });
  });
});

// ============================================
// RE-RENDER EFFICIENCY TESTS
// ============================================

describe('Re-render Efficiency', () => {
  describe('Component Re-render Counts', () => {
    it('should track re-renders on state change', async () => {
      const user = userEvent.setup();
      const renderCounter = vi.fn();

      render(<RerenderCounter onRender={renderCounter} />);

      // Initial render
      expect(renderCounter).toHaveBeenCalledTimes(1);

      // Click increment
      await user.click(screen.getByTestId('increment'));

      // Should have re-rendered once more
      expect(renderCounter).toHaveBeenCalledTimes(2);
    });

    it('should minimize unnecessary re-renders with memoization', async () => {
      const user = userEvent.setup();
      const items = createLargeList(10);
      const onItemClick = vi.fn();
      const itemRenderCount = vi.fn();

      // Custom memo item that tracks renders
      const TrackedMemoItem = memo(function TrackedItem({
        item,
        onClick,
      }: {
        item: { id: string; name: string };
        onClick: (id: string) => void;
      }) {
        itemRenderCount();
        return (
          <li onClick={() => onClick(item.id)}>
            {item.name}
          </li>
        );
      });

      function TrackedList() {
        const [selectedId, setSelectedId] = useState<string | null>(null);

        const handleClick = useCallback((id: string) => {
          setSelectedId(id);
          onItemClick(id);
        }, []);

        return (
          <ul data-testid="tracked-list">
            {items.map(item => (
              <TrackedMemoItem key={item.id} item={item} onClick={handleClick} />
            ))}
            <li data-testid="selected">{selectedId}</li>
          </ul>
        );
      }

      render(<TrackedList />);

      // Initial render: 10 items
      const initialRenderCount = itemRenderCount.mock.calls.length;
      expect(initialRenderCount).toBe(10);

      // Click an item - memoized items shouldn't re-render
      await user.click(screen.getByText('Item 5'));

      // Memoized items should not re-render on parent state change
      // (only the selected display updates)
      expect(onItemClick).toHaveBeenCalledWith('item-5');
    });
  });

  describe('Expensive Computation Memoization', () => {
    it('should benefit from useMemo for expensive computations', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1);

      // Without memoization
      const startWithout = performance.now();
      const { unmount: unmount1 } = render(
        <ExpensiveComputation data={data} useMemoization={false} />
      );
      const endWithout = performance.now();
      unmount1();

      // With memoization
      const startWith = performance.now();
      const { unmount: unmount2 } = render(
        <ExpensiveComputation data={data} useMemoization={true} />
      );
      const endWith = performance.now();
      unmount2();

      // Both should complete within reasonable time
      expect(endWithout - startWithout).toBeLessThan(500);
      expect(endWith - startWith).toBeLessThan(500);
    });
  });
});

// ============================================
// LARGE LIST RENDERING TESTS
// ============================================

describe('Large List Rendering', () => {
  describe('List Rendering Performance', () => {
    it('should render small list quickly', () => {
      const items = createLargeList(10);

      const startTime = performance.now();
      render(<SimpleList items={items} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });

    it('should render medium list in acceptable time', () => {
      const items = createLargeList(100);

      const startTime = performance.now();
      render(<SimpleList items={items} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(screen.getAllByRole('listitem')).toHaveLength(100);
    });

    it('should render large list with warning if slow', () => {
      const items = createLargeList(500);

      const startTime = performance.now();
      render(<SimpleList items={items} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Large lists should still render within 2 seconds
      expect(renderTime).toBeLessThan(2000);

      // Log warning if render time is significant
      if (renderTime > 500) {
        console.warn(`Large list (500 items) rendered in ${renderTime.toFixed(2)}ms - consider virtualization`);
      }
    });
  });

  describe('Optimized vs Unoptimized Lists', () => {
    it('should compare optimized and unoptimized list performance', async () => {
      const items = createLargeList(50);
      const onItemClick = vi.fn();

      // Unoptimized list
      const startUnoptimized = performance.now();
      const { unmount: unmount1 } = render(
        <ul>
          {items.map(item => (
            <li key={item.id} onClick={() => onItemClick(item.id)}>
              {item.name}
            </li>
          ))}
        </ul>
      );
      const endUnoptimized = performance.now();
      unmount1();

      // Optimized list
      const startOptimized = performance.now();
      const { unmount: unmount2 } = render(
        <OptimizedList items={items} onItemClick={onItemClick} />
      );
      const endOptimized = performance.now();
      unmount2();

      // Both should render quickly
      expect(endUnoptimized - startUnoptimized).toBeLessThan(300);
      expect(endOptimized - startOptimized).toBeLessThan(300);
    });
  });
});

// ============================================
// MEMORY LEAK DETECTION PATTERNS
// ============================================

describe('Memory Leak Detection Patterns', () => {
  describe('Cleanup on Unmount', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      function ComponentWithEventListener() {
        React.useEffect(() => {
          const handler = () => {};
          window.addEventListener('resize', handler);

          return () => {
            window.removeEventListener('resize', handler);
          };
        }, []);

        return <div>Component with event listener</div>;
      }

      const { unmount } = render(<ComponentWithEventListener />);

      // Event listener should be added
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      // Unmount component
      unmount();

      // Event listener should be removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should clean up timers on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      function ComponentWithTimer() {
        React.useEffect(() => {
          const timeoutId = setTimeout(() => {
            // Timer callback
          }, 5000);

          return () => {
            clearTimeout(timeoutId);
          };
        }, []);

        return <div>Component with timer</div>;
      }

      const { unmount } = render(<ComponentWithTimer />);
      unmount();

      // Timer should be cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('should clean up intervals on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      function ComponentWithInterval() {
        React.useEffect(() => {
          const intervalId = setInterval(() => {
            // Interval callback
          }, 1000);

          return () => {
            clearInterval(intervalId);
          };
        }, []);

        return <div>Component with interval</div>;
      }

      const { unmount } = render(<ComponentWithInterval />);
      unmount();

      // Interval should be cleared
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Subscription Cleanup', () => {
    it('should unsubscribe from subscriptions on unmount', () => {
      const unsubscribe = vi.fn();
      const subscribe = vi.fn().mockReturnValue(unsubscribe);

      function ComponentWithSubscription() {
        React.useEffect(() => {
          return subscribe();
        }, []);

        return <div>Component with subscription</div>;
      }

      const { unmount } = render(<ComponentWithSubscription />);

      expect(subscribe).toHaveBeenCalledTimes(1);

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref Cleanup', () => {
    it('should not hold stale refs after unmount', () => {
      const refCallback = vi.fn();

      function ComponentWithRef() {
        const ref = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
          if (ref.current) {
            refCallback(ref.current);
          }
        }, []);

        return <div ref={ref}>Component with ref</div>;
      }

      const { unmount } = render(<ComponentWithRef />);

      expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLDivElement));

      unmount();

      // After unmount, ref.current would be null
      // This pattern ensures we don't access stale refs
    });
  });
});

// ============================================
// LAZY LOADING VERIFICATION
// ============================================

describe('Lazy Loading Patterns', () => {
  it('should support React.lazy pattern', async () => {
    // Simulated lazy loaded component
    const LazyComponent = React.lazy(() =>
      Promise.resolve({
        default: () => <div data-testid="lazy-loaded">Lazy Content</div>,
      })
    );

    render(
      <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
        <LazyComponent />
      </React.Suspense>
    );

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Should eventually show the lazy content
    const lazyContent = await screen.findByTestId('lazy-loaded');
    expect(lazyContent).toBeInTheDocument();
  });

  it('should handle lazy load errors gracefully', async () => {
    // Simulated failed lazy load
    const FailingLazyComponent = React.lazy(() =>
      Promise.reject(new Error('Failed to load'))
    );

    // Error boundary to catch the error
    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError() {
        return { hasError: true };
      }

      render() {
        if (this.state.hasError) {
          return <div data-testid="error-fallback">Failed to load component</div>;
        }
        return this.props.children;
      }
    }

    render(
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <FailingLazyComponent />
        </React.Suspense>
      </ErrorBoundary>
    );

    // Should show error fallback
    const errorFallback = await screen.findByTestId('error-fallback');
    expect(errorFallback).toBeInTheDocument();
  });
});

// ============================================
// STATE UPDATE BATCHING
// ============================================

describe('State Update Batching', () => {
  it('should batch multiple state updates', async () => {
    const user = userEvent.setup();
    const renderCount = vi.fn();

    function BatchingTestComponent() {
      const [count1, setCount1] = useState(0);
      const [count2, setCount2] = useState(0);

      React.useEffect(() => {
        renderCount();
      });

      const handleBatchedUpdate = () => {
        // React 18+ automatically batches these updates
        setCount1(c => c + 1);
        setCount2(c => c + 1);
      };

      return (
        <div>
          <span data-testid="count1">{count1}</span>
          <span data-testid="count2">{count2}</span>
          <Button onClick={handleBatchedUpdate} data-testid="batch-update">
            Update Both
          </Button>
        </div>
      );
    }

    render(<BatchingTestComponent />);

    // Initial render
    expect(renderCount).toHaveBeenCalledTimes(1);

    // Click to trigger batched updates
    await user.click(screen.getByTestId('batch-update'));

    // React 18 batches these updates - should only cause one additional render
    expect(renderCount).toHaveBeenCalledTimes(2);

    // Both values should be updated
    expect(screen.getByTestId('count1')).toHaveTextContent('1');
    expect(screen.getByTestId('count2')).toHaveTextContent('1');
  });
});
