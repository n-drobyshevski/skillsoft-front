'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  FileText,
  BookOpen,
  BarChart3,
  Home,
  PlusCircle,
  Target,
  Lightbulb,
  FileQuestion,
  Network,
  Activity,
  UsersRound,
  Settings,
  ClipboardCheck,
} from 'lucide-react';
import { useActiveLens, useUserRole } from '@/hooks/useLens';
import { getSignedAuthHeaders } from '@/services/roleApi';
import type { LensType } from '@/store/lens-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchResult {
  id: string;
  name: string;
  description?: string;
}

interface NavigationEntry {
  id: string;
  labelKey: string;
  path: string;
  icon: React.ReactNode;
  lenses: LensType[];
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return `http://localhost:8080/api/${API_VERSION}`;
  }
  const protocol =
    apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
      ? 'http'
      : 'https';
  return `${protocol}://${apiUrl}/api/${API_VERSION}`;
}

// ---------------------------------------------------------------------------
// Search hook
// ---------------------------------------------------------------------------

interface SearchState {
  templateResults: SearchResult[];
  competencyResults: SearchResult[];
  isSearching: boolean;
}

/** Safely extract an array from a PromiseSettledResult */
function extractResults(result: PromiseSettledResult<SearchResult[]>): SearchResult[] {
  if (result.status !== 'fulfilled') return [];
  return Array.isArray(result.value) ? result.value : [];
}

/** Filter competencies client-side by query string */
function filterCompetencies(all: SearchResult[], query: string): SearchResult[] {
  const lowerQ = query.toLowerCase();
  return all.filter((c) => c.name.toLowerCase().includes(lowerQ)).slice(0, 5);
}

/** Resolve auth headers for client-side API calls */
async function resolveAuthHeaders(
  userId: string | null | undefined,
  userRole: string | null,
): Promise<Record<string, string>> {
  return userId && userRole
    ? getSignedAuthHeaders(userId, userRole)
    : {};
}

function usePaletteSearch(
  debouncedQuery: string,
  userId: string | null | undefined,
  userRole: string | null,
): SearchState {
  const [templateResults, setTemplateResults] = useState<SearchResult[]>([]);
  const [competencyResults, setCompetencyResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setTemplateResults([]);
      setCompetencyResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    async function performSearch() {
      try {
        const authHeaders = await resolveAuthHeaders(userId, userRole);
        const baseUrl = getApiBaseUrl();
        const fetchOpts = {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          mode: 'cors' as const,
          credentials: 'include' as const,
        };

        const [tplRes, compRes] = await Promise.allSettled([
          fetch(
            `${baseUrl}/tests/templates/search?name=${encodeURIComponent(debouncedQuery)}`,
            fetchOpts,
          ).then((r) => (r.ok ? (r.json() as Promise<SearchResult[]>) : [])),
          fetch(`${baseUrl}/competencies`, fetchOpts).then((r) =>
            r.ok ? (r.json() as Promise<SearchResult[]>) : [],
          ),
        ]);

        if (!mountedRef.current) return;

        setTemplateResults(extractResults(tplRes).slice(0, 5));
        setCompetencyResults(filterCompetencies(extractResults(compRes), debouncedQuery));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('[CommandPalette] Search failed:', err);
        }
      } finally {
        if (mountedRef.current) setIsSearching(false);
      }
    }

    void performSearch();
    return () => controller.abort();
  }, [debouncedQuery, userId, userRole]);

  return { templateResults, competencyResults, isSearching };
}

// ---------------------------------------------------------------------------
// Static navigation entries (filtered by lens at render time)
// ---------------------------------------------------------------------------

const NAVIGATION_ENTRIES: NavigationEntry[] = [
  {
    id: 'nav-dashboard',
    labelKey: 'dashboard',
    path: '/dashboard',
    icon: <Home className="mr-2 h-4 w-4" />,
    lenses: ['user', 'editor', 'admin'],
  },
  {
    id: 'nav-templates',
    labelKey: 'testTemplates',
    path: '/test-templates',
    icon: <FileText className="mr-2 h-4 w-4" />,
    lenses: ['user', 'editor', 'admin'],
  },
  {
    id: 'nav-my-tests',
    labelKey: 'myTests',
    path: '/my-tests',
    icon: <ClipboardCheck className="mr-2 h-4 w-4" />,
    lenses: ['user'],
  },
  {
    id: 'nav-competencies',
    labelKey: 'competencies',
    path: '/hr/competencies',
    icon: <Target className="mr-2 h-4 w-4" />,
    lenses: ['editor', 'admin'],
  },
  {
    id: 'nav-indicators',
    labelKey: 'indicators',
    path: '/hr/behavioral-indicators',
    icon: <Lightbulb className="mr-2 h-4 w-4" />,
    lenses: ['editor', 'admin'],
  },
  {
    id: 'nav-questions',
    labelKey: 'questions',
    path: '/hr/assessment-questions',
    icon: <FileQuestion className="mr-2 h-4 w-4" />,
    lenses: ['editor', 'admin'],
  },
  {
    id: 'nav-skill-mapper',
    labelKey: 'skillMapper',
    path: '/skill-mapper',
    icon: <Network className="mr-2 h-4 w-4" />,
    lenses: ['editor', 'admin'],
  },
  {
    id: 'nav-psychometrics',
    labelKey: 'commandPalette.psychometrics',
    path: '/psychometrics',
    icon: <Activity className="mr-2 h-4 w-4" />,
    lenses: ['admin'],
  },
  {
    id: 'nav-results',
    labelKey: 'results',
    path: '/test-results',
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
    lenses: ['user', 'editor', 'admin'],
  },
  {
    id: 'nav-users',
    labelKey: 'users',
    path: '/admin/users',
    icon: <UsersRound className="mr-2 h-4 w-4" />,
    lenses: ['admin'],
  },
  {
    id: 'nav-teams',
    labelKey: 'teams',
    path: '/admin/teams',
    icon: <UsersRound className="mr-2 h-4 w-4" />,
    lenses: ['admin'],
  },
  {
    id: 'nav-settings',
    labelKey: 'settings',
    path: '/settings',
    icon: <Settings className="mr-2 h-4 w-4" />,
    lenses: ['admin'],
  },
];

