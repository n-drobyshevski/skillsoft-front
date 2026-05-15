/**
 * Type definitions for skill/competency data from ESCO and O*NET standards
 * Used by the fuzzy search engine for skill mapping
 */

// ESCO Types

/**
 * Raw ESCO skill entry from skills_en.json
 */
export interface ESCOSkillRaw {
  conceptType: string;
  conceptUri: string;
  skillType: string;
  reuseLevel: string;
  preferredLabel: string;
  altLabels: string;
  hiddenLabels: string;
  status: string;
  modifiedDate: string;
  scopeNote: string;
  definition: string;
  inScheme: string;
  description: string;
}

/**
 * Processed ESCO skill for search indexing
 */
export interface ESCOSkill {
  id: string;
  source: 'esco';
  name: string;
  altNames: string[];
  description: string;
  type: string;
  reuseLevel: ESCOReuseLevel;
  uri: string;
  status: string;
}

export type ESCOReuseLevel = 
  | 'cross-sector' 
  | 'sector-specific' 
  | 'occupation-specific' 
  | 'transversal';

// O*NET Types

/**
 * Raw O*NET ability entry from Abilities.json
 */
export interface ONetAbilityRaw {
  'O*NET-SOC Code': string;
  'Title': string;
  'Element ID': string;
  'Element Name': string;
  'Scale ID': string;
  'Scale Name': string;
  'Data Value': string;
  'N': string;
  'Standard Error': string;
  'Lower CI Bound': string;
  'Upper CI Bound': string;
  'Recommend Suppress': string;
  'Not Relevant': string;
  'Date': string;
  'Domain Source': string;
}

/**
 * Raw O*NET Work Style entry from WorkStyles.json
 */
export interface ONetWorkStyleRaw {
  'O*NET-SOC Code': string;
  'Title': string;
  'Element ID': string;
  'Element Name': string;
  'Scale ID': string;
  'Scale Name': string;
  'Data Value': string;
  'N': string;
  'Standard Error': string;
  'Lower CI Bound': string;
  'Upper CI Bound': string;
  'Recommend Suppress': string;
  'Not Relevant': string;
  'Date': string;
  'Domain Source': string;
}

/**
 * Raw O*NET Knowledge entry from Knowledge.json
 */
export interface ONetKnowledgeRaw {
  'O*NET-SOC Code': string;
  'Title': string;
  'Element ID': string;
  'Element Name': string;
  'Scale ID': string;
  'Scale Name': string;
  'Data Value': string;
  'N': string;
  'Standard Error': string;
  'Lower CI Bound': string;
  'Upper CI Bound': string;
  'Recommend Suppress': string;
  'Not Relevant': string;
  'Date': string;
  'Domain Source': string;
}

/**
 * Processed O*NET element (ability, work style, or knowledge)
 */
export interface ONetElement {
  id: string;
  source: 'onet';
  elementId: string;
  name: string;
  description: string;
  category: ONetCategory;
  relatedOccupations: ONetOccupation[];
}

export interface ONetOccupation {
  code: string;
  title: string;
  importance: number;
  level: number;
}

export type ONetCategory = 'ability' | 'work-style' | 'knowledge';

// Unified Search Types

/**
 * Unified skill item for search indexing
 */
export interface UnifiedSkill {
  id: string;
  source: 'esco' | 'onet';
  name: string;
  altNames: string[];
  description: string;
  category: string;
  subCategory?: string;
  code?: string;
  uri?: string;
  metadata: Record<string, unknown>;
}

/**
 * Search result with match information
 */
export interface SkillSearchResult {
  item: UnifiedSkill;
  score: number;
  matches?: SkillSearchMatch[];
  refIndex?: number;
}

export interface SkillSearchMatch {
  key: string;
  value: string;
  indices: [number, number][];
}

/**
 * Search filter options
 */
export interface SkillSearchFilters {
  sources?: ('esco' | 'onet')[];
  categories?: string[];
  minScore?: number;
}

/**
 * Search configuration
 */
export interface SkillSearchConfig {
  threshold?: number;
  limit?: number;
  filters?: SkillSearchFilters;
}

// Big Five Mapping Types

export type BigFiveCode = 'O' | 'C' | 'E' | 'A' | 'N';

export interface BigFiveMapping {
  elementId: string;
  elementName: string;
  primary: {
    dimension: BigFiveCode;
    weight: number;
  };
  secondary?: {
    dimension: BigFiveCode;
    weight: number;
  };
  tertiary?: {
    dimension: BigFiveCode;
    weight: number;
  };
}

export interface BigFiveProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// Skill Recommendation Types

export interface SkillRecommendation {
  skill: UnifiedSkill;
  relevanceScore: number;
  matchedTerms: string[];
  relatedSkills: UnifiedSkill[];
  bigFiveAlignment?: Partial<BigFiveProfile>;
}

export interface SkillMapperState {
  query: string;
  results: SkillSearchResult[];
  selectedSkill: UnifiedSkill | null;
  isLoading: boolean;
  filters: SkillSearchFilters;
}
