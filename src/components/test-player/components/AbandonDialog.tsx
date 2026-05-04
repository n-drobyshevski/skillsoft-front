'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Trash2, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export interface AbandonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbandon: () => void;
  onDiscard: () => void;
  isSubmitting?: boolean;
  isDiscarding?: boolean;
}

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

  useEffect(() => {
    if (!open) setPhase('choose');
  }, [open]);

  const isBusy = isSubmitting || isDiscarding;

  return (
    <AlertDialog open={open} onOpenChange={isBusy ? undefined : onOpenChange}>
      <AlertDialogContent className="bg-[var(--zen-surface)] border-[var(--zen-border)] text-[var(--zen-text)] backdrop-blur-xl">
        {phase === 'choose' ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-[var(--zen-danger)]">
                <AlertTriangle className="h-5 w-5" />
                {t('exitTestQuestion')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[var(--zen-text-secondary)]">
                {t('progressWillBeSaved')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel
                disabled={isBusy}
                className="border-[var(--zen-border)] bg-[var(--zen-ghost-hover)] text-[var(--zen-text)] hover:bg-[var(--zen-muted)] hover:text-[var(--zen-text)]"
              >
                {t('continueTestBtn')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onAbandon}
                disabled={isBusy}
                className="bg-[var(--zen-text)] text-[var(--zen-bg)] hover:bg-[var(--zen-text-secondary)] hover:text-[var(--zen-bg)]"
              >
                {isSubmitting ? t('exiting') : t('saveAndExit')}
              </AlertDialogAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPhase('confirmDiscard')}
                disabled={isBusy}
                className="text-[var(--zen-text-muted)] hover:bg-[var(--zen-ghost-hover)] hover:text-[var(--zen-danger)] text-xs"
              >
                {t('exitWithoutSaving')}
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-[var(--zen-danger)]">
                <Trash2 className="h-5 w-5" />
                {t('exitWithoutSaving')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[var(--zen-text-secondary)]">
                {t('exitWithoutSavingWarning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setPhase('choose')}
                disabled={isDiscarding}
                className="border-[var(--zen-border)] bg-transparent text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)] hover:text-[var(--zen-text)]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('continueTestBtn')}
              </Button>
              <AlertDialogAction
                onClick={onDiscard}
                disabled={isDiscarding}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDiscarding ? t('discarding') : t('deleteAndExit')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AbandonDialog;
