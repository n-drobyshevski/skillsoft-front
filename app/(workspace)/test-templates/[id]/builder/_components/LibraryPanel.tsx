'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Search,
  GripVertical,
  Plus,
  Brain,
  Users,
  MessageSquare,
  TrendingUp,
  Heart,
  Lightbulb,
  Clock,
  Target,
  ChevronDown,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { LibraryCompetency, HealthStatus } from '../actions';
import type { ActiveDragData } from './BuilderDndProvider';
import { useBlueprintStore, useIndicatorInventory } from '@/store/blueprint-store';
import { IndicatorExpansion } from './IndicatorExpansion';
import { fetchIndicatorInventory } from '../actions';

// ============================================
// TYPES
// ============================================

interface LibraryPanelProps {
  /** Callback for mobile - when adding switches tabs back to canvas */
  onAdd?: (competency: LibraryCompetency) => void;
}

// ============================================
// HEALTH INDICATOR
// ============================================

const HEALTH_DOT_STYLES: Record<HealthStatus, string> = {
  CRITICAL: 'bg-red-500 animate-pulse',
  MODERATE: 'bg-amber-500',
  HEALTHY: 'bg-emerald-500',
};

function HealthIndicator({
  health,
  competencyId,
  questionsPerCompetency,
  targetDifficulty,
}: {
  health: HealthStatus;
  competencyId: string;
  questionsPerCompetency: number;
  targetDifficulty?: import('@/types/blueprint').Difficulty;
}) {
  const tHealth = useTranslations('builder.library.health');
  const tLib = useTranslations('builder.library');
  const inventory = useIndicatorInventory(competencyId);

  // Check indicator-level risk from cached inventory.
  // Two checks:
  //   1. Even-split: indicator has fewer total questions than its fair share
  //   2. Difficulty-gap: indicator has < 2 questions at the target difficulty,
  //      which will force the assembler to borrow from siblings
  let atRiskCount = 0;
  if (inventory) {
    const activeIndicators = inventory.indicators.filter((ind) => ind.isActive);
    if (activeIndicators.length > 0) {
      const expectedTotal = Math.ceil(questionsPerCompetency / activeIndicators.length);
      const diff = targetDifficulty ?? 'INTERMEDIATE';

      atRiskCount = activeIndicators.filter((ind) => {
        if (ind.totalQuestions < expectedTotal) return true;
        // Check difficulty-specific availability (assembler MIN_QUESTIONS_PER_GAP = 2)
        const atDifficulty = ind.questionsByDifficulty?.[diff] ?? 0;
        return atDifficulty < 2;
      }).length;
    }
  }

  const hasIndicatorWarning = atRiskCount > 0;

  // Override dot color to amber when indicators are at risk (but health is HEALTHY)
  const dotStyle = hasIndicatorWarning && health === 'HEALTHY'
    ? 'bg-amber-500'
    : HEALTH_DOT_STYLES[health];

  const healthLabel = {
    CRITICAL: tHealth('noQuestions'),
    MODERATE: tHealth('limitedQuestions'),
    HEALTHY: tHealth('goodInventory'),
  }[health];

  const tooltip = hasIndicatorWarning
    ? tLib('indicatorWarning', { count: atRiskCount })
    : healthLabel;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-block w-2 h-2 rounded-full shrink-0',
            dotStyle
          )}
          aria-label={tooltip}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

// ============================================
// CATEGORY ICON
// ============================================

function CategoryIcon({ category, isOnet }: { category: string; isOnet?: boolean }) {
  const t = useTranslations('builder.library');
  const iconMap: Record<string, React.ElementType> = {
    COGNITIVE: Brain,
    INTERPERSONAL: Users,
    COMMUNICATION: MessageSquare,
    LEADERSHIP: TrendingUp,
    EMOTIONAL_INTELLIGENCE: Heart,
    ADAPTABILITY: Lightbulb,
    TIME_MANAGEMENT: Clock,
    CRITICAL_THINKING: Target,
    COLLABORATION: Users,
  };

  const Icon = iconMap[category] ?? Brain;

  const icon = (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        isOnet ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-muted'
      )}
    >
      <Icon
        className={cn(
          'h-3.5 w-3.5',
          isOnet ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
        )}
      />
    </div>
  );

  if (!isOnet) return icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[220px]">
        {t('onetIconTooltip')}
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================
// COMPETENCY ITEM
// ============================================

