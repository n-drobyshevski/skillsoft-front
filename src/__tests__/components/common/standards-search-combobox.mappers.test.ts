import { describe, it, expect } from 'vitest';
import {
  normaliseOnetCategory,
  mapToOnetRef,
  mapToEscoRef,
  deriveEscoSkillType,
} from '@/components/common/standards-search-combobox';
import { ONET_CODE_PATTERN, ESCO_URI_PATTERN } from '@/lib/schemas/competency-schema';
import type { UnifiedSkill } from '@/types/skills';

// Literal copies of the Jakarta @Pattern strings from
// assessment-backend/.../domain/dto/StandardCodesDto.java — kept here so the
// frontend test breaks if backend and frontend drift apart.
const BACKEND_ONET_CODE_RE = /^\d+(\.[A-Za-z0-9]+){1,4}$/;
const BACKEND_ESCO_URI_RE =
  /^https?:\/\/data\.europa\.eu\/esco\/(skill|occupation|isced-f|qualification)\/[a-fA-F0-9-]+$/;
const BACKEND_ONET_ELEMENT_TYPE_RE =
  /^(ability|skill|knowledge|work_activity|work_style|interest|work_value|work_context)$/;
const BACKEND_ESCO_SKILL_TYPE_RE = /^(skill|competence|knowledge|language|transversal)$/;

// Frontend Zod patterns must match backend exactly (otherwise users see a
// backend 400 for a value the frontend already accepted).
describe('Zod ↔ backend regex parity', () => {
  it('frontend ONET_CODE_PATTERN matches backend regex string', () => {
    expect(ONET_CODE_PATTERN.source).toBe(BACKEND_ONET_CODE_RE.source);
  });
  it('frontend ESCO_URI_PATTERN matches backend regex string', () => {
    expect(ESCO_URI_PATTERN.source).toBe(BACKEND_ESCO_URI_RE.source);
  });
});

describe('normaliseOnetCategory', () => {
  it.each([
    ['Ability', 'ability'],
    ['Skill', 'skill'],
    ['Knowledge', 'knowledge'],
    ['Work Style', 'work_style'],
    ['Work Activity', 'work_activity'],
    ['Interest', 'interest'],
    ['Work Value', 'work_value'],
    ['Work Context', 'work_context'],
  ] as const)('maps preprocessor label "%s" to backend enum "%s"', (label, expected) => {
    expect(normaliseOnetCategory(label)).toBe(expected);
  });

  it('returns null for unknown categories (no silent default)', () => {
    expect(normaliseOnetCategory('Education')).toBeNull();
    expect(normaliseOnetCategory('Other')).toBeNull();
    expect(normaliseOnetCategory('')).toBeNull();
    expect(normaliseOnetCategory(undefined)).toBeNull();
  });

  it('is case- and separator-insensitive (matches preprocessor variants)', () => {
    expect(normaliseOnetCategory('work-style')).toBe('work_style');
    expect(normaliseOnetCategory('WORK STYLE')).toBe('work_style');
    expect(normaliseOnetCategory('work_style')).toBe('work_style');
  });
});

const baseOnet = (overrides: Partial<UnifiedSkill>): UnifiedSkill => ({
  id: `onet-${overrides.code ?? '1.A.1.a.1'}`,
  source: 'onet',
  name: 'Oral Comprehension',
  altNames: [],
  description: '',
  category: 'Ability',
  code: '1.A.1.a.1',
  metadata: {},
  ...overrides,
});

