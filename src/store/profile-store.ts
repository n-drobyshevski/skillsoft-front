import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  AssessmentSummary,
  CompetencyPassport,
  ProfileLoadingState,
  ProfileErrors,
  ProfileError,
} from '@/types/profile';
import { getAssessmentSummary, getCompetencyPassport } from '@/services/profile-api';

// RETRY CONFIGURATION

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff

// STORE STATE

interface ProfileState {
  // Data
  summary: AssessmentSummary | null;
  passport: CompetencyPassport | null;

  // Granular loading states
  loadingState: ProfileLoadingState;

  // Error tracking
  errors: ProfileErrors;

  // Retry counters
  retryCount: {
    summary: number;
    passport: number;
  };

  // Last successful fetch timestamps
  lastFetch: {
    summary: Date | null;
    passport: Date | null;
  };

  // Current user ID (for cache invalidation)
  currentUserId: string | null;
}

// STORE ACTIONS

interface ProfileActions {
  // Fetch actions
  fetchSummary: (clerkUserId: string) => Promise<void>;
  fetchPassport: (clerkUserId: string) => Promise<void>;
  fetchAll: (clerkUserId: string) => Promise<void>;

  // Retry action with compensation
  retry: (section: 'summary' | 'passport', clerkUserId: string) => Promise<void>;

  // Hydrate from server data
  hydrate: (data: {
    summary?: AssessmentSummary | null;
    passport?: CompetencyPassport | null;
  }) => void;

  // Reset store
  reset: () => void;

  // Check if data is stale
  isStale: (section: 'summary' | 'passport', maxAgeMs: number) => boolean;
}

type ProfileStore = ProfileState & ProfileActions;

// INITIAL STATE

const initialState: ProfileState = {
  summary: null,
  passport: null,
  loadingState: {
    summary: 'idle',
    passport: 'idle',
  },
  errors: {
    summary: null,
    passport: null,
  },
  retryCount: {
    summary: 0,
    passport: 0,
  },
  lastFetch: {
    summary: null,
    passport: null,
  },
  currentUserId: null,
};

// STORE IMPLEMENTATION

/**
 * Profile Store
 *
 * Manages user profile data state with Zustand.
 * Features:
 * - Granular loading states per section
 * - Error tracking with retry support
 * - Stale data detection
 * - Server data hydration
 * - Redux DevTools integration
 */
export const useProfileStore = create<ProfileStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      fetchSummary: async (clerkUserId: string) => {
        set(
          (state) => ({
            loadingState: { ...state.loadingState, summary: 'loading' },
            errors: { ...state.errors, summary: null },
            currentUserId: clerkUserId,
          }),
          false,
          'fetchSummary/start'
        );

        try {
          const summary = await getAssessmentSummary(clerkUserId);
          set(
            {
              summary,
              loadingState: { ...get().loadingState, summary: 'success' },
              retryCount: { ...get().retryCount, summary: 0 },
              lastFetch: { ...get().lastFetch, summary: new Date() },
            },
            false,
            'fetchSummary/success'
          );
        } catch (error) {
          const profileError: ProfileError = {
            message: error instanceof Error ? error.message : 'Failed to load assessment summary',
            code: 'FETCH_ERROR',
            retryable: true,
            timestamp: new Date(),
          };
          set(
            (state) => ({
              loadingState: { ...state.loadingState, summary: 'error' },
              errors: { ...state.errors, summary: profileError },
            }),
            false,
            'fetchSummary/error'
          );
        }
      },

      fetchPassport: async (clerkUserId: string) => {
        set(
          (state) => ({
            loadingState: { ...state.loadingState, passport: 'loading' },
            errors: { ...state.errors, passport: null },
            currentUserId: clerkUserId,
          }),
          false,
          'fetchPassport/start'
        );

        try {
          const passport = await getCompetencyPassport(clerkUserId);
          set(
            {
              passport,
              loadingState: { ...get().loadingState, passport: 'success' },
              retryCount: { ...get().retryCount, passport: 0 },
              lastFetch: { ...get().lastFetch, passport: new Date() },
            },
            false,
            'fetchPassport/success'
          );
        } catch (error) {
          const profileError: ProfileError = {
            message: error instanceof Error ? error.message : 'Failed to load competency passport',
            code: 'FETCH_ERROR',
            retryable: true,
            timestamp: new Date(),
          };
          set(
            (state) => ({
              loadingState: { ...state.loadingState, passport: 'error' },
              errors: { ...state.errors, passport: profileError },
            }),
            false,
            'fetchPassport/error'
          );
        }
      },

      fetchAll: async (clerkUserId: string) => {
        // Parallel fetch with independent error handling
        // One section failing should not block the other
        await Promise.allSettled([
          get().fetchSummary(clerkUserId),
          get().fetchPassport(clerkUserId),
        ]);
      },

      retry: async (section, clerkUserId) => {
        // eslint-disable-next-line security/detect-object-injection
        const currentRetry = get().retryCount[section];

        // Check max retries
        if (currentRetry >= MAX_RETRIES) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[ProfileStore] Max retries (${MAX_RETRIES}) exceeded for ${section}`);
          }
          return;
        }

        // Check if error is retryable
        // eslint-disable-next-line security/detect-object-injection
        const error = get().errors[section];
        if (error && !error.retryable) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[ProfileStore] Error for ${section} is not retryable`);
          }
          return;
        }

        // Apply exponential backoff
        // eslint-disable-next-line security/detect-object-injection
        const delay = RETRY_DELAYS[currentRetry] || 5000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Increment retry counter
        set(
          (state) => ({
            retryCount: {
              ...state.retryCount,
              [section]: currentRetry + 1,
            },
          }),
          false,
          `retry/${section}/attempt-${currentRetry + 1}`
        );

        // Retry the fetch
        if (section === 'summary') {
          await get().fetchSummary(clerkUserId);
        } else {
          await get().fetchPassport(clerkUserId);
        }
      },

      hydrate: (data) => {
        set(
          (state) => ({
            summary: data.summary ?? state.summary,
            passport: data.passport ?? state.passport,
            loadingState: {
              summary: data.summary ? 'success' : state.loadingState.summary,
              passport: data.passport ? 'success' : state.loadingState.passport,
            },
            lastFetch: {
              summary: data.summary ? new Date() : state.lastFetch.summary,
              passport: data.passport ? new Date() : state.lastFetch.passport,
            },
          }),
          false,
          'hydrate'
        );
      },

      reset: () => {
        set(initialState, false, 'reset');
      },

      isStale: (section, maxAgeMs) => {
        // eslint-disable-next-line security/detect-object-injection
        const lastFetch = get().lastFetch[section];
        if (!lastFetch) return true;
        return Date.now() - lastFetch.getTime() > maxAgeMs;
      },
    })),
    {
      name: 'ProfileStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// OPTIMIZED SELECTORS

/**
 * Select summary data
 */
export const useProfileSummary = () => useProfileStore((s) => s.summary);

/**
 * Select passport data
 */
export const useProfilePassport = () => useProfileStore((s) => s.passport);

/**
 * Select loading states
 */
export const useProfileLoading = () => useProfileStore((s) => s.loadingState);

/**
 * Select errors
 */
export const useProfileErrors = () => useProfileStore((s) => s.errors);

/**
 * Select store actions
 */
export const useProfileActions = () =>
  useProfileStore(
    useShallow((s) => ({
      fetchAll: s.fetchAll,
      fetchSummary: s.fetchSummary,
      fetchPassport: s.fetchPassport,
      retry: s.retry,
      hydrate: s.hydrate,
      reset: s.reset,
      isStale: s.isStale,
    }))
  );
