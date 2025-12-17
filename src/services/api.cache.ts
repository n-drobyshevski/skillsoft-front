/**
 * Server-side Cached API Functions
 *
 * This file uses Next.js's unstable_cache for data fetching caching.
 * These functions are server-only and cannot be imported by Client Components.
 *
 * Note: Using unstable_cache instead of 'use cache' directive because
 * cacheComponents is disabled in next.config.ts due to Clerk compatibility.
 *
 * Revalidation times (matching next.config.ts cacheLife profiles):
 * - realtime: 30s (user sessions, stats)
 * - entityData: 300s / 5min (competencies, questions)
 * - userData: 900s / 15min (profiles, roles)
 * - referenceData: 3600s / 1hr (standards, categories)
 */

import { unstable_cache } from 'next/cache';
import { Competency, BehavioralIndicator, AssessmentQuestion } from '@/types/domain';
import { User } from '@/types/user';

const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? `https://${apiUrl}/api` : "http://localhost:8080/api";
};

// API Endpoints
const COMPETENCIES_ENDPOINT = '/competencies';
const QUESTIONS_ENDPOINT = '/questions';
const INDICATORS_ENDPOINT = '/behavioral-indicators';
const USERS_ENDPOINT = '/users';

// Cache revalidation times (in seconds)
const REALTIME_REVALIDATE = 30;
const ENTITY_DATA_REVALIDATE = 300; // 5 minutes
const USER_DATA_REVALIDATE = 900; // 15 minutes

// ============================================================================
// Competencies
// ============================================================================

/**
 * Internal fetch function for competencies list
 */
async function fetchCompetencies(): Promise<Competency[] | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${COMPETENCIES_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: ENTITY_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as Competency[];
    } catch {
        return null;
    }
}

/**
 * Cached competencies list fetcher
 * Uses 5 minute revalidation
 */
export const getCompetenciesCached = unstable_cache(
    fetchCompetencies,
    ['competencies'],
    {
        revalidate: ENTITY_DATA_REVALIDATE,
        tags: ['competencies'],
    }
);

/**
 * Internal fetch function for single competency
 */
async function fetchCompetency(id: string): Promise<Competency | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${COMPETENCIES_ENDPOINT}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: ENTITY_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as Competency;
    } catch {
        return null;
    }
}

/**
 * Cached single competency fetcher
 */
export async function getCompetencyCached(id: string): Promise<Competency | null> {
    const cachedFetch = unstable_cache(
        () => fetchCompetency(id),
        ['competency', id],
        {
            revalidate: ENTITY_DATA_REVALIDATE,
            tags: ['competencies', `competency-${id}`],
        }
    );

    return cachedFetch();
}

// ============================================================================
// Behavioral Indicators
// ============================================================================

/**
 * Internal fetch function for behavioral indicators list
 */
async function fetchIndicators(): Promise<BehavioralIndicator[] | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${INDICATORS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: ENTITY_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as BehavioralIndicator[];
    } catch {
        return null;
    }
}

/**
 * Cached behavioral indicators list fetcher
 */
export const getIndicatorsCached = unstable_cache(
    fetchIndicators,
    ['indicators'],
    {
        revalidate: ENTITY_DATA_REVALIDATE,
        tags: ['indicators'],
    }
);

/**
 * Internal fetch function for single indicator
 */
async function fetchIndicator(id: string): Promise<BehavioralIndicator | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${INDICATORS_ENDPOINT}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: ENTITY_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as BehavioralIndicator;
    } catch {
        return null;
    }
}

/**
 * Cached single indicator fetcher
 */
export async function getIndicatorCached(id: string): Promise<BehavioralIndicator | null> {
    const cachedFetch = unstable_cache(
        () => fetchIndicator(id),
        ['indicator', id],
        {
            revalidate: ENTITY_DATA_REVALIDATE,
            tags: ['indicators', `indicator-${id}`],
        }
    );

    return cachedFetch();
}

// ============================================================================
// Assessment Questions
// ============================================================================

/**
 * Internal fetch function for questions list
 */
