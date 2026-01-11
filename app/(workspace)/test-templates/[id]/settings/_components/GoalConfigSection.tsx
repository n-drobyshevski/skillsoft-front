'use client';

import React, { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, Users, Crosshair, Settings } from 'lucide-react';
import { AssessmentGoal } from '@/types/domain';
import {
  OverviewConfigPanel,
  JobFitConfigPanel,
  TeamFitConfigPanel,
} from '@/components/blueprint-config';
import { useTranslations } from 'next-intl';

// ============================================================================
// Types
// ============================================================================

interface GoalConfigSectionProps {
  /** Number of competencies selected in the template */
  selectedCompetencyCount: number;
  /** Optional candidate Clerk user ID for Job Fit delta testing */
  candidateClerkUserId?: string | null;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Goal Visual Config
// ============================================================================

const goalVisualConfig: Record<
  AssessmentGoal,
  {
    icon: typeof Briefcase;
    borderColor: string;
    bgColor: string;
    accentColor: string;
  }
> = {
  [AssessmentGoal.OVERVIEW]: {
    icon: Crosshair,
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
  },
  [AssessmentGoal.JOB_FIT]: {
    icon: Briefcase,
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  [AssessmentGoal.TEAM_FIT]: {
    icon: Users,
    borderColor: 'border-violet-500/50',
    bgColor: 'bg-violet-50/50 dark:bg-violet-950/20',
    accentColor: 'text-violet-600 dark:text-violet-400',
  },
};

// ============================================================================
// Default Blueprint Values
// ============================================================================

const defaultBlueprintValues: Record<AssessmentGoal, Record<string, unknown>> = {
  [AssessmentGoal.OVERVIEW]: {
    includeBigFive: true,
    preferredDifficulty: 'INTERMEDIATE',
  },
  [AssessmentGoal.JOB_FIT]: {
    onetSocCode: '',
    strictnessLevel: 60,
    enableDeltaTesting: false,
    candidateClerkUserId: '',
  },
  [AssessmentGoal.TEAM_FIT]: {
    teamId: '',
    saturationThreshold: 0.7,
  },
};

// ============================================================================
// Component
// ============================================================================

export function GoalConfigSection({
  selectedCompetencyCount,
  candidateClerkUserId,
  className,
}: GoalConfigSectionProps) {
  const form = useFormContext();
  const t = useTranslations('template');
  const previousGoalRef = useRef<AssessmentGoal | null>(null);

  // Watch the goal field to react to changes
  const goal = useWatch({
    control: form.control,
    name: 'goal',
  }) as AssessmentGoal;

  // Reset blueprint fields when goal changes
  useEffect(() => {
    // Skip on initial mount (when previousGoalRef is null)
    if (previousGoalRef.current !== null && previousGoalRef.current !== goal) {
      // Reset to default values for the new goal
      // Safe: goal is a typed enum value from AssessmentGoal, not user input
      // eslint-disable-next-line security/detect-object-injection
      const defaults = defaultBlueprintValues[goal];
      Object.entries(defaults).forEach(([key, value]) => {
        form.setValue(key, value, { shouldDirty: true });
      });
    }
    previousGoalRef.current = goal;
  }, [goal, form]);

  // Safe: goal is a typed enum value from AssessmentGoal, not user input
  // eslint-disable-next-line security/detect-object-injection
  const visualConfig = goalVisualConfig[goal];
  const Icon = visualConfig.icon;

  return (
    <Card
      className={cn(
        'border-2 transition-all duration-300',
        visualConfig.borderColor,
        visualConfig.bgColor,
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              goal === AssessmentGoal.OVERVIEW && 'bg-emerald-100 dark:bg-emerald-900/50',
              goal === AssessmentGoal.JOB_FIT && 'bg-blue-100 dark:bg-blue-900/50',
              goal === AssessmentGoal.TEAM_FIT && 'bg-violet-100 dark:bg-violet-900/50'
            )}
          >
            <Icon className={cn('h-5 w-5', visualConfig.accentColor)} />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-muted-foreground" />
              {t('goalConfig')}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {t('goalConfigDesc')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Render the appropriate config panel based on goal */}
        {goal === AssessmentGoal.OVERVIEW && (
          <OverviewConfigPanel selectedCompetencyCount={selectedCompetencyCount} />
        )}

        {goal === AssessmentGoal.JOB_FIT && (
          <JobFitConfigPanel candidateClerkUserId={candidateClerkUserId} />
        )}

        {goal === AssessmentGoal.TEAM_FIT && <TeamFitConfigPanel />}
      </CardContent>
    </Card>
  );
}

export default GoalConfigSection;
