'use client';

import React, { useOptimistic, useTransition, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  GripVertical, 
  Trash2, 
  Plus,
  Loader2,
  Target,
  Clock,
  BarChart3,
  Briefcase,
  Users,
  Brain,
  Layers,
  Zap
} from 'lucide-react';
import { 
  BlueprintState, 
  BlueprintCompetency,
  saveDraftAction,
  addCompetencyAction,
  removeCompetencyAction
} from '../actions';
import { cn } from '@/lib/utils';

interface BlueprintEditorProps {
  initialState: BlueprintState;
  /** Available competencies from library (for validation) */
  availableCompetencies?: {
    id: string;
    name: string;
    category: string;
    description: string;
    questionCount: number;
    health: string;
  }[];
}

// Optimistic action types
type OptimisticAction = 
  | { type: 'add'; competency: BlueprintCompetency }
  | { type: 'remove'; competencyId: string }
  | { type: 'update'; competencyId: string; updates: Partial<BlueprintCompetency> }
  | { type: 'updateSettings'; settings: Partial<BlueprintState> };

/**
 * Reducer for optimistic updates
 */
function blueprintReducer(
  state: BlueprintState, 
  action: OptimisticAction
): BlueprintState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        competencies: [...state.competencies, action.competency],
      };
    case 'remove':
      return {
        ...state,
        competencies: state.competencies.filter(c => c.id !== action.competencyId),
      };
    case 'update':
      return {
        ...state,
        competencies: state.competencies.map(c =>
          c.id === action.competencyId ? { ...c, ...action.updates } : c
        ),
      };
    case 'updateSettings':
      return {
        ...state,
        ...action.settings,
      };
    default:
      return state;
  }
}

/**
 * Strategy configuration with icons and descriptions - dark mode support
 */
const strategyConfig = {
  UNIVERSAL_BASELINE: {
    icon: Brain,
    label: 'Universal Baseline',
    description: 'Broad assessment of core competencies',
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50',
  },
  TARGETED_FIT: {
    icon: Briefcase,
    label: 'Targeted Job Fit',
    description: 'Role-specific competency evaluation',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
  },
  DYNAMIC_GAP_ANALYSIS: {
    icon: Users,
    label: 'Team Gap Analysis',
    description: 'Fill competency gaps in existing teams',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
  },
};

/**
 * Modern Competency card - Clean, spacious design
 */
