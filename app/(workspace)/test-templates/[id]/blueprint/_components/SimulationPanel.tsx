'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  User,
  Shuffle,
  TrendingDown,
  Clock,
  BarChart3,
  FileCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  BlueprintState,
  SimulationProfile,
  SimulationResult,
  simulateAction,
  publishAction,
} from '../actions';
import { cn } from '@/lib/utils';

interface SimulationPanelProps {
  templateId: string;
  initialState: BlueprintState;
}

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Get persona icon and color
 */
function getPersonaInfo(profile: SimulationProfile) {
  switch (profile) {
    case 'PERFECT_CANDIDATE':
      return {
        icon: Sparkles,
        label: 'Perfect Candidate',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    case 'RANDOM_GUESSER':
      return {
        icon: Shuffle,
        label: 'Random Guesser',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      };
    case 'FAILING_CANDIDATE':
      return {
        icon: TrendingDown,
        label: 'Failing Candidate',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
  }
}

/**
 * Difficulty Timeline visualization
 */
function DifficultyTimeline({ 
  questions 
}: { 
  questions: SimulationResult['sampleQuestions'] 
}) {
  const difficultyColors: Record<string, string> = {
    'FOUNDATIONAL': 'bg-green-400',
    'INTERMEDIATE': 'bg-yellow-400',
    'ADVANCED': 'bg-orange-500',
    'EXPERT': 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Difficulty Progression</h4>
      <div className="flex gap-1 h-8 items-end">
        {questions.slice(0, 20).map((q, i) => {
          const heights: Record<string, string> = {
            'FOUNDATIONAL': 'h-2',
            'INTERMEDIATE': 'h-4',
            'ADVANCED': 'h-6',
            'EXPERT': 'h-8',
          };
          return (
            <div
              key={q.id || i}
              className={cn(
                "w-2 rounded-t transition-all",
                difficultyColors[q.difficulty] || 'bg-gray-400',
                heights[q.difficulty] || 'h-4'
              )}
              title={`${q.competencyName}: ${q.difficulty}`}
            />
          );
        })}
        {questions.length > 20 && (
          <span className="text-xs text-muted-foreground ml-2">
            +{questions.length - 20} more
          </span>
        )}
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" /> Foundation
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400" /> Intermediate
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500" /> Advanced
        </span>
      </div>
    </div>
  );
}

/**
 * Warning list component
 */
function WarningsList({ 
  warnings 
}: { 
  warnings: SimulationResult['warnings'] 
}) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm">No inventory issues</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning, i) => (
        <div 
          key={i}
          className={cn(
            "flex items-start gap-2 p-2 rounded text-sm",
            warning.severity === 'CRITICAL' 
              ? 'bg-red-50 text-red-700' 
              : 'bg-yellow-50 text-yellow-700'
          )}
        >
          {warning.severity === 'CRITICAL' ? (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <span className="font-medium">{warning.competencyName}</span>
            <p className="text-xs opacity-75">
              {warning.currentCount} questions at {warning.difficulty} level
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for simulation
 */
function SimulationSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

/**
 * Simulation Panel Component
 * 
 * Auto-simulates 500ms after last edit
 * Shows live preview with persona selection
 */
export default function SimulationPanel({
  templateId,
  initialState,
}: SimulationPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SimulationProfile>('PERFECT_CANDIDATE');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track blueprint state for auto-simulation
  const [currentState, setCurrentState] = useState(initialState);
  const debouncedState = useDebounce(currentState, 500);
  const lastSimulatedRef = useRef<string>('');

  // Listen for state changes from parent (via props or context)
  useEffect(() => {
    setCurrentState(initialState);
  }, [initialState]);

  // Auto-simulate on debounced state change
  useEffect(() => {
    const stateKey = JSON.stringify({
      competencies: debouncedState.competencies.map(c => c.id),
      profile: selectedProfile,
    });

    // Skip if same as last simulation
    if (stateKey === lastSimulatedRef.current) return;

    // Skip if no competencies
    if (debouncedState.competencies.length === 0) {
      setResult(null);
      return;
    }

    runSimulation();
    lastSimulatedRef.current = stateKey;
  }, [debouncedState, selectedProfile]);

  /**
   * Run simulation with current state and profile
   */
  const runSimulation = async () => {
    startTransition(async () => {
      setError(null);
      try {
        const response = await simulateAction(currentState, selectedProfile);
        
        if (response.success) {
          setResult(response.data);
        } else {
          setError(response.error);
          toast.error(response.error);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Simulation failed';
        setError(message);
        toast.error(message);
      }
    });
  };

  /**
   * Handle publish action
   */
  const handlePublish = async () => {
    if (!result?.valid) {
      toast.error('Cannot publish: Blueprint has validation errors');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await publishAction(templateId);
      
      if (response.success) {
        toast.success(`Published version ${response.data.version}`);
      } else {
        toast.error(response.error);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const personaInfo = getPersonaInfo(selectedProfile);
  const PersonaIcon = personaInfo.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Play className="h-4 w-4" />
          Simulation Preview
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Live dry-run of your blueprint
        </p>
      </div>

      {/* Persona Selector */}
      <div className="p-4 border-b">
        <label className="text-sm font-medium mb-2 block">Test Persona</label>
        <Select
          value={selectedProfile}
          onValueChange={(value) => setSelectedProfile(value as SimulationProfile)}
        >
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <PersonaIcon className={cn("h-4 w-4", personaInfo.color)} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERFECT_CANDIDATE">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                Perfect Candidate
              </div>
            </SelectItem>
            <SelectItem value="RANDOM_GUESSER">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-yellow-600" />
                Random Guesser
              </div>
            </SelectItem>
            <SelectItem value="FAILING_CANDIDATE">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Failing Candidate
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isPending ? (
            <SimulationSkeleton />
          ) : error ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Simulation Error</span>
                </div>
                <p className="text-sm text-red-600 mt-2">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={runSimulation}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : !result ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Add competencies to see simulation</p>
            </div>
          ) : (
            <>
              {/* Validity Status */}
              <Card className={cn(
                "border-2",
                result.valid 
                  ? "border-green-500 bg-green-50" 
                  : "border-red-500 bg-red-50"
              )}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.valid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {result.valid ? 'Valid Blueprint' : 'Invalid Blueprint'}
                      </span>
                    </div>
                    <Badge variant={result.valid ? 'default' : 'destructive'}>
                      {result.valid ? 'Ready' : 'Issues Found'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Score Preview */}
              {result.simulatedScore !== undefined && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Simulated Score</span>
                      <Badge className={personaInfo.bgColor + ' ' + personaInfo.color}>
                        <PersonaIcon className="h-3 w-3 mr-1" />
                        {personaInfo.label}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span className="font-bold">{result.simulatedScore}%</span>
                      </div>
                      <Progress value={result.simulatedScore} />
                      <p className="text-xs text-muted-foreground">
                        Passing threshold: {currentState.passingScore}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">
                          {result.estimatedDurationMinutes}
                        </p>
                        <p className="text-xs text-muted-foreground">Est. minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">
                          {result.sampleQuestions.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Questions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Difficulty Timeline */}
              {result.sampleQuestions.length > 0 && (
                <DifficultyTimeline questions={result.sampleQuestions} />
              )}

              <Separator />

              {/* Warnings */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Inventory Check
                </h4>
                <WarningsList warnings={result.warnings} />
              </div>

              {/* Run Logs (collapsible) */}
              {result.runLogs.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Simulation Logs ({result.runLogs.length})
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-h-32">
                    {result.runLogs.join('\n')}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Publish Button */}
      <div className="p-4 border-t">
        <Button
          className="w-full"
          disabled={!result?.valid || isPending || isPublishing}
          onClick={handlePublish}
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Publish Blueprint
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Publishing locks this version
        </p>
      </div>
    </div>
  );
}
