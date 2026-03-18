'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, GitBranch, Lock, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

interface VersionPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateVersion: () => Promise<void>;
  onOverwrite: () => Promise<void>;
}

export function VersionPromptDialog({
  open,
  onClose,
  onCreateVersion,
  onOverwrite,
}: VersionPromptDialogProps) {
  const t = useTranslations('builder.versionPrompt');
  const [isPending, startTransition] = useTransition();

  const handleCreateVersion = () => {
    startTransition(async () => {
      await onCreateVersion();
    });
  };

  const handleOverwrite = () => {
    startTransition(async () => {
      await onOverwrite();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lock className="h-5 w-5" />
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {t('description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleCreateVersion}
            disabled={isPending}
            className="w-full gap-2"
          >
            <GitBranch className="h-4 w-4" />
            {t('createVersion')}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {t('createVersionDescription')}
          </p>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('or')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleOverwrite}
            disabled={isPending}
            className="w-full gap-2 text-destructive hover:text-destructive"
          >
            <Save className="h-4 w-4" />
            {t('overwrite')}
          </Button>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>{t('overwriteWarning')}</span>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="w-full"
          >
            {t('cancel')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