describe('mapToOnetRef', () => {
  it('emits a 5-segment ability code that the backend regex accepts', () => {
    const ref = mapToOnetRef(baseOnet({ code: '1.A.1.a.1', category: 'Ability' }));
    expect(ref.code).toBe('1.A.1.a.1');
    expect(ref.elementType).toBe('ability');
    expect(BACKEND_ONET_CODE_RE.test(ref.code)).toBe(true);
    expect(BACKEND_ONET_ELEMENT_TYPE_RE.test(ref.elementType!)).toBe(true);
  });

  it('emits a 4-segment work-style code as work_style (no longer mislabelled as ability)', () => {
    const ref = mapToOnetRef(baseOnet({ code: '1.C.1.a', category: 'Work Style', name: 'Achievement/Effort' }));
    expect(ref.code).toBe('1.C.1.a');
    expect(ref.elementType).toBe('work_style');
    expect(BACKEND_ONET_CODE_RE.test(ref.code)).toBe(true);
  });

  it('emits knowledge for 2.C codes (Knowledge.json now maps to "Knowledge", not "Education")', () => {
    const ref = mapToOnetRef(baseOnet({ code: '2.C.1.a', category: 'Knowledge', name: 'Administration' }));
    expect(ref.elementType).toBe('knowledge');
    expect(BACKEND_ONET_CODE_RE.test(ref.code)).toBe(true);
  });

  it('omits elementType for unknown categories rather than defaulting to ability', () => {
    const ref = mapToOnetRef(baseOnet({ code: '9.Z.9.z', category: 'Unknown' }));
    expect(ref.elementType).toBeUndefined();
    // Code itself still satisfies the backend pattern shape.
    expect(BACKEND_ONET_CODE_RE.test(ref.code)).toBe(true);
  });

  it('throws on missing code (loud failure beats silent corruption)', () => {
    expect(() => mapToOnetRef(baseOnet({ code: undefined }))).toThrow(/missing code/);
  });
});

const baseEsco = (overrides: Partial<UnifiedSkill>): UnifiedSkill => ({
  id: `esco-${overrides.uri?.split('/').pop() ?? '0005c151-5b5a-4a66-8aac-60e734beb1ab'}`,
  source: 'esco',
  name: 'Communicate clearly',
  altNames: [],
  description: '',
  category: 'Cross-Sector Skill',
  subCategory: 'cross-sector',
  uri: 'http://data.europa.eu/esco/skill/0005c151-5b5a-4a66-8aac-60e734beb1ab',
  metadata: { conceptType: 'KnowledgeSkillCompetence' },
  ...overrides,
});

describe('deriveEscoSkillType', () => {
  it('returns "transversal" when subCategory carries the reuseLevel', () => {
    expect(deriveEscoSkillType(baseEsco({ subCategory: 'transversal', category: 'Transversal Competence' }))).toBe('transversal');
  });

  it('returns "knowledge" when preprocessor category is "Knowledge"', () => {
    expect(deriveEscoSkillType(baseEsco({ subCategory: 'sector-specific', category: 'Knowledge' }))).toBe('knowledge');
  });

  it('returns "skill" for the generic skill/competence rows', () => {
    expect(deriveEscoSkillType(baseEsco({ subCategory: 'cross-sector', category: 'Cross-Sector Skill' }))).toBe('skill');
    expect(deriveEscoSkillType(baseEsco({ subCategory: 'occupation-specific', category: 'Occupation-Specific Skill' }))).toBe('skill');
  });
});

describe('mapToEscoRef', () => {
  it('emits a URI that satisfies the backend ESCO pattern', () => {
    const ref = mapToEscoRef(baseEsco({}));
    expect(ref.uri).toBe('http://data.europa.eu/esco/skill/0005c151-5b5a-4a66-8aac-60e734beb1ab');
    expect(BACKEND_ESCO_URI_RE.test(ref.uri)).toBe(true);
    expect(BACKEND_ESCO_SKILL_TYPE_RE.test(ref.skillType!)).toBe(true);
  });

  it('produces transversal for a transversal reuseLevel (was previously always "skill")', () => {
    const ref = mapToEscoRef(baseEsco({ subCategory: 'transversal', category: 'Transversal Competence' }));
    expect(ref.skillType).toBe('transversal');
  });

  it('produces knowledge for ESCO knowledge entries', () => {
    const ref = mapToEscoRef(baseEsco({ category: 'Knowledge' }));
    expect(ref.skillType).toBe('knowledge');
  });

  it('throws on missing uri (loud failure beats silent corruption)', () => {
    expect(() => mapToEscoRef(baseEsco({ uri: undefined }))).toThrow(/missing uri/);
  });
});
