import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalBadge, getGoalConfig } from './GoalBadge';
import { TemplateStats } from './TemplateStats';
import type { TemplateCardData } from '@/types/domain';
import { cn } from '@/lib/utils';

interface TemplateInfoCardProps {
  template: TemplateCardData;
  /** Slot: action buttons (Start/View/Edit) */
  actions: React.ReactNode;
  /** Slot: permission badge, shared-by attribution, etc. */
  metadata?: React.ReactNode;
  /** 'card' for vertical card, 'compact' for smaller variant */
  variant?: 'card' | 'compact';
  className?: string;
}

/**
 * TemplateInfoCard - Composite card with slots for actions and metadata.
 *
 * Provides a consistent layout for template cards across
 * Available Tests and Shared with Me views.
 */
export function TemplateInfoCard({
  template,
  actions,
  metadata,
  variant = 'card',
  className,
}: TemplateInfoCardProps) {
  const goalConfig = getGoalConfig(template.goal);

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'group relative flex flex-col rounded-xl border transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5',
          className
        )}
      >
        {/* Permission indicator strip */}
        <div
          className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-xl', goalConfig.iconBgClass)}
          aria-hidden="true"
        />

        <div className="p-3 pt-4 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium truncate flex-1">{template.name}</h4>
            {metadata}
          </div>

          {/* Goal badge */}
          <GoalBadge goal={template.goal} variant="outline" className="mb-2" />

          {/* Stats */}
          <TemplateStats template={template} variant="inline" className="mb-3" />

          {/* Actions slot */}
          {actions}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">{template.name}</CardTitle>
            {template.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {template.description}
              </p>
            )}
          </div>
          {metadata}
        </div>

        {/* Goal badge */}
        <GoalBadge goal={template.goal} variant="outline" />
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Stats */}
        <TemplateStats template={template} variant="inline" />

        {/* Actions slot */}
        {actions}
      </CardContent>
    </Card>
  );
}
