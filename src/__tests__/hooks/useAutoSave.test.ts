import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSave } from '../../hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ============================================
  // BASIC FUNCTIONALITY TESTS
  // ============================================

  describe('Basic Functionality', () => {
    it('should initialize with idle status and no unsaved changes', () => {
      const onSave = vi.fn();
      const { result } = renderHook(() =>
        useAutoSave({
          data: { value: 'initial' },
          onSave,
        })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.isSaving).toBe(false);
    });

    it('should trigger save when data changes', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      // Change data
      rerender({ data: { value: 'updated' } });

      // Status should be pending immediately
      expect(result.current.status).toBe('pending');
      expect(result.current.hasUnsavedChanges).toBe(true);

      // Fast-forward past debounce time
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(onSave).toHaveBeenCalledWith({ value: 'updated' });
    });

    it('should set saved status on successful save', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'updated' } });

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.status).toBe('saved');
      expect(result.current.lastSaved).not.toBeNull();
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should not save when disabled', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, enabled: false }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'updated' } });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // DEBOUNCE TESTS
  // ============================================

  describe('Debounce Behavior', () => {
    it('should debounce rapid changes', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 500 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      // Simulate rapid changes
      rerender({ data: { value: 'change1' } });
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      rerender({ data: { value: 'change2' } });
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      rerender({ data: { value: 'change3' } });
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Save should not have been called yet (300ms < 500ms debounce)
      expect(onSave).not.toHaveBeenCalled();

      // Wait for debounce to complete
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Should only save once with final value
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ value: 'change3' });
    });

    it('should respect maxWait timer for forced save', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave,
            debounceMs: 5000,
            maxWaitMs: 3000,
          }),
        { initialProps: { data: { value: 'initial' } } }
      );

      // Change data
      rerender({ data: { value: 'updated' } });

      // Wait less than debounce but more than maxWait
      await act(async () => {
        vi.advanceTimersByTime(3100);
      });

      // Should have saved due to maxWait
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // RETRY LOGIC TESTS
  // ============================================

  describe('Retry Logic with Exponential Backoff', () => {
    it('should retry on network failure with exponential backoff', async () => {
      const onSave = vi
        .fn()
        .mockResolvedValueOnce(false) // First attempt fails
        .mockResolvedValueOnce(false) // Second attempt fails
        .mockResolvedValueOnce(true); // Third attempt succeeds

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave,
            debounceMs: 100,
            retry: {
              maxAttempts: 3,
              baseDelayMs: 100,
              multiplier: 2,
            },
          }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'updated' } });

      // Wait for initial save attempt
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.status).toBe('retrying');
      expect(result.current.retryAttempt).toBe(1);

      // Wait for first retry (100ms base delay)
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.retryAttempt).toBe(2);

      // Wait for second retry (200ms = 100 * 2^1)
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.status).toBe('saved');
      expect(onSave).toHaveBeenCalledTimes(3);
    });

    it('should set error status after max retries exceeded', async () => {
      const onSave = vi.fn().mockResolvedValue(false);
      const onError = vi.fn();

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave,
            onError,
            debounceMs: 100,
            retry: {
              maxAttempts: 2,
              baseDelayMs: 100,
            },
          }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'updated' } });

      // Wait for all retries to complete
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.status).toBe('error');
      expect(onError).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledTimes(2);
    });

    it('should handle exception in save function with retry', async () => {
      const onSave = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave,
            debounceMs: 100,
            retry: { maxAttempts: 2, baseDelayMs: 100 },
          }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'updated' } });

      // Wait for initial attempt and retry
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.status).toBe('saved');
      expect(onSave).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================
  // OFFLINE HANDLING TESTS
  // ============================================

  describe('Offline Handling', () => {
    it('should handle offline state gracefully', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'updated' } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.status).toBe('offline');
      expect(result.current.isOffline).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should save when coming back online', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      // Change data while offline
      rerender({ data: { value: 'offline-change' } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isOffline).toBe(true);
      expect(onSave).not.toHaveBeenCalled();

      // Go back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      await act(async () => {
        window.dispatchEvent(new Event('online'));
        vi.advanceTimersByTime(600); // Wait for stabilization delay + debounce
      });

      expect(result.current.isOffline).toBe(false);
      expect(onSave).toHaveBeenCalledWith({ value: 'offline-change' });
    });
  });

  // ============================================
  // BEFOREUNLOAD WARNING TESTS
  // ============================================

  describe('Browser Unload Warning', () => {
    it('should warn on browser unload with unsaved changes', async () => {
      const onSave = vi.fn().mockResolvedValue(true);
      const mockPreventDefault = vi.fn();

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 5000, warnOnLeave: true }),
        { initialProps: { data: { value: 'initial' } } }
      );

      // Change data but don't wait for save
      rerender({ data: { value: 'unsaved' } });

      // Simulate beforeunload event
      const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
      event.preventDefault = mockPreventDefault;

      window.dispatchEvent(event);

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it('should not warn on unload when warnOnLeave is disabled', async () => {
      const onSave = vi.fn().mockResolvedValue(true);
      const mockPreventDefault = vi.fn();

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 5000, warnOnLeave: false }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'unsaved' } });

      const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
      event.preventDefault = mockPreventDefault;

      window.dispatchEvent(event);

      expect(mockPreventDefault).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // MANUAL SAVE TESTS
  // ============================================

  describe('Manual Save (saveNow)', () => {
    it('should trigger immediate save when saveNow is called', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 10000 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'manual-save' } });

      // Call saveNow without waiting for debounce
      await act(async () => {
        await result.current.saveNow();
      });

      expect(onSave).toHaveBeenCalledWith({ value: 'manual-save' });
      expect(result.current.status).toBe('saved');
    });

    it('should return save result from saveNow', async () => {
      const onSave = vi.fn().mockResolvedValue(false);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 10000, retry: { maxAttempts: 1 } }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'will-fail' } });

      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.saveNow();
      });

      expect(saveResult).toBe(false);
      expect(result.current.status).toBe('error');
    });
  });

  // ============================================
  // CANCEL TESTS
  // ============================================

  describe('Cancel Pending Save', () => {
    it('should cancel pending save when cancel is called', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 5000 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'pending-change' } });

      // Cancel before debounce completes
      act(() => {
        result.current.cancel();
      });

      // Fast forward time
      await act(async () => {
        vi.advanceTimersByTime(6000);
      });

      expect(onSave).not.toHaveBeenCalled();
      expect(result.current.status).toBe('idle');
    });
  });

  // ============================================
  // CUSTOM COMPARE KEY TESTS
  // ============================================

  describe('Custom Compare Key', () => {
    it('should use custom compareKey function', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      // Compare only by specific field, ignoring others
      const compareKey = (data: { id: number; timestamp: number }) =>
        JSON.stringify({ id: data.id });

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100, compareKey }),
        { initialProps: { data: { id: 1, timestamp: Date.now() } } }
      );

      // Change only timestamp (should not trigger save)
      rerender({ data: { id: 1, timestamp: Date.now() + 1000 } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Save should not be called because 'id' didn't change
      expect(onSave).not.toHaveBeenCalled();

      // Change id (should trigger save)
      rerender({ data: { id: 2, timestamp: Date.now() } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // CALLBACK TESTS
  // ============================================

  describe('Callbacks', () => {
    it('should call onSuccess callback on successful save', async () => {
      const onSave = vi.fn().mockResolvedValue(true);
      const onSuccess = vi.fn();

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, onSuccess, debounceMs: 100 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'success' } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError callback on failed save', async () => {
      const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const onError = vi.fn();

      const { rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave,
            onError,
            debounceMs: 100,
            retry: { maxAttempts: 1 },
          }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'fail' } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe('Edge Cases', () => {
    it('should not save when data has not changed', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100 }),
        { initialProps: { data: { value: 'same' } } }
      );

      // Re-render with same data
      rerender({ data: { value: 'same' } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should handle component unmount during save', async () => {
      const onSave = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(true), 100);
          })
      );

      const { result, rerender, unmount } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 50 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'unmount-test' } });

      // Start save but unmount before it completes
      await act(async () => {
        vi.advanceTimersByTime(60);
      });

      unmount();

      // Complete the save timer
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Should not throw error
      expect(true).toBe(true);
    });

    it('should reset status to idle after showing saved', async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 100 }),
        { initialProps: { data: { value: 'initial' } } }
      );

      rerender({ data: { value: 'saved' } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.status).toBe('saved');

      // Wait for status to reset to idle
      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      expect(result.current.status).toBe('idle');
    });
  });
});
