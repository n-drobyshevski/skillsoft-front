/**
 * Smoke tests for the StandardsSearchCombobox three-slot panel + modal redesign.
 *
 * We mock useWorkerSearch so the test runs deterministically without a Web
 * Worker. getBigFiveMapping reads from a static JSON bundle and is left real,
 * which means the auto-derive assertion uses a code (1.C.1.a) known to map to
 * CONSCIENTIOUSNESS.
 */
import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-providers';
import { StandardsSearchCombobox } from '@/components/common/standards-search-combobox';
import type { SkillSearchResult, UnifiedSkill } from '@/types/skills';
import type { StandardCodesDto } from '@/types/domain';

// --- Mocks ------------------------------------------------------------------

interface WorkerStateLike {
  query: string;
  deferredQuery: string;
  results: SkillSearchResult[];
  recommendations: SkillSearchResult[];
  isSearching: boolean;
  isIndexing: boolean;
  isIndexReady: boolean;
  totalIndexed: number;
  searchTime: number;
  indexBuildTime: number;
  workerSupported: boolean;
}

const workerState: WorkerStateLike = {
  query: '',
  deferredQuery: '',
  results: [],
  recommendations: [],
  isSearching: false,
  isIndexing: false,
  isIndexReady: true,
  totalIndexed: 0,
  searchTime: 0,
  indexBuildTime: 0,
  workerSupported: false,
};
const workerActions = {
  setQuery: vi.fn(),
  clearQuery: vi.fn(),
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
  rebuildIndex: vi.fn(),
  recommend: vi.fn(),
  clearRecommendations: vi.fn(),
};

vi.mock('@/hooks/use-worker-search', () => ({
  useWorkerSearch: (skills: UnifiedSkill[]) => ({
    state: { ...workerState, totalIndexed: skills.length },
    actions: workerActions,
  }),
}));

// --- Fixtures ---------------------------------------------------------------

const fixtureSkills: UnifiedSkill[] = [
  {
    id: 'onet-1.C.1.a',
    source: 'onet',
    name: 'Achievement/Effort',
    altNames: [],
    description: 'Work Style: Achievement/Effort',
    category: 'Work Style',
    code: '1.C.1.a',
    metadata: {},
  },
  {
    id: 'onet-1.A.1.a.1',
    source: 'onet',
    name: 'Oral Comprehension',
    altNames: [],
    description: 'Ability: Oral Comprehension',
    category: 'Ability',
    code: '1.A.1.a.1',
    metadata: {},
  },
  {
    id: 'esco-uuid-a',
    source: 'esco',
    name: 'Communicate clearly',
    altNames: [],
    description: 'Cross-sector ESCO skill',
    category: 'Cross-Sector Skill',
    subCategory: 'cross-sector',
    uri: 'http://data.europa.eu/esco/skill/0005c151-5b5a-4a66-8aac-60e734beb1ab',
    metadata: { conceptType: 'KnowledgeSkillCompetence' },
  },
];

// Helper to seed worker results before opening the modal
function seedWorkerResults(skills: UnifiedSkill[]) {
  workerState.query = skills.length ? 'seeded' : '';
  workerState.results = skills.map((item, i) => ({ item, score: 0, refIndex: i }));
}

function resetWorkerState() {
  workerState.query = '';
  workerState.results = [];
  workerState.recommendations = [];
  Object.values(workerActions).forEach((fn) => fn.mockClear?.());
}

// --- Tests ------------------------------------------------------------------

describe('StandardsSearchCombobox (three-slot redesign)', () => {
  beforeEach(() => {
    resetWorkerState();
    // The global setup mocks ResizeObserver once in beforeAll, but vitest's
    // `mockReset: true` wipes the implementation between tests. cmdk uses
    // `new ResizeObserver(...)` and Element.scrollIntoView inside Command,
    // neither of which jsdom provides — stub both before each test.
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    } else {
      vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    }
  });

  it('renders three slots: O*NET, Big Five, ESCO', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StandardsSearchCombobox skills={fixtureSkills} onChange={onChange} />
    );

    // Slot titles come from the new i18n keys
    expect(screen.getByText('Occupational anchor')).toBeInTheDocument();
    expect(screen.getByText('Personality profile')).toBeInTheDocument();
    expect(screen.getByText('European skill')).toBeInTheDocument();
  });

  it('clicking Browse on the empty O*NET slot opens the search modal', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StandardsSearchCombobox skills={fixtureSkills} onChange={onChange} />
    );

    // Two "Browse" CTAs (one per O*NET / ESCO empty slot). Find them by role.
    const browseButtons = screen.getAllByRole('button', { name: /Browse/i });
    expect(browseButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(browseButtons[0]);

    // The modal title appears
    expect(screen.getByText('Choose O*NET classification')).toBeInTheDocument();
  });

  it('selecting an O*NET result with a Big Five mapping auto-derives the trait', () => {
    const onChange = vi.fn();
    // Provide pre-seeded worker results so the CommandItem renders without typing
    seedWorkerResults([fixtureSkills[0]]);

    renderWithProviders(
      <StandardsSearchCombobox skills={fixtureSkills} onChange={onChange} />
    );

    // Open the O*NET modal
    fireEvent.click(screen.getAllByRole('button', { name: /Browse/i })[0]);

    // Click the seeded result row
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Achievement/Effort'));

    // onChange should have been called with onetRef + bigFiveRef (auto-derived)
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0] as StandardCodesDto;
    expect(updated.onetRef?.code).toBe('1.C.1.a');
    expect(updated.onetRef?.elementType).toBe('work_style');
    // 1.C.1.a maps to CONSCIENTIOUSNESS in the bundled JSON
    expect(updated.bigFiveRef?.trait).toBe('CONSCIENTIOUSNESS');
  });

  it('renders filled state with title + code when value is pre-populated', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StandardsSearchCombobox
        skills={fixtureSkills}
        onChange={onChange}
        value={{
          onetRef: {
            code: '1.A.1.a.1',
            title: 'Oral Comprehension',
            elementType: 'ability',
          },
        }}
      />
    );

    // Title + code visible
    expect(screen.getByText('Oral Comprehension')).toBeInTheDocument();
    // The code text node contains the dotted ID
    expect(screen.getByText(/1\.A\.1\.a\.1/)).toBeInTheDocument();
  });
});
