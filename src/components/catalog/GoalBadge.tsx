/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */
import { Badge } from '@/components/ui/badge';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';
import { Briefcase, Crosshair, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Goal badge visual configuration.
 * Unified from SharedTemplatesGrid.goalBadgeConfig and TestTemplateCard.GOAL_CONFIG.
 */
const GOAL_CONFIG = {
  [AssessmentGoal.OVERVIEW]: {
    icon: Crosshair,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    borderClass: 'border-l-emerald-500',
    iconBgClass: 'bg-emerald-500/10',
    iconTextClass: 'text-emerald-600 dark:text-emerald-400',
  },
  [AssessmentGoal.JOB_FIT]: {
    icon: Briefcase,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    borderClass: 'border-l-blue-500',
    iconBgClass: 'bg-blue-500/10',
    iconTextClass: 'text-blue-600 dark:text-blue-400',
  },
  [AssessmentGoal.TEAM_FIT]: {
    icon: Users,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    borderClass: 'border-l-violet-500',
    iconBgClass: 'bg-violet-500/10',
    iconTextClass: 'text-violet-600 dark:text-violet-400',
  },
} as const;

export type GoalConfigEntry = (typeof GOAL_CONFIG)[AssessmentGoal];

/**
 * Get the full goal config for a given goal.
 */
export function getGoalConfig(goal: AssessmentGoal | undefined): GoalConfigEntry {
  return GOAL_CONFIG[goal || AssessmentGoal.OVERVIEW];
}

interface GoalBadgeProps {
  goal: AssessmentGoal;
  /** 'badge' shows icon+label in a Badge, 'outline' uses outline badge variant */
  variant?: 'badge' | 'outline';
  className?: string;
}

/**
 * GoalBadge - Shared goal badge component for template cards.
 *
 * Extracted from duplicated config in SharedTemplatesGrid and TestTemplateCard.
 */
export function GoalBadge({ goal, variant = 'badge', className }: GoalBadgeProps) {
  const config = GOAL_CONFIG[goal];
  const GoalIcon = config.icon;
  const goalInfo = AssessmentGoalInfo[goal];

  if (variant === 'outline') {
    return (
      <Badge variant="outline" className={cn('w-fit text-xs', config.badgeClass, className)}>
        {goalInfo.displayName}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium px-2 py-0.5', config.badgeClass, className)}
    >
      <GoalIcon className="h-3 w-3 mr-1" />
      {goalInfo.displayName}
    </Badge>
  );
}
