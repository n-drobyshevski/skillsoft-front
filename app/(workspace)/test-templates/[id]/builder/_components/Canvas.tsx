'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GripVertical,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { BlueprintCompetency, LibraryCompetency } from '../actions';

// ============================================
// SORTABLE COMPETENCY CARD
// ============================================

interface SortableCompetencyCardProps {
  competency: BlueprintCompetency;
  onRemove: () => void;
  onUpdateWeight: (weight: number) => void;
  isPending: boolean;
}

function SortableCompetencyCard({
  competency,
  onRemove,
  onUpdateWeight,
  isPending,
}: SortableCompetencyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: competency.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-xl border bg-card transition-all duration-200',
        'hover:shadow-md hover:border-border',
        isDragging && 'opacity-50 shadow-lg scale-[1.02] z-50',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'cursor-grab active:cursor-grabbing p-1 rounded-md',
            'hover:bg-muted transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground/50" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{competency.name}</h4>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {competency.category.replace(/_/g, ' ').slice(0, 12)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            <span>{competency.questionCount} questions</span>
            <span>•</span>
            <span>Weight: {competency.weight.toFixed(1)}x</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            aria-label={`Remove ${competency.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t bg-muted/30">
          <div className="pt-3 space-y-3">
            {/* Weight Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Weight
                </label>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {competency.weight.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[competency.weight]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={([value]) => onUpdateWeight(value)}
                className="w-full"
              />
            </div>

            {/* Difficulty indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Difficulty</span>
              <Badge variant="outline" className="text-[10px]">
                {competency.difficulty || 'INTERMEDIATE'}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DRAG OVERLAY CARD
// ============================================

function DragOverlayCard({ competency }: { competency: BlueprintCompetency }) {
  return (
    <div className="rounded-xl border bg-card shadow-xl p-3 opacity-90">
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{competency.name}</h4>
          <p className="text-[11px] text-muted-foreground">
            {competency.category.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState() {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8',
        'border-2 border-dashed border-muted-foreground/20 rounded-2xl',
        'bg-linear-to-b from-muted/20 to-transparent'
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
        <Layers className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground/80 mb-2">
        Start building your blueprint
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Drag competencies here from the library or click{' '}
        <span className="inline-flex items-center gap-1 text-primary">
          <Plus className="h-3 w-3" /> Add
        </span>{' '}
        to browse.
      </p>
    </div>
  );
}

// ============================================
// CANVAS LOADING SKELETON
// ============================================

function CanvasLoadingSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ============================================
// MAIN CANVAS COMPONENT
// ============================================

export function Canvas() {
  const {
    state,
    isPending,
    removeCompetency,
    reorderCompetencies,
    updateCompetency,
    addCompetency,
    libraryCompetencies,
  } = useBlueprintWorkspace();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Prevent SSR hydration mismatch - DndContext generates unique IDs
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);  const activeCompetency = activeId
    ? state.competencies.find((c) => c.id === activeId)
    : null;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start (internal reorder)
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end (internal reorder)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);

      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = state.competencies.findIndex((c) => c.id === active.id);
        const newIndex = state.competencies.findIndex((c) => c.id === over.id);
        reorderCompetencies(oldIndex, newIndex);
      }
    },
    [state.competencies, reorderCompetencies]
  );

  // Handle external drop (from library)
  const handleExternalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      try {
        const data = JSON.parse(
          e.dataTransfer.getData('application/json')
        ) as LibraryCompetency;
        addCompetency(data);
      } catch {
        // Invalid drop data
      }
    },
    [addCompetency]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Canvas Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Competency Stack</span>
          <Badge variant="secondary" className="text-[10px] ml-1">
            {state.competencies.length} items
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>
            ~{Math.ceil(state.competencies.reduce((s, c) => s + c.questionCount * 1.5, 0))} min
          </span>
        </div>
      </div>

      {/* Drop Zone - Scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        <div
          className={cn(
            'p-4 min-h-full transition-all duration-200',
            isDragOver && 'bg-primary/5'
          )}
          onDrop={handleExternalDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {state.competencies.length === 0 ? (
            <EmptyState />
          ) : !isMounted ? (
            // Show skeleton until client-side hydration completes
            <CanvasLoadingSkeleton />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={state.competencies.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {state.competencies.map((comp) => (
                    <SortableCompetencyCard
                      key={comp.id}
                      competency={comp}
                      onRemove={() => removeCompetency(comp.id)}
                      onUpdateWeight={(weight) =>
                        updateCompetency(comp.id, { weight })
                      }
                      isPending={isPending}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeCompetency && (
                  <DragOverlayCard competency={activeCompetency} />
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Drop Indicator for external drops */}
          {isDragOver && state.competencies.length > 0 && (
            <div
              className={cn(
                'mt-2 p-4 rounded-xl border-2 border-dashed border-primary/40',
                'bg-primary/5 text-center text-sm text-primary/80'
              )}
            >
              Drop here to add
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
