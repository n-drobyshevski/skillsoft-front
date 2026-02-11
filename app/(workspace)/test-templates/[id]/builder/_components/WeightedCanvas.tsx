"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2, Play, Redo2, Save, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { useBuilderDnd } from "./BuilderDndProvider";
import { CompetencySmartCard } from "./CompetencySmartCard";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { InsertionIndicator } from "./InsertionIndicator";
import { useBlueprintHistory, type HistoryActionType } from "@/hooks/useBlueprintHistory";

export function WeightedCanvas() {
  const {
    state,
    isPending,
    isSaving,
    saveBlueprint,
    setCompetencies,
    templateId,
    // Auto-save state
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    retryAttempt,
  } = useBlueprintWorkspace();

  // Get drag state from shared DnD context
  const { insertionTarget, isDragging, activeDragData } = useBuilderDnd();

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

  // ARIA live region for accessibility announcements
  const [ariaAnnouncement, setAriaAnnouncement] = useState("");

  // DnD-Kit hydration fix: defer rendering until client-side to avoid ID mismatch
  // DnD-Kit uses incrementing IDs that differ between SSR and client
  const [isDndReady, setIsDndReady] = useState(false);
  useEffect(() => {
    setIsDndReady(true);
  }, []);

  // Use droppable for the canvas container to enable external drops
  const { setNodeRef: setDroppableRef, isOver: isCanvasOver } = useDroppable({
    id: 'canvas-droppable',
  });

  // Determine if we should show the drag-over state for empty canvas
  const showEmptyDropState = isDragging && activeDragData?.type === 'library-item' && state.competencies.length === 0;

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
          ref={setDroppableRef}
          className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 min-h-full max-w-full overflow-hidden"
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
            <SortableContext items={state.competencies.map((c) => c.id)}>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {state.competencies.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed transition-colors",
                      showEmptyDropState
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    <Sparkles className={cn("h-10 w-10 mb-3", showEmptyDropState ? "text-primary" : "text-muted-foreground/40")} />
                    <p className="text-sm font-medium">
                      {showEmptyDropState ? "Drop to add competency" : "Drag competencies here"}
                    </p>
                    <p className="text-xs mt-1 opacity-70">
                      {showEmptyDropState ? "" : "Or click + to add from library"}
                    </p>
                  </div>
                ) : (
                  state.competencies.map((comp, index) => (
                    <React.Fragment key={comp.id}>
                      {/* Insertion indicator BEFORE this card */}
                      {insertionTarget?.index === index &&
                        insertionTarget?.position === "before" && (
                          <InsertionIndicator />
                        )}

                      <CompetencySmartCard
                        competency={comp}
                        laneId="DEFAULT"
                        isPending={isPending}
                        onRemove={() => {
                          const updated = state.competencies.filter((c) => c.id !== comp.id);
                          setCompetencies(updated);
                        }}
                        onWeightChange={(val) => setCompetencies(state.competencies.map((c) => c.id === comp.id ? { ...c, weight: val } : c))}
                      />

                      {/* Insertion indicator AFTER this card */}
                      {insertionTarget?.index === index &&
                        insertionTarget?.position === "after" && (
                          <InsertionIndicator />
                        )}
                    </React.Fragment>
                  ))
                )}
              </div>
            </SortableContext>
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
        </div>
      </ScrollArea>
    </div>
  );
}
