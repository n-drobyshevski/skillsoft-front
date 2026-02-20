"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { GripVertical, ChevronDown, ChevronUp, Trash2, Minus, Plus } from "lucide-react";
import { BlueprintCompetency, type Difficulty } from "../actions";
import { getSampleQuestion } from "../actions";
import { useTranslations } from "next-intl";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { getImportanceLevelKey, importanceLevelColors } from "./utils/importanceLabel";

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
  /** Disable sortable behavior (used during SSR to avoid hydration mismatch) */
  disableSortable?: boolean;
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

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; short: string; color: string }[] = [
  { value: "FOUNDATIONAL", label: "Foundational", short: "F", color: "bg-emerald-500 text-white" },
  { value: "INTERMEDIATE", label: "Intermediate", short: "I", color: "bg-amber-500 text-white" },
  { value: "ADVANCED", label: "Advanced", short: "A", color: "bg-orange-500 text-white" },
  { value: "EXPERT", label: "Expert", short: "E", color: "bg-red-500 text-white" },
];

export function CompetencySmartCard({
  competency,
  onRemove,
  isPending,
  laneId,
  onWeightChange,
  disableSortable = false,
}: CompetencySmartCardProps) {
  const t = useTranslations('builder.card');
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

  // Pass disabled to useSortable to avoid generating aria-describedby during SSR
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: competency.id,
    data: {
      type: 'canvas-item' as const,
      laneId: laneId || "DEFAULT",
      name: competency.name,
      category: competency.category,
    },
    disabled: disableSortable,
  });

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
        // Prevent horizontal overflow on small screens
        "w-full max-w-full overflow-hidden box-border",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]",
        "hover:-translate-y-0.5 hover:border-border/60",
        isDragging && "opacity-70 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] scale-[1.02] z-50 rotate-1",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
        {/* Header */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 p-2 sm:p-3 md:p-5 min-w-0 overflow-hidden">
          <button
            {...attributes}
            {...listeners}
            data-drag-handle
            className={cn(
              // Small mobile (<480px): compact 32px touch target
              "h-8 w-8 flex items-center justify-center shrink-0",
              // Mobile (>=480px): 44px touch target
              "sm:h-11 sm:w-11",
              // Desktop: smaller
              "md:h-auto md:w-auto md:p-2",
              "cursor-grab active:cursor-grabbing rounded-md touch-none",
              "hover:bg-muted/60 active:bg-muted/80 transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            )}
            aria-label={t('dragToReorder')}
          >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/70" />
        </button>

        <div className="flex-1 min-w-0 overflow-hidden">
          <h4 className="text-sm md:text-base font-semibold truncate text-foreground">{competency.name}</h4>
          <div className="flex items-center gap-1 sm:gap-2 mt-1 text-[11px] sm:text-xs text-muted-foreground overflow-hidden">
            <span className="font-medium text-foreground/70 shrink-0">{competency.questionCount}q</span>
            <span className="text-border/50 shrink-0">•</span>
            <span className={cn("truncate", importanceLevelColors[getImportanceLevelKey(competency.weight ?? 1)])}>{t(`importanceLevel.${getImportanceLevelKey(competency.weight ?? 1)}`)}</span>
          </div>
        </div>

        {/* U6: Inline difficulty selector - desktop */}
        <div className="hidden md:flex items-center mr-2">
          <div className="flex rounded-md border border-border/40 overflow-hidden">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCompetency(competency.id, { difficulty: opt.value })}
                disabled={isPending}
                className={cn(
                  "px-2 py-1 text-[10px] font-medium transition-colors",
                  (competency.difficulty ?? "INTERMEDIATE") === opt.value
                    ? opt.color
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                )}
                title={opt.label}
              >
                {opt.short}
              </button>
            ))}
          </div>
        </div>

        {/* Compact weight control - always visible on desktop */}
        <div className="hidden md:flex items-center gap-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/30 border border-border/30">
                <span className="text-[10px] text-muted-foreground font-medium">{t('importance')}</span>
                <div className="w-16">
                  <Slider
                    value={[competency.weight ?? 1]}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    onValueChange={([val]) => onWeightChange(val)}
                    disabled={isPending}
                    className="[&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3"
                  />
                </div>
                <span className={cn("text-xs w-14 text-right font-medium", importanceLevelColors[getImportanceLevelKey(competency.weight ?? 1)])}>
                  {t(`importanceLevel.${getImportanceLevelKey(competency.weight ?? 1)}`)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-xs">
              {t('importanceTooltip')}
            </TooltipContent>
          </Tooltip>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            // Fixed sizes to prevent overflow accumulation
            "h-8 w-8 shrink-0",
            "sm:h-10 sm:w-10",
            "md:h-8 md:w-8",
            "rounded-lg hover:bg-muted active:scale-95 transition-all"
          )}
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? t('collapseDetail') : t('expandOptions')}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile controls - weight stepper + difficulty selector */}
      <div className="md:hidden px-2 sm:px-4 pb-2 sm:pb-3 space-y-2">
        {/* M1: Touch-optimized importance stepper with visual feedback */}
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-muted/20 border border-border/30">
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium shrink-0">{t('importance')}</span>
          <div className="flex-1 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full active:scale-90 active:bg-destructive/10 touch-manipulation transition-all"
              onClick={() => onWeightChange(Math.max(0.5, Math.round(((competency.weight ?? 1) - 0.1) * 10) / 10))}
              disabled={isPending || (competency.weight ?? 1) <= 0.5}
              aria-label={t('decreaseImportance')}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center">
              <span className={cn("text-base font-semibold w-16 text-center transition-all", importanceLevelColors[getImportanceLevelKey(competency.weight ?? 1)])}>
                {t(`importanceLevel.${getImportanceLevelKey(competency.weight ?? 1)}`)}
              </span>
              {/* Visual importance bar indicator */}
              <div className="w-12 h-1 mt-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${(((competency.weight ?? 1) - 0.5) / 1.5) * 100}%` }}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full active:scale-90 active:bg-primary/10 touch-manipulation transition-all"
              onClick={() => onWeightChange(Math.min(2.0, Math.round(((competency.weight ?? 1) + 0.1) * 10) / 10))}
              disabled={isPending || (competency.weight ?? 1) >= 2.0}
              aria-label={t('increaseImportance')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* U6: Mobile difficulty selector */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium shrink-0">{t('difficulty')}</span>
          <div className="flex-1 flex rounded-md border border-border/40 overflow-hidden">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCompetency(competency.id, { difficulty: opt.value })}
                disabled={isPending}
                className={cn(
                  "flex-1 py-1.5 text-[11px] font-medium transition-colors",
                  (competency.difficulty ?? "INTERMEDIATE") === opt.value
                    ? opt.color
                    : "bg-muted/30 text-muted-foreground"
                )}
              >
                {opt.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-2 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 border-t border-border/40 bg-muted/5 space-y-3 sm:space-y-4 pt-3 sm:pt-4 animate-card-expand overflow-hidden">
          {/* Inventory depth */}
          <div className="space-y-2 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] sm:text-xs font-semibold text-foreground/90 truncate">{t('inventoryDepth')}</Label>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground/70 font-medium shrink-0">{t('inventoryEMH')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex-1 min-w-0 h-2.5 sm:h-3 rounded-full bg-muted/60 overflow-hidden border border-border/40 shadow-inner flex">
                <div className={cn("h-full shrink-0", difficultyPalette.easy)} style={{ width: `${(inventoryCounts.easy / total) * 100}%` }} />
                <div className={cn("h-full shrink-0", difficultyPalette.medium)} style={{ width: `${(inventoryCounts.medium / total) * 100}%` }} />
                <div className={cn("h-full shrink-0", difficultyPalette.hard)} style={{ width: `${(inventoryCounts.hard / total) * 100}%` }} />
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-muted-foreground/80 font-medium shrink-0">
                <span>{inventoryCounts.easy}</span>
                <span>/</span>
                <span>{inventoryCounts.medium}</span>
                <span>/</span>
                <span>{inventoryCounts.hard}</span>
              </div>
            </div>
          </div>

          {/* Sample question */}
          <div className="space-y-2 overflow-hidden">
            <Label className="text-[11px] sm:text-xs font-semibold text-foreground/90">{t('sampleQuestion')}</Label>
            <div className="rounded-lg border border-border/40 bg-background p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground min-h-[48px] sm:min-h-[56px] leading-relaxed shadow-sm overflow-hidden">
              {isSampleLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ) : sampleQuestion ? (
                <span className="text-foreground/80 break-words">{sampleQuestion}</span>
              ) : (
                <span>{t('noSampleAvailable')}</span>
              )}
            </div>
          </div>

          {/* Indicator tuning */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] sm:text-xs font-semibold text-foreground/90">{t('indicatorPriority')}</Label>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 font-medium">{t('optimisticApply')}</span>
            </div>
            {indicators.map((indicator) => (
              <div key={indicator.id} className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs w-12 sm:w-20 md:w-28 truncate text-foreground/80 font-medium shrink-0">{indicator.title}</span>
                <div className="flex-1 min-w-0">
                  <Slider
                    value={[indicator.weight]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={([val]) => handleIndicatorChange(indicator.id, val)}
                    disabled={isPending}
                    className="[&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:w-4 sm:[&_[data-slot=slider-thumb]]:h-5 sm:[&_[data-slot=slider-thumb]]:w-5 md:[&_[data-slot=slider-thumb]]:h-4 md:[&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-track]]:h-1.5"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-7 sm:w-9 text-right shrink-0">{indicator.weight}%</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-destructive hover:text-destructive hover:bg-destructive/10",
                    "min-h-[36px] sm:min-h-[44px] md:h-8 md:min-h-0 font-medium gap-1.5 sm:gap-2 text-xs sm:text-sm"
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('removeButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('removeTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.rich('removeDescription', {
                      name: competency.name,
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="min-h-[44px] md:min-h-0">{t('removeCancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemove}
                    className="min-h-[44px] md:min-h-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('removeConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          </div>
        )}
    </div>
  );
}
