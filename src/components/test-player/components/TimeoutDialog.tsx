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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            {t('timeExpired')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('timeExpiredDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onComplete} disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('viewResults')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default TimeoutDialog;
