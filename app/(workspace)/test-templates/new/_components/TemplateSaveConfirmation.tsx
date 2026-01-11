'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  FileText,
  Target,
  Clock,
  Percent,
  HelpCircle,
  RefreshCw,
  Eye,
  Shuffle,
  SkipForward,
  ArrowLeft,
  Users,
  Briefcase,
  Globe,
  Lock,
  Link2,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { SaveWorkflowState } from '@/hooks/useConfirmSaveWorkflow';
import { AssessmentGoal, TemplateVisibility } from '@/types/domain';

/**
 * Template summary data for the confirmation dialog
 */
export interface TemplateSummary {
  name: string;
  description?: string;
  goal: AssessmentGoal;
  competencyCount: number;
  questionsPerIndicator: number;
  timeLimitMinutes: number;
  passingScore: number;
  visibility: TemplateVisibility;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowSkip: boolean;
  allowBackNavigation: boolean;
  showResultsImmediately: boolean;
}

interface TemplateSaveConfirmationProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback to change open state */
  onOpenChange: (open: boolean) => void;
  /** Current workflow state */
  state: SaveWorkflowState;
  /** Template data being saved (for summary display) */
  templateData: TemplateSummary | null;
  /** Error message if in error state */
  error: Error | null;
  /** Current retry count */
  retryCount: number;
  /** Max retries allowed */
  maxRetries: number;
  /** Confirm button handler */
  onConfirm: () => void;
  /** Cancel/dismiss handler */
  onCancel: () => void;
  /** Retry handler */
  onRetry: () => void;
}

/**
 * Get goal icon component
 */
function GoalIcon({ goal }: { goal: AssessmentGoal }) {
  switch (goal) {
    case AssessmentGoal.OVERVIEW:
      return <Target className="w-4 h-4" />;
    case AssessmentGoal.JOB_FIT:
      return <Briefcase className="w-4 h-4" />;
    case AssessmentGoal.TEAM_FIT:
      return <Users className="w-4 h-4" />;
    default:
      return <Target className="w-4 h-4" />;
  }
}

/**
 * Get visibility icon component
 */
function VisibilityIcon({ visibility }: { visibility: TemplateVisibility }) {
  switch (visibility) {
    case TemplateVisibility.PRIVATE:
      return <Lock className="w-3 h-3" />;
    case TemplateVisibility.PUBLIC:
      return <Globe className="w-3 h-3" />;
    case TemplateVisibility.LINK:
      return <Link2 className="w-3 h-3" />;
    default:
      return <Lock className="w-3 h-3" />;
  }
}

/**
 * TemplateSaveConfirmation - Confirmation dialog with full template summary
 *
 * Shows template details before creating, with loading, success, and error states.
 * Follows existing patterns from CompletionDialog and DeleteConfirmationDialog.
 */
export function TemplateSaveConfirmation({
  open,
  onOpenChange,
  state,
  templateData,
  error,
  retryCount,
  maxRetries,
  onConfirm,
  onCancel,
  onRetry,
}: TemplateSaveConfirmationProps) {
  const t = useTranslations('template.saveConfirmation');
  const tCommon = useTranslations('common');

  const isSaving = state === 'saving';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const canRetry = isError && retryCount < maxRetries;

  // Prevent closing during saving or success states
  const handleOpenChange = (newOpen: boolean) => {
    if (isSaving || isSuccess) return;
    if (!newOpen) {
      onCancel();
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          {/* State Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'p-3 rounded-full',
                isSuccess && 'bg-emerald-500/20',
                isError && 'bg-destructive/20',
                !isSuccess && !isError && 'bg-primary/20'
              )}
            >
              {isSuccess && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
              {isError && <AlertTriangle className="w-8 h-8 text-destructive" />}
              {isSaving && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
              {state === 'confirm_dialog' && <FileText className="w-8 h-8 text-primary" />}
            </div>
          </div>

          {/* Title based on state */}
          <AlertDialogTitle className="text-center text-xl">
            {isSuccess && t('successTitle')}
            {isError && t('errorTitle')}
            {isSaving && t('savingTitle')}
            {state === 'confirm_dialog' && t('confirmTitle')}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center" asChild>
            <div className="space-y-4">
              {/* Confirmation state: Show full template summary */}
              {state === 'confirm_dialog' && templateData && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{t('confirmDescription')}</p>

                  {/* Template Name & Description */}
                  <div className="p-4 bg-muted/50 rounded-lg text-left space-y-3">
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {templateData.name}
                      </div>
                      {templateData.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {templateData.description}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Goal & Competencies */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <GoalIcon goal={templateData.goal} />
                        {t(`goals.${templateData.goal}`)}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Target className="w-3 h-3" />
                        {templateData.competencyCount} {t('competencies')}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <VisibilityIcon visibility={templateData.visibility} />
                        {t(`visibility.${templateData.visibility}`)}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Test Settings */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HelpCircle className="w-4 h-4" />
                        <span>
                          {templateData.questionsPerIndicator} {t('questionsPerIndicator')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {templateData.timeLimitMinutes} {t('minutes')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Percent className="w-4 h-4" />
                        <span>
                          {templateData.passingScore}% {t('passingScore')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>
                          {templateData.showResultsImmediately
                            ? t('showResultsYes')
                            : t('showResultsNo')}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Behavior Settings */}
                    <div className="flex flex-wrap gap-2">
                      {templateData.shuffleQuestions && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Shuffle className="w-3 h-3" />
                          {t('shuffleQuestions')}
                        </Badge>
                      )}
                      {templateData.shuffleOptions && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Shuffle className="w-3 h-3" />
                          {t('shuffleOptions')}
                        </Badge>
                      )}
                      {templateData.allowSkip && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <SkipForward className="w-3 h-3" />
                          {t('allowSkip')}
                        </Badge>
                      )}
                      {templateData.allowBackNavigation && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <ArrowLeft className="w-3 h-3" />
                          {t('allowBack')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Saving state */}
              {isSaving && (
                <p className="text-muted-foreground">{t('savingDescription')}</p>
              )}

              {/* Success state */}
              {isSuccess && (
                <div className="space-y-2">
                  <p className="text-emerald-600 dark:text-emerald-400">
                    {t('successDescription')}
                  </p>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    {t('redirecting')}
                  </p>
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="space-y-3">
                  <p className="text-destructive">
                    {error?.message || t('genericError')}
                  </p>
                  {canRetry && (
                    <p className="text-sm text-muted-foreground">
                      {t('retryAttempt', { current: retryCount, max: maxRetries })}
                    </p>
                  )}
                  {!canRetry && (
                    <p className="text-sm text-muted-foreground">
                      {t('maxRetriesReached')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {/* Confirmation state buttons */}
          {state === 'confirm_dialog' && (
            <>
              <AlertDialogCancel onClick={onCancel} disabled={isSaving}>
                {tCommon('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className="bg-primary hover:bg-primary/90"
              >
                {t('confirm')}
              </AlertDialogAction>
            </>
          )}

          {/* Saving state - show disabled buttons */}
          {isSaving && (
            <>
              <AlertDialogCancel disabled>
                {tCommon('cancel')}
              </AlertDialogCancel>
              <Button disabled className="gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('creating')}
              </Button>
            </>
          )}

          {/* Error state buttons */}
          {isError && (
            <>
              <Button variant="outline" onClick={onCancel}>
                {t('goBack')}
              </Button>
              {canRetry && (
                <Button onClick={onRetry} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t('retry')}
                </Button>
              )}
            </>
          )}

          {/* Success state - no interactive buttons */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
