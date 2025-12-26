'use client';

import React from 'react';
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
// CONTENT MAPPING
// ============================================

const EMPTY_STATE_CONTENT = {
  'no-competencies': {
    icon: Plus,
    title: 'Add competencies to simulate',
    description: {
      UNIVERSAL_BASELINE:
        'Drag competencies from the library to build a competency profile assessment',
      TARGETED_FIT: 'Add job-relevant competencies to simulate job fit scoring',
      DYNAMIC_GAP_ANALYSIS: 'Add team competencies to simulate gap analysis',
    },
    actionLabel: undefined,
  },
  'no-simulation': {
    icon: Play,
    title: 'Ready to simulate',
    description: {
      UNIVERSAL_BASELINE:
        'Click Run to preview how the assessment will evaluate competency breadth',
      TARGETED_FIT: 'Click Run to see predicted job fit scores based on persona profiles',
      DYNAMIC_GAP_ANALYSIS: 'Click Run to analyze individual vs team benchmark gaps',
    },
    actionLabel: 'Run Simulation',
  },
  'missing-config': {
    icon: AlertCircle,
    title: 'Configuration needed',
    description: {
      UNIVERSAL_BASELINE: 'No additional configuration required for this strategy',
      TARGETED_FIT:
        'Set an O*NET SOC code in template settings to enable job fit alignment insights',
      DYNAMIC_GAP_ANALYSIS:
        'Select a team in template settings to enable gap comparison features',
    },
    actionLabel: 'Go to Settings',
  },
} as const;

// ============================================
// MAIN COMPONENT
// ============================================

export function StrategyEmptyState({
  strategy,
  type,
  onAction,
  className,
}: StrategyEmptyStateProps) {
  const config = STRATEGY_CONFIG[strategy];
  const content = EMPTY_STATE_CONTENT[type];
  const StrategyIcon = STRATEGY_ICONS[strategy];
  const StateIcon = type === 'no-simulation' ? StrategyIcon : content.icon;
  const description = content.description[strategy];

  // For missing-config, use Settings icon instead
  const DisplayIcon = type === 'missing-config' ? Settings : StateIcon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
      role="status"
      aria-label={content.title}
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
      <p className="text-sm font-medium text-foreground">{content.title}</p>

      {/* Description */}
      <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
        {description}
      </p>

      {/* Action button */}
      {content.actionLabel && onAction && (
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
          {content.actionLabel}
        </Button>
      )}
    </div>
  );
}

export default StrategyEmptyState;
