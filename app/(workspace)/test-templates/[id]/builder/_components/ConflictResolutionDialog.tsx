'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, GitMerge, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ConflictInfo } from '@/hooks/useMultiTabSync';
import type { BlueprintCompetency } from '../actions';

/**
 * Conflict Resolution Dialog - Phase 4.3
 *
 * Displays when multiple tabs have conflicting changes to the blueprint.
 * Allows user to choose between local, remote, or merged state.
 */

interface ConflictResolutionDialogProps {
  open: boolean;
  conflict: ConflictInfo<BlueprintCompetency[]> | null;
  onResolve: (resolution: 'keep_local' | 'use_remote' | 'merge') => void;
  onDismiss: () => void;
}

export function ConflictResolutionDialog({
  open,
  conflict,
  onResolve,
  onDismiss,
}: ConflictResolutionDialogProps) {
  const t = useTranslations('builder.conflict');
  const tTime = useTranslations('builder.saveStatus.timeAgo');

  if (!conflict) {
    return null;
  }

  const localCount = conflict.localState.length;
  const remoteCount = conflict.remoteState.length;
  const timeDiff = Date.now() - conflict.timestamp;

  const timeAgo = (() => {
    const seconds = Math.floor(timeDiff / 1000);
    if (seconds < 5) return tTime('justNow');
    if (seconds < 60) return tTime('secondsAgo', { seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return tTime('minutesAgo', { minutes });
    const hours = Math.floor(minutes / 60);
    return tTime('hoursAgo', { hours });
  })();

  // Find differences
  const localIds = new Set(conflict.localState.map((c) => c.id));
  const remoteIds = new Set(conflict.remoteState.map((c) => c.id));

  const onlyInLocal = conflict.localState.filter((c) => !remoteIds.has(c.id));
  const onlyInRemote = conflict.remoteState.filter((c) => !localIds.has(c.id));
  const inBoth = conflict.localState.filter((c) => remoteIds.has(c.id));

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Version info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{t('detectedAgo', { time: timeAgo })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                v{conflict.localVersion} → v{conflict.remoteVersion}
              </Badge>
            </div>
          </div>

          {/* Comparison summary */}
          <div className="grid grid-cols-2 gap-3">
            {/* Local state */}
            <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeft className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {t('yourChanges')}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {t('competencies', { count: localCount })}
                {onlyInLocal.length > 0 && (
                  <span className="text-green-600 ml-1">
                    ({t('newItems', { count: onlyInLocal.length })})
                  </span>
                )}
              </div>
            </div>

            {/* Remote state */}
            <div className="p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                  {t('otherTab')}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {t('competencies', { count: remoteCount })}
                {onlyInRemote.length > 0 && (
                  <span className="text-green-600 ml-1">
                    ({t('newItems', { count: onlyInRemote.length })})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed diff */}
          {(onlyInLocal.length > 0 || onlyInRemote.length > 0) && (
            <ScrollArea className="h-32 rounded-lg border p-3">
              <div className="space-y-2 text-xs">
                {onlyInLocal.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-600">{t('onlyInYourVersion')}</span>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {onlyInLocal.map((c) => (
                        <li key={c.id} className="text-muted-foreground">
                          • {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {onlyInRemote.length > 0 && (
                  <div>
                    <span className="font-medium text-purple-600">{t('onlyInOtherTab')}</span>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {onlyInRemote.map((c) => (
                        <li key={c.id} className="text-muted-foreground">
                          • {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {inBoth.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      {t('inBoth', { count: inBoth.length })}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {inBoth.slice(0, 3).map((c) => c.name).join(', ')}
                      {inBoth.length > 3 && ` ${t('moreItems', { count: inBoth.length - 3 })}`}
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onResolve('keep_local')}
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
            {t('keepMine')}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onResolve('use_remote')}
          >
            <ArrowRight className="h-4 w-4 text-purple-600" />
            {t('useTheirs')}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => onResolve('merge')}
          >
            <GitMerge className="h-4 w-4" />
            {t('mergeBoth')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
