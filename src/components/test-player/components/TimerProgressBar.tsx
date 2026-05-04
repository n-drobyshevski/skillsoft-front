'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { NUMERIC_COUNTDOWN_THRESHOLD } from '../hooks/useTestTimer';

/**
 * TimerProgressBar - Anxiety-reducing timer display for test sessions
 *
 * Replaces the always-visible numeric countdown with a visual progress bar.
 * - Progress bar is always shown (full -> empty as time runs out)
 * - Numeric countdown only appears when < 3 minutes remain
 * - Color transitions: primary (>30%) -> amber (10-30%) -> destructive (<10%)
 */

export interface TimerProgressBarProps {
  /** Total time in seconds the timer was started with */
  totalSeconds: number;
  /** Current remaining time in seconds */
  remainingSeconds: number;
  /** Compact formatted time string (M:SS) */
  compactFormattedTime: string;
  /** Whether timer is in warning state (<3 min) */
  isWarning: boolean;
  /** Whether timer is in critical state (<1 min) */
  isCritical: boolean;
}

export function TimerProgressBar({
  totalSeconds,
  remainingSeconds,
  compactFormattedTime,
  isWarning,
  isCritical,
}: TimerProgressBarProps) {
  const t = useTranslations('assessment');

  // Calculate remaining percentage
  const percentage = totalSeconds > 0
    ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
    : 0;

  // Determine progress bar color based on percentage thresholds
  const barColorClass = percentage < 10
    ? 'bg-destructive'
    : percentage < 30
      ? 'bg-amber-500'
      : 'bg-primary';

  // Show numeric countdown only when under the threshold (3 minutes)
  const showNumeric = remainingSeconds <= NUMERIC_COUNTDOWN_THRESHOLD;

  return (
    <div className="w-full">
      {/* Progress bar — always visible */}
      <div
        className="w-full h-1 bg-[var(--zen-track)] overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('timeRemaining')}
      >
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear',
            barColorClass,
            isCritical && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Numeric countdown — only when < 3 minutes remain */}
      <AnimatePresence>
        {showNumeric && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex justify-end px-3 md:px-4 lg:px-6 pt-1"
          >
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono tabular-nums transition-colors',
                isCritical
                  ? 'text-destructive animate-pulse'
                  : isWarning
                    ? 'text-[var(--zen-warning)]'
                    : 'text-[var(--zen-text-secondary)]'
              )}
              role="timer"
              aria-live={isCritical ? 'assertive' : 'polite'}
              aria-label={t('timer.remaining', {
                minutes: Math.floor(remainingSeconds / 60).toString(),
                seconds: (remainingSeconds % 60).toString().padStart(2, '0'),
              })}
            >
              <span>{compactFormattedTime}</span>
              <span className="text-[10px] opacity-70">
                {t('timer.warning')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TimerProgressBar;
