'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Target,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
} from 'lucide-react';
import { ONetSearchCombobox } from './ONetSearchCombobox';
import type { ONetProfile, ONetBenchmark } from '@/types/domain';

// Types

interface JobFitConfigPanelProps {
  /** Additional class names */
  className?: string;
}

// Strictness Levels — labels/descriptions come from i18n (strictness.levels.*),
// only the threshold→key/color mapping is static here.

const STRICTNESS_LEVELS: Record<number, { key: string; color: string }> = {
  20: { key: 'lenient', color: 'text-green-600' },
  40: { key: 'moderate', color: 'text-teal-600' },
  60: { key: 'standard', color: 'text-blue-600' },
  80: { key: 'strict', color: 'text-orange-600' },
  100: { key: 'exact', color: 'text-red-600' },
};

function getStrictnessLevel(value: number) {
  const thresholds = [20, 40, 60, 80, 100];
  const closest = thresholds.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
  return STRICTNESS_LEVELS[closest];
}

// Component

export function JobFitConfigPanel({
  className,
}: JobFitConfigPanelProps) {
  const form = useFormContext();
  const t = useTranslations('help.scenario.jobFit');
  const [onetProfile, setOnetProfile] = useState<ONetProfile | null>(null);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [showAllBenchmarks, setShowAllBenchmarks] = useState(false);

  const onetSocCode = form.watch('onetSocCode');
  const strictnessLevel = form.watch('strictnessLevel') ?? 60;
  const enableDeltaTesting = form.watch('enableDeltaTesting') ?? false;

  // Handle O*NET selection
  const handleONetChange = (socCode: string | undefined, profile?: ONetProfile) => {
    form.setValue('onetSocCode', socCode || '', { shouldDirty: true });
    if (profile) {
      setOnetProfile(profile);
      setShowAllBenchmarks(false);
    } else {
      setOnetProfile(null);
    }
  };

  const strictnessInfo = getStrictnessLevel(strictnessLevel);
  const strictnessLabel = t(`strictness.levels.${strictnessInfo.key}.label`);
  const strictnessDesc = t(`strictness.levels.${strictnessInfo.key}.desc`);

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
              {t('ui.targetJobRole')}
              <HelpTooltip content={t('onetRole')} variant="info" />
            </FormLabel>
            <FormControl>
              <ONetSearchCombobox
                value={field.value}
                onChange={handleONetChange}
                placeholder={t('ui.searchPlaceholder')}
              />
            </FormControl>
            <FormDescription>
              {t('roleDescription')}
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
                <div
                  role="button"
                  tabIndex={0}
                  className="flex w-full items-center justify-between cursor-pointer rounded-md p-0 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      {t('ui.benchmarkPreview')}
                      <HelpTooltip content={t('benchmark')} variant="info" size="sm" />
                    </CardTitle>
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {t('ui.competenciesCount', { count: onetProfile.benchmarks.length })}
                    </Badge>
                  </div>
                  {benchmarkOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CardDescription className="text-xs mt-1">
                {onetProfile.occupationTitle}
              </CardDescription>
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-2">
                  {/* Show 3 on mobile, 5 on desktop by default; all when expanded */}
                  {(showAllBenchmarks
                    ? onetProfile.benchmarks
                    : onetProfile.benchmarks.slice(0, 5)
                  ).map((benchmark, idx) => (
                    <BenchmarkItem
                      key={benchmark.competencyCode}
                      benchmark={benchmark}
                      className={!showAllBenchmarks && idx >= 3 ? 'hidden sm:flex' : undefined}
                    />
                  ))}
                  {!showAllBenchmarks && onetProfile.benchmarks.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllBenchmarks(true)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-1 transition-colors"
                    >
                      {t('ui.showAllCompetencies', { count: onetProfile.benchmarks.length })}
                    </button>
                  )}
                  {showAllBenchmarks && onetProfile.benchmarks.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllBenchmarks(false)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-1 transition-colors"
                    >
                      {t('ui.showLess')}
                    </button>
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
                {t('ui.strictnessLevel')}
                <HelpTooltip content={t('strictness.description')} variant="help" />
              </FormLabel>
              <Badge variant="outline" className={cn('text-xs', strictnessInfo.color)}>
                {strictnessLabel}
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
                  <span className="text-[10px] text-muted-foreground">{t('strictness.levels.lenient.label')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('strictness.levels.exact.label')}</span>
                </div>
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              {strictnessDesc}
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Competency Passport & Delta Testing */}
      <div className="border-t pt-4">
        <Card className={cn(
          'border-dashed transition-colors',
          enableDeltaTesting
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
            : 'border-border'
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg transition-colors',
                  enableDeltaTesting
                    ? 'bg-amber-100 dark:bg-amber-900/50'
                    : 'bg-muted'
                )}>
                  <Shield className={cn(
                    'h-5 w-5 transition-colors',
                    enableDeltaTesting
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  )} />
                </div>
                <div>
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    {t('passportTitle')}
                    <HelpTooltip content={t('passport')} variant="info" />
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t('passportDesc')}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Delta Testing Toggle */}
            <FormField
              control={form.control}
              name="enableDeltaTesting"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Zap className={cn(
                      'h-4 w-4 shrink-0 mt-0.5',
                      field.value ? 'text-amber-500' : 'text-muted-foreground'
                    )} />
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        {t('enableDelta')}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {t('enableDeltaDesc')}
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!onetSocCode}
                      className={cn(
                        field.value && 'data-[state=checked]:bg-amber-500'
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Status explanation */}
            <p className="text-xs text-muted-foreground px-1">
              {enableDeltaTesting ? t('deltaEnabled') : t('deltaDisabled')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning if no job selected */}
      {!onetSocCode && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-amber-800 dark:text-amber-200">
            {t('ui.noRoleWarning')}
          </span>
        </div>
      )}
    </div>
  );
}

// Benchmark Item Subcomponent

interface BenchmarkItemProps {
  benchmark: ONetBenchmark;
  className?: string;
}

function BenchmarkItem({ benchmark, className }: BenchmarkItemProps) {
  const t = useTranslations('help.scenario.jobFit');
  // Level is 1-7 scale, importance is 1-5 scale
  const levelPercent = ((benchmark.requiredLevel - 1) / 6) * 100;
  const importancePercent = ((benchmark.importance - 1) / 4) * 100;

  return (
    <div className={cn("flex items-center justify-between py-1.5 px-2 rounded-md bg-background/50", className)}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-xs font-medium truncate">{benchmark.competencyName}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {/* Level indicator */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{t('ui.levelShort')}</span>
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
