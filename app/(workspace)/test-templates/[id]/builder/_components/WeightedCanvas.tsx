"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2, PanelLeftClose, PanelLeftOpen, Play, Redo2, Save, Scale, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { useBuilderDnd } from "./BuilderDndProvider";
import { CompetencySmartCard } from "./CompetencySmartCard";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { InsertionIndicator } from "./InsertionIndicator";
import { useBlueprintHistory, type HistoryActionType } from "@/hooks/useBlueprintHistory";
import { useTranslations } from "next-intl";
import { STRATEGY_HELP_CONTENT, type Strategy } from "./simulator/strategy-context";

interface WeightedCanvasProps {
  onToggleLibrary?: () => void;
  isLibraryCollapsed?: boolean;
}

export const WeightedCanvas = React.memo(function WeightedCanvas({
  onToggleLibrary,
  isLibraryCollapsed,
}: WeightedCanvasProps = {}) {
  const t = useTranslations('builder.canvas');
  const tSim = useTranslations('builder.simulator');
  const {
    state,
    isPending,
    isSaving,
    saveBlueprint,
    setCompetencies,
    removeCompetency,
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

  // U3: Track focused card index for keyboard navigation
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);

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
      setAriaAnnouncement(t('undoneAnnouncement', { count: previousState.length }));
    }
  }, [historyUndo, setCompetencies]);

  const handleRedo = useCallback(() => {
    const nextState = historyRedo();
    if (nextState) {
      isRestoringRef.current = true;
      setCompetencies(nextState);
      setAriaAnnouncement(t('redoneAnnouncement', { count: nextState.length }));
    }
  }, [historyRedo, setCompetencies]);

  const handleSave = useCallback(() => {
    void saveBlueprint();
  }, [saveBlueprint]);

  const handleTestDrive = useCallback(() => {
    window.open(`/test-templates/${templateId}/start?mode=test-drive`, '_blank');
  }, [templateId]);

  // U4: Balance weights - normalize all weights so average is 1.0x
  const handleBalanceWeights = useCallback(() => {
    if (state.competencies.length === 0) return;
    const totalWeight = state.competencies.reduce((sum, c) => sum + (c.weight ?? 1), 0);
    const targetTotal = state.competencies.length; // average of 1.0x
    const factor = targetTotal / totalWeight;
    const balanced = state.competencies.map((c) => ({
      ...c,
      weight: Math.round((c.weight ?? 1) * factor * 10) / 10,
    }));
    setCompetencies(balanced);
    setAriaAnnouncement(t('weightsBalancedAnnouncement'));
  }, [state.competencies, setCompetencies]);

  // U3: Move card up/down via keyboard (Alt+Arrow)
  const handleMoveCard = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= state.competencies.length) return;
    const reordered = [...state.competencies];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    setCompetencies(reordered);
    setFocusedCardIndex(newIndex);
    setAriaAnnouncement(t('movedAnnouncement', { name: moved.name, direction, position: newIndex + 1 }));
  }, [state.competencies, setCompetencies]);

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

      // U3: Alt+ArrowUp / Alt+ArrowDown = Move focused card
      if (e.altKey && !isMod && focusedCardIndex !== null) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleMoveCard(focusedCardIndex, 'up');
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleMoveCard(focusedCardIndex, 'down');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, focusedCardIndex, handleMoveCard]);

  return (
    <div className="@container flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-b bg-background/50 shrink-0 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          {onToggleLibrary && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 active:scale-95"
                  onClick={onToggleLibrary}
                  aria-label={isLibraryCollapsed ? "Show library" : "Hide library"}
                >
                  {isLibraryCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isLibraryCollapsed ? "Show library" : "Hide library"}
              </TooltipContent>
            </Tooltip>
          )}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-xs">
                {t('priorityTooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
          {/* Save status - hide text when panel is narrow, icon-only via tooltip */}
          <div className="hidden @[560px]:block mr-2">
            <SaveStatusIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              retryAttempt={retryAttempt}
              compact={false}
            />
          </div>
          <div className="block @[560px]:hidden mr-1">
            <SaveStatusIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              retryAttempt={retryAttempt}
              compact
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 active:scale-95"
                onClick={handleUndo}
                disabled={!canUndo || isPending}
                aria-label={t('undoLabel')}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {t('undoTooltip')} <kbd className="ml-1.5 px-1.5 py-0.5 bg-background/20 rounded text-[10px] font-mono">{t('undoKey')}</kbd>
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
                aria-label={t('redoLabel')}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {t('redoTooltip')} <kbd className="ml-1.5 px-1.5 py-0.5 bg-background/20 rounded text-[10px] font-mono">{t('redoKey')}</kbd>
            </TooltipContent>
          </Tooltip>
          {/* U4: Balance Weights button */}
          {state.competencies.length >= 2 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 active:scale-95"
                  onClick={handleBalanceWeights}
                  disabled={isPending}
                  aria-label={t('balanceWeightsLabel')}
                >
                  <Scale className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t('balanceWeightsTooltip')}
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 sm:h-10 md:h-8 gap-1 sm:gap-1.5 px-2 sm:px-3 active:scale-95"
                onClick={handleTestDrive}
                disabled={state.competencies.length === 0}
              >
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden @[480px]:inline">{t('testDrive')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs @[480px]:hidden">
              {t('testDrive')}
            </TooltipContent>
          </Tooltip>
          {/* Manual save button - only visible when there are unsaved changes */}
          {hasUnsavedChanges && (
            <Button
              size="sm"
              className="h-8 sm:h-10 md:h-8 gap-1 sm:gap-1.5 px-2 sm:px-3 active:scale-95"
              onClick={handleSave}
              disabled={isSaving || isPending}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              <span className="hidden sm:inline">{t('saveNow')}</span>
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
                      {showEmptyDropState ? t('dropToAdd') : t('dragHint')}
                    </p>
                    <p className="text-xs mt-1 opacity-70">
                      {showEmptyDropState ? "" : t('dragHintAlt')}
                    </p>
                    {!showEmptyDropState && STRATEGY_HELP_CONTENT[state.strategy as Strategy] && (
                      <div className="mt-4 text-left w-full max-w-xs space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground/80">
                          {tSim(STRATEGY_HELP_CONTENT[state.strategy as Strategy].titleKey as Parameters<typeof tSim>[0])}
                        </p>
                        {STRATEGY_HELP_CONTENT[state.strategy as Strategy].pointKeys.slice(0, 2).map((key, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground/60 flex items-start gap-1.5">
                            <span className="mt-0.5 shrink-0">&#8226;</span>
                            <span>{tSim(key as Parameters<typeof tSim>[0])}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  state.competencies.map((comp, index) => (
                    <React.Fragment key={comp.id}>
                      {/* Insertion indicator BEFORE this card */}
                      {insertionTarget?.index === index &&
                        insertionTarget?.position === "before" && (
                          <InsertionIndicator />
                        )}

                      {/* U3: Wrapper div for keyboard focus tracking */}
                      <div
                        onFocus={() => setFocusedCardIndex(index)}
                        onBlur={(e) => {
                          // Only clear if focus leaves this card entirely
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setFocusedCardIndex(null);
                          }
                        }}
                      >
                      <CompetencySmartCard
                        competency={comp}
                        laneId="DEFAULT"
                        isPending={isPending}
                        onRemove={() => {
                          removeCompetency(comp.id);
                          setAriaAnnouncement(t('removedAnnouncement', { name: comp.name, count: state.competencies.length - 1 }));
                        }}
                        onWeightChange={(val) => setCompetencies(state.competencies.map((c) => c.id === comp.id ? { ...c, weight: val } : c))}
                      />

                      {/* Insertion indicator AFTER this card */}
                      {insertionTarget?.index === index &&
                        insertionTarget?.position === "after" && (
                          <InsertionIndicator />
                        )}
                      </div>
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
                  <p className="text-sm font-medium">{t('dragHint')}</p>
                  <p className="text-xs mt-1 opacity-70">{t('dragHintAlt')}</p>
                  {STRATEGY_HELP_CONTENT[state.strategy as Strategy] && (
                    <div className="mt-4 text-left w-full max-w-xs space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground/80">
                        {tSim(STRATEGY_HELP_CONTENT[state.strategy as Strategy].titleKey as Parameters<typeof tSim>[0])}
                      </p>
                      {STRATEGY_HELP_CONTENT[state.strategy as Strategy].pointKeys.slice(0, 2).map((key, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground/60 flex items-start gap-1.5">
                          <span className="mt-0.5 shrink-0">&#8226;</span>
                          <span>{tSim(key as Parameters<typeof tSim>[0])}</span>
                        </p>
                      ))}
                    </div>
                  )}
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
});
