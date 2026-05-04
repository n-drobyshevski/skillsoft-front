'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type AnswerSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: AnswerSaveStatus;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SaveIndicator - Subtle visual feedback for answer submission state.
 *
 * Displays a small "Saving..." / "Saved" / "Save failed" indicator
 * that auto-hides after 2 seconds on success. Designed for the dark
 * test player UI (neutral-950 background).
 *
 * Accessibility: uses role="status" and aria-live="polite" so screen
 * readers announce state changes without interrupting the user.
 */
export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      setVisible(false);
      return;
    }

    setVisible(true);

    // Auto-hide "saved" after 2 seconds
    if (status === 'saved') {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm',
            status === 'saving' && 'text-[var(--zen-text-secondary)] bg-[var(--zen-track)]',
            status === 'saved' && 'text-[var(--zen-success)] bg-[var(--zen-success-subtle)]',
            status === 'error' && 'text-[var(--zen-danger)] bg-[var(--zen-danger-subtle)]',
            className,
          )}
          role="status"
          aria-live="polite"
        >
          {status === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {status === 'saved' && (
            <>
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-3 w-3" />
              <span>Save failed</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
