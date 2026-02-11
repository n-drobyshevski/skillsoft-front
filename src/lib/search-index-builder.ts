/**
 * Search Index Builder
 * 
 * Processes and normalizes ESCO and O*NET JSON data into a unified
 * searchable format for the fuzzy search engine.
 * 
 * This module runs client-side and builds the search index from
 * static JSON imports with zero network calls.
 */

import type {
  ESCOSkillRaw,
  ONetAbilityRaw,
  ONetWorkStyleRaw,
  ONetKnowledgeRaw,
  UnifiedSkill,
  ESCOReuseLevel,
} from '@/types/skills';

// =============================================================================
// ESCO Processing
// =============================================================================

/**
 * Extract ID from ESCO concept URI
 */
function extractESCOId(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

/**
 * Parse alternative labels from newline-separated string
 */
function parseAltLabels(altLabels: string): string[] {
  if (!altLabels || altLabels.trim() === '') {
    return [];
  }
  return altLabels
    .split('\n')
    .map(label => label.trim())
    .filter(label => label.length > 0);
}

/**
 * Map ESCO skill type to category
 */
function mapESCOCategory(skillType: string, reuseLevel: string): string {
  if (skillType === 'knowledge') {
    return 'Knowledge';
  }
  
  const levelMap: Record<string, string> = {
    'cross-sector': 'Cross-Sector Skill',
    'sector-specific': 'Sector-Specific Skill',
    'occupation-specific': 'Occupation-Specific Skill',
    'transversal': 'Transversal Competence',
  };
  
  return levelMap[reuseLevel] || 'Skill/Competence';
}

/**
 * Process raw ESCO skill into unified format
 */
export function processESCOSkill(raw: ESCOSkillRaw): UnifiedSkill {
  const id = extractESCOId(raw.conceptUri);
  
  return {
    id: `esco-${id}`,
    source: 'esco',
    name: raw.preferredLabel,
    altNames: parseAltLabels(raw.altLabels),
    description: raw.description || raw.scopeNote || '',
    category: mapESCOCategory(raw.skillType, raw.reuseLevel),
    subCategory: raw.reuseLevel as ESCOReuseLevel,
    uri: raw.conceptUri,
    metadata: {
      status: raw.status,
      modifiedDate: raw.modifiedDate,
      conceptType: raw.conceptType,
    },
  };
}

/**
 * Process array of raw ESCO skills
 */
export function processESCOSkills(rawSkills: ESCOSkillRaw[]): UnifiedSkill[] {
  return rawSkills
    .filter(skill => skill.status === 'released')
    .map(processESCOSkill);
}

// =============================================================================
// O*NET Processing
// =============================================================================

/**
 * Deduplicate O*NET elements and aggregate occupation data
 */
interface ONetElementAggregated {
  elementId: string;
  elementName: string;
  occupations: Map<string, {
    code: string;
    title: string;
    importance?: number;
    level?: number;
  }>;
}

/**
 * Aggregate O*NET raw data by element (removes per-occupation duplication)
 */
function aggregateONetElements<T extends ONetAbilityRaw | ONetWorkStyleRaw | ONetKnowledgeRaw>(
  rawData: T[]
): ONetElementAggregated[] {
  const elementMap = new Map<string, ONetElementAggregated>();
  
  for (const row of rawData) {
    const elementId = row['Element ID'];
    const elementName = row['Element Name'];
    const occupationCode = row['O*NET-SOC Code'];
    const occupationTitle = row['Title'];
    const scaleId = row['Scale ID'];
    const dataValue = parseFloat(row['Data Value']);
    
    // Get or create element entry
    if (!elementMap.has(elementId)) {
      elementMap.set(elementId, {
        elementId,
        elementName,
        occupations: new Map(),
      });
    }
    
    const element = elementMap.get(elementId)!;
    
    // Get or create occupation entry for this element
    if (!element.occupations.has(occupationCode)) {
      element.occupations.set(occupationCode, {
        code: occupationCode,
        title: occupationTitle,
      });
    }
    
    const occupation = element.occupations.get(occupationCode)!;
    
    // Update importance or level based on scale
    if (scaleId === 'IM') {
      occupation.importance = dataValue;
    } else if (scaleId === 'LV') {
      occupation.level = dataValue;
    }
  }
  
  return Array.from(elementMap.values());
}

/**
 * Map O*NET element ID to category
 */
function mapONetCategory(elementId: string): string {
  if (elementId.startsWith('1.A')) return 'Ability';
  if (elementId.startsWith('1.B')) return 'Interest';
  if (elementId.startsWith('1.C')) return 'Work Style';
  if (elementId.startsWith('2.A')) return 'Knowledge';
  if (elementId.startsWith('2.B')) return 'Skill';
  if (elementId.startsWith('2.C')) return 'Education';
  return 'Other';
}

/**
 * Process aggregated O*NET element into unified format
 */
function processONetElement(
  element: ONetElementAggregated,
  _category: 'ability' | 'work-style' | 'knowledge'
): UnifiedSkill {
  // Get top occupations by importance
  const topOccupations = Array.from(element.occupations.values())
    .filter(occ => occ.importance !== undefined)
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 10);
  
  const categoryLabel = mapONetCategory(element.elementId);
  
  return {
    id: `onet-${element.elementId}`,
    source: 'onet',
    name: element.elementName,
    altNames: [],
    description: `O*NET ${categoryLabel}: ${element.elementName}. ` +
      `Relevant for occupations like ${topOccupations.slice(0, 3).map(o => o.title).join(', ')}.`,
    category: categoryLabel,
    code: element.elementId,
    metadata: {
      occupationCount: element.occupations.size,
      topOccupations: topOccupations.map(o => ({
        code: o.code,
        title: o.title,
        importance: o.importance,
        level: o.level,
      })),
    },
  };
}

