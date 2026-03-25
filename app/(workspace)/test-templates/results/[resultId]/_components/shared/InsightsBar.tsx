'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { InsightPill } from './types';

// ============================================================================
// Variant style map
// ============================================================================

const PILL_VARIANT_CLASSES = {
  success:
    'bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  warning:
    'bg-amber-500/[0.08] text-amber-600 dark:text-amber-400 border-amber-500/25',
  info:
    'bg-blue-500/[0.08] text-blue-600 dark:text-blue-400 border-blue-500/25',
} as const;

// ============================================================================
// Props
// ============================================================================

interface InsightsBarProps {
  insights: InsightPill[];
  /** Show dismiss buttons on pills (default: true) */
  dismissible?: boolean;
}

// ============================================================================
// InsightsBar — dismissible row of insight pills with animated exit
// ============================================================================

export function InsightsBar({ insights, dismissible = true }: InsightsBarProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = insights.filter((pill) => !dismissed.has(pill.id));

  if (visible.length === 0) return null;

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  return (
    <div className="sticky z-[25] top-[116px] bg-card border-b border-border flex flex-wrap items-center gap-2.5 px-6 py-2 lg:px-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:top-auto max-md:px-4 max-md:py-2">
      <AnimatePresence initial={false}>
        {visible.map((pill) => {
          const Icon = pill.icon;
          return (
            <motion.div
              key={pill.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-md',
                  'text-[11px] font-medium border',
                  PILL_VARIANT_CLASSES[pill.variant],
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {pill.text}
                {dismissible && (
                  <button
                    type="button"
                    aria-label={`Dismiss: ${pill.text}`}
                    onClick={() => dismiss(pill.id)}
                    className="w-6 h-6 rounded border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground ml-auto shrink-0 flex items-center justify-center cursor-pointer touch-manipulation transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