function CompetencyCard({
  competency,
  onRemove,
  onUpdate,
  isPending,
}: {
  competency: BlueprintCompetency;
  onRemove: () => void;
  onUpdate: (updates: Partial<BlueprintCompetency>) => void;
  isPending: boolean;
}) {
  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-md",
      "border-l-4 border-l-primary/60",
      isPending && "opacity-60"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <div className="mt-1 cursor-grab opacity-40 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-base">{competency.name}</h4>
                <Badge variant="secondary" className="text-xs font-normal">
                  {competency.category.replace(/_/g, ' ')}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={onRemove}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Sliders Row - Modern design */}
            <div className="grid grid-cols-2 gap-6">
              {/* Question Count */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Questions</Label>
                  <Badge variant="outline" className="text-xs tabular-nums">
                    {competency.questionCount}
                  </Badge>
                </div>
                <Slider
                  value={[competency.questionCount]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => onUpdate({ questionCount: value })}
                  disabled={isPending}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>

              {/* Weight */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Weight</Label>
                  <Badge variant="outline" className="text-xs tabular-nums">
                    {competency.weight.toFixed(1)}x
                  </Badge>
                </div>
                <Slider
                  value={[competency.weight * 10]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={([value]) => onUpdate({ weight: value / 10 })}
                  disabled={isPending}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            </div>

            {/* Difficulty Selector - Pill buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Label className="text-sm font-medium shrink-0">Difficulty:</Label>
              <div className="flex gap-2">
                {(['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onUpdate({ difficulty: level })}
                    disabled={isPending}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                      competency.difficulty === level
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Blueprint Editor Component
 * 
 * Uses useOptimistic for instant drag-drop feedback
 * Persists changes via saveDraftAction in background
 */
export default function BlueprintEditor({
  initialState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  availableCompetencies: _availableCompetencies,
}: BlueprintEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Optimistic state for instant UI updates
  const [optimisticState, dispatchOptimistic] = useOptimistic(
    initialState,
    blueprintReducer
  );

  // Real state that tracks server-confirmed changes
  const [serverState, setServerState] = useState(initialState);

  /**
   * Handle dropping a competency from the library
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Check if already added
      if (optimisticState.competencies.some(c => c.id === data.id)) {
        toast.warning('Competency already added');
        return;
      }

      const newCompetency: BlueprintCompetency = {
        id: data.id,
        name: data.name,
        category: data.category,
        questionCount: 3,
        weight: 1.0,
        difficulty: 'INTERMEDIATE',
      };

      startTransition(async () => {
        // Optimistic update - instant UI feedback
        dispatchOptimistic({ type: 'add', competency: newCompetency });

        // Background validation
        const result = await addCompetencyAction(serverState.templateId, newCompetency);
        
        if (!result.success) {
          toast.error(result.error);
          // State will revert on next render since server state didn't change
          return;
        }

        // Update server state
        const newState = {
          ...serverState,
          competencies: [...serverState.competencies, newCompetency],
        };
        setServerState(newState);

        // Auto-save
        await saveDraft(newState);
        toast.success(`Added ${newCompetency.name}`);
      });
    } catch (error) {
      console.error('Drop failed:', error);
      toast.error('Failed to add competency');
    }
  }, [optimisticState, serverState, dispatchOptimistic]);

  /**
   * Handle removing a competency
   */
  const handleRemove = useCallback((competencyId: string) => {
    const competency = optimisticState.competencies.find(c => c.id === competencyId);
    
    startTransition(async () => {
      dispatchOptimistic({ type: 'remove', competencyId });

      const result = await removeCompetencyAction(serverState.templateId, competencyId);
      
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const newState = {
        ...serverState,
        competencies: serverState.competencies.filter(c => c.id !== competencyId),
      };
      setServerState(newState);

      await saveDraft(newState);
      toast.success(`Removed ${competency?.name || 'competency'}`);
    });
  }, [optimisticState, serverState, dispatchOptimistic]);

  /**
   * Handle updating a competency
   */
  const handleUpdate = useCallback((
    competencyId: string, 
    updates: Partial<BlueprintCompetency>
  ) => {
    startTransition(async () => {
      dispatchOptimistic({ type: 'update', competencyId, updates });

      const newState = {
        ...serverState,
        competencies: serverState.competencies.map(c =>
          c.id === competencyId ? { ...c, ...updates } : c
        ),
      };
      setServerState(newState);

      // Debounced save would be better, but for now save immediately
      await saveDraft(newState);
    });
  }, [serverState, dispatchOptimistic]);

  /**
   * Handle settings update
   */
  const handleSettingsUpdate = useCallback((settings: Partial<BlueprintState>) => {
    startTransition(async () => {
      dispatchOptimistic({ type: 'updateSettings', settings });

      const newState = { ...serverState, ...settings };
      setServerState(newState);

      await saveDraft(newState);
    });
  }, [serverState, dispatchOptimistic]);

  /**
   * Save draft to server
   */
  const saveDraft = async (state: BlueprintState) => {
    setIsSaving(true);
    try {
      const result = await saveDraftAction(state);
      if (!result.success) {
        toast.error(result.error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const currentStrategy = strategyConfig[optimisticState.strategy];
  const StrategyIcon = currentStrategy.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Strategy Card - Modern hero section */}
      <Card className="overflow-hidden">
        <div className={cn(
          "p-6 border-b",
          currentStrategy.color
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm">
                <StrategyIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{currentStrategy.label}</h3>
                <p className="text-sm opacity-80">{currentStrategy.description}</p>
              </div>
            </div>
            {(isPending || isSaving) && (
              <Badge variant="secondary" className="gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {/* Strategy Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Assessment Strategy</Label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(strategyConfig) as [BlueprintState['strategy'], typeof strategyConfig.UNIVERSAL_BASELINE][]).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = optimisticState.strategy === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSettingsUpdate({ strategy: key })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      isActive 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-muted hover:border-muted-foreground/30 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      isActive ? config.color : "bg-muted"
                    )}>
                      <Icon className={cn("h-5 w-5", isActive ? "" : "text-muted-foreground")} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Global Settings - Modern cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Time Limit */}
            <div className="space-y-4 p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Time Limit</Label>
                  <p className="text-xs text-muted-foreground">Maximum duration</p>
                </div>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[optimisticState.timeLimitMinutes]}
                  min={15}
                  max={120}
                  step={5}
                  onValueChange={([value]) => 
                    handleSettingsUpdate({ timeLimitMinutes: value })
                  }
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15 min</span>
                  <Badge variant="secondary" className="font-mono">
                    {optimisticState.timeLimitMinutes} min
                  </Badge>
                  <span>120 min</span>
                </div>
              </div>
            </div>

            {/* Passing Score */}
            <div className="space-y-4 p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Passing Score</Label>
                  <p className="text-xs text-muted-foreground">Minimum to pass</p>
                </div>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[optimisticState.passingScore]}
                  min={50}
                  max={100}
                  step={5}
                  onValueChange={([value]) => 
                    handleSettingsUpdate({ passingScore: value })
                  }
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50%</span>
                  <Badge variant="secondary" className="font-mono">
                    {optimisticState.passingScore}%
                  </Badge>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adaptivity Toggle - Clean design */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-sm font-medium">Allow Backtracking</Label>
                <p className="text-xs text-muted-foreground">
                  Candidates can revisit previous questions
                </p>
              </div>
            </div>
            <Switch
              checked={optimisticState.adaptivity.allowBacktracking}
              onCheckedChange={(checked) =>
                handleSettingsUpdate({
                  adaptivity: { ...optimisticState.adaptivity, allowBacktracking: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Competency Canvas - Modern Drop Zone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Competency Stack</h3>
              <p className="text-xs text-muted-foreground">
                {optimisticState.competencies.length} competencies configured
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "border-2 border-dashed rounded-2xl transition-all duration-300",
            "min-h-[240px]",
            isDragOver 
              ? "border-primary bg-primary/5 scale-[1.01] shadow-lg" 
              : "border-muted-foreground/20",
            optimisticState.competencies.length === 0 && "flex items-center justify-center"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {optimisticState.competencies.length === 0 ? (
            <div className="text-center p-8">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-muted-foreground">Drop competencies here</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Drag from the library panel on the left
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {optimisticState.competencies.map((competency) => (
                <CompetencyCard
                  key={competency.id}
                  competency={competency}
                  onRemove={() => handleRemove(competency.id)}
                  onUpdate={(updates) => handleUpdate(competency.id, updates)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats - Modern metrics cards */}
      {optimisticState.competencies.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { 
              label: 'Competencies', 
              value: optimisticState.competencies.length,
              icon: Layers,
              color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50',
            },
            { 
              label: 'Questions', 
              value: optimisticState.competencies.reduce((sum, c) => sum + c.questionCount, 0),
              icon: BarChart3,
              color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
            },
            { 
              label: 'Est. Duration', 
              value: `~${Math.round(optimisticState.competencies.reduce((sum, c) => sum + c.questionCount * 1.5, 0))}m`,
              icon: Clock,
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
            },
            { 
              label: 'Pass Threshold', 
              value: `${optimisticState.passingScore}%`,
              icon: Target,
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
            },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
