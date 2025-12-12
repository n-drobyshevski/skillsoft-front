"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
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
import { BlueprintCompetency } from "../actions";

export function WeightedCanvas() {
  const {
    state,
    isPending,
    isSaving,
    saveBlueprint,
    setCompetencies,
    addCompetency,
    templateId,
  } = useBlueprintWorkspace();

  const historyRef = useRef<BlueprintCompetency[][]>([]);
  const futureRef = useRef<BlueprintCompetency[][]>([]);
  const restoringRef = useRef(false);
  const lastSnapshotRef = useRef<string>("");
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const snapshot = JSON.stringify(state.competencies);
    const clone = state.competencies.map((c) => ({ ...c }));

    if (!lastSnapshotRef.current) {
      historyRef.current = [clone];
      lastSnapshotRef.current = snapshot;
      setHistoryState({ canUndo: false, canRedo: false });
      return;
    }

    if (snapshot === lastSnapshotRef.current) return;

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
    setHistoryState({ canUndo: historyRef.current.length > 1, canRedo: false });
  }, [state.competencies]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleUndo = useCallback(() => {
    if (historyRef.current.length < 2) return;
    const current = historyRef.current.pop();
    if (current) futureRef.current.push(current.map((c) => ({ ...c })));
    const previous = historyRef.current[historyRef.current.length - 1];
    if (!previous) return;
    restoringRef.current = true;
    setCompetencies(previous.map((c) => ({ ...c })));
    setHistoryState({ canUndo: historyRef.current.length > 1, canRedo: futureRef.current.length > 0 });
  }, [setCompetencies]);

  const handleRedo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    const clone = next.map((c) => ({ ...c }));
    historyRef.current.push(clone);
    restoringRef.current = true;
    setCompetencies(clone);
    setHistoryState({ canUndo: historyRef.current.length > 1, canRedo: futureRef.current.length > 0 });
  }, [setCompetencies]);

  const handleSave = useCallback(() => {
    void saveBlueprint();
  }, [saveBlueprint]);

  const handleTestDrive = useCallback(() => {
    window.open(`/test-templates/${templateId}/start?mode=test-drive`, '_blank');
  }, [templateId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const items = state.competencies;
    const oldIndex = items.findIndex((c) => c.id === activeId);
    const newIndex = items.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = [...items];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    setCompetencies(updated);
  };

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
      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium hidden sm:inline">Structural Workbench</span>
          <Badge variant="secondary" className="text-[10px] ml-0 sm:ml-1">
            {state.competencies.length} competencies
          </Badge>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-xs">
                Order sets priority. When time is tight, cards near the top are asked first.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8" onClick={handleUndo} disabled={!historyState.canUndo || isPending}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8" onClick={handleRedo} disabled={!historyState.canRedo || isPending}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 md:h-8 gap-1.5"
            onClick={handleTestDrive}
            disabled={state.competencies.length === 0}
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Test Drive</span>
          </Button>
          <Button size="sm" className="h-9 md:h-8 gap-1.5" onClick={handleSave} disabled={isSaving || isPending}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div 
          className="p-3 md:p-4 space-y-3 md:space-y-4 min-h-full"
          onDrop={handleExternalDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={state.competencies.map((c) => c.id)}>
              <div className="space-y-3 md:space-y-4">
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
          </DndContext>
          
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
