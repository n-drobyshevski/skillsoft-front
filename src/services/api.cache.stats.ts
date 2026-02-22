/**
 * Server-side Cached API Function for Entity Statistics
 *
 * Uses Next.js 16 'use cache' directive for granular cache profiles.
 * Fetches aggregated stats from the backend stats endpoint.
 *
 * Profile: entityData (60s stale, 300s revalidate, 600s expire)
 */

import { cacheLife, cacheTag } from 'next/cache';
import { EntityStats } from '@/types/domain';

const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? `https://${apiUrl}/api` : "http://localhost:8080/api";
};

const STATS_ENDPOINT = '/v1/stats/entities';

/**
 * Cached entity statistics fetcher.
 * Returns aggregated stats for competencies, indicators, and questions.
 * Uses entityData profile (5 min revalidation).
 */
export async function getEntityStatsCached(): Promise<EntityStats | null> {
    'use cache';
    cacheLife('entityData');
    cacheTag('entity-stats', 'competencies', 'indicators', 'questions');

    try {
        const response = await fetch(`${getApiBaseUrl()}${STATS_ENDPOINT}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) return null;
        return (await response.json()) as EntityStats;
    } catch {
        return null;
    }
}
