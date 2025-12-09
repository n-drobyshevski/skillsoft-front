"use client";

import React, { useState, useCallback, Suspense, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  LineChart as LineChartIcon,
  SlidersHorizontal,
  HelpCircle,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useBlueprintWorkspace } from './BlueprintWorkspaceProvider';
import { SimulationProfile, SimulationResult, SelectionReason, Difficulty } from '../actions';

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

      {/* Warnings */}
      <WarningsList warnings={result.warnings} />
    </div>
  );
}

// ============================================
// ANALYTICS TABS
// ============================================

const difficultyColors: Record<Difficulty, string> = {
  FOUNDATIONAL: '#22c55e',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#f97316',
  EXPERT: '#ef4444',
};

const difficultyLevelMap: Record<Difficulty, number> = {
  FOUNDATIONAL: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

const selectionReasonLabels: Record<SelectionReason, string> = {
  COVERAGE_GAP: 'Coverage gap',
  CALIBRATION: 'Calibration',
  ADAPTIVE_CHECK: 'Adaptive check',
  RANDOMIZED: 'Randomized',
  BACKSTOP: 'Backstop',
};

function AnalyticsTab({ result }: { result: SimulationResult }) {
  const competencyData = useMemo(() => {
    if (result.distributionByCompetency?.length) {
      return result.distributionByCompetency.map((entry) => ({
        name: entry.competencyName,
        value: entry.questionCount,
      }));
    }

    return Object.entries(result.composition).map(([name, value]) => ({
      name,
      value,
    }));
  }, [result]);

  const difficultyData = useMemo(() => {
    const distribution = result.distributionByDifficulty || result.difficultyDistribution;
    return Object.entries(distribution).map(([difficulty, value]) => ({
      name: difficulty,
      value,
    }));
  }, [result]);

  const selectionData = useMemo(() => {
    return Object.entries(result.selectionReasons || {}).map(([reason, value]) => ({
      name: selectionReasonLabels[reason as SelectionReason] || reason,
      value,
    }));
  }, [result]);

  const difficultyLineData = useMemo(() => {
    return (result.sampleQuestions || []).map((q, index) => {
      const difficulty = (q.difficulty || 'INTERMEDIATE') as Difficulty;
      return {
        index: index + 1,
        label: `Q${index + 1}`,
        difficulty,
        difficultyValue: difficultyLevelMap[difficulty] ?? 2,
        text: q.text,
      };
    });
  }, [result.sampleQuestions]);

  const colors = ['#6366f1', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Coverage by competency</span>
          </div>
          {competencyData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No competencies selected</p>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={competencyData} dataKey="value" nameKey="name" outerRadius={80}>
                    {competencyData.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
            {competencyData.map((entry, index) => (
              <span
                key={entry.name}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-background"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Difficulty balance</span>
          </div>
          {difficultyData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No difficulty data</p>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer>
                <BarChart data={difficultyData} margin={{ top: 10, left: 0, right: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <RechartTooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {difficultyData.map((entry) => (
                      <Cell key={entry.name} fill={difficultyColors[entry.name as Difficulty] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">

        {/* <div className="p-3 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Adaptive curve</span>
          </div>
          {difficultyLineData.length === 0 ? (
            <p className="text-xs text-muted-foreground">Run a simulation to view the adaptive path</p>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={difficultyLineData} margin={{ top: 10, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                    domain={[1, 4]}
                    tickFormatter={(value) => {
                      const entry = Object.entries(difficultyLevelMap).find(([, v]) => v === value);
                      return entry ? entry[0].charAt(0) + entry[0].toLowerCase().slice(1, 3) : value;
                    }}
                  />
                  <RechartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const datum = payload[0].payload as { label: string; difficulty: Difficulty; text: string };
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs max-w-xs">
                          <div className="font-semibold mb-1">
                            {datum.label} · {datum.difficulty}
                          </div>
                          <div className="text-muted-foreground line-clamp-3">{datum.text}</div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="difficultyValue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, stroke: '#6366f1', fill: '#ffffff' }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div> */}
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Selection reasons</span>
          </div>
          {selectionData.length === 0 ? (
            <p className="text-xs text-muted-foreground">Run a simulation to see selection logic</p>
          ) : (
            <div className="flex flex-wrap gap-2 text-[11px]">
              {selectionData.map((item) => (
                <Badge key={item.name} variant="outline" className="gap-1 rounded-full">
                  <span className="font-semibold text-xs">{item.value}</span>
                  {item.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TIMELINE TAB
// ============================================

function TimelineTab({ result }: { result: SimulationResult }) {
  const difficultyLineData = useMemo(() => {
    return (result.sampleQuestions || []).map((q, index) => {
      const difficulty = (q.difficulty || 'INTERMEDIATE') as Difficulty;
      return {
        index: index + 1,
        label: `Q${index + 1}`,
        difficulty,
        difficultyValue: difficultyLevelMap[difficulty] ?? 2,
        text: q.text,
      };
    });
  }, [result.sampleQuestions]);

  if (!result.sampleQuestions.length) {
    return <p className="text-xs text-muted-foreground">No sample questions available.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Adaptive curve</span>
        </div>
        {difficultyLineData.length === 0 ? (
          <p className="text-xs text-muted-foreground">Run a simulation to view the adaptive path</p>
        ) : (
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={difficultyLineData} margin={{ top: 10, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  domain={[1, 4]}
                  tickFormatter={(value) => {
                    const entry = Object.entries(difficultyLevelMap).find(([, v]) => v === value);
                    return entry ? entry[0].charAt(0) + entry[0].toLowerCase().slice(1, 3) : value;
                  }}
                />
                <RechartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const datum = payload[0].payload as { label: string; difficulty: Difficulty; text: string };
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs max-w-xs">
                        <div className="font-semibold mb-1">
                          {datum.label} · {datum.difficulty}
                        </div>
                        <div className="text-muted-foreground line-clamp-3">{datum.text}</div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="difficultyValue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, stroke: '#6366f1', fill: '#ffffff' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {result.sampleQuestions.map((question, index) => (
        <div
          key={question.id || index}
          className="flex items-start gap-3 p-3 rounded-xl border bg-background/80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {question.competencyName}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {question.difficulty}
                </Badge>
                {question.selectionReason && (
                  <Badge variant="outline" className="text-[10px]">
                    {selectionReasonLabels[question.selectionReason] || question.selectionReason}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                ~{Math.round(question.estimatedTimeSeconds / 60)}m
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-2">{question.text}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {question.indicatorTitle}
            </p>
            {typeof question.abilityDelta === 'number' && (
              <div className="text-[11px] text-muted-foreground">
                Ability shift: {question.abilityDelta > 0 ? '+' : ''}{question.abilityDelta}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// FINE TUNE TAB
// ============================================

interface FineTuneTabProps {
  strictness: number;
  onStrictnessChange: (value: number) => void;
  saturation: number;
  onSaturationChange: (value: number) => void;
  allowBacktracking: boolean;
  onAllowBacktrackingChange: (value: boolean) => void;
  onApply: () => void;
  onRun: () => void;
  disabled: boolean;
}

function FineTuneTab(props: FineTuneTabProps) {
  const {
    strictness,
    saturation,
    allowBacktracking,
    onStrictnessChange,
    onSaturationChange,
    onAllowBacktrackingChange,
    onApply,
    onRun,
    disabled,
  } = props;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Fine tune</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Strictness</span>
            <span className="font-semibold text-foreground">{strictness}</span>
          </div>
          <Slider
            value={[strictness]}
            min={0}
            max={100}
            step={1}
            onValueChange={(val) => onStrictnessChange(val[0])}
            disabled={disabled}
          />
          <p className="text-[11px] text-muted-foreground">
            Higher values tighten scoring and reduce randomness.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Item saturation guard</span>
            <span className="font-semibold text-foreground">{saturation}%</span>
          </div>
          <Slider
            value={[saturation]}
            min={10}
            max={100}
            step={5}
            onValueChange={(val) => onSaturationChange(val[0])}
            disabled={disabled}
          />
          <p className="text-[11px] text-muted-foreground">
            Prevents overusing the same competency pool across attempts.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-background/60">
          <div className="space-y-0.5">
            <Label className="text-sm">Allow backtracking</Label>
            <p className="text-[11px] text-muted-foreground">Let candidates revisit previous items.</p>
          </div>
          <Switch
            checked={allowBacktracking}
            onCheckedChange={onAllowBacktrackingChange}
            disabled={disabled}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onApply} disabled={disabled}>
            Save settings
          </Button>
          <Button className="flex-1" onClick={onRun} disabled={disabled}>
            {disabled ? 'Running...' : 'Apply & re-run'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELP TAB
// ============================================

function HelpTab() {
  return (
    <div className="space-y-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HelpCircle className="h-4 w-4" />
        How the Glass Box works
      </div>
      <p>
        The simulator runs an adaptive pass using your blueprint, showing why each question
        appears (selection reason), how competencies are balanced, and whether the candidate
        would pass under the current thresholds.
      </p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Use personas to stress-test difficulty bands.</li>
        <li>Watch the timeline to verify coverage and avoid over-reuse.</li>
        <li>Adjust strictness and saturation, then re-run to compare.</li>
      </ul>
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
    updateSettings,
  } = useBlueprintWorkspace();

  const [selectedProfile, setSelectedProfile] = useState<SimulationProfile>('RANDOM_GUESSER');
  const [strictness, setStrictness] = useState<number>(state.strictnessLevel ?? 50);
  const [saturation, setSaturation] = useState<number>(state.saturationThreshold ?? 70);
  const [allowBacktracking, setAllowBacktracking] = useState<boolean>(
    state.adaptivity?.allowBacktracking ?? true
  );

  useEffect(() => {
    setStrictness(state.strictnessLevel ?? 50);
    setSaturation(state.saturationThreshold ?? 70);
    setAllowBacktracking(state.adaptivity?.allowBacktracking ?? true);
  }, [state.strictnessLevel, state.saturationThreshold, state.adaptivity]);

  const applySettings = useCallback(() => {
    const adaptivity = state.adaptivity || { mode: 'ADAPTIVE_STANDARD', allowBacktracking: true };

    updateSettings({
      strictnessLevel: strictness,
      saturationThreshold: saturation,
      adaptivity: {
        ...adaptivity,
        allowBacktracking,
      },
    });
  }, [updateSettings, strictness, saturation, allowBacktracking, state.adaptivity]);

  const handleRunSimulation = useCallback(() => {
    applySettings();
    runSimulation(selectedProfile);
  }, [applySettings, runSimulation, selectedProfile]);

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
        <div className="p-3 space-y-4">
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

              <Tabs defaultValue="timeline" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="fine">Fine tune</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-3">
                  <TimelineTab result={simulationResult} />
                </TabsContent>

                <TabsContent value="analytics" className="mt-3">
                  <AnalyticsTab result={simulationResult} />
                </TabsContent>

                <TabsContent value="fine" className="mt-3">
                  <FineTuneTab
                    strictness={strictness}
                    onStrictnessChange={setStrictness}
                    saturation={saturation}
                    onSaturationChange={setSaturation}
                    allowBacktracking={allowBacktracking}
                    onAllowBacktrackingChange={setAllowBacktracking}
                    onApply={applySettings}
                    onRun={handleRunSimulation}
                    disabled={isSimulating}
                  />
                </TabsContent>

                <TabsContent value="help" className="mt-3">
                  <HelpTab />
                </TabsContent>
              </Tabs>
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
