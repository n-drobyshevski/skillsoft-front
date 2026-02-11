'use client';

import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import {
  Brain,
  Sparkles,
  BarChart3,
  Clock,
  Target,
  Lightbulb,
  ListChecks,
  Heart,
  Shield,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface OverviewConfigPanelProps {
  selectedCompetencyCount: number;
  className?: string;
}

// ============================================================================
// Big Five Info Cards
// ============================================================================

const BIG_FIVE_TRAITS = [
  { key: 'OPENNESS', name: 'O', fullName: 'Openness', icon: Lightbulb, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  { key: 'CONSCIENTIOUSNESS', name: 'C', fullName: 'Conscientiousness', icon: ListChecks, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { key: 'EXTRAVERSION', name: 'E', fullName: 'Extraversion', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  { key: 'AGREEABLENESS', name: 'A', fullName: 'Agreeableness', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
  { key: 'EMOTIONAL_STABILITY', name: 'ES', fullName: 'Emotional Stability', icon: Shield, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
];

// ============================================================================
// Component
// ============================================================================

export function OverviewConfigPanel({
  selectedCompetencyCount,
  className,
}: OverviewConfigPanelProps) {
  const form = useFormContext();
  const t = useTranslations('help.scenario.overview');

  // Calculate estimated questions and time
  const estimatedQuestions = useMemo(() => {
    const questionsPerIndicator = form.watch('questionsPerIndicator') || 2;
    // Assume ~3 indicators per competency on average
    const avgIndicators = 3;
    return selectedCompetencyCount * avgIndicators * questionsPerIndicator;
  }, [selectedCompetencyCount, form]);

  const estimatedTime = useMemo(() => {
    // ~30 seconds per question on average
    return Math.ceil(estimatedQuestions * 0.5);
  }, [estimatedQuestions]);

  const includeBigFive = form.watch('includeBigFive');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Big Five Toggle Card */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  Big Five Personality
                  <HelpTooltip content={t('bigFive.description')} variant="info" size="sm" />
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Include OCEAN personality profiling in results
                </CardDescription>
              </div>
            </div>
            <FormField
              control={form.control}
              name="includeBigFive"
              render={({ field }) => (
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </FormControl>
              )}
            />
          </div>
        </CardHeader>

        {includeBigFive && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-5 gap-2">
              {BIG_FIVE_TRAITS.map((trait) => {
                const Icon = trait.icon;
                const traitKey = trait.key === 'EMOTIONAL_STABILITY'
                  ? 'emotionalStability'
                  : trait.key.toLowerCase() as 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness';
                return (
                  <TooltipProvider key={trait.key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex flex-col items-center p-2 rounded-lg text-center cursor-help',
                            trait.bg
                          )}
                        >
                          <Icon className={cn('h-4 w-4 mb-1', trait.color)} />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {trait.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs">
                        {t(`bigFive.traits.${traitKey}`)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Difficulty Preference */}
      <FormField
        control={form.control}
        name="preferredDifficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Preferred Difficulty
              <HelpTooltip content={t('difficulty.description')} variant="help" />
            </FormLabel>
            <Select value={field.value || 'INTERMEDIATE'} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="BASIC">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                      Basic
                    </Badge>
                    <span className="text-xs text-muted-foreground">Entry-level questions</span>
                  </div>
                </SelectItem>
                <SelectItem value="INTERMEDIATE">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      Intermediate
                    </Badge>
                    <span className="text-xs text-muted-foreground">Standard complexity</span>
                  </div>
                </SelectItem>
                <SelectItem value="ADVANCED">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                      Advanced
                    </Badge>
                    <span className="text-xs text-muted-foreground">Senior-level scenarios</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Controls the complexity of situational judgment questions
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Estimation Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span>{selectedCompetencyCount} competencies selected</span>
              <HelpTooltip content={t('estimation.questions')} variant="info" size="sm" />
            </div>
            <Badge variant="outline" className="font-mono">
              ~{estimatedQuestions} questions
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Estimated duration</span>
              <HelpTooltip content={t('estimation.duration')} variant="info" size="sm" />
            </div>
            <Badge variant="secondary">~{estimatedTime} min</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverviewConfigPanel;
