'use client';

/**
 * StandardsSearchCombobox — Triple-Standard picker
 *
 * Three-slot panel + ResponsiveModal search. Replaces the previous twin-popover
 * layout. Each slot (O*NET, Big Five, ESCO) renders flush inside the
 * CompetencyForm "Standard Mapping" section card (Document mode per DESIGN.md).
 * Big Five sits between O*NET and ESCO with a visible connector line when it
 * was auto-derived from the O*NET selection.
 *
 * Mapping helpers (`normaliseOnetCategory`, `mapToOnetRef`,
 * `deriveEscoSkillType`, `mapToEscoRef`) are exported for unit tests.
 */

import * as React from 'react';
import {
  ArrowRight,
  Brain,
  Briefcase,
  Check,
  Filter,
  Globe,
  Heart,
  Loader2,
  Search,
  Shield,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkerSearch } from '@/hooks/use-worker-search';
import type {
  BigFiveDimension,
  EscoRefDto,
  OnetRefDto,
  StandardCodesDto,
} from '@/types/domain';
import { BIG_FIVE_DIMENSIONS, BigFiveInfo } from '@/types/domain';
import type { UnifiedSkill } from '@/types/skills';
import { getBigFiveMapping, useBigFiveMapper } from '@/hooks/useBigFiveMapper';

// ============================================================================
// Public mapping helpers (exported for tests)
// ============================================================================

/**
 * Normalise the preprocessor's free-form category label ("Work Style", "Ability", …)
 * to the backend `OnetRefDto.elementType` enum. Returns null for unrecognised input
 * so callers can surface a validation error instead of silently defaulting.
 */
export function normaliseOnetCategory(c?: string): OnetRefDto['elementType'] | null {
  switch ((c ?? '').toLowerCase().replace(/[\s-]+/g, '_')) {
    case 'ability':       return 'ability';
    case 'skill':         return 'skill';
    case 'knowledge':     return 'knowledge';
    case 'work_style':    return 'work_style';
    case 'work_activity': return 'work_activity';
    case 'interest':      return 'interest';
    case 'work_value':    return 'work_value';
    case 'work_context':  return 'work_context';
    default:              return null;
  }
}

export function mapToOnetRef(skill: UnifiedSkill): OnetRefDto {
  if (!skill.code) {
    throw new Error(`O*NET skill missing code: ${skill.id}`);
  }
  const elementType = normaliseOnetCategory(skill.category);
  return {
    code: skill.code,
    title: skill.name,
    ...(elementType ? { elementType } : {}),
  };
}

/**
 * Derive ESCO `skillType` from the fields the preprocessor actually emits:
 * - `subCategory` carries raw `reuseLevel` ('transversal' | 'cross-sector' | …)
 * - `category` is the mapped human label ("Knowledge" | "Transversal Competence" | …)
 *
 * Source data has no `'language'` skillType, so that branch is intentionally absent.
 */
export function deriveEscoSkillType(skill: UnifiedSkill): EscoRefDto['skillType'] {
  if ((skill.subCategory ?? '').toLowerCase() === 'transversal') return 'transversal';
  if ((skill.category ?? '').toLowerCase() === 'knowledge') return 'knowledge';
  return 'skill';
}

export function mapToEscoRef(skill: UnifiedSkill): EscoRefDto {
  if (!skill.uri) {
    throw new Error(`ESCO skill missing uri: ${skill.id}`);
  }
  return {
    uri: skill.uri,
    title: skill.name,
    skillType: deriveEscoSkillType(skill),
  };
}

// ============================================================================
// Big Five visual mapping (mirrors DESIGN.md §"Big Five personality traits"
// and the canonical /profile PersonalitySection)
// ============================================================================

interface TraitVisual {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  iconText: string;
  bg: string;
  iconBg: string;
  border: string;
  chipHover: string;
}

