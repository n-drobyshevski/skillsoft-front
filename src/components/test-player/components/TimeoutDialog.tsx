'use client';

import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * TimeoutDialog
 *
 * Displayed when the test timer expires.
 * Informs user their answers will be saved and provides action to view results.
 */

export interface TimeoutDialogProps {
  open: boolean;
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function TimeoutDialog({ open, onComplete, isSubmitting }: TimeoutDialogProps) {
  const t = useTranslations('assessment');

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-[var(--zen-surface)] border-[var(--zen-border)] text-[var(--zen-text)] backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[var(--zen-text)]">
            <Clock className="h-5 w-5 text-[var(--zen-warning)]" />
            {t('timeExpired')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--zen-text-secondary)]">
            {t('timeExpiredDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onComplete}
            disabled={isSubmitting}
            className="bg-[var(--zen-text)] text-[var(--zen-bg)] hover:bg-[var(--zen-text-secondary)] hover:text-[var(--zen-bg)]"
          >
            {isSubmitting ? t('saving') : t('viewResults')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default TimeoutDialog;
