import { revalidateCompetencyTags } from '@/app/actions';
import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { Competency, BehavioralIndicator } from '@/types/domain';

// Endpoint constant
const COMPETENCIES_ENDPOINT = '/competencies';

// Input types for API operations
interface CompetencyInput {
    name: string;
    description?: string;
    category: string;
    isActive: boolean;
    approvalStatus: string;
    standardCodes?: Record<string, unknown>;
}

export const competenciesApi = {
    getAllCompetencies: async (): Promise<Competency[] | null> => {
        return fetchApi(COMPETENCIES_ENDPOINT, {
            tags: ['competencies'],
            revalidate: 300, // 5 minutes
        });
    },

    getCompetencyById: async (competencyId: string) : Promise<Competency | null> => {
        return fetchApi(`/competencies/${competencyId}`, {
            tags: [`competency-${competencyId}`],
            revalidate: 60,
            silentStatusCodes: [404], // 404 is expected for non-existent/deleted competencies
        });
    },

    createCompetency: async (data: CompetencyInput): Promise<Competency> => {
        const authHeaders = await getAuthHeaders();
        const result = await fetchApi<Competency>(COMPETENCIES_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags();
        return result;
    },

    updateCompetency: async (competencyId: string, data: CompetencyInput): Promise<Competency> => {
        const authHeaders = await getAuthHeaders();
        const result = await fetchApi<Competency>(`/competencies/${competencyId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags(competencyId);
        return result;
    },

    deleteCompetency: async (competencyId: string) => {
        const authHeaders = await getAuthHeaders();
        await fetchApi(`/competencies/${competencyId}`, {
            method: 'DELETE',
            cache: 'no-store',
            authHeaders,
        });
        // Note: Cache revalidation is handled in the server action
    },

    attachIndicator: async (competencyId: string, indicatorId: string): Promise<void> => {
        const authHeaders = await getAuthHeaders();
        await fetchApi(`/competencies/${competencyId}/bi/${indicatorId}`, {
            method: 'POST',
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags(competencyId);
    },

    detachIndicator: async (competencyId: string, indicatorId: string): Promise<void> => {
        const authHeaders = await getAuthHeaders();
        await fetchApi(`/competencies/${competencyId}/bi/${indicatorId}`, {
            method: 'DELETE',
            cache: 'no-store',
            authHeaders,
        });
        await revalidateCompetencyTags(competencyId);
    },

    getAvailableIndicators: async (competencyId: string): Promise<BehavioralIndicator[]> => {
        return fetchApi(`/competencies/${competencyId}/available-bi`, {
            tags: [`available-indicators-${competencyId}`],
            revalidate: 60,
            silentStatusCodes: [404], // 404 is expected when competency doesn't exist
        });
    },
};
