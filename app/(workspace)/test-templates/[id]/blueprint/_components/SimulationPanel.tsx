'use client';

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
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
  Zap,
  Target,
  Eye,
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
 * Persona configuration with dark mode support
 */
const personaConfig = {
  PERFECT_CANDIDATE: {
    icon: Sparkles,
    label: 'Perfect',
    fullLabel: 'Perfect Candidate',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    progressColor: 'bg-emerald-500 dark:bg-emerald-400',
  },
  RANDOM_GUESSER: {
    icon: Shuffle,
    label: 'Random',
    fullLabel: 'Random Guesser',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    progressColor: 'bg-amber-500 dark:bg-amber-400',
  },
  FAILING_CANDIDATE: {
    icon: TrendingDown,
    label: 'Failing',
    fullLabel: 'Failing Candidate',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
    progressColor: 'bg-red-500 dark:bg-red-400',
  },
};

/**
 * Modern Difficulty Timeline visualization
 */
function DifficultyTimeline({ 
  questions 
}: { 
  questions: SimulationResult['sampleQuestions'] 
}) {
  const difficultyConfig = {
    'FOUNDATIONAL': { color: 'bg-emerald-400', height: 'h-3', label: 'F' },
    'INTERMEDIATE': { color: 'bg-amber-400', height: 'h-5', label: 'I' },
    'ADVANCED': { color: 'bg-orange-500', height: 'h-7', label: 'A' },
    'EXPERT': { color: 'bg-red-500', height: 'h-9', label: 'E' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h4 className="text-sm font-medium">Difficulty Flow</h4>
          <p className="text-xs text-muted-foreground">Question progression</p>
        </div>
      </div>
      
      <div className="p-4 rounded-xl bg-muted/30">
        <div className="flex gap-1 h-10 items-end">
          {questions.slice(0, 24).map((q, i) => {
            const config = difficultyConfig[q.difficulty as keyof typeof difficultyConfig] 
              || { color: 'bg-gray-400', height: 'h-4', label: '?' };
            return (
              <div
                key={q.id || i}
                className={cn(
                  "flex-1 min-w-1 max-w-2 rounded-t-sm transition-all hover:opacity-80",
                  config.color,
                  config.height
                )}
                title={`${q.competencyName}: ${q.difficulty}`}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>Start</span>
          <span>{questions.length} questions</span>
          <span>End</span>
        </div>
      </div>
      
      <div className="flex gap-4 text-xs">
        {Object.entries(difficultyConfig).slice(0, 3).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
            {key.charAt(0) + key.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Modern Warning list component
 */
function WarningsList({ 
  warnings 
}: { 
  warnings: SimulationResult['warnings'] 
}) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">All Clear</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">No inventory issues detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning, i) => (
        <div 
          key={i}
          className={cn(
            "flex items-start gap-3 p-3 rounded-xl border",
            warning.severity === 'CRITICAL' 
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' 
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
          )}
        >
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
            warning.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
          )}>
            {warning.severity === 'CRITICAL' ? (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className={cn(
              "text-sm font-medium truncate",
              warning.severity === 'CRITICAL' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
            )}>
              {warning.competencyName}
            </p>
            <p className={cn(
              "text-xs",
              warning.severity === 'CRITICAL' ? 'text-red-600/70 dark:text-red-400/70' : 'text-amber-600/70 dark:text-amber-400/70'
            )}>
              {warning.currentCount} questions • {warning.difficulty}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Modern Loading skeleton for simulation
 */
function SimulationSkeleton() {
  return (
    <div className="space-y-4 p-1">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
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

  /**
   * Run simulation with current state and profile
   */
  const runSimulation = useCallback(async () => {
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
  }, [currentState, selectedProfile]);

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
  }, [debouncedState, selectedProfile, runSimulation]);

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

  const persona = personaConfig[selectedProfile];
  const PersonaIcon = persona.icon;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="p-6 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Live Preview</h2>
            <p className="text-xs text-muted-foreground">
              Auto-simulates on changes
            </p>
          </div>
        </div>
        
        {isPending && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Simulating...
          </div>
        )}
      </div>

      {/* Persona Selector */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Test Persona</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(personaConfig) as SimulationProfile[]).map((profile) => {
            const config = personaConfig[profile];
            const Icon = config.icon;
            const isSelected = selectedProfile === profile;
            
            return (
              <button
                key={profile}
                onClick={() => setSelectedProfile(profile)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? config.bgColor
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  isSelected ? 'bg-white/60' : 'bg-muted'
                )}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? config.color : "text-muted-foreground"
                )}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Area */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {isPending ? (
            <SimulationSkeleton />
          ) : error ? (
            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-red-700 dark:text-red-300">Simulation Error</h3>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">{error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-2"
                onClick={runSimulation}
              >
                <Zap className="h-4 w-4 mr-2" />
                Retry Simulation
              </Button>
            </div>
          ) : !result ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-muted-foreground mb-1">No Simulation</h3>
              <p className="text-sm text-muted-foreground/70">
                Add competencies to see results
              </p>
            </div>
          ) : (
            <>
              {/* Validity Status Card */}
              <div className={cn(
                "p-5 rounded-2xl border-2 transition-all",
                result.valid 
                  ? "border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50" 
                  : "border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      result.valid ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50"
                    )}>
                      {result.valid ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-semibold",
                        result.valid ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                      )}>
                        {result.valid ? 'Ready to Publish' : 'Needs Attention'}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        result.valid ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-red-600/80 dark:text-red-400/80"
                      )}>
                        {result.valid 
                          ? 'Blueprint meets all requirements' 
                          : `${result.warnings.length} issues found`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Preview Card */}
              {result.simulatedScore !== undefined && (
                <div className="p-5 rounded-2xl bg-card border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        persona.bgColor.replace('border-', 'border ').split(' ')[0]
                      )}>
                        <PersonaIcon className={cn("h-5 w-5", persona.color)} />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Predicted Score</span>
                        <p className="text-xs text-muted-foreground">{persona.fullLabel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold">{result.simulatedScore}</span>
                      <span className="text-lg text-muted-foreground">%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          persona.progressColor
                        )}
                        style={{ width: `${result.simulatedScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="font-medium">Pass: {currentState.passingScore}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {result.estimatedDurationMinutes}
                      </p>
                      <p className="text-xs text-muted-foreground">Minutes</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {result.sampleQuestions.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty Timeline */}
              {result.sampleQuestions.length > 0 && (
                <div className="p-5 rounded-2xl bg-card border">
                  <DifficultyTimeline questions={result.sampleQuestions} />
                </div>
              )}

              {/* Inventory Check */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Inventory Check</h4>
                    <p className="text-xs text-muted-foreground">Question availability</p>
                  </div>
                </div>
                <WarningsList warnings={result.warnings} />
              </div>

              {/* Run Logs (collapsible) */}
              {result.runLogs.length > 0 && (
                <details className="text-xs group">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span>Simulation Logs ({result.runLogs.length})</span>
                  </summary>
                  <pre className="mt-2 p-4 bg-muted/30 rounded-xl text-xs overflow-x-auto max-h-40 font-mono">
                    {result.runLogs.join('\n')}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Publish Button */}
      <div className="p-6 border-t bg-background/80 backdrop-blur-sm">
        <Button
          className={cn(
            "w-full h-12 rounded-xl text-base font-medium shadow-lg transition-all",
            result?.valid 
              ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25" 
              : ""
          )}
          disabled={!result?.valid || isPending || isPublishing}
          onClick={handlePublish}
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Publish Blueprint
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Publishing creates a locked version
        </p>
      </div>
    </div>
  );
}
