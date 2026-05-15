'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';
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
  features: string[];
  estimatedTime: string;
  className: string;
  selectedClassName: string;
  iconColor: string;
}

// Configuration

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: AssessmentGoal.OVERVIEW,
    icon: Crosshair,
    features: [
      'Competency Passport generation',
      'Big Five personality profile',
      'Full skill mapping',
    ],
    estimatedTime: '20-30 min',
    className: 'border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30',
    selectedClassName: 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm',
    iconColor: 'text-primary',
  },
  {
    value: AssessmentGoal.JOB_FIT,
    icon: Briefcase,
    features: [
      'O*NET benchmark comparison',
      'Gap analysis report',
      'Role-specific scoring',
    ],
    estimatedTime: '15-25 min',
    className: 'border-border/60 bg-card hover:border-blue-500/50 hover:bg-blue-500/5',
    selectedClassName: 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 shadow-sm',
    iconColor: 'text-blue-500',
  },
  {
    value: AssessmentGoal.TEAM_FIT,
    icon: Users,
    features: [
      'Team saturation analysis',
      'Skill gap identification',
      'Compatibility scoring',
    ],
    estimatedTime: '15-20 min',
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
          const info = AssessmentGoalInfo[option.value];
          const isSelected = value === option.value;

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
                      {info.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {info.description}
                    </p>
                  </div>
                </div>

                {/* Features list - hidden on mobile, shown on tablet+ */}
                <div className="hidden sm:block space-y-1.5 mt-2 pt-3 border-t border-dashed">
                  {option.features.map((feature, idx) => (
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
                    ~{option.estimatedTime}
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
              {AssessmentGoalInfo[value].displayName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {GOAL_OPTIONS.find(o => o.value === value)?.features.join(' | ')}
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  );
}

export default GoalSelector;