const TRAIT_VISUALS: Record<BigFiveDimension, TraitVisual> = {
  OPENNESS: {
    icon: Brain,
    text: 'text-violet-700 dark:text-violet-300',
    iconText: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50/50 dark:bg-violet-950/30',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    border: 'border-violet-200 dark:border-violet-800',
    chipHover: 'hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:border-violet-300 dark:hover:border-violet-700',
  },
  CONSCIENTIOUSNESS: {
    icon: Target,
    text: 'text-blue-700 dark:text-blue-300',
    iconText: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50/50 dark:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
    chipHover: 'hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700',
  },
  EXTRAVERSION: {
    icon: Users,
    text: 'text-amber-700 dark:text-amber-300',
    iconText: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/50 dark:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    border: 'border-amber-200 dark:border-amber-800',
    chipHover: 'hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 dark:hover:border-amber-700',
  },
  AGREEABLENESS: {
    icon: Heart,
    text: 'text-emerald-700 dark:text-emerald-300',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    chipHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  EMOTIONAL_STABILITY: {
    icon: Shield,
    text: 'text-cyan-700 dark:text-cyan-300',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50/50 dark:bg-cyan-950/30',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    border: 'border-cyan-200 dark:border-cyan-800',
    chipHover: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-300 dark:hover:border-cyan-700',
  },
};

// ============================================================================
// Filter constants
// ============================================================================

// Filter values match backend OnetRefDto.elementType enum exactly so that
// `normaliseOnetCategory(skill.category) === filter` is the only check needed.
type OnetFilter = 'all' | OnetRefDto['elementType'];
type EscoFilter = 'all' | EscoRefDto['skillType'];

const ONET_FILTERS: ReadonlyArray<{ value: OnetFilter; key: string }> = [
  { value: 'all', key: 'all' },
  { value: 'ability', key: 'ability' },
  { value: 'skill', key: 'skill' },
  { value: 'knowledge', key: 'knowledge' },
  { value: 'work_style', key: 'work_style' },
  { value: 'work_activity', key: 'work_activity' },
  { value: 'interest', key: 'interest' },
];

const ESCO_FILTERS: ReadonlyArray<{ value: EscoFilter; key: string }> = [
  { value: 'all', key: 'all' },
  { value: 'skill', key: 'skill' },
  { value: 'knowledge', key: 'knowledge' },
  { value: 'transversal', key: 'transversal' },
];

// ============================================================================
// Loading skeleton (mirrors three-slot layout to keep CLS at zero)
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-20 shrink-0 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Search modal (Dialog on desktop, Sheet on mobile)
// ============================================================================

interface StandardsSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: 'onet' | 'esco';
  skills: UnifiedSkill[];
  selectedCode?: string;
  selectedUri?: string;
  onSelect: (skill: UnifiedSkill) => void;
  contextSeed?: string;
}

