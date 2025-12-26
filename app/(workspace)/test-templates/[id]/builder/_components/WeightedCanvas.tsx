"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2, Play, Redo2, Save, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { CompetencySmartCard } from "./CompetencySmartCard";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { BlueprintCompetency } from "../actions";
import { useBlueprintHistory, type HistoryActionType } from "@/hooks/useBlueprintHistory";

export function WeightedCanvas() {
  const {
    state,
    isPending,
    isSaving,
    saveBlueprint,
    setCompetencies,
    addCompetency,
    templateId,
    // Auto-save state
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    retryAttempt,
  } = useBlueprintWorkspace();

  // Zustand-based history with SessionStorage persistence
  const {
    trackChange,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo,
  } = useBlueprintHistory({ templateId });

  // Track if we're currently restoring from history (to avoid circular updates)
  const isRestoringRef = useRef(false);
  const lastTrackedRef = useRef<string>("");

  const [isDragOver, setIsDragOver] = useState(false);
  // ARIA live region for accessibility announcements
  const [ariaAnnouncement, setAriaAnnouncement] = useState("");
  const [draggedItemName, setDraggedItemName] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD-Kit hydration fix: defer rendering until client-side to avoid ID mismatch
  // DnD-Kit uses incrementing IDs that differ between SSR and client
  const [isDndReady, setIsDndReady] = useState(false);
  useEffect(() => {
    setIsDndReady(true);
  }, []);

  // Track competency changes in history store
  useEffect(() => {
    const snapshot = JSON.stringify(state.competencies);

    // Skip if restoring or no change
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      lastTrackedRef.current = snapshot;
      return;
    }

    if (snapshot === lastTrackedRef.current) {
      return;
    }

    // Track the change (action type will be inferred based on diff)
    const actionType: HistoryActionType = lastTrackedRef.current
      ? 'BATCH_UPDATE'
      : 'INITIAL';

    trackChange(state.competencies, actionType);
    lastTrackedRef.current = snapshot;
  }, [state.competencies, trackChange]);

  // Mobile-optimized sensors with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      // Delay prevents accidental drags during scroll
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleUndo = useCallback(() => {
    const previousState = historyUndo();
    if (previousState) {
      isRestoringRef.current = true;
      setCompetencies(previousState);
    }
  }, [historyUndo, setCompetencies]);

  const handleRedo = useCallback(() => {
    const nextState = historyRedo();
    if (nextState) {
      isRestoringRef.current = true;
      setCompetencies(nextState);
    }
  }, [historyRedo, setCompetencies]);

  const handleSave = useCallback(() => {
    void saveBlueprint();
  }, [saveBlueprint]);

  const handleTestDrive = useCallback(() => {
    window.open(`/test-templates/${templateId}/start?mode=test-drive`, '_blank');
  }, [templateId]);

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo), Ctrl+S (save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + Z = Undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl/Cmd + Shift + Z = Redo
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }

      // Ctrl/Cmd + Y = Redo (alternative)
      if (isMod && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Ctrl/Cmd + S = Save
      if (isMod && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave]);

  // Announce drag start for screen readers
  const handleDragStart = (event: DragStartEvent) => {
    const dragId = event.active.id as string;
    const activeItem = state.competencies.find((c) => c.id === dragId);
    if (activeItem) {
      setActiveId(dragId);
      setDraggedItemName(activeItem.name);
      const position = state.competencies.findIndex((c) => c.id === dragId) + 1;
      setAriaAnnouncement(
        `Picked up ${activeItem.name}. Current position: ${position} of ${state.competencies.length}. Use arrow keys to move, Space or Enter to drop.`
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const prevDraggedName = draggedItemName;
    setActiveId(null);
    setDraggedItemName(null);

    if (!over) {
      setAriaAnnouncement(`Dropped ${prevDraggedName || 'item'}. Position unchanged.`);
      return;
    }

    const dragActiveId = active.id as string;
    const overId = over.id as string;
    if (dragActiveId === overId) {
      const activeItem = state.competencies.find((c) => c.id === dragActiveId);
      setAriaAnnouncement(`Dropped ${activeItem?.name || 'item'}. Position unchanged.`);
      return;
    }

    const items = state.competencies;
    const oldIndex = items.findIndex((c) => c.id === dragActiveId);
    const newIndex = items.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const activeItem = items[oldIndex];
    const updated = [...items];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    setCompetencies(updated);

    // Announce the new position
    setAriaAnnouncement(
      `${activeItem.name} moved from position ${oldIndex + 1} to position ${newIndex + 1} of ${items.length}.`
    );
  };

  // Get the currently dragged competency for the overlay
  const activeCompetency = activeId ? state.competencies.find((c) => c.id === activeId) : null;

  // Handle external drop from library panel
  const handleExternalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data && data.id) {
          addCompetency(data);
        }
      } catch (error) {
        // Invalid drop data - ignore
        console.warn('Invalid drag data', error);
      }
    },
    [addCompetency]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set drag over to false if leaving the container itself
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-b bg-background/50 shrink-0 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium hidden sm:inline truncate">Structural Workbench</span>
          <Badge variant="secondary" className="text-[10px] ml-0 sm:ml-1 shrink-0 hidden xs:inline-flex">
            {state.competencies.length}
          </Badge>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-xs">
                Order sets priority. When time is tight, cards near the top are asked first.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
          {/* Auto-save status indicator */}
          <SaveStatusIndicator
            status={saveStatus}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
            retryAttempt={retryAttempt}
            compact={false}
            className="hidden sm:flex mr-2"
          />
          {/* Mobile: compact status */}
          <SaveStatusIndicator
            status={saveStatus}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
            retryAttempt={retryAttempt}
            compact
            className="sm:hidden mr-1"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 active:scale-95"
                onClick={handleUndo}
                disabled={!canUndo || isPending}
                aria-label="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Undo <kbd className="ml-1.5 px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+Z</kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 active:scale-95"
                onClick={handleRedo}
                disabled={!canRedo || isPending}
                aria-label="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Redo <kbd className="ml-1.5 px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+Shift+Z</kbd>
            </TooltipContent>
          </Tooltip>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 sm:h-10 md:h-8 gap-1 sm:gap-1.5 px-2 sm:px-3 active:scale-95"
            onClick={handleTestDrive}
            disabled={state.competencies.length === 0}
          >
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Test Drive</span>
          </Button>
          {/* Manual save button - only visible when there are unsaved changes */}
          {hasUnsavedChanges && (
            <Button
              size="sm"
              className="h-8 sm:h-10 md:h-8 gap-1 sm:gap-1.5 px-2 sm:px-3 active:scale-95"
              onClick={handleSave}
              disabled={isSaving || isPending}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              <span className="hidden sm:inline">Save Now</span>
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div
          className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 min-h-full max-w-full overflow-hidden"
          onDrop={handleExternalDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* ARIA Live Region for screen reader announcements */}
          <div
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
          >
            {ariaAnnouncement}
          </div>

          {/* DnD-Kit hydration fix: render static list during SSR, DnD after hydration */}
          {isDndReady ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={state.competencies.map((c) => c.id)}>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {state.competencies.length === 0 ? (
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed transition-colors",
                        isDragOver
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      <Sparkles className={cn("h-10 w-10 mb-3", isDragOver ? "text-primary" : "text-muted-foreground/40")} />
                      <p className="text-sm font-medium">
                        {isDragOver ? "Drop to add competency" : "Drag competencies here"}
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        {isDragOver ? "" : "Or click + to add from library"}
                      </p>
                    </div>
                  ) : (
                    state.competencies.map((comp) => (
                      <CompetencySmartCard
                        key={comp.id}
                        competency={comp}
                        laneId="DEFAULT"
                        isPending={isPending}
                        onRemove={() => {
                          const updated = state.competencies.filter((c) => c.id !== comp.id);
                          setCompetencies(updated);
                        }}
                        onWeightChange={(val) => setCompetencies(state.competencies.map((c) => c.id === comp.id ? { ...c, weight: val } : c))}
                      />
                    ))
                  )}
                </div>
              </SortableContext>

              {/* Custom drag overlay with styled preview */}
              <DragOverlay dropAnimation={null}>
                {activeCompetency ? (
                  <div className={cn(
                    "rounded-xl border border-primary/40 bg-card/95 backdrop-blur-sm",
                    "shadow-[0_16px_48px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)]",
                    "p-3 md:p-4 scale-[1.02] rotate-1",
                    "ring-2 ring-primary/20"
                  )}>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                        {activeCompetency.category.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        {activeCompetency.name}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {activeCompetency.questionCount} questions • Weight {activeCompetency.weight?.toFixed(1) ?? 1}x
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            /* Static list during SSR - no DnD to avoid hydration mismatch */
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {state.competencies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-medium">Drag competencies here</p>
                  <p className="text-xs mt-1 opacity-70">Or click + to add from library</p>
                </div>
              ) : (
                state.competencies.map((comp) => (
                  <CompetencySmartCard
                    key={comp.id}
                    competency={comp}
                    laneId="DEFAULT"
                    isPending={isPending}
                    disableSortable={true}
                    onRemove={() => {
                      const updated = state.competencies.filter((c) => c.id !== comp.id);
                      setCompetencies(updated);
                    }}
                    onWeightChange={(val) => setCompetencies(state.competencies.map((c) => c.id === comp.id ? { ...c, weight: val } : c))}
                  />
                ))
              )}
            </div>
          )}
          
          {/* Drop indicator when dragging over non-empty canvas */}
          {isDragOver && state.competencies.length > 0 && (
            <div className={cn(
              "p-4 rounded-xl border-2 border-dashed border-primary/60",
              "bg-primary/5 text-center text-sm text-primary font-medium",
              "animate-in fade-in duration-200"
            )}>
              Drop to add to bottom
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
