'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AssessmentGoal } from '@/types/domain';
import {
  Crosshair,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react';

// Types

interface GoalSelectorProps {
  value: AssessmentGoal;
  onChange: (goal: AssessmentGoal) => void;
  disabled?: boolean;
  className?: string;
}

interface GoalOption {
  value: AssessmentGoal;
  icon: React.ComponentType<{ className?: string }>;
  /** `help.scenario.<scenarioKey>` namespace segment for this goal's UI copy. */
  scenarioKey: 'overview' | 'jobFit' | 'teamFit';
  className: string;
  selectedClassName: string;
  iconColor: string;
}

// Configuration
// Display text is internationalized: title/description come from the
// `enums.assessmentGoal` namespace, and the feature bullets + estimated time
// from `help.scenario.<scenarioKey>.ui`.

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: AssessmentGoal.OVERVIEW,
    icon: Crosshair,
    scenarioKey: 'overview',
    className: 'border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30',
    selectedClassName: 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm',
    iconColor: 'text-primary',
  },
  {
    value: AssessmentGoal.JOB_FIT,
    icon: Briefcase,
    scenarioKey: 'jobFit',
    className: 'border-border/60 bg-card hover:border-blue-500/50 hover:bg-blue-500/5',
    selectedClassName: 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 shadow-sm',
    iconColor: 'text-blue-500',
  },
  {
    value: AssessmentGoal.TEAM_FIT,
    icon: Users,
    scenarioKey: 'teamFit',
    className: 'border-border/60 bg-card hover:border-purple-500/50 hover:bg-purple-500/5',
    selectedClassName: 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500 shadow-sm',
    iconColor: 'text-purple-500',
  },
];

// Component

export function GoalSelector({
  value,
  onChange,
  disabled = false,
  className,
}: GoalSelectorProps) {
  const tGoals = useTranslations('enums.assessmentGoal');
  const tScenario = useTranslations('help.scenario');
  const selectedScenarioKey =
    GOAL_OPTIONS.find((o) => o.value === value)?.scenarioKey ?? 'overview';
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as AssessmentGoal)}
      disabled={disabled}
      className={cn('grid gap-4', className)}
    >
      {/* Mobile: Stack vertically, Desktop: 3 columns */}
      <div className="grid gap-3 sm:grid-cols-3">
        {GOAL_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          const scenarioKey = option.scenarioKey;
          const features = [
            tScenario(`${scenarioKey}.ui.goalFeature1`),
            tScenario(`${scenarioKey}.ui.goalFeature2`),
            tScenario(`${scenarioKey}.ui.goalFeature3`),
          ];

          return (
            <div key={option.value} className="relative group">
              <RadioGroupItem
                value={option.value}
                id={`goal-${option.value}`}
                className="sr-only"
              />
              <Label
                htmlFor={`goal-${option.value}`}
                className={cn(
                  // Base styles
                  'flex flex-col rounded-2xl border p-4 cursor-pointer transition-all duration-200',
                  'w-full h-full relative overflow-hidden',
                  // Touch feedback
                  'active:scale-[0.98]',
                  // State styles
                  isSelected ? option.selectedClassName : option.className,
                  // Disabled state
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 animate-in zoom-in duration-200">
                    <CheckCircle2 className="h-5 w-5 text-current fill-background" />
                  </div>
                )}

                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-xl transition-colors',
                      isSelected ? 'bg-background shadow-sm' : 'bg-muted group-hover:bg-background'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', option.iconColor)} />
                  </div>
                  <div>
                    <p className={cn('font-bold text-sm', isSelected && option.iconColor)}>
                      {tGoals(option.value)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tGoals(`${option.value}_DESC`)}
                    </p>
                  </div>
                </div>

                {/* Features list - hidden on mobile, shown on tablet+ */}
                <div className="hidden sm:block space-y-1.5 mt-2 pt-3 border-t border-dashed">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="h-3 w-3 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Estimated time badge */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    ~{tScenario(`${scenarioKey}.ui.goalTime`)}
                  </span>
                </div>
              </Label>
            </div>
          );
        })}
      </div>

      {/* Goal description footer for mobile */}
      <div className="sm:hidden p-3 rounded-xl bg-muted/50 border">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">
              {tGoals(value)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {[
                tScenario(`${selectedScenarioKey}.ui.goalFeature1`),
                tScenario(`${selectedScenarioKey}.ui.goalFeature2`),
                tScenario(`${selectedScenarioKey}.ui.goalFeature3`),
              ].join(' | ')}
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  );
}

export default GoalSelector;