function StandardsSearchModal({
  open,
  onOpenChange,
  kind,
  skills,
  selectedCode,
  selectedUri,
  onSelect,
  contextSeed,
}: StandardsSearchModalProps) {
  const t = useTranslations('competency.standards');
  const isMobile = useIsMobile();
  const isOnet = kind === 'onet';

  const filters = isOnet ? ONET_FILTERS : ESCO_FILTERS;
  const [filter, setFilter] = React.useState<OnetFilter | EscoFilter>('all');

  // Skills filtered by source + category before passing to the worker
  const filteredSkills = React.useMemo(() => {
    const sourceFiltered = skills.filter((s) => s.source === kind);
    if (filter === 'all') return sourceFiltered;
    if (isOnet) {
      return sourceFiltered.filter((s) => normaliseOnetCategory(s.category) === filter);
    }
    return sourceFiltered.filter((s) => deriveEscoSkillType(s) === filter);
  }, [skills, kind, filter, isOnet]);

  const { state, actions } = useWorkerSearch(filteredSkills, {
    threshold: 0.4,
    limit: 20,
    useWorker: true,
  });
  const { recommend, clearRecommendations, setQuery } = actions;

  // ESCO modal seeds recommendations from the chosen O*NET title
  React.useEffect(() => {
    if (!open) return;
    if (contextSeed && state.isIndexReady) {
      recommend(contextSeed, kind);
    } else {
      clearRecommendations();
    }
  }, [open, contextSeed, state.isIndexReady, kind, recommend, clearRecommendations]);

  // Reset filter + query when the modal closes
  React.useEffect(() => {
    if (!open) {
      setFilter('all');
      setQuery('');
    }
  }, [open, setQuery]);

  const isSelected = (skill: UnifiedSkill): boolean => {
    if (isOnet) return !!selectedCode && skill.code === selectedCode;
    return !!selectedUri && skill.uri === selectedUri;
  };

  const handleSelect = (skill: UnifiedSkill) => {
    onSelect(skill);
    onOpenChange(false);
  };

  const dedupedResults = React.useMemo(() => {
    const seen = new Set<string>();
    return state.results.filter((r) => {
      const key = r.item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [state.results]);

  const dedupedRecommendations = React.useMemo(() => {
    const seen = new Set<string>();
    return state.recommendations.filter((r) => {
      const key = r.item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [state.recommendations]);

  const hasQuery = state.query.trim().length > 0;
  const showRecommendations = !hasQuery && dedupedRecommendations.length > 0;

  const headerIcon = isOnet ? Briefcase : Globe;
  const HeaderIcon = headerIcon;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={isOnet ? t('modal.onetTitle') : t('modal.escoTitle')}
      description={isOnet ? t('modal.onetDescription') : t('modal.escoDescription')}
      maxWidth="lg"
    >
      <Command shouldFilter={false} className="rounded-lg border border-border bg-transparent">
        {/* Search input row */}
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <CommandInput
            autoFocus={!isMobile}
            placeholder={
              state.isIndexing
                ? t('modal.buildingIndex')
                : isOnet
                ? t('modal.searchPlaceholderOnet')
                : t('modal.searchPlaceholderEsco')
            }
            value={state.query}
            onValueChange={setQuery}
            className="h-11 border-0 bg-transparent px-0 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
          />
          {state.isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" aria-hidden="true" />
          )}
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 px-2 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mx-1" aria-hidden="true" />
          {filters.map((f) => {
            const active = filter === f.value;
            return (
              <Button
                key={f.value}
                type="button"
                variant={active ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={cn(
                  'h-8 px-2.5 text-xs font-medium rounded-md touch-manipulation',
                  !active && 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-pressed={active}
              >
                {t(`categoryFilter.${f.key}`)}
              </Button>
            );
          })}
        </div>

        {/* Results list */}
        <CommandList className="max-h-[55dvh] sm:max-h-[420px] overflow-y-auto">
          {state.isIndexing ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary/60" aria-hidden="true" />
              <span className="text-sm">{t('modal.buildingIndex')}</span>
            </div>
          ) : hasQuery && dedupedResults.length === 0 ? (
            <CommandEmpty className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-3">
                <Search className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold mx-auto max-w-[280px]">
                {t('modal.emptyResults', { query: state.query })}
              </p>
            </CommandEmpty>
          ) : showRecommendations ? (
            <CommandGroup
              heading={
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {t('modal.recommendedHeader')}
                </span>
              }
              className="px-2 py-1.5"
            >
              {dedupedRecommendations.map((result) => (
                <SearchResultRow
                  key={result.item.id}
                  skill={result.item}
                  selected={isSelected(result.item)}
                  onSelect={() => handleSelect(result.item)}
                  isOnet={isOnet}
                  isRecommendation
                />
              ))}
            </CommandGroup>
          ) : hasQuery && dedupedResults.length > 0 ? (
            <CommandGroup
              heading={
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('modal.searchResults')}
                </span>
              }
              className="px-2 py-1.5"
            >
              {dedupedResults.slice(0, 20).map((result) => (
                <SearchResultRow
                  key={result.item.id}
                  skill={result.item}
                  selected={isSelected(result.item)}
                  onSelect={() => handleSelect(result.item)}
                  isOnet={isOnet}
                />
              ))}
            </CommandGroup>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-3">
                <HeaderIcon className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-foreground">{t('modal.startTyping')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('modal.available', { count: filteredSkills.length.toLocaleString() })}
              </p>
            </div>
          )}
        </CommandList>

        {/* Sticky footer with status */}
        {(state.results.length > 0 || showRecommendations) && (
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {showRecommendations
                ? `${dedupedRecommendations.length} ${t('modal.recommendedHeader').toLowerCase()}`
                : `${dedupedResults.length}`}
            </span>
            <div className="flex items-center gap-2">
              {state.searchTime > 0 && (
                <span className="tabular-nums">{state.searchTime.toFixed(0)}ms</span>
              )}
              {state.workerSupported && (
                <span className="text-green-600 dark:text-green-400 font-medium" aria-label="Web Worker">
                  ⚡
                </span>
              )}
            </div>
          </div>
        )}
      </Command>
    </ResponsiveModal>
  );
}

// ============================================================================
// Search result row
// ============================================================================

interface SearchResultRowProps {
  skill: UnifiedSkill;
  selected: boolean;
  onSelect: () => void;
  isOnet: boolean;
  isRecommendation?: boolean;
}

function SearchResultRow({
  skill,
  selected,
  onSelect,
  isOnet,
  isRecommendation,
}: SearchResultRowProps) {
  // For O*NET items that have a Big Five mapping, surface the trait hint inline
  const bigFiveHint = React.useMemo(() => {
    if (!isOnet || !skill.code) return null;
    const mapping = getBigFiveMapping(skill.code);
    if (!mapping.hasMapping || !mapping.bigFive) return null;
    return BigFiveInfo[mapping.bigFive]?.displayName;
  }, [isOnet, skill.code]);

  const subLabel = isOnet ? skill.code : skill.uri?.split('/').pop();

  return (
    <CommandItem
      value={skill.id}
      onSelect={onSelect}
      className={cn(
        'flex items-start gap-3 rounded-md cursor-pointer mb-0.5 px-2 py-2.5 sm:py-2',
        'min-h-[56px] sm:min-h-[44px]',
        'border border-transparent',
        selected
          ? 'bg-primary/5 border-primary/30'
          : 'hover:bg-muted/60'
      )}
      aria-selected={selected}
    >
      {/* Selection indicator (only renders when selected to save space) */}
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-sm shrink-0 mt-0.5 border',
          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
        )}
        aria-hidden="true"
      >
        {selected && <Check className="h-3 w-3" />}
      </div>

      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-medium leading-snug text-foreground truncate">
          {skill.name}
        </span>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {subLabel && (
            <span className="font-mono text-[11px] truncate max-w-[160px]">{subLabel}</span>
          )}
          {skill.category && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">
              {skill.category}
            </Badge>
          )}
          {bigFiveHint && (
            <span className="flex items-center gap-0.5 text-[10px] text-primary/80">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              {bigFiveHint}
            </span>
          )}
          {isRecommendation && (
            <Badge variant="outline" className="h-4 px-1 text-[10px] gap-0.5 border-primary/30 text-primary/80">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              Match
            </Badge>
          )}
        </div>
      </div>
    </CommandItem>
  );
}

// ============================================================================
// Slot components
// ============================================================================

interface SlotShellProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  iconBgClassName?: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
  filled?: boolean;
}

/** Common section frame for an O*NET / ESCO / Big Five slot. */
function SlotShell({
  icon: Icon,
  iconClassName,
  iconBgClassName,
  title,
  badge,
  children,
  ariaLabel,
  className,
  filled,
}: SlotShellProps) {
  return (
    <section
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn(
        'rounded-lg border border-border bg-card transition-colors',
        filled && 'border-border/80',
        className
      )}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            iconBgClassName ?? 'bg-muted'
          )}
          aria-hidden="true"
        >
          <Icon className={cn('h-4 w-4', iconClassName ?? 'text-muted-foreground')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            {badge}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

interface OnetSlotProps {
  value?: OnetRefDto;
  onBrowse: () => void;
  onClear: () => void;
  disabled?: boolean;
}

function OnetSlot({ value, onBrowse, onClear, disabled }: OnetSlotProps) {
  const t = useTranslations('competency.standards');
  const filled = !!value?.code;

  return (
    <SlotShell
      icon={Briefcase}
      iconBgClassName={filled ? 'bg-primary/10' : 'bg-muted'}
      iconClassName={filled ? 'text-primary' : 'text-muted-foreground'}
      title={t('onetSlot.title')}
      badge={
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">
          {t('onetSlot.primary')}
        </Badge>
      }
      ariaLabel={t('onetSlot.title')}
      filled={filled}
    >
      {filled ? (
        <div className="flex items-center justify-between gap-2 animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{value!.title}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
              {value!.code}
              {value!.elementType && (
                <span className="ml-2 font-sans not-italic">· {value!.elementType.replace(/_/g, ' ')}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBrowse}
              disabled={disabled}
              className="h-9 px-2 text-muted-foreground hover:text-foreground touch-manipulation"
              aria-label={t('onetSlot.browse')}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={disabled}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive touch-manipulation"
              aria-label={t('onetSlot.clear')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{t('onetSlot.emptyPrompt')}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBrowse}
            disabled={disabled}
            className="h-11 sm:h-9 px-3 gap-1.5 shrink-0 touch-manipulation active:scale-[0.98]"
          >
            <span className="hidden sm:inline">{t('onetSlot.browse')}</span>
            <ArrowRight className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <ArrowRight className="hidden sm:inline h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only sm:hidden">{t('onetSlot.browse')}</span>
          </Button>
        </div>
      )}
    </SlotShell>
  );
}

interface EscoSlotProps {
  value?: EscoRefDto;
  onBrowse: () => void;
  onClear: () => void;
  disabled?: boolean;
}

function EscoSlot({ value, onBrowse, onClear, disabled }: EscoSlotProps) {
  const t = useTranslations('competency.standards');
  const filled = !!value?.uri;
  const tail = value?.uri?.split('/').pop();

  return (
    <SlotShell
      icon={Globe}
      iconBgClassName={filled ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-muted'}
      iconClassName={filled ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}
      title={t('escoSlot.title')}
      badge={
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal text-muted-foreground">
          {t('escoSlot.optional')}
        </Badge>
      }
      ariaLabel={t('escoSlot.title')}
      filled={filled}
    >
      {filled ? (
        <div className="flex items-center justify-between gap-2 animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{value!.title}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
              {tail}
              {value!.skillType && (
                <span className="ml-2 font-sans">· {value!.skillType}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBrowse}
              disabled={disabled}
              className="h-9 px-2 text-muted-foreground hover:text-foreground touch-manipulation"
              aria-label={t('escoSlot.browse')}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={disabled}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive touch-manipulation"
              aria-label={t('escoSlot.clear')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{t('escoSlot.emptyPrompt')}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBrowse}
            disabled={disabled}
            className="h-11 sm:h-9 px-3 gap-1.5 shrink-0 touch-manipulation active:scale-[0.98]"
          >
            <span className="hidden sm:inline">{t('escoSlot.browse')}</span>
            <ArrowRight className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <ArrowRight className="hidden sm:inline h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only sm:hidden">{t('escoSlot.browse')}</span>
          </Button>
        </div>
      )}
    </SlotShell>
  );
}

interface BigFiveSlotProps {
  value?: { trait: BigFiveDimension; title?: string; facet?: string };
  onetCode: string | null;
  isAutoApplied: boolean;
  onPick: (trait: BigFiveDimension) => void;
  onClear: () => void;
  onResetToAuto: () => void;
  disabled?: boolean;
}

function BigFiveSlot({
  value,
  onetCode,
  isAutoApplied,
  onPick,
  onClear,
  onResetToAuto,
  disabled,
}: BigFiveSlotProps) {
  const t = useTranslations('competency.standards');
  const mapping = useBigFiveMapper(onetCode);
  const filled = !!value?.trait;
  const visual = value ? TRAIT_VISUALS[value.trait] : null;
  const TraitIcon = visual?.icon;

  // Manual override differs from the auto-suggested mapping → offer "Reset to auto"
  const canResetToAuto =
    !!mapping.bigFive && !!value?.trait && value.trait !== mapping.bigFive;

  // O*NET set, no mapping → tell the user manual selection is needed
  const noMappingHint = !!onetCode && !mapping.hasMapping && !filled;

  if (filled && visual && TraitIcon) {
    return (
      <SlotShell
        icon={TraitIcon}
        iconBgClassName={visual.iconBg}
        iconClassName={visual.iconText}
        title={t('bigFiveSlot.title')}
        badge={
          isAutoApplied ? (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[10px] gap-0.5 bg-primary/10 text-primary border-primary/20 animate-in fade-in-0 duration-300 motion-reduce:animate-none"
              aria-label={t('bigFiveSlot.autoLabel')}
            >
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              {t('bigFiveSlot.auto')}
            </Badge>
          ) : undefined
        }
        ariaLabel={t('bigFiveSlot.title')}
        filled
        className={cn(visual.bg, visual.border)}
      >
        <div className="flex items-center justify-between gap-2 animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none">
          <div className="min-w-0 flex-1">
            <p className={cn('text-sm font-medium truncate', visual.text)}>
              {BigFiveInfo[value!.trait].displayName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {value!.facet ? (
                <span>{value!.facet}</span>
              ) : (
                <span className="italic">{BigFiveInfo[value!.trait].description}</span>
              )}
              {isAutoApplied && mapping.confidence > 0 && (
                <span className="ml-2 font-mono tabular-nums">
                  · {t('bigFiveSlot.confidenceLabel', {
                    percent: Math.round(mapping.confidence * 100),
                  })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {canResetToAuto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetToAuto}
                disabled={disabled}
                className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
                aria-label={t('bigFiveSlot.resetToAutoLabel')}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {t('bigFiveSlot.resetToAuto')}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={disabled}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive touch-manipulation"
              aria-label={t('bigFiveSlot.overrideLabel')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </SlotShell>
    );
  }

  // Empty state — render trait chip strip
  return (
    <SlotShell
      icon={Sparkles}
      iconBgClassName="bg-muted"
      iconClassName="text-muted-foreground"
      title={t('bigFiveSlot.title')}
      ariaLabel={t('bigFiveSlot.title')}
    >
      <p className="text-sm text-muted-foreground mb-2.5">
        {noMappingHint ? t('bigFiveSlot.noMapping') : t('bigFiveSlot.emptyPrompt')}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {BIG_FIVE_DIMENSIONS.map((dim) => {
          const v = TRAIT_VISUALS[dim];
          const TraitIcon = v.icon;
          return (
            <button
              key={dim}
              type="button"
              onClick={() => onPick(dim)}
              disabled={disabled}
              aria-pressed={false}
              aria-label={BigFiveInfo[dim].displayName}
              className={cn(
                'flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-2 min-h-[44px]',
                'text-xs font-medium text-left touch-manipulation transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
                'active:scale-[0.98]',
                v.chipHover
              )}
            >
              <TraitIcon className={cn('h-4 w-4 shrink-0', v.iconText)} aria-hidden="true" />
              <span className="truncate">{BigFiveInfo[dim].displayName}</span>
            </button>
          );
        })}
      </div>
    </SlotShell>
  );
}

// ============================================================================
// Visual connector between O*NET and Big Five (only when auto-derived)
// ============================================================================

function AutoConnector() {
  return (
    <div
      className="flex justify-start pl-7 sm:pl-8 -my-1 animate-in fade-in-0 duration-300 motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        <div className="h-3 w-px bg-primary/30" />
        <Sparkles className="h-3 w-3 text-primary/60 my-px" />
        <div className="h-3 w-px bg-primary/30" />
      </div>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

interface StandardsSearchComboboxProps {
  value?: StandardCodesDto;
  onChange: (value: StandardCodesDto) => void;
  skills: UnifiedSkill[];
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function StandardsSearchCombobox({
  value,
  onChange,
  skills,
  isLoading = false,
  disabled = false,
  className,
}: StandardsSearchComboboxProps) {
  const onetCode = value?.onetRef?.code || null;
  const bigFiveMapping = useBigFiveMapper(onetCode);

  // Tracks whether the current bigFiveRef was auto-applied from an O*NET selection
  // (vs manually picked by the user). Only auto-applied refs are dropped when
  // O*NET is cleared — a user's manual choice must be preserved.
  const bigFiveAutoAppliedRef = React.useRef<boolean>(false);

  // Search modal state
  const [modalKind, setModalKind] = React.useState<'onet' | 'esco' | null>(null);
  const modalOpen = modalKind !== null;

  // Handlers ----------------------------------------------------------------

  const handleOnetSelect = (skill: UnifiedSkill) => {
    const newValue: StandardCodesDto = { ...value };
    const onetRef = mapToOnetRef(skill);
    newValue.onetRef = onetRef;

    const mapping = getBigFiveMapping(onetRef.code);
    if (mapping.hasMapping && mapping.bigFive) {
      newValue.bigFiveRef = {
        trait: mapping.bigFive,
        title: BigFiveInfo[mapping.bigFive]?.displayName,
        facet: mapping.facet || undefined,
      };
      bigFiveAutoAppliedRef.current = true;
    }
    onChange(newValue);
  };

  const handleEscoSelect = (skill: UnifiedSkill) => {
    const newValue: StandardCodesDto = { ...value };
    newValue.escoRef = mapToEscoRef(skill);
    onChange(newValue);
  };

  const handleClearOnet = () => {
    const newValue = { ...value };
    delete newValue.onetRef;
    // Only drop bigFiveRef if it was auto-applied; preserve manual selections.
    if (bigFiveAutoAppliedRef.current) {
      delete newValue.bigFiveRef;
    }
    bigFiveAutoAppliedRef.current = false;
    onChange(newValue);
  };

  const handleClearEsco = () => {
    const newValue = { ...value };
    delete newValue.escoRef;
    onChange(newValue);
  };

  const handleBigFivePick = (trait: BigFiveDimension) => {
    const newValue: StandardCodesDto = { ...(value || {}) };
    const matchesAutoMapping = bigFiveMapping.bigFive === trait;
    newValue.bigFiveRef = {
      trait,
      title: BigFiveInfo[trait]?.displayName,
      facet: matchesAutoMapping ? (bigFiveMapping.facet || undefined) : undefined,
    };
    bigFiveAutoAppliedRef.current = matchesAutoMapping;
    onChange(newValue);
  };

  const handleBigFiveClear = () => {
    const newValue: StandardCodesDto = { ...(value || {}) };
    delete newValue.bigFiveRef;
    bigFiveAutoAppliedRef.current = false;
    onChange(newValue);
  };

  const handleBigFiveResetToAuto = () => {
    if (!bigFiveMapping.bigFive) return;
    const newValue: StandardCodesDto = { ...(value || {}) };
    newValue.bigFiveRef = {
      trait: bigFiveMapping.bigFive,
      title: BigFiveInfo[bigFiveMapping.bigFive]?.displayName,
      facet: bigFiveMapping.facet || undefined,
    };
    bigFiveAutoAppliedRef.current = true;
    onChange(newValue);
  };

  // Loading / disabled ------------------------------------------------------

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const hasOnet = !!value?.onetRef;
  const showConnector = hasOnet && !!value?.bigFiveRef && bigFiveAutoAppliedRef.current;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
        <OnetSlot
          value={value?.onetRef}
          onBrowse={() => setModalKind('onet')}
          onClear={handleClearOnet}
          disabled={disabled}
        />
      </div>

      {showConnector && <AutoConnector />}

      <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-75 motion-reduce:animate-none">
        <BigFiveSlot
          value={value?.bigFiveRef as BigFiveSlotProps['value']}
          onetCode={onetCode}
          isAutoApplied={bigFiveAutoAppliedRef.current && !!value?.bigFiveRef}
          onPick={handleBigFivePick}
          onClear={handleBigFiveClear}
          onResetToAuto={handleBigFiveResetToAuto}
          disabled={disabled}
        />
      </div>

      <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-150 motion-reduce:animate-none">
        <EscoSlot
          value={value?.escoRef}
          onBrowse={() => setModalKind('esco')}
          onClear={handleClearEsco}
          disabled={disabled}
        />
      </div>

      <StandardsSearchModal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) setModalKind(null);
        }}
        kind={modalKind ?? 'onet'}
        skills={skills}
        selectedCode={value?.onetRef?.code}
        selectedUri={value?.escoRef?.uri}
        onSelect={modalKind === 'esco' ? handleEscoSelect : handleOnetSelect}
        contextSeed={modalKind === 'esco' ? value?.onetRef?.title : undefined}
      />
    </div>
  );
}

export default StandardsSearchCombobox;
