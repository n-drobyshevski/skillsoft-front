'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Target,
  AlertCircle,
  CheckCircle2,
  Zap,
  Lock,
  Clock,
} from 'lucide-react';
import { ONetSearchCombobox } from './ONetSearchCombobox';
import type { ONetProfile, ONetBenchmark } from '@/types/domain';

// ============================================================================
// Types
// ============================================================================

interface JobFitConfigPanelProps {
  className?: string;
}

// ============================================================================
// Strictness Labels
// ============================================================================

const STRICTNESS_LABELS: Record<number, { label: string; description: string; color: string }> = {
  20: { label: 'Lenient', description: 'Broader candidate pool', color: 'text-green-600' },
  40: { label: 'Moderate', description: 'Balanced matching', color: 'text-teal-600' },
  60: { label: 'Standard', description: 'Industry typical', color: 'text-blue-600' },
  80: { label: 'Strict', description: 'High bar requirements', color: 'text-orange-600' },
  100: { label: 'Exact', description: 'Precise benchmark match', color: 'text-red-600' },
};

function getStrictnessLabel(value: number) {
  const thresholds = [20, 40, 60, 80, 100];
  const closest = thresholds.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
  return STRICTNESS_LABELS[closest];
}

// ============================================================================
// Component
// ============================================================================

export function JobFitConfigPanel({ className }: JobFitConfigPanelProps) {
  const form = useFormContext();
  const [onetProfile, setOnetProfile] = useState<ONetProfile | null>(null);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);

  const onetSocCode = form.watch('onetSocCode');
  const strictnessLevel = form.watch('strictnessLevel') ?? 60;
  const enableDeltaTesting = form.watch('enableDeltaTesting');

  // Handle O*NET selection
  const handleONetChange = useCallback(
    (socCode: string | undefined, profile?: ONetProfile) => {
      form.setValue('onetSocCode', socCode || '');
      if (profile) {
        setOnetProfile(profile);
        // Auto-expand benchmark preview when profile loads
        setBenchmarkOpen(true);
      } else {
        setOnetProfile(null);
      }
    },
    [form]
  );

  const strictnessInfo = getStrictnessLabel(strictnessLevel);

  return (
    <div className={cn('space-y-6', className)}>
      {/* O*NET Job Selection */}
      <FormField
        control={form.control}
        name="onetSocCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Target Job Role
            </FormLabel>
            <FormControl>
              <ONetSearchCombobox
                value={field.value}
                onChange={handleONetChange}
                placeholder="Search O*NET job titles..."
              />
            </FormControl>
            <FormDescription>
              Select the job role to benchmark candidates against
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Benchmark Preview (Collapsible) */}
      {onetProfile && (
        <Collapsible open={benchmarkOpen} onOpenChange={setBenchmarkOpen}>
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="py-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-sm">Benchmark Preview</CardTitle>
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {onetProfile.benchmarks.length} competencies
                    </Badge>
                  </div>
                  {benchmarkOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CardDescription className="text-xs mt-1">
                {onetProfile.occupationTitle}
              </CardDescription>
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-2">
                  {onetProfile.benchmarks.slice(0, 5).map((benchmark) => (
                    <BenchmarkItem key={benchmark.competencyCode} benchmark={benchmark} />
                  ))}
                  {onetProfile.benchmarks.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{onetProfile.benchmarks.length - 5} more competencies
                    </p>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Strictness Level Slider */}
      <FormField
        control={form.control}
        name="strictnessLevel"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                Strictness Level
              </FormLabel>
              <Badge variant="outline" className={cn('text-xs', strictnessInfo.color)}>
                {strictnessInfo.label}
              </Badge>
            </div>
            <FormControl>
              <div className="pt-4 pb-2 px-1">
                <Slider
                  value={[field.value ?? 60]}
                  onValueChange={([v]) => field.onChange(v)}
                  min={0}
                  max={100}
                  step={1}
                  className="touch-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Lenient</span>
                  <span className="text-[10px] text-muted-foreground">Exact</span>
                </div>
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              {strictnessInfo.description}
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Delta Testing Toggle */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Delta Testing
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-amber-600 border-amber-300">
                    Coming Soon
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Skip already-measured competencies from Passport
                </CardDescription>
              </div>
            </div>
            <FormField
              control={form.control}
              name="enableDeltaTesting"
              render={({ field }) => (
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                    className="data-[state=checked]:bg-amber-500"
                  />
                </FormControl>
              )}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Delta testing requires an existing Competency Passport. This feature will enable shorter
              assessments by reusing previous results.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Warning if no job selected */}
      {!onetSocCode && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-amber-800 dark:text-amber-200">
            Select a job role to configure Job Fit benchmarks
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Benchmark Item Subcomponent
// ============================================================================

interface BenchmarkItemProps {
  benchmark: ONetBenchmark;
}

function BenchmarkItem({ benchmark }: BenchmarkItemProps) {
  // Level is 1-7 scale, importance is 1-5 scale
  const levelPercent = ((benchmark.requiredLevel - 1) / 6) * 100;
  const importancePercent = ((benchmark.importance - 1) / 4) * 100;

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-background/50">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-xs font-medium truncate">{benchmark.competencyName}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {/* Level indicator */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Lvl</span>
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">
            {benchmark.requiredLevel.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default JobFitConfigPanel;
