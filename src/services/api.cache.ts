'use cache';
/**
 * Server-side Cached API Functions
 * 
 * This file uses Next.js 16's 'use cache' directive for automatic caching.
 * These functions are server-only and cannot be imported by Client Components.
 * 
 * Cache Profiles (defined in next.config.ts):
 * - 'realtime': 30s stale, 60s expire (user sessions, stats)
 * - 'entityData': 60s stale, 5min revalidate (competencies, questions)
 * - 'userData': 5min stale, 15min revalidate (profiles, roles)
 * - 'referenceData': 30min stale, 1hr revalidate (standards, categories)
 */

import { cacheLife, cacheTag } from 'next/cache';
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

// ============================================================================
// Competencies
// ============================================================================

/**
 * Cached competencies list fetcher
 * Uses 'entityData' profile: 5 minute revalidation
 */
export async function getCompetenciesCached(): Promise<Competency[] | null> {
    cacheLife('entityData');
    cacheTag('competencies');
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${COMPETENCIES_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as Competency[];
    } catch {
        return null;
    }
}

/**
 * Cached single competency fetcher
 */
export async function getCompetencyCached(id: string): Promise<Competency | null> {
    cacheLife('entityData');
    cacheTag('competencies', `competency-${id}`);
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${COMPETENCIES_ENDPOINT}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as Competency;
    } catch {
        return null;
    }
}

// ============================================================================
// Behavioral Indicators
// ============================================================================

/**
 * Cached behavioral indicators list fetcher
 */
export async function getIndicatorsCached(): Promise<BehavioralIndicator[] | null> {
    cacheLife('entityData');
    cacheTag('indicators');
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${INDICATORS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as BehavioralIndicator[];
    } catch {
        return null;
    }
}

/**
 * Cached single indicator fetcher
 */
export async function getIndicatorCached(id: string): Promise<BehavioralIndicator | null> {
    cacheLife('entityData');
    cacheTag('indicators', `indicator-${id}`);
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${INDICATORS_ENDPOINT}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as BehavioralIndicator;
    } catch {
        return null;
    }
}

// ============================================================================
// Assessment Questions
// ============================================================================

/**
 * Cached questions list fetcher
 */
export async function getQuestionsCached(): Promise<AssessmentQuestion[] | null> {
    cacheLife('entityData');
    cacheTag('questions');
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${QUESTIONS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as AssessmentQuestion[];
    } catch {
        return null;
    }
}

/**
 * Cached single question fetcher
 */
export async function getQuestionCached(id: string): Promise<AssessmentQuestion | null> {
    cacheLife('entityData');
    cacheTag('questions', `question-${id}`);
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${QUESTIONS_ENDPOINT}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as AssessmentQuestion;
    } catch {
        return null;
    }
}

// ============================================================================
// Users
// ============================================================================
// NOTE: User endpoints require authentication headers (X-User-Id, X-User-Role)
// which cannot be used with 'use cache' directive (cache would be shared across users).
// For user data, use usersApi from api.ts which handles authentication properly.
// The functions below are only useful for public/anonymous user listing if the API allows it.

/**
 * Cached users list fetcher (requires public API endpoint)
 * Uses 'userData' profile: 15 minute revalidation
 * @deprecated User APIs typically require auth - use usersApi.getAllUsers() instead
 */
export async function getUsersCached(): Promise<User[] | null> {
    cacheLife('userData');
    cacheTag('users');
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${USERS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) return null;
        return (await response.json()) as User[];
    } catch {
        return null;
    }
}

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
 * Cached dashboard stats fetcher
 * Uses 'realtime' profile: 30 second revalidation for frequently updating data
 */
export async function getDashboardStatsCached(): Promise<DashboardStats | null> {
    cacheLife('realtime');
    cacheTag('dashboard-stats');
    
    try {
        const [competencies, indicators, questions, users] = await Promise.all([
            fetch(`${getApiBaseUrl()}${COMPETENCIES_ENDPOINT}/count`),
            fetch(`${getApiBaseUrl()}${INDICATORS_ENDPOINT}/count`),
            fetch(`${getApiBaseUrl()}${QUESTIONS_ENDPOINT}/count`),
            fetch(`${getApiBaseUrl()}${USERS_ENDPOINT}/count`),
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
