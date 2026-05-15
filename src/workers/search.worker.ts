/**
 * Search Web Worker
 * 
 * Offloads Fuse.js index building and search operations to a separate thread.
 * This keeps the main thread responsive during initial load and heavy searches.
 * 
 * Features:
 * - Index building off main thread
 * - Search execution in worker
 * - Transferable results for performance
 */

import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type { UnifiedSkill, SkillSearchResult } from '@/types/skills';

// Types

export interface WorkerMessage {
  type: 'build-index' | 'search' | 'update-options' | 'recommend';
  payload: BuildIndexPayload | SearchPayload | UpdateOptionsPayload | RecommendPayload;
  id: string;
}

export interface BuildIndexPayload {
  skills: UnifiedSkill[];
  options: IFuseOptions<UnifiedSkill>;
}

export interface SearchPayload {
  query: string;
  limit: number;
}

export interface UpdateOptionsPayload {
  options: Partial<IFuseOptions<UnifiedSkill>>;
}

export interface RecommendPayload {
  query: string;
  standard: 'onet' | 'esco';
  limit?: number;
}

export interface WorkerResponse {
  type: 'index-ready' | 'search-results' | 'recommendations' | 'error';
  payload: IndexReadyPayload | SearchResultsPayload | RecommendationsPayload | ErrorPayload;
  id: string;
}

export interface IndexReadyPayload {
  indexedCount: number;
  buildTime: number;
}

export interface SearchResultsPayload {
  results: SkillSearchResult[];
  searchTime: number;
  query: string;
}

export interface RecommendationsPayload {
  results: SkillSearchResult[];
  searchTime: number;
  seedQuery: string;
  standard: 'onet' | 'esco';
}

export interface ErrorPayload {
  message: string;
  code: string;
}

// Worker State

let fuseInstance: Fuse<UnifiedSkill> | null = null;
let currentOptions: IFuseOptions<UnifiedSkill> = {};

// Default Fuse Options

const DEFAULT_FUSE_OPTIONS: IFuseOptions<UnifiedSkill> = {
  threshold: 0.4,
  distance: 100,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'altNames', weight: 1.5 },
    { name: 'description', weight: 0.8 },
    { name: 'category', weight: 0.6 },
    { name: 'code', weight: 1.0 },
  ],
  includeScore: true,
  includeMatches: true,
};

// Transform Results

function transformResults(fuseResults: FuseResult<UnifiedSkill>[]): SkillSearchResult[] {
  return fuseResults.map(result => ({
    item: result.item,
    score: result.score ?? 0,
    matches: result.matches?.map(match => ({
      key: match.key ?? '',
      value: match.value ?? '',
      indices: match.indices as [number, number][],
    })),
    refIndex: result.refIndex,
  }));
}

// Message Handlers

function handleBuildIndex(payload: BuildIndexPayload, id: string): void {
  const startTime = performance.now();
  
  try {
    currentOptions = { ...DEFAULT_FUSE_OPTIONS, ...payload.options };
    fuseInstance = new Fuse(payload.skills, currentOptions);
    
    const buildTime = performance.now() - startTime;
    
    const response: WorkerResponse = {
      type: 'index-ready',
      payload: {
        indexedCount: payload.skills.length,
        buildTime,
      },
      id,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error building index',
        code: 'INDEX_BUILD_ERROR',
      },
      id,
    };
    
    self.postMessage(response);
  }
}

function handleSearch(payload: SearchPayload, id: string): void {
  const startTime = performance.now();
  
  if (!fuseInstance) {
    const response: WorkerResponse = {
      type: 'error',
      payload: {
        message: 'Search index not initialized. Call build-index first.',
        code: 'INDEX_NOT_READY',
      },
      id,
    };
    
    self.postMessage(response);
    return;
  }
  
  try {
    const query = payload.query.trim();
    
    if (query.length === 0) {
      const response: WorkerResponse = {
        type: 'search-results',
        payload: {
          results: [],
          searchTime: 0,
          query: '',
        },
        id,
      };
      
      self.postMessage(response);
      return;
    }
    
    const fuseResults = fuseInstance.search(query, { limit: payload.limit });
    const transformedResults = transformResults(fuseResults);
    
    const searchTime = performance.now() - startTime;
    
    const response: WorkerResponse = {
      type: 'search-results',
      payload: {
        results: transformedResults,
        searchTime,
        query,
      },
      id,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown search error',
        code: 'SEARCH_ERROR',
      },
      id,
    };
    
    self.postMessage(response);
  }
}

function handleUpdateOptions(payload: UpdateOptionsPayload, id: string): void {
  currentOptions = { ...currentOptions, ...payload.options };
  
  // Note: Fuse.js doesn't support updating options on existing index
  // The caller should rebuild the index after updating options
  
  const response: WorkerResponse = {
    type: 'index-ready',
    payload: {
      indexedCount: 0, // Index needs rebuild
      buildTime: 0,
    },
    id,
  };
  
  self.postMessage(response);
}

/**
 * Handle RECOMMEND action - Context-aware smart boosting
 * Uses the O*NET skill name as a "seed" to recommend relevant ESCO skills
 */
function handleRecommend(payload: RecommendPayload, id: string): void {
  const startTime = performance.now();
  
  if (!fuseInstance) {
    const response: WorkerResponse = {
      type: 'error',
      payload: {
        message: 'Search index not initialized. Call build-index first.',
        code: 'INDEX_NOT_READY',
      },
      id,
    };
    
    self.postMessage(response);
    return;
  }
  
  try {
    const query = payload.query.trim();
    const limit = payload.limit ?? 5; // Default to top 5 recommendations
    
    if (query.length === 0) {
      const response: WorkerResponse = {
        type: 'recommendations',
        payload: {
          results: [],
          searchTime: 0,
          seedQuery: '',
          standard: payload.standard,
        },
        id,
      };
      
      self.postMessage(response);
      return;
    }
    
    // Use the existing Fuse.js instance to search
    // The index should already be filtered to the target standard (ESCO)
    const fuseResults = fuseInstance.search(query, { limit });
    const transformedResults = transformResults(fuseResults);
    
    const searchTime = performance.now() - startTime;
    
    const response: WorkerResponse = {
      type: 'recommendations',
      payload: {
        results: transformedResults,
        searchTime,
        seedQuery: query,
        standard: payload.standard,
      },
      id,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown recommendation error',
        code: 'RECOMMEND_ERROR',
      },
      id,
    };
    
    self.postMessage(response);
  }
}

// Worker Entry Point

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data;
  
  switch (type) {
    case 'build-index':
      handleBuildIndex(payload as BuildIndexPayload, id);
      break;
    case 'search':
      handleSearch(payload as SearchPayload, id);
      break;
    case 'update-options':
      handleUpdateOptions(payload as UpdateOptionsPayload, id);
      break;
    case 'recommend':
      handleRecommend(payload as RecommendPayload, id);
      break;
    default:
      self.postMessage({
        type: 'error',
        payload: {
          message: `Unknown message type: ${type}`,
          code: 'UNKNOWN_MESSAGE',
        },
        id,
      } as WorkerResponse);
  }
};

// Signal that worker is ready
self.postMessage({
  type: 'index-ready',
  payload: { indexedCount: 0, buildTime: 0 },
  id: 'init',
} as WorkerResponse);
