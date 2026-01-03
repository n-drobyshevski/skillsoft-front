'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Circle,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type StageStatus = 'pending' | 'active' | 'complete' | 'failed';

interface AssemblyStageIndicatorProps {
  /** Stage title */
  title: string;
  /** Stage description */
  description: string;
  /** Current status of this stage */
  status: StageStatus;
  /** Whether this stage is currently active */
  isActive?: boolean;
  /** Optional progress for stages with sub-progress (e.g., SELECTING) */
  progress?: {
    current: number;
    total: number;
  };
  /** Optional className */
  className?: string;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG = {
  pending: {
    Icon: Circle,
    iconClass: 'text-muted-foreground/50',
    bgClass: 'bg-muted/30',
    textClass: 'text-muted-foreground',
  },
  active: {
    Icon: Loader2,
    iconClass: 'text-primary animate-spin',
    bgClass: 'bg-primary/10',
    textClass: 'text-foreground',
  },
  complete: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  failed: {
    Icon: XCircle,
    iconClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-700 dark:text-red-400',
  },
} as const;

// ============================================================================
// Component
// ============================================================================

export function AssemblyStageIndicator({
  title,
  description,
  status,
  isActive = false,
  progress,
  className,
}: AssemblyStageIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.Icon;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        config.bgClass,
        isActive && 'ring-1 ring-primary/20',
        className
      )}
    >
      {/* Status Icon */}
      <div className={cn('shrink-0', config.iconClass)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm font-medium', config.textClass)}>{title}</p>

          {/* Progress indicator for stages with sub-progress */}
          {progress && status === 'active' && (
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {progress.current}/{progress.total}
            </span>
          )}
        </div>

        {/* Description - only show for active/failed states */}
        {(status === 'active' || status === 'failed') && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-muted-foreground mt-0.5"
          >
            {description}
          </motion.p>
        )}

        {/* Progress bar for stages with sub-progress */}
        {progress && status === 'active' && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </div>

      {/* Completion indicator */}
      {status === 'complete' && (
        <ChevronRight className="h-4 w-4 text-emerald-500/50 shrink-0" />
      )}
    </motion.div>
  );
}

export default AssemblyStageIndicator;