// ---------------------------------------------------------------------------
// Sub-components to reduce cognitive complexity of the main component
// ---------------------------------------------------------------------------

interface NavigationSectionProps {
  entries: NavigationEntry[];
  tNav: ReturnType<typeof useTranslations<'navigation'>>;
  onNavigate: (path: string) => void;
}

function NavigationSection({ entries, tNav, onNavigate }: NavigationSectionProps) {
  return (
    <CommandGroup heading={tNav('commandPalette.navigation')}>
      {entries.map((entry) => (
        <CommandItem
          key={entry.id}
          value={tNav(entry.labelKey)}
          onSelect={() => onNavigate(entry.path)}
        >
          {entry.icon}
          {tNav(entry.labelKey)}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

interface QuickActionsSectionProps {
  tNav: ReturnType<typeof useTranslations<'navigation'>>;
  onNavigate: (path: string) => void;
}

function QuickActionsSection({ tNav, onNavigate }: QuickActionsSectionProps) {
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading={tNav('quickActions')}>
        <CommandItem
          value={tNav('commandPalette.createNewTemplate')}
          onSelect={() => onNavigate('/test-templates/new')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {tNav('commandPalette.createNewTemplate')}
        </CommandItem>
      </CommandGroup>
    </>
  );
}

interface SearchResultsSectionProps {
  templateResults: SearchResult[];
  competencyResults: SearchResult[];
  tNav: ReturnType<typeof useTranslations<'navigation'>>;
  onNavigate: (path: string) => void;
}

function SearchResultsSection({
  templateResults,
  competencyResults,
  tNav,
  onNavigate,
}: SearchResultsSectionProps) {
  return (
    <>
      {templateResults.length > 0 && (
        <CommandGroup heading={tNav('commandPalette.templates')}>
          {templateResults.map((template) => (
            <CommandItem
              key={template.id}
              value={`template-${template.name}`}
              onSelect={() => onNavigate(`/test-templates/${template.id}`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="truncate">{template.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {competencyResults.length > 0 && (
        <CommandGroup heading={tNav('competencies')}>
          {competencyResults.map((competency) => (
            <CommandItem
              key={competency.id}
              value={`competency-${competency.name}`}
              onSelect={() => onNavigate(`/hr/competencies/${competency.id}`)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span className="truncate">{competency.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}

interface KeyboardHintFooterProps {
  tCommon: ReturnType<typeof useTranslations<'common'>>;
}

function KeyboardHintFooter({ tCommon }: KeyboardHintFooterProps) {
  return (
    <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
      <div className="flex items-center gap-2">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">Esc</span>
        </kbd>
        <span>{tCommon('close')}</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">Enter</span>
        </kbd>
        <span>{tCommon('confirm')}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const router = useRouter();
  const { userId } = useAuth();
  const activeLens = useActiveLens();
  const userRole = useUserRole();
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');

  const debouncedQuery = useDebounce(query, 300);
  const { templateResults, competencyResults, isSearching } = usePaletteSearch(
    debouncedQuery,
    userId,
    userRole,
  );

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle open change - clears query when closing
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery('');
    }
  };

  const navigate = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(path);
  };

  // Filter navigation entries by active lens
  const visibleNavEntries = NAVIGATION_ENTRIES.filter((entry) =>
    entry.lenses.includes(activeLens),
  );

  const hasSearchQuery = query.length > 0;
  const hasResults = templateResults.length > 0 || competencyResults.length > 0;
  const showQuickActions = activeLens === 'editor' || activeLens === 'admin';

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={tNav('commandPalette.title')}
      description={tNav('commandPalette.description')}
    >
      <CommandInput
        placeholder={tNav('commandPalette.placeholder')}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching
            ? tNav('commandPalette.searching')
            : tNav('commandPalette.noResults')}
        </CommandEmpty>

        {!hasSearchQuery && (
          <NavigationSection
            entries={visibleNavEntries}
            tNav={tNav}
            onNavigate={navigate}
          />
        )}

        {!hasSearchQuery && showQuickActions && (
          <QuickActionsSection tNav={tNav} onNavigate={navigate} />
        )}

        <SearchResultsSection
          templateResults={templateResults}
          competencyResults={competencyResults}
          tNav={tNav}
          onNavigate={navigate}
        />

        {hasSearchQuery && isSearching && !hasResults && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {tNav('commandPalette.searching')}
          </div>
        )}
      </CommandList>

      <KeyboardHintFooter tCommon={tCommon} />
    </CommandDialog>
  );
}
