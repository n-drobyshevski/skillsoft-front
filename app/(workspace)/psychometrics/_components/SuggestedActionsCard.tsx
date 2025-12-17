'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

export interface SuggestedAction {
  /** Action title */
  title: string;
  /** Action description */
  description?: string;
  /** Icon for the action */
  icon?: LucideIcon;
  /** Priority level */
  priority?: 'high' | 'medium' | 'low';
  /** Action handler */
  onAction?: () => void;
  /** Action button label */
  actionLabel?: string;
  /** Whether action is completed */
  completed?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

interface SuggestedActionsCardProps {
  /** Title for the card */
  title?: string;
  /** List of suggested actions */
  actions: SuggestedAction[];
  /** Additional className */
  className?: string;
  /** Maximum actions to show initially */
  maxVisible?: number;
  /** Show expand button for more actions */
  expandable?: boolean;
}

const priorityStyles = {
  high: {
    container: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    label: 'Критично',
  },
  medium: {
    container: 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    label: 'Рекомендуется',
  },
  low: {
    container: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    label: 'Опционально',
  },
};

/**
 * ActionItem - Individual action item component
 */
function ActionItem({
  action,
  className,
}: {
  action: SuggestedAction;
  className?: string;
}) {
  const Icon = action.icon || ArrowRight;
  const priority = action.priority || 'medium';
  const styles = priorityStyles[priority];

  return (
    <div
      className={cn(
        'p-3 rounded-lg transition-colors',
        action.completed ? 'bg-emerald-50 dark:bg-emerald-950/20' : styles.container,
        action.disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {action.completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', styles.icon)} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'font-medium text-sm',
                action.completed && 'line-through text-muted-foreground'
              )}
            >
              {action.title}
            </p>
            {!action.completed && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
                  priority === 'medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
                  priority === 'low' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                )}
              >
                {styles.label}
              </span>
            )}
          </div>
          {action.description && (
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
          )}
          {action.onAction && !action.completed && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-xs"
              onClick={action.onAction}
              disabled={action.disabled}
            >
              {action.actionLabel || 'Выполнить'} <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SuggestedActionsCard - Card displaying recommended actions
 *
 * Shows a list of suggested actions with priority indicators,
 * descriptions, and optional action buttons.
 */
export function SuggestedActionsCard({
  title = 'Рекомендуемые действия',
  actions,
  className,
  maxVisible = 5,
}: SuggestedActionsCardProps) {
  // Sort actions by priority (high first)
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']);
  });

  const visibleActions = sortedActions.slice(0, maxVisible);
  const remainingCount = sortedActions.length - maxVisible;

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleActions.map((action, index) => (
            <ActionItem key={index} action={action} />
          ))}
        </div>
        {remainingCount > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            + еще {remainingCount} рекомендаций
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * InlineActionsList - Simpler list without card wrapper
 */
export function InlineActionsList({
  actions,
  className,
}: {
  actions: SuggestedAction[];
  className?: string;
}) {
  if (actions.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {actions.map((action, index) => (
        <ActionItem key={index} action={action} />
      ))}
    </div>
  );
}
