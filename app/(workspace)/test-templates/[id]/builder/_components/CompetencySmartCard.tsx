"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GripVertical, ChevronDown, ChevronUp, Dot, Info, Loader2 } from "lucide-react";
import { BlueprintCompetency } from "../actions";
import { getSampleQuestion } from "../actions";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";

interface Indicator {
  id: string;
  title: string;
  weight: number;
}

interface CompetencySmartCardProps {
  competency: BlueprintCompetency;
  onRemove: () => void;
  isPending: boolean;
  laneId?: string;
  onWeightChange: (value: number) => void;
}

const indicatorDefaults: Indicator[] = [
  { id: "indicator-1", title: "Problem Solving", weight: 60 },
  { id: "indicator-2", title: "Communication", weight: 40 },
  { id: "indicator-3", title: "Adaptability", weight: 50 },
];

const difficultyPalette = {
  easy: "bg-emerald-400",
  medium: "bg-amber-400",
  hard: "bg-orange-500",
};

export function CompetencySmartCard({
  competency,
  onRemove,
  isPending,
  laneId,
  onWeightChange,
}: CompetencySmartCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>(() => {
    // If competency already has indicatorWeights, use them
    // @ts-expect-error indicators may not exist in type
    const existing = (competency.indicators as Indicator[] | undefined) || indicatorDefaults;
    return existing.map((i, idx) => ({ ...i, id: i.id || `indicator-${idx}` }));
  });
  const [sampleQuestion, setSampleQuestion] = useState<string>("");
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { updateCompetency } = useBlueprintWorkspace();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: competency.id, data: { laneId: laneId || "DEFAULT" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const inventoryCounts = useMemo(() => {
    const easy = Math.max(1, Math.round((competency.questionCount || 3) * 0.3));
    const medium = Math.max(1, Math.round((competency.questionCount || 3) * 0.5));
    const hard = Math.max(0, competency.questionCount - easy - medium);
    return { easy, medium, hard };
  }, [competency.questionCount]);

  useEffect(() => {
    if (!isExpanded || sampleQuestion) return;
    setIsSampleLoading(true);
    getSampleQuestion(competency.id).then((res) => {
      if (res.success) {
        setSampleQuestion(res.data.text);
      }
    }).finally(() => setIsSampleLoading(false));
  }, [competency.id, isExpanded, sampleQuestion]);

  const handleIndicatorChange = (id: string, value: number) => {
    setIndicators((prev) => {
      const next = prev.map((ind) => (ind.id === id ? { ...ind, weight: value } : ind));
      // debounce server update
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // @ts-expect-error indicators is not typed on BlueprintCompetency
        updateCompetency(competency.id, { indicators: next });
      }, 500);
      return next;
    });
  };

  const total = inventoryCounts.easy + inventoryCounts.medium + inventoryCounts.hard;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-border/40 bg-card transition-all duration-200",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]",
        "hover:-translate-y-0.5 hover:border-border/60",
        isDragging && "opacity-70 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] scale-[1.02] z-50 rotate-1",
        isPending && "opacity-50 pointer-events-none",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing p-2 rounded-md touch-none",
            "hover:bg-muted/60 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm md:text-base font-semibold truncate text-foreground">{competency.name}</h4>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] px-2 py-0.5 h-5 bg-muted/50 text-foreground/70 border-0 font-medium">
              {competency.category.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{competency.questionCount} questions</span>
            <span className="text-border/50">•</span>
            <span className="text-muted-foreground/80">Weight {competency.weight?.toFixed(1) ?? 1}x</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground" title="Inventory health">
            <Dot className="h-6 w-6 text-emerald-500" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:h-8 md:w-8 rounded-lg hover:bg-muted"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Weight control */}
      <div className="px-4 md:px-5 pb-4 md:pb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-foreground/90">Priority weight</span>
          <span className="font-mono text-sm text-foreground bg-muted/70 px-2.5 py-1 rounded-md border border-border/30">
            {Math.round((competency.weight ?? 1) * 100) / 100}
          </span>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
          <Slider
            value={[competency.weight ?? 1]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={([val]) => onWeightChange(val)}
            disabled={isPending}
          />
          <p className="text-[11px] text-muted-foreground/80 mt-2.5 flex items-center gap-1.5 leading-relaxed">
            <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" /> 
            <span className="hidden md:inline">Order determines priority; top competencies are favored when time is tight.</span>
            <span className="md:hidden">Top cards get priority when time is tight.</span>
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-border/40 bg-muted/5 space-y-4 pt-4">
          {/* Inventory depth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground/90">Inventory depth</Label>
              <span className="text-[11px] text-muted-foreground/70 font-medium">E/M/H mix</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-muted/60 overflow-hidden border border-border/40 shadow-inner">
                <div className={cn("h-full", difficultyPalette.easy)} style={{ width: `${(inventoryCounts.easy / total) * 100}%` }} />
                <div className={cn("h-full", difficultyPalette.medium)} style={{ width: `${(inventoryCounts.medium / total) * 100}%` }} />
                <div className={cn("h-full", difficultyPalette.hard)} style={{ width: `${(inventoryCounts.hard / total) * 100}%` }} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 font-medium">
                <span>E {inventoryCounts.easy}</span>
                <span>M {inventoryCounts.medium}</span>
                <span>H {inventoryCounts.hard}</span>
              </div>
            </div>
          </div>

          {/* Sample question */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground/90">Sample question</Label>
            <div className="rounded-lg border border-border/40 bg-background p-3.5 text-sm text-muted-foreground min-h-[64px] leading-relaxed shadow-sm">
              {isSampleLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ) : sampleQuestion ? (
                <span className="text-foreground/80">{sampleQuestion}</span>
              ) : (
                <span>No sample available</span>
              )}
            </div>
          </div>

          {/* Indicator tuning */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground/90">Indicator priority</Label>
              <span className="text-[10px] text-muted-foreground/70 font-medium">Optimistic apply</span>
            </div>
            {indicators.map((indicator) => (
              <div key={indicator.id} className="flex items-center gap-3">
                <span className="text-xs w-24 md:w-32 truncate text-foreground/80 font-medium">{indicator.title}</span>
                <Slider
                  value={[indicator.weight]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([val]) => handleIndicatorChange(indicator.id, val)}
                  disabled={isPending}
                />
                <span className="text-[11px] text-muted-foreground w-10 text-right">{indicator.weight}%</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 md:h-8 font-medium">
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
