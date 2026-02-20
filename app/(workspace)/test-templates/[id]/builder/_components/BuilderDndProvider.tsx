"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
  closestCenter,
  CollisionDetection,
  pointerWithin,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { LibraryCompetency } from "../actions";
import { getImportanceLevelKey, importanceLevelColors } from "./utils/importanceLabel";

// ============================================
// TYPES
// ============================================

export interface InsertionTarget {
  /** Index in the competencies array where insertion should happen */
  index: number;
  /** Whether to insert before or after this index */
  position: "before" | "after";
}

export interface ActiveDragData {
  type: "library-item" | "canvas-item";
  competency?: LibraryCompetency;
  name: string;
  category: string;
}

interface BuilderDndContextValue {
  /** Current insertion target during drag */
  insertionTarget: InsertionTarget | null;
  /** Data about the currently dragged item */
  activeDragData: ActiveDragData | null;
  /** Whether a drag is in progress */
  isDragging: boolean;
  /** ID of the currently dragged item */
  activeId: UniqueIdentifier | null;
}

// ============================================
// CONTEXT
// ============================================

const BuilderDndContext = createContext<BuilderDndContextValue | null>(null);

/**
 * Hook to access drag-and-drop state from BuilderDndProvider.
 * Returns safe fallback values when used outside provider (e.g., mobile layout).
 */
export function useBuilderDnd(): BuilderDndContextValue {
  const ctx = useContext(BuilderDndContext);

  // Return safe fallback values for mobile layout (no drag-drop)
  if (!ctx) {
    return {
      insertionTarget: null,
      activeDragData: null,
      isDragging: false,
      activeId: null,
    };
  }

  return ctx;
}

// ============================================
// CUSTOM COLLISION DETECTION
// ============================================

/**
 * Custom collision detection that uses different strategies based on drag source:
 * - Library items: Use pointerWithin + rectIntersection for precise positioning
 * - Canvas items: Use closestCenter for smooth reordering
 */
function createCustomCollision(): CollisionDetection {
  return (args) => {
    const activeData = args.active.data.current as ActiveDragData | undefined;

    if (activeData?.type === "library-item") {
      // For external items, combine pointerWithin and rectIntersection
      // pointerWithin is more precise for insertion
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        return pointerCollisions;
      }
      return rectIntersection(args);
    }

    // For internal canvas items, use closestCenter (existing behavior)
    return closestCenter(args);
  };
}

// ============================================
// PROVIDER
// ============================================

interface BuilderDndProviderProps {
  children: ReactNode;
}