interface CompetencyItemProps {
  competency: LibraryCompetency;
  isSelected: boolean;
  onAdd: () => void;
  /** Enable drag-and-drop (desktop only, disabled for mobile sheet) */
  enableDrag?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  questionsPerCompetency?: number;
  targetDifficulty?: import('@/types/blueprint').Difficulty;
  /** Whether this competency is part of the O*NET job profile */
  isOnet?: boolean;
}

/**
 * Draggable version of CompetencyItem - uses dnd-kit useDraggable hook.
 * Only rendered when inside a DndContext (desktop).
 */
function DraggableCompetencyItem({
  competency,
  isSelected,
  onAdd,
  isExpanded,
  onToggleExpand,
  questionsPerCompetency,
  targetDifficulty,
  isOnet,
}: Omit<CompetencyItemProps, 'enableDrag'>) {
  const tLib = useTranslations('builder.library');
  const isCritical = competency.health === 'CRITICAL';
  const isAddDisabled = isCritical || isSelected;

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: `library-${competency.id}`,
    disabled: isAddDisabled,
    data: {
      type: 'library-item',
      competency: competency,
      name: competency.name,
      category: competency.category,
    } satisfies ActiveDragData,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex flex-col rounded-lg border transition-all duration-150',
        isCritical
          ? 'opacity-50 cursor-not-allowed bg-muted/30'
          : 'cursor-pointer hover:bg-muted/50 hover:shadow-sm',
        isSelected && 'ring-1 ring-primary/40 bg-primary/5',
        isDragging && 'opacity-50 ring-2 ring-primary/40'
      )}
      onClick={() => !isCritical && onToggleExpand?.()}
      aria-label={isExpanded ? tLib('collapseCard', { name: competency.name }) : tLib('expandCard', { name: competency.name })}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 p-2.5">
        {/* Grip handle — only this area initiates drag */}
        <div
          className={cn('shrink-0 cursor-grab active:cursor-grabbing', isAddDisabled && 'opacity-0')}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/80 transition-opacity" />
        </div>
        <HealthIndicator
          health={competency.health}
          competencyId={competency.id}
          questionsPerCompetency={questionsPerCompetency ?? 5}
          targetDifficulty={targetDifficulty}
        />
        <CategoryIcon category={competency.category} isOnet={isOnet} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{competency.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {tLib(`categories.${competency.category.toLowerCase()}` as Parameters<typeof tLib>[0])}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-muted-foreground/50 transition-transform duration-200 shrink-0',
            isExpanded && 'rotate-180'
          )}
        />
        {!isAddDisabled && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'min-h-[44px] min-w-[44px] rounded-lg',
              'md:h-8 md:w-8 md:min-h-0 md:min-w-0',
              'md:opacity-60 md:group-hover:opacity-100',
              'active:scale-95 active:bg-primary/15',
              'hover:bg-primary/10 hover:text-primary',
              'transition-all duration-150'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={tLib('addToCanvas', { name: competency.name })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expansion panel */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent
          className={cn(
            'overflow-hidden',
            'data-[state=open]:animate-collapsible-down',
            'data-[state=closed]:animate-collapsible-up',
            'motion-reduce:transition-none'
          )}
        >
          <div className="border-t border-border/50 pt-2">
            <IndicatorExpansion
              competencyId={competency.id}
              questionsPerCompetency={questionsPerCompetency ?? 5}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Static (non-draggable) version of CompetencyItem.
 * Used on mobile where drag-drop is not supported.
 */
function StaticCompetencyItem({
  competency,
  isSelected,
  onAdd,
  isExpanded,
  onToggleExpand,
  questionsPerCompetency,
  targetDifficulty,
  isOnet,
}: Omit<CompetencyItemProps, 'enableDrag'>) {
  const tLib = useTranslations('builder.library');
  const isCritical = competency.health === 'CRITICAL';
  const isAddDisabled = isCritical || isSelected;

  return (
    <div
      className={cn(
        'group flex flex-col rounded-lg border transition-all duration-150',
        isCritical
          ? 'opacity-50 cursor-not-allowed bg-muted/30'
          : 'cursor-pointer hover:bg-muted/50 hover:shadow-sm',
        isSelected && 'ring-1 ring-primary/40 bg-primary/5'
      )}
      onClick={() => !isCritical && onToggleExpand?.()}
      aria-label={isExpanded ? tLib('collapseCard', { name: competency.name }) : tLib('expandCard', { name: competency.name })}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 p-2.5">
        <HealthIndicator
          health={competency.health}
          competencyId={competency.id}
          questionsPerCompetency={questionsPerCompetency ?? 5}
          targetDifficulty={targetDifficulty}
        />
        <CategoryIcon category={competency.category} isOnet={isOnet} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{competency.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {tLib(`categories.${competency.category.toLowerCase()}` as Parameters<typeof tLib>[0])}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-muted-foreground/50 transition-transform duration-200 shrink-0',
            isExpanded && 'rotate-180'
          )}
        />
        {!isAddDisabled && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'min-h-[44px] min-w-[44px] rounded-lg',
              'md:h-8 md:w-8 md:min-h-0 md:min-w-0',
              'md:opacity-60 md:group-hover:opacity-100',
              'active:scale-95 active:bg-primary/15',
              'hover:bg-primary/10 hover:text-primary',
              'transition-all duration-150'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            aria-label={tLib('addToCanvas', { name: competency.name })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expansion panel */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent
          className={cn(
            'overflow-hidden',
            'data-[state=open]:animate-collapsible-down',
            'data-[state=closed]:animate-collapsible-up',
            'motion-reduce:transition-none'
          )}
        >
          <div className="border-t border-border/50 pt-2">
            <IndicatorExpansion
              competencyId={competency.id}
              questionsPerCompetency={questionsPerCompetency ?? 5}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * CompetencyItem that renders either draggable or static version based on enableDrag prop.
 */
function CompetencyItem({
  competency,
  isSelected,
  onAdd,
  enableDrag = false,
  isExpanded,
  onToggleExpand,
  questionsPerCompetency,
  targetDifficulty,
  isOnet,
}: CompetencyItemProps) {
  if (enableDrag) {
    return (
      <DraggableCompetencyItem
        competency={competency}
        isSelected={isSelected}
        onAdd={onAdd}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        questionsPerCompetency={questionsPerCompetency}
        targetDifficulty={targetDifficulty}
        isOnet={isOnet}
      />
    );
  }

  return (
    <StaticCompetencyItem
      competency={competency}
      isSelected={isSelected}
      onAdd={onAdd}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      questionsPerCompetency={questionsPerCompetency}
      targetDifficulty={targetDifficulty}
      isOnet={isOnet}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

// ============================================
// VIRTUALIZED ROW TYPES
// ============================================

type VirtualRow =
  | { type: 'header'; category: string; count: number }
  | { type: 'item'; competency: LibraryCompetency; isExpanded: boolean };

const ROW_HEIGHT_HEADER = 36;
const ROW_HEIGHT_ITEM = 64;
const ROW_HEIGHT_EXPANDED_BASE = 64 + 36 + 36; // card + header + footer
const ROW_HEIGHT_PER_INDICATOR = 64; // three-line rows (title + bar/count/risk)

export function LibraryPanel({ onAdd }: LibraryPanelProps) {
  const t = useTranslations('builder.library');
  const { libraryCompetencies, state, addCompetency } = useBlueprintWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When onAdd is provided (mobile sheet), disable drag
  // When not provided (desktop panel), enable drag
  const enableDrag = !onAdd;

  const selectedIds = state.competencies.map((c) => c.id);

  // O*NET restriction: only show matching competencies in JOB_FIT mode
  const allowedIds = useBlueprintStore((s) => s.allowedCompetencyIds);

  // O*NET filter toggle — when true, restrict to O*NET matches only
  const [onetFilterActive, setOnetFilterActive] = useState(false);
  const allowedIdSet = useMemo(() => allowedIds ? new Set(allowedIds) : null, [allowedIds]);

  // Accordion expansion state — only one card expanded at a time
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const setIndicatorInventory = useBlueprintStore((s) => s.setIndicatorInventory);
  const indicatorInventories = useBlueprintStore((s) => s.indicatorInventories);

  const handleToggleExpand = useCallback(
    (competencyId: string) => {
      const newId = expandedId === competencyId ? null : competencyId;
      setExpandedId(newId);
      if (newId && !indicatorInventories[newId]) {
        fetchIndicatorInventory(newId).then((result) => {
          if (result.success) {
            setIndicatorInventory(newId, result.data);
          }
        });
      }
    },
    [expandedId, setIndicatorInventory, indicatorInventories]
  );

  // Apply O*NET restriction (JOB_FIT mode) when toggle is active, then filter by search
  const restrictedCompetencies = allowedIds && onetFilterActive
    ? libraryCompetencies.filter((c) => allowedIds.includes(c.id))
    : libraryCompetencies;

  const filteredCompetencies = restrictedCompetencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // U2: Flatten grouped categories into virtual rows
  const virtualRows = useMemo(() => {
    const grouped = filteredCompetencies.reduce(
      (acc, comp) => {
        const category = comp.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(comp);
        return acc;
      },
      {} as Record<string, LibraryCompetency[]>
    );

    const sortedCategories = Object.keys(grouped).sort();
    const rows: VirtualRow[] = [];

    for (const category of sortedCategories) {
      rows.push({ type: 'header', category, count: grouped[category].length });
      for (const comp of grouped[category]) {
        rows.push({ type: 'item', competency: comp, isExpanded: expandedId === comp.id });
      }
    }

    return rows;
  }, [filteredCompetencies, expandedId]);

  // Virtualizer for efficient rendering
  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => {
      const row = virtualRows[index];
      if (row.type === 'header') return ROW_HEIGHT_HEADER;
      if (row.isExpanded) {
        const inv = indicatorInventories[row.competency.id];
        const indicatorCount = inv?.indicators.length ?? 3;
        return ROW_HEIGHT_EXPANDED_BASE + indicatorCount * ROW_HEIGHT_PER_INDICATOR;
      }
      return ROW_HEIGHT_ITEM;
    },
    overscan: 8,
  });

  // Re-measure the virtualizer when expansion state or loaded inventories change
  React.useEffect(() => {
    virtualizer.measure();
  }, [expandedId, indicatorInventories, virtualizer]);

  // Handle add (click or mobile) - drag is now handled by useDraggable
  const handleAdd = useCallback(
    (competency: LibraryCompetency) => {
      if (onAdd) {
        onAdd(competency);
      } else {
        addCompetency(competency);
      }
    },
    [onAdd, addCompetency]
  );

  return (
    // suppressHydrationWarning: Browser extensions (e.g., ProtonPass) may inject
    // attributes that cause hydration mismatches. This is safe to suppress.
    <div className="flex flex-col h-full min-h-0 bg-muted/10" suppressHydrationWarning>
      {/* Search Header */}
      <div className="p-3 border-b bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-base sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
          <span>{t('available', { count: filteredCompetencies.length })}</span>
          <span className="text-primary font-medium">
            {t('selected', { count: selectedIds.length })}
          </span>
        </div>
      </div>

      {/* O*NET restriction info banner */}
      {allowedIds && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-blue-50/50 dark:bg-blue-950/20">
          <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <p className="flex-1 text-[11px] leading-snug text-blue-700 dark:text-blue-400">
            {onetFilterActive
              ? t('onetFilterActive', { count: allowedIds.length })
              : t('onetFilterInactive', { count: libraryCompetencies.length })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 shrink-0"
            onClick={() => setOnetFilterActive((prev) => !prev)}
          >
            {onetFilterActive ? t('onetShowAll') : t('onetShowMatched')}
          </Button>
        </div>
      )}

      {/* U2: Virtualized Competency List */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-auto">
        {virtualRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-3">
            <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">{t('noCompetenciesFound')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t('tryAdjustingSearch')}
            </p>
          </div>
        ) : (
          <div
            className="relative w-full px-3"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const row = virtualRows[virtualItem.index];

              if (row.type === 'header') {
                return (
                  <div
                    key={`header-${row.category}`}
                    className="absolute left-3 right-3 flex items-center gap-2 px-1 pt-3"
                    style={{
                      top: `${virtualItem.start}px`,
                      height: `${virtualItem.size}px`,
                    }}
                  >
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {t(`categories.${row.category.toLowerCase()}` as Parameters<typeof t>[0])}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      ({row.count})
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={`item-${row.competency.id}`}
                  className="absolute left-3 right-3"
                  style={{
                    top: `${virtualItem.start}px`,
                    height: `${virtualItem.size}px`,
                    paddingTop: 3,
                  }}
                >
                  <CompetencyItem
                    competency={row.competency}
                    isSelected={selectedIds.includes(row.competency.id)}
                    onAdd={() => handleAdd(row.competency)}
                    enableDrag={enableDrag}
                    isExpanded={row.isExpanded}
                    onToggleExpand={() => handleToggleExpand(row.competency.id)}
                    questionsPerCompetency={
                      state.competencies.find((c) => c.id === row.competency.id)?.questionCount ?? 5
                    }
                    targetDifficulty={
                      state.competencies.find((c) => c.id === row.competency.id)?.difficulty
                    }
                    isOnet={allowedIdSet?.has(row.competency.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
