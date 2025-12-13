/**
 * Tests for useEntityStats hook
 * Tests async loading, error handling, and mock data generation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useEntityStats, type EntityType } from '@/hooks/use-entity-stats';

describe('useEntityStats', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should start in loading state', () => {
    const { result } = renderHook(() => useEntityStats('competencies'));

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load competency stats', async () => {
    const { result } = renderHook(() => useEntityStats('competencies'));

    // Fast-forward through the simulated delay
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).not.toBeNull();
    expect(result.current.stats?.total).toBeGreaterThan(0);
    expect(result.current.stats?.trend).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should load behavioral indicator stats', async () => {
    const { result } = renderHook(() => useEntityStats('behavioral-indicators'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).not.toBeNull();
    expect(result.current.stats?.total).toBeGreaterThan(0);
  });

  it('should load assessment question stats', async () => {
    const { result } = renderHook(() => useEntityStats('assessment-questions'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).not.toBeNull();
    expect(result.current.stats?.total).toBeGreaterThan(0);
  });

  it('should have active/inactive counts', async () => {
    const { result } = renderHook(() => useEntityStats('competencies'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats?.active).toBeDefined();
    expect(result.current.stats?.inactive).toBeDefined();
  });

  it('should have trend information', async () => {
    const { result } = renderHook(() => useEntityStats('competencies'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats?.trend).toBeDefined();
    expect(result.current.stats?.trend?.value).toBeDefined();
    expect(result.current.stats?.trend?.label).toBe('vs last month');
    expect(typeof result.current.stats?.trend?.isPositive).toBe('boolean');
  });

  it('should handle refresh', async () => {
    const { result } = renderHook(() => useEntityStats('competencies'));

    // Initial load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);

    // Trigger refresh
    act(() => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    // Stats should be refreshed (values are random, so just check it's populated)
    expect(result.current.stats).not.toBeNull();
    expect(result.current.stats?.total).toBeGreaterThan(0);
  });

  it('should refetch when entity type changes', async () => {
    const { result, rerender } = renderHook(
      ({ type }: { type: EntityType }) => useEntityStats(type),
      { initialProps: { type: 'competencies' as EntityType } }
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);

    // Change entity type
    rerender({ type: 'behavioral-indicators' });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).not.toBeNull();
  });

  it('should provide type-specific stats for competencies', async () => {
    const { result } = renderHook(() => useEntityStats('competencies'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    // Type-specific fields for competencies
    const stats = result.current.stats;
    expect(stats).toHaveProperty('byLevel');
    expect(stats).toHaveProperty('byCategory');
    expect(stats).toHaveProperty('averageWeight');
    expect(stats).toHaveProperty('withAssessments');
  });

  it('should provide type-specific stats for behavioral indicators', async () => {
    const { result } = renderHook(() => useEntityStats('behavioral-indicators'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    // Type-specific fields for behavioral indicators
    const stats = result.current.stats;
    expect(stats).toHaveProperty('byLevel');
    expect(stats).toHaveProperty('withQuestions');
    expect(stats).toHaveProperty('averageComplexity');
  });

  it('should provide type-specific stats for assessment questions', async () => {
    const { result } = renderHook(() => useEntityStats('assessment-questions'));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    // Type-specific fields for assessment questions
    const stats = result.current.stats;
    expect(stats).toHaveProperty('byType');
    expect(stats).toHaveProperty('byDifficulty');
    expect(stats).toHaveProperty('withIndicators');
    expect(stats).toHaveProperty('averageScore');
  });
});
