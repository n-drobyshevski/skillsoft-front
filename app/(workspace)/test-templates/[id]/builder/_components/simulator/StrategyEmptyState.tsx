'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  ClipboardList,
  Briefcase,
  Users,
  Plus,
  Play,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from './strategy-context';

// ============================================
// TYPES
// ============================================

type EmptyStateType = 'no-competencies' | 'no-simulation' | 'missing-config';

interface StrategyEmptyStateProps {
  strategy: Strategy;
  type: EmptyStateType;
  onAction?: () => void;
  className?: string;
}

// ============================================
// ICON MAPPING
// ============================================

const STRATEGY_ICONS = {
  UNIVERSAL_BASELINE: ClipboardList,
  TARGETED_FIT: Briefcase,
  DYNAMIC_GAP_ANALYSIS: Users,
} as const;

// ============================================
// CONTENT KEY MAPPING
// ============================================

type StrategyKey = 'universal' | 'jobFit' | 'teamGap';

const STRATEGY_TO_KEY: Record<Strategy, StrategyKey> = {
  UNIVERSAL_BASELINE: 'universal',
  TARGETED_FIT: 'jobFit',
  DYNAMIC_GAP_ANALYSIS: 'teamGap',
};

interface EmptyStateKeyConfig {
  icon: React.ElementType;
  titleKey: string;
  descriptionKeyPrefix: string;
  actionLabelKey: string | null;
}

const EMPTY_STATE_KEY_CONFIG: Record<EmptyStateType, EmptyStateKeyConfig> = {
  'no-competencies': {
    icon: Plus,
    titleKey: 'emptyState.addCompetencies',
    descriptionKeyPrefix: 'emptyState.noCompetencies',
    actionLabelKey: null,
  },
  'no-simulation': {
    icon: Play,
    titleKey: 'emptyState.readyToSimulate',
    descriptionKeyPrefix: 'emptyState.noSimulation',
    actionLabelKey: 'runSimulation',
  },
  'missing-config': {
    icon: AlertCircle,
    titleKey: 'emptyState.configurationNeeded',
    descriptionKeyPrefix: 'emptyState.missingConfig',
    actionLabelKey: 'emptyState.goToSettings',
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function StrategyEmptyState({
  strategy,
  type,
  onAction,
  className,
}: StrategyEmptyStateProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];
  const keyConfig = EMPTY_STATE_KEY_CONFIG[type];
  const StrategyIcon = STRATEGY_ICONS[strategy];
  const strategyKey = STRATEGY_TO_KEY[strategy];

  const StateIcon = type === 'no-simulation' ? StrategyIcon : keyConfig.icon;
  const DisplayIcon = type === 'missing-config' ? Settings : StateIcon;

  const title = t(keyConfig.titleKey as Parameters<typeof t>[0]);
  const description = t(`${keyConfig.descriptionKeyPrefix}.${strategyKey}` as Parameters<typeof t>[0]);
  const actionLabel = keyConfig.actionLabelKey
    ? t(keyConfig.actionLabelKey as Parameters<typeof t>[0])
    : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon container with strategy theme */}
      <div
        className={cn(
          'p-4 rounded-2xl mb-4',
          type === 'missing-config'
            ? 'bg-amber-100 dark:bg-amber-900/30'
            : config.iconBg
        )}
      >
        <DisplayIcon
          className={cn(
            'h-8 w-8',
            type === 'missing-config'
              ? 'text-amber-600 dark:text-amber-400'
              : config.iconText
          )}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground">{title}</p>

      {/* Description */}
      <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
        {description}
      </p>

      {/* Action button */}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className={cn(
            'mt-4 gap-2',
            type !== 'missing-config' && config.focusColor
          )}
        >
          {type === 'no-simulation' ? (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default StrategyEmptyState;
