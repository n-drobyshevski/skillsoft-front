'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  GripVertical,
  Plus,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Users,
  MessageSquare,
  TrendingUp,
  Heart,
  Lightbulb,
  Clock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { LibraryCompetency, HealthStatus } from '../actions';
import type { ActiveDragData } from './BuilderDndProvider';

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

function HealthIndicator({ health }: { health: HealthStatus }) {
  const t = useTranslations('builder.library.health');
  const config = {
    CRITICAL: {
      icon: AlertCircle,
      label: t('noQuestions'),
      className:
        'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    },
    MODERATE: {
      icon: AlertTriangle,
      label: t('limitedQuestions'),
      // Fixed: Changed text-amber-600 to text-amber-700 for WCAG AA contrast (5.2:1)
      className:
        'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    HEALTHY: {
      icon: CheckCircle2,
      label: t('goodInventory'),
      className:
        'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
  };

  const { icon: Icon, className, label } = config[health];

  return (
    <div
      className={cn(
        'flex items-center justify-center w-6 h-6 rounded-full border shrink-0',
        className
      )}
      title={label}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

// ============================================
// CATEGORY ICON
// ============================================

function CategoryIcon({ category }: { category: string }) {
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

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
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
}

/**
 * Draggable version of CompetencyItem - uses dnd-kit useDraggable hook.
 * Only rendered when inside a DndContext (desktop).
 */
function DraggableCompetencyItem({
  competency,
  isSelected,
  onAdd,
}: Omit<CompetencyItemProps, 'enableDrag'>) {
  const tLib = useTranslations('builder.library');
  const isCritical = competency.health === 'CRITICAL';
  const isDisabled = isCritical || isSelected;

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: `library-${competency.id}`,
    disabled: isDisabled,
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
        'group flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-150',
        'border-l-[3px]',
        competency.health === 'CRITICAL' && 'border-l-red-500 dark:border-l-red-400',
        competency.health === 'MODERATE' && 'border-l-amber-500 dark:border-l-amber-400',
        competency.health === 'HEALTHY' && 'border-l-emerald-500 dark:border-l-emerald-400',
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-muted/30'
          : 'cursor-grab active:cursor-grabbing hover:bg-muted/50 hover:shadow-sm',
        isSelected && 'ring-1 ring-primary/40 bg-primary/5',
        isDragging && 'opacity-50 ring-2 ring-primary/40'
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical
        className={cn(
          'h-4 w-4 text-muted-foreground/40 shrink-0 transition-opacity',
          isDisabled ? 'opacity-0' : 'group-hover:text-muted-foreground/80'
        )}
      />
      <CategoryIcon category={competency.category} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{competency.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {tLib(`categories.${competency.category.toLowerCase()}` as Parameters<typeof tLib>[0])}
        </p>
      </div>
      <HealthIndicator health={competency.health} />
      {!isDisabled && (
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
}: Omit<CompetencyItemProps, 'enableDrag'>) {
  const tLib = useTranslations('builder.library');
  const isCritical = competency.health === 'CRITICAL';
  const isDisabled = isCritical || isSelected;

  return (
    <div
      className={cn(
        'group flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-150',
        'border-l-[3px]',
        competency.health === 'CRITICAL' && 'border-l-red-500 dark:border-l-red-400',
        competency.health === 'MODERATE' && 'border-l-amber-500 dark:border-l-amber-400',
        competency.health === 'HEALTHY' && 'border-l-emerald-500 dark:border-l-emerald-400',
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-muted/30'
          : 'hover:bg-muted/50 hover:shadow-sm',
        isSelected && 'ring-1 ring-primary/40 bg-primary/5'
      )}
    >
      <CategoryIcon category={competency.category} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{competency.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {tLib(`categories.${competency.category.toLowerCase()}` as Parameters<typeof tLib>[0])}
        </p>
      </div>
      <HealthIndicator health={competency.health} />
      {!isDisabled && (
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
}: CompetencyItemProps) {
  if (enableDrag) {
    return (
      <DraggableCompetencyItem
        competency={competency}
        isSelected={isSelected}
        onAdd={onAdd}
      />
    );
  }

  return (
    <StaticCompetencyItem
      competency={competency}
      isSelected={isSelected}
      onAdd={onAdd}
    />
  );
}

// ============================================
// CATEGORY GROUP
// ============================================

interface CategoryGroupProps {
  category: string;
  competencies: LibraryCompetency[];
  selectedIds: string[];
  onAdd: (competency: LibraryCompetency) => void;
  /** Enable drag-and-drop (desktop only) */
  enableDrag?: boolean;
}

function CategoryGroup({
  category,
  competencies,
  selectedIds,
  onAdd,
  enableDrag = false,
}: CategoryGroupProps) {
  const t = useTranslations('builder.library');
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {t(`categories.${category.toLowerCase()}` as Parameters<typeof t>[0])}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          ({competencies.length})
        </span>
      </div>

      <div className="space-y-1.5">
        {competencies.map((comp) => (
          <CompetencyItem
            key={comp.id}
            competency={comp}
            isSelected={selectedIds.includes(comp.id)}
            onAdd={() => onAdd(comp)}
            enableDrag={enableDrag}
          />
        ))}
      </div>
    </div>
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
  | { type: 'item'; competency: LibraryCompetency };

const ROW_HEIGHT_HEADER = 36;
const ROW_HEIGHT_ITEM = 64;

export function LibraryPanel({ onAdd }: LibraryPanelProps) {
  const t = useTranslations('builder.library');
  const { libraryCompetencies, state, addCompetency } = useBlueprintWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When onAdd is provided (mobile sheet), disable drag
  // When not provided (desktop panel), enable drag
  const enableDrag = !onAdd;

  const selectedIds = state.competencies.map((c) => c.id);

  // Filter competencies by search
  const filteredCompetencies = libraryCompetencies.filter(
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
        rows.push({ type: 'item', competency: comp });
      }
    }

    return rows;
  }, [filteredCompetencies]);

  // Virtualizer for efficient rendering
  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) =>
      virtualRows[index].type === 'header' ? ROW_HEIGHT_HEADER : ROW_HEIGHT_ITEM,
    overscan: 8,
  });

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
