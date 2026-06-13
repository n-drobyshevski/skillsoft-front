'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut, ArrowLeft, Trash2, ShieldCheck, TriangleAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export interface AbandonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbandon: () => void;
  onDiscard: () => void;
  isSubmitting?: boolean;
  isDiscarding?: boolean;
}

/**
 * Shared button base. Hierarchy is expressed through fill/color/position — not
 * by shrinking hit areas, so every action stays ≥44px tall (min-h-11).
 */
const btnBase =
  'inline-flex w-full items-center justify-center gap-2 min-h-11 rounded-xl px-4 text-sm font-medium ' +
  'cursor-pointer select-none transition-all duration-150 ease-out motion-reduce:transition-none ' +
  'active:scale-[0.99] motion-reduce:active:scale-100 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-[var(--zen-bg)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export function AbandonDialog({
  open,
  onOpenChange,
  onAbandon,
  onDiscard,
  isSubmitting,
  isDiscarding,
}: AbandonDialogProps) {
  const t = useTranslations('assessment');
  const [phase, setPhase] = useState<'choose' | 'confirmDiscard'>('choose');

  // Reset to the first phase whenever the dialog closes (including when the
  // parent closes it externally) so a reopen always starts fresh. This is the
  // "adjust state during render" pattern — preferred over a setState-in-effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setPhase('choose');
  }

  const isBusy = isSubmitting || isDiscarding;

  return (
    <AlertDialog open={open} onOpenChange={isBusy ? undefined : onOpenChange}>
      <AlertDialogContent
        className={cn(
          'gap-0 rounded-2xl border-[var(--zen-border)] p-0',
          'bg-[var(--zen-surface)] text-[var(--zen-text)] backdrop-blur-xl',
          'shadow-2xl shadow-black/40 sm:max-w-[420px]',
        )}
      >
        {phase === 'choose' ? (
          <div className="flex flex-col items-center gap-5 p-6 text-center">
            {/* Calm, neutral badge — this path keeps all progress, so no alarm. */}
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--zen-border)] bg-[var(--zen-card)]"
            >
              <LogOut className="h-[22px] w-[22px] text-[var(--zen-text-secondary)]" />
            </span>

            <div className="flex flex-col gap-3">
              <AlertDialogTitle className="text-xl font-semibold tracking-tight text-[var(--zen-text)]">
                {t('exitTestQuestion')}
              </AlertDialogTitle>

              {/* Reassurance band — reframes "exit" as safe (progress is saved). */}
              <AlertDialogDescription
                className="flex items-start gap-2.5 rounded-xl border border-[var(--zen-success-border)] bg-[var(--zen-success-subtle)] px-3.5 py-3 text-left text-[13px] leading-relaxed text-[var(--zen-text-secondary)]"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--zen-success)]" aria-hidden />
                <span>{t('progressWillBeSaved')}</span>
              </AlertDialogDescription>
            </div>

            <div className="mt-1 flex w-full flex-col gap-2.5">
              {/* Primary — the single emphasized CTA. */}
              <button
                type="button"
                onClick={onAbandon}
                disabled={isBusy}
                className={cn(
                  btnBase,
                  'bg-[var(--zen-text)] text-[var(--zen-bg)] shadow-sm font-semibold',
                  'hover:opacity-90 focus-visible:ring-[var(--zen-text)]',
                )}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    {t('exiting')}
                  </>
                ) : (
                  t('saveAndExit')
                )}
              </button>

              {/* Secondary — safe default (also bound to Esc / backdrop). */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
                className={cn(
                  btnBase,
                  'border border-[var(--zen-border)] bg-transparent text-[var(--zen-text)]',
                  'hover:bg-[var(--zen-ghost-hover)] focus-visible:ring-[var(--zen-text)]',
                )}
              >
                {t('continueTestBtn')}
              </button>
            </div>

            {/* Destructive — separated below a divider and quiet until intent. */}
            <div className="w-full border-t border-[var(--zen-border)] pt-3">
              <button
                type="button"
                onClick={() => setPhase('confirmDiscard')}
                disabled={isBusy}
                className={cn(
                  btnBase,
                  'text-[13px] font-normal text-[var(--zen-text-muted)]',
                  'hover:text-[var(--zen-danger)] hover:bg-[var(--zen-danger-subtle)]',
                  'focus-visible:ring-[var(--zen-danger)]',
                )}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                {t('exitWithoutSaving')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 p-6 text-center">
            {/* Danger badge — red lives only on the irreversible path. */}
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--zen-danger-border)] bg-[var(--zen-danger-subtle)]"
            >
              <TriangleAlert className="h-[22px] w-[22px] text-[var(--zen-danger)]" />
            </span>

            <div className="flex flex-col gap-3">
              <AlertDialogTitle className="text-xl font-semibold tracking-tight text-[var(--zen-text)]">
                {t('exitWithoutSaving')}
              </AlertDialogTitle>

              <AlertDialogDescription
                className="flex items-start gap-2.5 rounded-xl border border-[var(--zen-danger-border)] bg-[var(--zen-danger-subtle)] px-3.5 py-3 text-left text-[13px] leading-relaxed text-[var(--zen-text-secondary)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--zen-danger)]" aria-hidden />
                <span>{t('exitWithoutSavingWarning')}</span>
              </AlertDialogDescription>
            </div>

            <div className="mt-1 flex w-full flex-col gap-2.5">
              {/* Destructive confirm — danger-tinted (AA-legible) rather than a
                  low-contrast solid red; clearly the irreversible action. */}
              <button
                type="button"
                onClick={onDiscard}
                disabled={isDiscarding}
                className={cn(
                  btnBase,
                  'border border-[var(--zen-danger-border)] bg-[var(--zen-danger-subtle)] font-semibold text-[var(--zen-danger)]',
                  'hover:border-[var(--zen-danger)] hover:bg-[color-mix(in_oklab,var(--zen-danger)_22%,transparent)]',
                  'focus-visible:ring-[var(--zen-danger)]',
                )}
              >
                {isDiscarding ? (
                  <>
                    <Spinner />
                    {t('discarding')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {t('deleteAndExit')}
                  </>
                )}
              </button>

              {/* Easy escape back to safety. */}
              <button
                type="button"
                onClick={() => setPhase('choose')}
                disabled={isDiscarding}
                className={cn(
                  btnBase,
                  'border border-[var(--zen-border)] bg-transparent text-[var(--zen-text)]',
                  'hover:bg-[var(--zen-ghost-hover)] focus-visible:ring-[var(--zen-text)]',
                )}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t('continueTestBtn')}
              </button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Inline busy spinner that respects reduced-motion. */
function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

export default AbandonDialog;