/**
 * Process O*NET abilities into unified format
 */
export function processONetAbilities(rawAbilities: ONetAbilityRaw[]): UnifiedSkill[] {
  const aggregated = aggregateONetElements(rawAbilities);
  return aggregated.map(element => processONetElement(element, 'ability'));
}

/**
 * Process O*NET work styles into unified format
 */
export function processONetWorkStyles(rawWorkStyles: ONetWorkStyleRaw[]): UnifiedSkill[] {
  const aggregated = aggregateONetElements(rawWorkStyles);
  return aggregated.map(element => processONetElement(element, 'work-style'));
}

/**
 * Process O*NET knowledge into unified format
 */
export function processONetKnowledge(rawKnowledge: ONetKnowledgeRaw[]): UnifiedSkill[] {
  const aggregated = aggregateONetElements(rawKnowledge);
  return aggregated.map(element => processONetElement(element, 'knowledge'));
}

// =============================================================================
// Index Builder
// =============================================================================

export interface SearchIndexData {
  skills: UnifiedSkill[];
  bySource: {
    esco: UnifiedSkill[];
    onet: UnifiedSkill[];
  };
  byCategory: Map<string, UnifiedSkill[]>;
  totalCount: number;
  buildTime: number;
}

/**
 * Build complete search index from all data sources
 */
export function buildSearchIndex(
  escoSkills: ESCOSkillRaw[],
  onetAbilities: ONetAbilityRaw[],
  onetWorkStyles: ONetWorkStyleRaw[],
  onetKnowledge: ONetKnowledgeRaw[]
): SearchIndexData {
  const startTime = performance.now();
  
  // Process all data sources
  const escoProcessed = processESCOSkills(escoSkills);
  const onetAbilitiesProcessed = processONetAbilities(onetAbilities);
  const onetWorkStylesProcessed = processONetWorkStyles(onetWorkStyles);
  const onetKnowledgeProcessed = processONetKnowledge(onetKnowledge);
  
  // Combine O*NET sources
  const onetCombined = [
    ...onetAbilitiesProcessed,
    ...onetWorkStylesProcessed,
    ...onetKnowledgeProcessed,
  ];
  
  // Combine all sources
  const allSkills = [...escoProcessed, ...onetCombined];
  
  // Build category index
  const byCategory = new Map<string, UnifiedSkill[]>();
  for (const skill of allSkills) {
    const category = skill.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(skill);
  }
  
  const buildTime = performance.now() - startTime;
  
  return {
    skills: allSkills,
    bySource: {
      esco: escoProcessed,
      onet: onetCombined,
    },
    byCategory,
    totalCount: allSkills.length,
    buildTime,
  };
}

/**
 * Get unique categories from index
 */
export function getCategories(index: SearchIndexData): string[] {
  return Array.from(index.byCategory.keys()).sort();
}

/**
 * Get index statistics
 */
export function getIndexStats(index: SearchIndexData): {
  total: number;
  esco: number;
  onet: number;
  categories: number;
  buildTimeMs: number;
} {
  return {
    total: index.totalCount,
    esco: index.bySource.esco.length,
    onet: index.bySource.onet.length,
    categories: index.byCategory.size,
    buildTimeMs: Math.round(index.buildTime),
  };
}