export function BuilderDndProvider({ children }: BuilderDndProviderProps) {
  const { state, setCompetencies, insertCompetencyAtIndex } = useBlueprintWorkspace();

  // Drag state
  const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);
  const [insertionTarget, setInsertionTarget] = useState<InsertionTarget | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Sensors with mobile-optimized touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize collision detection
  const collisionDetection = useMemo(() => createCustomCollision(), []);

  // ----------------------------------------
  // Event Handlers
  // ----------------------------------------

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as ActiveDragData | undefined;

    // Haptic feedback on drag start (mobile)
    navigator.vibrate?.(50);

    setActiveId(active.id);
    setActiveDragData(data || null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      const activeData = active.data.current as ActiveDragData | undefined;

      // Only calculate insertion for library items dragging over canvas
      if (!over || activeData?.type !== "library-item") {
        setInsertionTarget(null);
        return;
      }

      const overId = over.id as string;

      // Check if over the canvas droppable zone (not a specific card)
      if (overId === "canvas-droppable") {
        // Append to end
        setInsertionTarget({
          index: state.competencies.length - 1,
          position: "after",
        });
        return;
      }

      const overIndex = state.competencies.findIndex((c) => c.id === overId);

      if (overIndex === -1) {
        // Over something else - append to end
        setInsertionTarget({
          index: Math.max(0, state.competencies.length - 1),
          position: "after",
        });
        return;
      }

      // Get the rect of the over element to determine if pointer is above/below midpoint
      const overRect = over.rect;
      if (!overRect) {
        setInsertionTarget({ index: overIndex, position: "after" });
        return;
      }

      // Calculate midpoint of the card
      const midpoint = overRect.top + overRect.height / 2;

      // Get pointer position from the drag event
      // Use the collision rect's center as approximation
      const collisionRect = active.rect.current.translated;
      const pointerY = collisionRect
        ? collisionRect.top + collisionRect.height / 2
        : midpoint;

      // Determine position based on pointer relative to midpoint
      const position: "before" | "after" = pointerY < midpoint ? "before" : "after";

      setInsertionTarget({ index: overIndex, position });
    },
    [state.competencies]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeData = active.data.current as ActiveDragData | undefined;

      // Capture insertion target before resetting
      const currentInsertionTarget = insertionTarget;

      // Reset state
      setActiveId(null);
      setActiveDragData(null);
      setInsertionTarget(null);

      if (!over) return;

      // Haptic feedback on successful drop (mobile)
      navigator.vibrate?.(30);

      if (activeData?.type === "library-item" && activeData.competency) {
        // EXTERNAL DROP: Add library item at specific position
        let insertIndex: number;

        if (currentInsertionTarget) {
          insertIndex =
            currentInsertionTarget.position === "before"
              ? currentInsertionTarget.index
              : currentInsertionTarget.index + 1;
        } else {
          // Fallback: append to end
          insertIndex = state.competencies.length;
        }

        insertCompetencyAtIndex(activeData.competency, insertIndex);
      } else if (activeData?.type === "canvas-item") {
        // INTERNAL REORDER: Move canvas item to new position
        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        if (activeIdStr === overIdStr) return;

        const oldIndex = state.competencies.findIndex((c) => c.id === activeIdStr);
        const newIndex = state.competencies.findIndex((c) => c.id === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(state.competencies, oldIndex, newIndex);
          setCompetencies(reordered);
        }
      }
    },
    [state.competencies, insertionTarget, setCompetencies, insertCompetencyAtIndex]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveDragData(null);
    setInsertionTarget(null);
  }, []);

  // ----------------------------------------
  // Context Value
  // ----------------------------------------

  const contextValue: BuilderDndContextValue = {
    insertionTarget,
    activeDragData,
    isDragging: activeId !== null,
    activeId,
  };

  // Find the active competency for overlay (for canvas items)
  const activeCanvasCompetency =
    activeDragData?.type === "canvas-item"
      ? state.competencies.find((c) => c.id === activeId)
      : null;

  return (
    <BuilderDndContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}

        {/* Unified Drag Overlay for both item types */}
        {/* MOB-3: will-change for GPU-promoted compositing during drag */}
        <DragOverlay dropAnimation={null} style={{ willChange: 'transform' }}>
          {activeDragData ? (
            <DragPreview data={activeDragData} activeCompetency={activeCanvasCompetency} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </BuilderDndContext.Provider>
  );
}

// ============================================
// DRAG PREVIEW COMPONENT
// ============================================

interface DragPreviewProps {
  data: ActiveDragData;
  activeCompetency?: {
    name: string;
    category: string;
    questionCount: number;
    weight?: number;
  } | null;
}

function DragPreview({ data, activeCompetency }: DragPreviewProps) {
  if (data.type === "library-item") {
    // Compact preview for library items
    return (
      <div
        className={cn(
          "rounded-lg border border-primary/40 bg-card/95 backdrop-blur-sm",
          "shadow-lg p-2.5 scale-[1.02] rotate-1",
          "ring-2 ring-primary/20 max-w-[200px]"
        )}
      >
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 shrink-0">
            {data.category.replace(/_/g, " ")}
          </Badge>
          <span className="text-xs font-medium text-foreground truncate">
            {data.name}
          </span>
        </div>
      </div>
    );
  }

  // Full preview for canvas items (existing style)
  if (activeCompetency) {
    return (
      <div
        className={cn(
          "rounded-xl border border-primary/40 bg-card/95 backdrop-blur-sm",
          "shadow-[0_16px_48px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)]",
          "p-3 md:p-4 scale-[1.02] rotate-1",
          "ring-2 ring-primary/20"
        )}
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {activeCompetency.category.replace(/_/g, " ")}
          </Badge>
          <span className="text-sm font-semibold text-foreground">
            {activeCompetency.name}
          </span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {activeCompetency.questionCount} questions
        </div>
      </div>
    );
  }

  return null;
}
