'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
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
  Undo2,
  Redo2,
  Save,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
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
  t: ReturnType<typeof useTranslations<'template.builder'>>;
}

function SortableCompetencyCard({
  competency,
  onRemove,
  onUpdateWeight,
  isPending,
  t,
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
          aria-label={t('dragToReorder')}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground/50" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold truncate">{competency.name}</h4>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {competency.category.replace(/_/g, ' ').slice(0, 12)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            <span>{t('questions', { count: competency.questionCount })}</span>
            <span>•</span>
            <span>{t('weightValue', { value: competency.weight.toFixed(1) })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? t('collapse') : t('expand')}
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
            className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
            aria-label={t('removeCompetency', { name: competency.name })}
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
                  {t('weight')}
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
              <span className="text-muted-foreground">{t('difficulty')}</span>
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
          <h4 className="text-lg font-semibold">{competency.name}</h4>
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

interface EmptyStateProps {
  t: ReturnType<typeof useTranslations<'template.builder'>>;
}

function EmptyState({ t }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 space-y-4',
        'border-2 border-dashed border-muted-foreground/20 rounded-2xl',
        'bg-linear-to-b from-muted/20 to-transparent'
      )}
    >
      <svg
        width="200"
        height="140"
        viewBox="0 0 200 140"
        aria-hidden="true"
        className="text-primary/60"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect x="10" y="20" width="180" height="100" rx="12" fill="url(#bgGrad)" />
        <rect x="26" y="36" width="60" height="16" rx="4" fill="currentColor" opacity="0.25" />
        <rect x="26" y="58" width="120" height="12" rx="4" fill="currentColor" opacity="0.18" />
        <rect x="26" y="78" width="88" height="12" rx="4" fill="currentColor" opacity="0.18" />
        <circle cx="150" cy="60" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M145 60 L155 60 M150 55 L150 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="98" r="6" fill="currentColor" opacity="0.3" />
        <circle cx="80" cy="102" r="4" fill="currentColor" opacity="0.2" />
      </svg>
      <h3 className="text-lg font-semibold text-foreground/80">
        {t('emptyStateTitle')}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {t('emptyStateDescription')}
      </p>
      <div className="inline-flex items-center gap-2 text-primary text-sm">
        <Plus className="h-4 w-4" /> {t('addCompetenciesFromLibrary')}
      </div>
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
  const t = useTranslations('template.builder');
  const {
    state,
    isPending,
    isSaving,
    removeCompetency,
    reorderCompetencies,
    updateCompetency,
    addCompetency,
    saveBlueprint,
    setCompetencies,
  } = useBlueprintWorkspace();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const historyRef = useRef<BlueprintCompetency[][]>([]);
  const futureRef = useRef<BlueprintCompetency[][]>([]);
  const restoringRef = useRef(false);
  const lastSnapshotRef = useRef<string>('');
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  
  // Prevent SSR hydration mismatch - DndContext generates unique IDs
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const snapshot = JSON.stringify(state.competencies);
    const clone = state.competencies.map((c) => ({ ...c }));

    if (!lastSnapshotRef.current) {
      historyRef.current = [clone];
      lastSnapshotRef.current = snapshot;
      setHistoryState({ canUndo: false, canRedo: false });
      return;
    }

    if (snapshot === lastSnapshotRef.current) {
      return;
    }

    if (restoringRef.current) {
      lastSnapshotRef.current = snapshot;
      restoringRef.current = false;
      setHistoryState({
        canUndo: historyRef.current.length > 1,
        canRedo: futureRef.current.length > 0,
      });
      return;
    }

    historyRef.current = [...historyRef.current.slice(-9), clone];
    futureRef.current = [];
    lastSnapshotRef.current = snapshot;
    setHistoryState({
      canUndo: historyRef.current.length > 1,
      canRedo: false,
    });
  }, [state.competencies]);

  const activeCompetency = activeId
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
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUndo = () => {
    if (historyRef.current.length < 2) return;

    const current = historyRef.current.pop();
    if (current) {
      futureRef.current.push(current.map((c) => ({ ...c })));
    }

    const previous = historyRef.current[historyRef.current.length - 1];
    if (!previous) return;

    restoringRef.current = true;
    setCompetencies(previous.map((c) => ({ ...c })));
    setHistoryState({
      canUndo: historyRef.current.length > 1,
      canRedo: futureRef.current.length > 0,
    });
  };

  const handleRedo = () => {
    const next = futureRef.current.pop();
    if (!next) return;

    const clone = next.map((c) => ({ ...c }));
    historyRef.current.push(clone);
    restoringRef.current = true;
    setCompetencies(clone);
    setHistoryState({
      canUndo: historyRef.current.length > 1,
      canRedo: futureRef.current.length > 0,
    });
  };

  const handleSave = () => {
    void saveBlueprint();
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Canvas Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t('competencyStack')}</span>
          <Badge variant="secondary" className="text-[10px] ml-1">
            {t('items', { count: state.competencies.length })}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-muted-foreground mr-2">
            <span>
              {t('minutesEstimate', { minutes: Math.ceil(state.competencies.reduce((s, c) => s + c.questionCount * 1.5, 0)) })}
            </span>
            <span>{t('pass', { score: state.passingScore })}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={handleUndo}
            disabled={!historyState.canUndo || isPending}
            aria-label={t('undo')}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={handleRedo}
            disabled={!historyState.canRedo || isPending}
            aria-label={t('redo')}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-lg gap-1.5"
            onClick={handleSave}
            disabled={isSaving || isPending}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('save')}
          </Button>
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
            <EmptyState t={t} />
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
                <div className="space-y-6">
                  {state.competencies.map((comp) => (
                    <SortableCompetencyCard
                      key={comp.id}
                      competency={comp}
                      onRemove={() => removeCompetency(comp.id)}
                      onUpdateWeight={(weight) =>
                        updateCompetency(comp.id, { weight })
                      }
                      isPending={isPending}
                      t={t}
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
              {t('dropHereToAdd')}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
