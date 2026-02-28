"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { GripVertical, ChevronDown, ChevronUp, Trash2, Equal } from "lucide-react";
import { BlueprintCompetency, type Difficulty } from "../actions";
import { useTranslations } from "next-intl";
import { useBlueprintWorkspace } from "./BlueprintWorkspaceProvider";
import { getImportanceLevelKey, importanceLevelColors, IMPORTANCE_LEVELS, importanceLevelBgColors } from "./utils/importanceLabel";
import { useSimulationStore } from "@/store/simulation-store";
import { useBlueprintStore, type StoredIndicator } from "@/store/blueprint-store";
import { useCardWarnings, type CardExpansionState } from "./hooks/useCardWarnings";
import { TrafficLightIndicator } from "./TrafficLightIndicator";
import { WarningBadge } from "./WarningBadge";
import { CardWarningsList } from "./CardWarningsList";
import { IndicatorStepper } from "./IndicatorStepper";

interface CompetencySmartCardProps {
  competency: BlueprintCompetency;
  onRemove: () => void;
  isPending: boolean;
  laneId?: string;
  onWeightChange: (value: number) => void;
  /** Disable sortable behavior (used during SSR to avoid hydration mismatch) */
  disableSortable?: boolean;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; key: string; color: string }[] = [
  { value: "FOUNDATIONAL", key: "foundational", color: "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white" },
  { value: "INTERMEDIATE", key: "intermediate", color: "bg-amber-500 text-white hover:bg-amber-600 hover:text-white" },
  { value: "ADVANCED", key: "advanced", color: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white" },
  { value: "EXPERT", key: "expert", color: "bg-red-500 text-white hover:bg-red-600 hover:text-white" },
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

  // ---- 3-state expansion machine ----
  const [expansionState, setExpansionState] = useState<CardExpansionState>('collapsed');
  const isHalf = expansionState === 'half' || expansionState === 'full';
  const isFull = expansionState === 'full';

  const cycleExpansion = useCallback(() => {
    setExpansionState((prev) => {
      if (prev === 'collapsed') return 'half';
      if (prev === 'half') return 'full';
      return 'collapsed';
    });
  }, []);

  // ---- Warning hook ----
  const { warnings, status, warningCount, hasErrors } = useCardWarnings({
    competencyId: competency.id,
    weight: competency.weight,
    questionCount: competency.questionCount,
  });

  // ---- Simulation distribution (primitive selector to avoid infinite loops) ----
  const simulationDistribution = useSimulationStore(
    (s) =>
      s.simulationResult?.distributionByCompetency?.find(
        (d) => d.competencyId === competency.id
      ) ?? null
  );

  // Read real behavioral indicators from the store (populated by CompetencyResolver)
  const storedIndicators = useBlueprintStore(
    (s) => s.indicatorsByCompetency[competency.id]
  );
  const [indicators, setIndicators] = useState<StoredIndicator[]>([]);

  // Sync local state when store data arrives (streamed async)
  useEffect(() => {
    if (storedIndicators && storedIndicators.length > 0) {
      setIndicators(storedIndicators);
    }
  }, [storedIndicators]);
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

  // ---- Auto-collapse while dragging ----
  useEffect(() => {
    if (isDragging && expansionState !== 'collapsed') {
      setExpansionState('collapsed');
    }
  }, [isDragging, expansionState]);

  // Real per-difficulty question counts from inventory heatmap
  const inventoryData = useBlueprintStore(
    (s) => s.inventoryByCompetency[competency.id]
  );

  const inventoryCounts = useMemo(() => {
    if (inventoryData) {
      return {
        foundational: inventoryData.FOUNDATIONAL ?? 0,
        intermediate: inventoryData.INTERMEDIATE ?? 0,
        advanced: inventoryData.ADVANCED ?? 0,
        expert: inventoryData.EXPERT ?? 0,
      };
    }
    return { foundational: 0, intermediate: 0, advanced: 0, expert: 0 };
  }, [inventoryData]);

  // Estimated question allocation based on importance weight
  const allocationEstimate = useMemo(() => {
    const indicators = competency.indicatorCount ?? 3;
    const qpi = 3; // default questionsPerIndicator
    const base = indicators * qpi;
    const weight = competency.weight ?? 1;
    const estimated = Math.round(base * weight);
    const level = t(`importanceLevel.${getImportanceLevelKey(weight)}`);
    return { base, indicators, estimated, level, weight };
  }, [competency.indicatorCount, competency.weight, t]);

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

  const handleEqualizeWeights = useCallback(() => {
    if (indicators.length === 0) return;
    const base = Math.round(100 / indicators.length);
    const remainder = 100 - base * indicators.length;
    const equalized = indicators.map((ind, i) => ({
      ...ind,
      weight: base + (i === 0 ? remainder : 0),
    }));
    setIndicators(equalized);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // @ts-expect-error indicators is not typed on BlueprintCompetency
      updateCompetency(competency.id, { indicators: equalized });
    }, 500);
  }, [indicators, competency.id, updateCompetency]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border bg-card transition-all duration-200",
        "w-full max-w-full overflow-hidden box-border",
        // Traffic light left border
        "border-l-[3px]",
        status === 'red' && "border-l-red-500",
        status === 'amber' && "border-l-amber-500",
        status === 'green' && "border-l-emerald-500",
        // Keep existing border color for other sides
        "border-border/40",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]",
        "hover:-translate-y-0.5 hover:border-border/60",
        isDragging && "opacity-70 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] scale-[1.02] z-50 rotate-1",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* ---- Header (State 1: scannable status row) ---- */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 p-2 sm:p-3 md:p-5 min-w-0 overflow-hidden">
        <button
          {...attributes}
          {...listeners}
          data-drag-handle
          className={cn(
            "h-11 w-11 flex items-center justify-center shrink-0",
            "md:h-auto md:w-auto md:p-2",
            "cursor-grab active:cursor-grabbing rounded-md touch-none",
            "hover:bg-muted/60 active:bg-muted/80 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
          aria-label={t('dragToReorder')}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/60 sm:text-muted-foreground/40 group-hover:text-muted-foreground/70" />
        </button>

        {/* Name + metadata */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5">
            {/* Traffic light dot - mobile only */}
            <TrafficLightIndicator status={status} className="md:hidden" />
            <h4 className="text-sm md:text-base font-semibold truncate text-foreground">{competency.name}</h4>
            {competency.onetRecommended && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                O*NET
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5 text-[11px] sm:text-xs text-muted-foreground overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium text-foreground/70 shrink-0 cursor-help">
                  {simulationDistribution
                    ? `${simulationDistribution.questionCount}/${competency.questionCount}q`
                    : `${competency.questionCount}q`}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {simulationDistribution
                  ? t('questionCountSimTooltip', { selected: simulationDistribution.questionCount, available: competency.questionCount })
                  : t('questionCountTooltip')}
              </TooltipContent>
            </Tooltip>
            {competency.indicatorCount != null && (
              <>
                <span className="text-border/50 shrink-0">·</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground/50 shrink-0 cursor-help">
                      {competency.indicatorCount}i
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {t('indicatorCountTooltip', { count: competency.indicatorCount })}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <span className="text-border/50 shrink-0">·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("truncate cursor-help", importanceLevelColors[getImportanceLevelKey(competency.weight ?? 1)])}>
                  {t(`importanceLevel.${getImportanceLevelKey(competency.weight ?? 1)}`)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-[220px] space-y-0.5">
                <p>{t('importanceAllocationTooltip', {
                  level: allocationEstimate.level,
                  count: allocationEstimate.estimated,
                  multiplier: allocationEstimate.weight.toFixed(1),
                })}</p>
                <p className="text-muted-foreground">{t('importanceAllocationBase', {
                  base: 3,
                  indicators: allocationEstimate.indicators,
                  total: allocationEstimate.base,
                })}</p>
              </TooltipContent>
            </Tooltip>
            {/* Difficulty label - read-only display, desktop only */}
            <span className="hidden md:inline text-border/50 shrink-0">·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="hidden md:inline truncate text-muted-foreground cursor-help">
                  {t(`difficultyOptions.${(competency.difficulty ?? 'INTERMEDIATE').toLowerCase()}`)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t('difficultyTooltip')}
              </TooltipContent>
            </Tooltip>
            {/* Inventory depth — compact dot badges (real data from heatmap) */}
            {inventoryData && (
            <>
            <span className="hidden xs:inline text-border/50 shrink-0">·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="hidden xs:inline-flex items-center gap-1.5 shrink-0 cursor-help">
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium tabular-nums text-muted-foreground/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    {inventoryCounts.foundational}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium tabular-nums text-muted-foreground/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                    {inventoryCounts.intermediate}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium tabular-nums text-muted-foreground/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
                    {inventoryCounts.advanced}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium tabular-nums text-muted-foreground/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                    {inventoryCounts.expert}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t('inventoryDepthTooltip')}
              </TooltipContent>
            </Tooltip>
            </>
            )}
          </div>
        </div>

        {/* Warning badge */}
        <WarningBadge count={warningCount} hasErrors={hasErrors} className="shrink-0" />

        {/* Remove — icon-only with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 shrink-0",
                "md:h-8 md:w-8",
                "rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
              )}
              aria-label={t('removeButton')}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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

        {/* Expand/collapse chevron */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-11 w-11 shrink-0",
            "md:h-8 md:w-8",
            "rounded-lg hover:bg-muted active:scale-95 transition-all"
          )}
          onClick={cycleExpansion}
          aria-label={
            expansionState === 'collapsed' ? t('expandWarnings')
            : expansionState === 'half' ? t('expandDetails')
            : t('collapseCard')
          }
        >
          {isFull
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* ---- Half-expanded section (State 2): warnings + controls ---- */}
      {isHalf && (
        <div className="px-2 sm:px-4 md:px-5 pb-2 sm:pb-3 border-t border-border/40 bg-muted/5 space-y-2 sm:space-y-3 pt-2 sm:pt-3 animate-card-half-expand overflow-hidden">
          {warningCount > 0 && <CardWarningsList warnings={warnings} />}

          <div className="space-y-2 md:flex md:items-end md:gap-6 md:space-y-0">
            {/* Importance */}
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-help">
                    {t('importance')}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[220px] space-y-0.5">
                  <p>{t('importanceAllocationTooltip', {
                    level: allocationEstimate.level,
                    count: allocationEstimate.estimated,
                    multiplier: allocationEstimate.weight.toFixed(1),
                  })}</p>
                  <p className="text-muted-foreground">{t('importanceAllocationBase', {
                    base: 3,
                    indicators: allocationEstimate.indicators,
                    total: allocationEstimate.base,
                  })}</p>
                </TooltipContent>
              </Tooltip>
              {(() => {
                const currentImportance = getImportanceLevelKey(competency.weight ?? 1);
                return (
                  <ToggleGroup
                    type="single"
                    value={currentImportance}
                    onValueChange={(val) => {
                      if (!val) return;
                      const level = IMPORTANCE_LEVELS.find((l) => l.key === val);
                      if (level) onWeightChange(level.value);
                    }}
                    className="w-full md:w-auto"
                  >
                    {IMPORTANCE_LEVELS.map((level) => (
                      <Tooltip key={level.key}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={level.key}
                            disabled={isPending}
                            className={cn(
                              "flex-1 md:flex-initial min-h-[44px] md:min-h-0 text-xs font-medium transition-colors touch-manipulation",
                              currentImportance === level.key
                                ? importanceLevelBgColors[level.key]
                                : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                            )}
                          >
                            {t(`importanceLevel.${level.key}`)}
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {t(`importanceLevel.${level.key}Tooltip`)}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </ToggleGroup>
                );
              })()}
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('difficulty')}
              </span>
              {(() => {
                const currentDifficulty = competency.difficulty ?? "INTERMEDIATE";
                return (
                  <ToggleGroup
                    type="single"
                    value={currentDifficulty}
                    onValueChange={(val) => {
                      if (!val) return;
                      updateCompetency(competency.id, { difficulty: val as Difficulty });
                    }}
                    className="w-full md:w-auto"
                  >
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <Tooltip key={opt.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={opt.value}
                            disabled={isPending}
                            className={cn(
                              "flex-1 md:flex-initial min-h-[44px] md:min-h-0 text-xs font-medium transition-colors touch-manipulation",
                              currentDifficulty === opt.value
                                ? opt.color
                                : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                            )}
                          >
                            {t(`difficultyOptions.${opt.key}Short`)}
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {t(`difficultyOptions.${opt.key}`)}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </ToggleGroup>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ---- Full-expanded section (State 3): indicator tuning + remove ---- */}
      {isFull && (
        <div className="px-2 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 border-t border-border/40 bg-muted/5 space-y-3 sm:space-y-4 pt-3 sm:pt-4 animate-card-expand overflow-hidden">
          {/* Indicator tuning with stepper controls */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('indicatorPriority')}</Label>
              {indicators.length > 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-[11px] sm:text-xs gap-1 font-medium",
                        "text-muted-foreground hover:text-foreground",
                        "min-h-[44px] sm:min-h-0 touch-manipulation",
                        "active:scale-[0.98]"
                      )}
                      onClick={handleEqualizeWeights}
                      disabled={isPending}
                      aria-label={t('equalizeWeights')}
                    >
                      <Equal className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('equalize')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {t('equalizeTooltip')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {indicators.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic">{t('noIndicatorsAvailable')}</p>
            ) : (
              <div className="space-y-2" role="list" aria-label={t('indicatorPriority')}>
                {indicators.map((indicator) => (
                  <div key={indicator.id} role="listitem">
                    <IndicatorStepper
                      indicator={indicator}
                      onChange={handleIndicatorChange}
                      disabled={isPending}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