async function fetchQuestions(): Promise<AssessmentQuestion[] | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${QUESTIONS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: ENTITY_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as AssessmentQuestion[];
    } catch {
        return null;
    }
}

/**
 * Cached questions list fetcher
 */
export const getQuestionsCached = unstable_cache(
    fetchQuestions,
    ['questions'],
    {
        revalidate: ENTITY_DATA_REVALIDATE,
        tags: ['questions'],
    }
);

/**
 * Internal fetch function for single question
 */
async function fetchQuestion(id: string): Promise<AssessmentQuestion | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${QUESTIONS_ENDPOINT}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: ENTITY_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as AssessmentQuestion;
    } catch {
        return null;
    }
}

/**
 * Cached single question fetcher
 */
export async function getQuestionCached(id: string): Promise<AssessmentQuestion | null> {
    const cachedFetch = unstable_cache(
        () => fetchQuestion(id),
        ['question', id],
        {
            revalidate: ENTITY_DATA_REVALIDATE,
            tags: ['questions', `question-${id}`],
        }
    );

    return cachedFetch();
}

// ============================================================================
// Users
// ============================================================================
// NOTE: User endpoints require authentication headers (X-User-Id, X-User-Role)
// which cannot be used with cached functions (cache would be shared across users).
// For user data, use usersApi from api.ts which handles authentication properly.
// The functions below are only useful for public/anonymous user listing if the API allows it.

/**
 * Internal fetch function for users list
 */
async function fetchUsers(): Promise<User[] | null> {
    try {
        const response = await fetch(`${getApiBaseUrl()}${USERS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: USER_DATA_REVALIDATE },
        });

        if (!response.ok) return null;
        return (await response.json()) as User[];
    } catch {
        return null;
    }
}

/**
 * Cached users list fetcher (requires public API endpoint)
 * Uses 15 minute revalidation
 * @deprecated User APIs typically require auth - use usersApi.getAllUsers() instead
 */
export const getUsersCached = unstable_cache(
    fetchUsers,
    ['users'],
    {
        revalidate: USER_DATA_REVALIDATE,
        tags: ['users'],
    }
);

// ============================================================================
// Stats (Real-time data)
// ============================================================================

interface DashboardStats {
    totalCompetencies: number;
    totalIndicators: number;
    totalQuestions: number;
    totalUsers: number;
}

/**
 * Internal fetch function for dashboard stats
 */
async function fetchDashboardStats(): Promise<DashboardStats | null> {
    try {
        const [competencies, indicators, questions, users] = await Promise.all([
            fetch(`${getApiBaseUrl()}${COMPETENCIES_ENDPOINT}/count`, {
                next: { revalidate: REALTIME_REVALIDATE },
            }),
            fetch(`${getApiBaseUrl()}${INDICATORS_ENDPOINT}/count`, {
                next: { revalidate: REALTIME_REVALIDATE },
            }),
            fetch(`${getApiBaseUrl()}${QUESTIONS_ENDPOINT}/count`, {
                next: { revalidate: REALTIME_REVALIDATE },
            }),
            fetch(`${getApiBaseUrl()}${USERS_ENDPOINT}/count`, {
                next: { revalidate: REALTIME_REVALIDATE },
            }),
        ]);

        // Handle potential failures gracefully
        const getCount = async (response: Response): Promise<number> => {
            if (!response.ok) return 0;
            const data = await response.json() as number | { count?: number };
            return typeof data === 'number' ? data : (data?.count ?? 0);
        };

        return {
            totalCompetencies: await getCount(competencies),
            totalIndicators: await getCount(indicators),
            totalQuestions: await getCount(questions),
            totalUsers: await getCount(users),
        };
    } catch {
        return null;
    }
}

/**
 * Cached dashboard stats fetcher
 * Uses 30 second revalidation for frequently updating data
 */
export const getDashboardStatsCached = unstable_cache(
    fetchDashboardStats,
    ['dashboard-stats'],
    {
        revalidate: REALTIME_REVALIDATE,
        tags: ['dashboard-stats'],
    }
);
