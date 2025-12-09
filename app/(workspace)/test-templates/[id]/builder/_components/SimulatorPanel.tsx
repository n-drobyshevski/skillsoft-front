'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  Play,
  Sparkles,
  Shuffle,
  TrendingDown,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { SimulationProfile, SimulationResult } from '../actions';

// ============================================
// PERSONA SELECTOR
// ============================================

const personaConfig: Record<
  SimulationProfile,
  {
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  PERFECT_CANDIDATE: {
    icon: Sparkles,
    label: 'Perfect',
    description: 'Ideal candidate',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
  },
  RANDOM_GUESSER: {
    icon: Shuffle,
    label: 'Random',
    description: 'Random answers',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
  },
  FAILING_CANDIDATE: {
    icon: TrendingDown,
    label: 'Failing',
    description: 'Poor performer',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
  },
};

interface PersonaSelectorProps {
  selected: SimulationProfile;
  onSelect: (profile: SimulationProfile) => void;
  disabled?: boolean;
}

function PersonaSelector({ selected, onSelect, disabled }: PersonaSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(personaConfig) as SimulationProfile[]).map((profile) => {
        const config = personaConfig[profile];
        const Icon = config.icon;
        const isSelected = selected === profile;

        return (
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
              'hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected ? config.bgColor : 'bg-background border-border hover:border-border/80',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className={cn('h-5 w-5', isSelected ? config.color : 'text-muted-foreground')} />
            <span
              className={cn(
                'text-xs font-medium',
                isSelected ? config.color : 'text-muted-foreground'
              )}
            >
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// DIFFICULTY CHART
// ============================================

interface DifficultyChartProps {
  questions: SimulationResult['sampleQuestions'];
}

function DifficultyChart({ questions }: DifficultyChartProps) {
  const difficultyConfig = {
    FOUNDATIONAL: { color: 'bg-emerald-400', height: 'h-3' },
    INTERMEDIATE: { color: 'bg-amber-400', height: 'h-5' },
    ADVANCED: { color: 'bg-orange-500', height: 'h-7' },
    EXPERT: { color: 'bg-red-500', height: 'h-9' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium">Difficulty Flow</span>
      </div>

      <div className="p-3 rounded-xl bg-muted/30">
        <div className="flex gap-0.5 h-10 items-end">
          {questions.slice(0, 30).map((q, i) => {
            const config =
              difficultyConfig[q.difficulty as keyof typeof difficultyConfig] ||
              difficultyConfig.INTERMEDIATE;
            return (
              <div
                key={q.id || i}
                className={cn(
                  'flex-1 min-w-0.5 max-w-1.5 rounded-t-sm transition-all',
                  config.color,
                  config.height
                )}
                title={`${q.competencyName}: ${q.difficulty}`}
              />
            );
          })}
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Start</span>
          <span>{questions.length} questions</span>
          <span>End</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        {Object.entries(difficultyConfig)
          .slice(0, 3)
          .map(([key, config]) => (
            <span key={key} className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-sm', config.color)} />
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </span>
          ))}
      </div>
    </div>
  );
}

// ============================================
// SCORE DISPLAY
// ============================================

interface ScoreDisplayProps {
  score: number;
  passingScore: number;
  profile: SimulationProfile;
}

function ScoreDisplay({ score, passingScore, profile }: ScoreDisplayProps) {
  const config = personaConfig[profile];
  const passed = score >= passingScore;

  return (
    <div className={cn('p-4 rounded-xl border', config.bgColor)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Simulated Score
        </span>
        {passed ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Pass
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Fail
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('text-3xl font-bold', config.color)}>{score}%</span>
        <span className="text-xs text-muted-foreground">/ {passingScore}% to pass</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            passed ? 'bg-emerald-500' : 'bg-red-500'
          )}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
        {/* Passing threshold marker */}
        <div
          className="relative -top-2 h-2 w-0.5 bg-foreground/50"
          style={{ marginLeft: `${passingScore}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// WARNINGS LIST
// ============================================

interface WarningsListProps {
  warnings: SimulationResult['warnings'];
}

function WarningsList({ warnings }: WarningsListProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium">Inventory Warnings</span>
      </div>

      <div className="space-y-1.5">
        {warnings.slice(0, 5).map((warning) => (
          <div
            key={warning.competencyId}
            className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs"
          >
            <span className="flex-1 truncate text-amber-700 dark:text-amber-300">
              {warning.competencyName}
            </span>
            <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600">
              {warning.currentCount} questions
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SIMULATION SKELETON
// ============================================

function SimulationSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ============================================
// SIMULATION RESULTS
// ============================================

interface SimulationResultsProps {
  result: SimulationResult;
  profile: SimulationProfile;
  passingScore: number;
}

function SimulationResults({ result, profile, passingScore }: SimulationResultsProps) {
  return (
    <div className="space-y-4">
      {/* Score */}
      {result.simulatedScore !== undefined && (
        <ScoreDisplay
          score={result.simulatedScore}
          passingScore={passingScore}
          profile={profile}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-muted/30 border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Duration</span>
          </div>
          <span className="text-sm font-semibold">{result.estimatedDurationMinutes} min</span>
        </div>

        <div className="p-3 rounded-xl bg-muted/30 border">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Questions</span>
          </div>
          <span className="text-sm font-semibold">{result.sampleQuestions.length}</span>
        </div>
      </div>

      {/* Difficulty Chart */}
      {result.sampleQuestions.length > 0 && (
        <DifficultyChart questions={result.sampleQuestions} />
      )}

      {/* Warnings */}
      <WarningsList warnings={result.warnings} />
    </div>
  );
}

// ============================================
// MAIN SIMULATOR PANEL
// ============================================

export function SimulatorPanel() {
  const {
    state,
    isSimulating,
    simulationResult,
    runSimulation,
  } = useBlueprintWorkspace();

  const [selectedProfile, setSelectedProfile] = useState<SimulationProfile>('RANDOM_GUESSER');

  // Manual simulation only - removed auto-run to prevent infinite loops
  // Users click "Run" button to trigger simulation

  const handleRunSimulation = useCallback(() => {
    runSimulation(selectedProfile);
  }, [runSimulation, selectedProfile]);

  const canSimulate = state.competencies.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/10">
      {/* Persona Selector Header */}
      <div className="p-3 border-b bg-background/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Test Persona</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 rounded-lg"
            onClick={handleRunSimulation}
            disabled={isSimulating || !canSimulate}
          >
            {isSimulating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Run
          </Button>
        </div>

        <PersonaSelector
          selected={selectedProfile}
          onSelect={setSelectedProfile}
          disabled={isSimulating}
        />
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3">
          {!canSimulate ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Add competencies to simulate</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                The simulator will preview test behavior
              </p>
            </div>
          ) : isSimulating && !simulationResult ? (
            <SimulationSkeleton />
          ) : simulationResult ? (
            <Suspense fallback={<SimulationSkeleton />}>
              <SimulationResults
                result={simulationResult}
                profile={selectedProfile}
                passingScore={state.passingScore}
              />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Play className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Click Run to simulate</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
