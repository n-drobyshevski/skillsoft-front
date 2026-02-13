/**
 * Template API Cache - Server-side caching for test templates.
 *
 * Provides cached template data fetching with 'use cache'.
 * Templates are stable entity data — changes only when HR edits them.
 *
 * Cache profiles:
 * - Active templates list: entityData (60s stale, 5min revalidation)
 * - Single template: entityData with entity-specific tag
 * - Template readiness: realtime (questions may change)
 */

import { cacheLife, cacheTag } from 'next/cache';
import type { TestTemplateSummary, TestTemplate, TemplateReadinessResponse } from '@/types/domain';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  if (!apiUrl) {
    return `http://localhost:8080/api${versionPath}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api${versionPath}`;
};

const TEMPLATES_BASE = '/tests/templates';

/**
 * Cached active templates list.
 * Uses entityData profile — templates change infrequently.
 */
export async function getActiveTemplatesCached(): Promise<TestTemplateSummary[]> {
  'use cache';
  cacheLife('entityData');
  cacheTag('templates', 'active-templates');

  try {
    const response = await fetch(`${getApiBaseUrl()}${TEMPLATES_BASE}/active`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return [];
    return (await response.json()) as TestTemplateSummary[];
  } catch {
    return [];
  }
}

/**
 * Cached single template fetcher.
 * Uses entityData profile with entity-specific tag for targeted invalidation.
 */
export async function getTemplateCached(templateId: string): Promise<TestTemplate | null> {
  'use cache';
  cacheLife('entityData');
  cacheTag('templates', `template-${templateId}`);

  try {
    const response = await fetch(`${getApiBaseUrl()}${TEMPLATES_BASE}/${templateId}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;
    return (await response.json()) as TestTemplate;
  } catch {
    return null;
  }
}

/**
 * Cached template readiness check.
 * Uses realtime profile — question counts may change frequently.
 */
export async function getTemplateReadinessCached(
  templateId: string
): Promise<TemplateReadinessResponse | null> {
  'use cache';
  cacheLife('realtime');
  cacheTag('template-readiness', `template-readiness-${templateId}`);

  try {
    const response = await fetch(`${getApiBaseUrl()}${TEMPLATES_BASE}/${templateId}/readiness`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;
    return (await response.json()) as TemplateReadinessResponse;
  } catch {
    return null;
  }
}
