'use client';

import * as React from 'react';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

// Types

export type AnnouncePoliteNess = 'polite' | 'assertive';

interface Announcement {
  id: string;
  message: string;
  politeness: AnnouncePoliteNess;
  timestamp: number;
}

interface ScreenReaderContextValue {
  /** Announce a message to screen readers */
  announce: (message: string, politeness?: AnnouncePoliteNess) => void;
  /** Clear all announcements */
  clear: () => void;
}

// Context

const ScreenReaderContext = createContext<ScreenReaderContextValue | null>(null);

/**
 * Hook to access the screen reader announcer
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce } = useScreenReader();
 *
 *   const handleSave = async () => {
 *     await saveData();
 *     announce('Data saved successfully');
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useScreenReader() {
  const context = useContext(ScreenReaderContext);

  if (!context) {
    // Return a no-op version if not in provider
    return {
      announce: () => {},
      clear: () => {},
    };
  }

  return context;
}

// Provider Component

interface ScreenReaderProviderProps {
  children: React.ReactNode;
  /** Delay between announcements (ms) to prevent overlap */
  debounceDelay?: number;
}

/**
 * ScreenReaderProvider - Provides screen reader announcements throughout the app
 *
 * Wrap your app or a section of it to enable screen reader announcements.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <ScreenReaderProvider>
 *   {children}
 * </ScreenReaderProvider>
 * ```
 */
export function ScreenReaderProvider({
  children,
  debounceDelay = 100,
}: ScreenReaderProviderProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idCounter = useRef(0);

  const announce = (message: string, politeness: AnnouncePoliteNess = 'polite') => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce to prevent rapid announcements
    timeoutRef.current = setTimeout(() => {
      const id = `announcement-${++idCounter.current}`;
      const announcement: Announcement = {
        id,
        message,
        politeness,
        timestamp: Date.now(),
      };

      setAnnouncements((prev) => [...prev, announcement]);

      // Auto-clear announcement after 5 seconds
      setTimeout(() => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }, 5000);
    }, debounceDelay);
  };

  const clear = () => {
    setAnnouncements([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ScreenReaderContext.Provider value={{ announce, clear }}>
      {children}
      {/* Polite announcements (non-interrupting) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter((a) => a.politeness === 'polite')
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
      {/* Assertive announcements (interrupting) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter((a) => a.politeness === 'assertive')
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
    </ScreenReaderContext.Provider>
  );
}

// Direct Announcement Component

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  /** ARIA live region politeness */
  politeness?: AnnouncePoliteNess;
  /** Whether to use atomic updates */
  atomic?: boolean;
  /** Role for the element */
  role?: 'status' | 'alert' | 'log';
}

/**
 * ScreenReaderOnly - Visually hidden content for screen readers
 *
 * Use this for:
 * - Dynamic status updates
 * - Important notifications
 * - Context that sighted users get visually
 *
 * @example
 * ```tsx
 * // Status update
 * <ScreenReaderOnly>
 *   Question {current} of {total}: {questionText}
 * </ScreenReaderOnly>
 *
 * // Alert
 * <ScreenReaderOnly politeness="assertive" role="alert">
 *   Error: Your session has expired
 * </ScreenReaderOnly>
 * ```
 */
export function ScreenReaderOnly({
  children,
  politeness = 'polite',
  atomic = true,
  role = 'status',
}: ScreenReaderOnlyProps) {
  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Announcement Hooks

/**
 * Hook to announce navigation changes
 *
 * @example
 * ```tsx
 * const announceNavigation = useNavigationAnnounce();
 *
 * useEffect(() => {
 *   announceNavigation(`Page ${pageTitle} loaded`);
 * }, [pageTitle, announceNavigation]);
 * ```
 */
export function useNavigationAnnounce() {
  const { announce } = useScreenReader();

  return (message: string) => {
    announce(message, 'polite');
  };
}

/**
 * Hook to announce form validation errors
 *
 * @example
 * ```tsx
 * const announceError = useErrorAnnounce();
 *
 * const onSubmit = () => {
 *   if (!isValid) {
 *     announceError('Please fix the errors before submitting');
 *   }
 * };
 * ```
 */
export function useErrorAnnounce() {
  const { announce } = useScreenReader();

  return (message: string) => {
    announce(message, 'assertive');
  };
}

/**
 * Hook to announce loading states
 *
 * @example
 * ```tsx
 * const announceLoading = useLoadingAnnounce();
 *
 * useEffect(() => {
 *   if (isLoading) {
 *     announceLoading('Loading data...');
 *   } else {
 *     announceLoading('Data loaded');
 *   }
 * }, [isLoading, announceLoading]);
 * ```
 */
export function useLoadingAnnounce() {
  const { announce } = useScreenReader();

  return (message: string) => {
    announce(message, 'polite');
  };
}

// Question Progress Announcer

interface QuestionProgressAnnouncerProps {
  currentIndex: number;
  totalQuestions: number;
  questionText: string;
  isAnswered: boolean;
  isSkipped: boolean;
}

/**
 * QuestionProgressAnnouncer - Announces question progress for test-taking
 *
 * @example
 * ```tsx
 * <QuestionProgressAnnouncer
 *   currentIndex={currentIndex}
 *   totalQuestions={questions.length}
 *   questionText={currentQuestion.text}
 *   isAnswered={hasAnswer}
 *   isSkipped={isSkipped}
 * />
 * ```
 */
export function QuestionProgressAnnouncer({
  currentIndex,
  totalQuestions,
  questionText,
  isAnswered,
  isSkipped,
}: QuestionProgressAnnouncerProps) {
  const status = isAnswered ? 'Answered' : isSkipped ? 'Skipped' : 'Unanswered';

  return (
    <ScreenReaderOnly>
      Question {currentIndex + 1} of {totalQuestions}: {questionText}. Status: {status}.
    </ScreenReaderOnly>
  );
}

// Selection Announcer

interface SelectionAnnouncerProps {
  selectedCount: number;
  totalCount: number;
  itemType?: string;
}

/**
 * SelectionAnnouncer - Announces selection changes for batch operations
 *
 * @example
 * ```tsx
 * <SelectionAnnouncer
 *   selectedCount={selectedIds.size}
 *   totalCount={items.length}
 *   itemType="items"
 * />
 * ```
 */
export function SelectionAnnouncer({
  selectedCount,
  totalCount,
  itemType = 'items',
}: SelectionAnnouncerProps) {
  const prevCount = useRef(selectedCount);

  // Only announce when count changes
  useEffect(() => {
    if (selectedCount !== prevCount.current) {
      prevCount.current = selectedCount;
    }
  }, [selectedCount]);

  if (selectedCount === 0) {
    return <ScreenReaderOnly>No {itemType} selected</ScreenReaderOnly>;
  }

  if (selectedCount === totalCount) {
    return <ScreenReaderOnly>All {totalCount} {itemType} selected</ScreenReaderOnly>;
  }

  return (
    <ScreenReaderOnly>
      {selectedCount} of {totalCount} {itemType} selected
    </ScreenReaderOnly>
  );
}

export default ScreenReaderProvider;
