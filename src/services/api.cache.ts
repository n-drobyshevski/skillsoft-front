/**
 * Server-side Cached API Functions
 *
 * Uses Next.js 16 'use cache' directive at function level for granular
 * cache profiles. Cache profiles are defined in next.config.ts cacheLife.
 *
 * Each cached function declares its own 'use cache', cacheLife, and cacheTag.
 * Function arguments automatically become part of the cache key.
 *
 * Profiles used:
 * - entityData: 60s stale, 300s revalidate, 600s expire
 */

import { cacheLife, cacheTag } from 'next/cache';
import { Competency, BehavioralIndicator, AssessmentQuestion } from '@/types/domain';

const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? `https://${apiUrl}/api` : "http://localhost:8080/api";
};

// API Endpoints
const COMPETENCIES_ENDPOINT = '/competencies';
const QUESTIONS_ENDPOINT = '/questions';
const INDICATORS_ENDPOINT = '/behavioral-indicators';

// ============================================================================
// Competencies
// ============================================================================

/**
 * Cached competencies list fetcher
 * Uses entityData profile (5 min revalidation)
 */
export async function getCompetenciesCached(): Promise<Competency[] | null> {
    'use cache';
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
 * Uses entityData profile with entity-specific tag
 */
export async function getCompetencyCached(id: string): Promise<Competency | null> {
    'use cache';
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
    'use cache';
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
    'use cache';
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
    'use cache';
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
    'use cache';
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

