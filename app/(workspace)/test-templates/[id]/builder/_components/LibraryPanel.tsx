'use client';

import React, { useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { LibraryCompetency, HealthStatus } from '../actions';

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
  const config = {
    CRITICAL: {
      icon: AlertCircle,
      className:
        'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    },
    MODERATE: {
      icon: AlertTriangle,
      className:
        'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    HEALTHY: {
      icon: CheckCircle2,
      className:
        'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
  };

  const { icon: Icon, className } = config[health];

  return (
    <div
      className={cn(
        'flex items-center justify-center w-5 h-5 rounded-full border shrink-0',
        className
      )}
    >
      <Icon className="h-3 w-3" />
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
  onDragStart: (e: React.DragEvent) => void;
  onAdd: () => void;
}

function CompetencyItem({
  competency,
  isSelected,
  onDragStart,
  onAdd,
}: CompetencyItemProps) {
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
          : 'cursor-grab active:cursor-grabbing hover:bg-muted/50 hover:shadow-sm',
        isSelected && 'ring-1 ring-primary/40 bg-primary/5'
      )}
      draggable={!isDisabled}
      onDragStart={isDisabled ? undefined : onDragStart}
    >
      {/* Drag Handle */}
      <GripVertical
        className={cn(
          'h-4 w-4 text-muted-foreground/40 shrink-0 transition-opacity',
          isDisabled ? 'opacity-0' : 'group-hover:text-muted-foreground/80'
        )}
      />

      {/* Category Icon */}
      <CategoryIcon category={competency.category} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {competency.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {competency.category.replace(/_/g, ' ').toLowerCase()}
        </p>
      </div>

      {/* Health Status */}
      <HealthIndicator health={competency.health} />

      {/* Add Button (shows on hover, for accessibility) */}
      {!isDisabled && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-primary/10 hover:text-primary'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          aria-label={`Add ${competency.name} to canvas`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ============================================
// CATEGORY GROUP
// ============================================

interface CategoryGroupProps {
  category: string;
  competencies: LibraryCompetency[];
  selectedIds: string[];
  onDragStart: (e: React.DragEvent, competency: LibraryCompetency) => void;
  onAdd: (competency: LibraryCompetency) => void;
}

function CategoryGroup({
  category,
  competencies,
  selectedIds,
  onDragStart,
  onAdd,
}: CategoryGroupProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {category.replace(/_/g, ' ')}
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
            onDragStart={(e) => onDragStart(e, comp)}
            onAdd={() => onAdd(comp)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LibraryPanel({ onAdd }: LibraryPanelProps) {
  const { libraryCompetencies, state, addCompetency } = useBlueprintWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedIds = state.competencies.map((c) => c.id);

  // Filter competencies by search
  const filteredCompetencies = libraryCompetencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const groupedCompetencies = filteredCompetencies.reduce(
    (acc, comp) => {
      const category = comp.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(comp);
      return acc;
    },
    {} as Record<string, LibraryCompetency[]>
  );

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedCompetencies).sort();

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, competency: LibraryCompetency) => {
      e.dataTransfer.setData('application/json', JSON.stringify(competency));
      e.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  // Handle add (click or mobile)
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
            placeholder="Search competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-lg bg-muted/50 border-transparent focus-visible:border-border focus-visible:ring-1"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
          <span>{filteredCompetencies.length} available</span>
          <span className="text-primary font-medium">
            {selectedIds.length} selected
          </span>
        </div>
      </div>

      {/* Competency List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-4">
          {sortedCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No competencies found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try adjusting your search
              </p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <CategoryGroup
                key={category}
                category={category}
                competencies={groupedCompetencies[category]}
                selectedIds={selectedIds}
                onDragStart={handleDragStart}
                onAdd={handleAdd}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
