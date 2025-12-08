'use client';

import React, { useOptimistic, useTransition, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  GripVertical, 
  Trash2, 
  Plus,
  Save,
  Loader2,
  Settings2,
  Target,
  Clock,
  BarChart3,
  Briefcase,
  Users,
  Brain
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
  availableCompetencies: {
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
 * Strategy icon mapping
 */
function getStrategyIcon(strategy: BlueprintState['strategy']) {
  switch (strategy) {
    case 'UNIVERSAL_BASELINE':
      return Brain;
    case 'TARGETED_FIT':
      return Briefcase;
    case 'DYNAMIC_GAP_ANALYSIS':
      return Users;
  }
}

/**
 * Competency card in the canvas
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
      "transition-all",
      isPending && "opacity-70"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{competency.name}</h4>
                <Badge variant="outline" className="text-xs mt-1">
                  {competency.category.replace('_', ' ')}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onRemove}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Question Count Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Questions</Label>
                  <span className="text-xs text-muted-foreground">
                    {competency.questionCount}
                  </span>
                </div>
                <Slider
                  value={[competency.questionCount]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => onUpdate({ questionCount: value })}
                  disabled={isPending}
                />
              </div>

              {/* Weight Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Weight</Label>
                  <span className="text-xs text-muted-foreground">
                    {competency.weight.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[competency.weight * 10]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={([value]) => onUpdate({ weight: value / 10 })}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Difficulty:</Label>
              <Select 
                value={competency.difficulty || 'INTERMEDIATE'}
                onValueChange={(value) => onUpdate({ 
                  difficulty: value as BlueprintCompetency['difficulty'] 
                })}
                disabled={isPending}
              >
                <SelectTrigger className="h-7 text-xs w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOUNDATIONAL">Foundational</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
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
  availableCompetencies,
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

  const StrategyIcon = getStrategyIcon(optimisticState.strategy);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Strategy Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Blueprint Configuration
            </CardTitle>
            {(isPending || isSaving) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strategy Selector */}
          <div className="space-y-2">
            <Label>Assessment Strategy</Label>
            <Select
              value={optimisticState.strategy}
              onValueChange={(value) => 
                handleSettingsUpdate({ strategy: value as BlueprintState['strategy'] })
              }
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <StrategyIcon className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIVERSAL_BASELINE">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Universal Baseline
                  </div>
                </SelectItem>
                <SelectItem value="TARGETED_FIT">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Targeted Job Fit
                  </div>
                </SelectItem>
                <SelectItem value="DYNAMIC_GAP_ANALYSIS">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Dynamic Team Gap Analysis
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Global Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Time Limit (min)</Label>
              </div>
              <Slider
                value={[optimisticState.timeLimitMinutes]}
                min={15}
                max={120}
                step={5}
                onValueChange={([value]) => 
                  handleSettingsUpdate({ timeLimitMinutes: value })
                }
              />
              <span className="text-sm text-muted-foreground">
                {optimisticState.timeLimitMinutes} minutes
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <Label>Passing Score (%)</Label>
              </div>
              <Slider
                value={[optimisticState.passingScore]}
                min={50}
                max={100}
                step={5}
                onValueChange={([value]) => 
                  handleSettingsUpdate({ passingScore: value })
                }
              />
              <span className="text-sm text-muted-foreground">
                {optimisticState.passingScore}%
              </span>
            </div>
          </div>

          {/* Adaptivity Settings */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label>Allow Backtracking</Label>
              <p className="text-xs text-muted-foreground">
                Let candidates revisit previous questions
              </p>
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

      {/* Competency Canvas - Drop Zone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competencies ({optimisticState.competencies.length})
          </h3>
        </div>

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 min-h-[200px] transition-colors",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25",
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
            <div className="text-center text-muted-foreground">
              <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Drop competencies here</p>
              <p className="text-sm">Drag from the library on the left</p>
            </div>
          ) : (
            <div className="grid gap-4">
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

      {/* Summary Stats */}
      {optimisticState.competencies.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {optimisticState.competencies.length}
                </p>
                <p className="text-xs text-muted-foreground">Competencies</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {optimisticState.competencies.reduce((sum, c) => sum + c.questionCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ~{Math.round(optimisticState.competencies.reduce((sum, c) => sum + c.questionCount * 1.5, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Est. Minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {optimisticState.passingScore}%
                </p>
                <p className="text-xs text-muted-foreground">Pass Threshold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
