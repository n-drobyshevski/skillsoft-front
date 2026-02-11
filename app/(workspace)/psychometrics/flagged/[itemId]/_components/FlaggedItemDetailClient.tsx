'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ItemStatisticsDetail,
  ItemValidityStatus,
  ItemValidityStatusDisplay,
} from '@/types/psychometrics';
import { ValidityStatusBadge } from '../../../_components/ValidityStatusBadge';
import { psychometricsApi } from '@/services/api';
import {
  RefreshCw,
  History,
  Loader2,
  ArrowRight,
  Ban,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

interface FlaggedItemDetailClientProps {
  item: ItemStatisticsDetail;
}

// Validation constants matching backend
const REASON_MIN_LENGTH = 10;
const REASON_MAX_LENGTH = 500;

export function FlaggedItemDetailClient({ item }: FlaggedItemDetailClientProps) {
  const router = useRouter();
  const t = useTranslations('psychometrics.flaggedDetail');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ItemValidityStatus>(item.validityStatus);
  const [statusReason, setStatusReason] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isRetireDialogOpen, setIsRetireDialogOpen] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);

  // Validation state
  const reasonLength = statusReason.length;
  const isReasonTooShort = reasonLength > 0 && reasonLength < REASON_MIN_LENGTH;
  const isReasonTooLong = reasonLength > REASON_MAX_LENGTH;
  const isReasonValid = reasonLength >= REASON_MIN_LENGTH && reasonLength <= REASON_MAX_LENGTH;
  const showReasonError = reasonTouched && (isReasonTooShort || isReasonTooLong || reasonLength === 0);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await psychometricsApi.recalculateItem(item.questionId);
      toast.success(t('toast.recalculateSuccess'), {
        description: t('toast.metricsUpdated'),
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.recalculateFailed');
      toast.error(t('toast.error'), { description: message });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleStatusUpdate = async () => {
    setReasonTouched(true);

    if (!isReasonValid) {
      if (reasonLength === 0) {
        toast.error(t('toast.reasonRequired'));
      } else if (isReasonTooShort) {
        toast.error(t('validation.reasonTooShort'), {
          description: t('validation.minChars', { count: REASON_MIN_LENGTH }),
        });
      } else if (isReasonTooLong) {
        toast.error(t('validation.reasonTooLong'), {
          description: t('validation.maxChars', { count: REASON_MAX_LENGTH }),
        });
      }
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus,
        reason: statusReason,
      });
      toast.success(t('toast.statusUpdated'), {
        description: t('toast.newStatus', { status: ItemValidityStatusDisplay[newStatus].label }),
      });
      setIsStatusDialogOpen(false);
      setStatusReason('');
      setReasonTouched(false);

      // Redirect to flagged list if item is no longer flagged
      if (newStatus !== ItemValidityStatus.FLAGGED_FOR_REVIEW) {
        router.push('/psychometrics/flagged');
      } else {
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.statusUpdateFailed');
      toast.error(t('toast.error'), { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleQuickRetire = async () => {
    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus: ItemValidityStatus.RETIRED,
        reason: t('actions.retireReason'),
      });
      toast.success(t('toast.itemRetired'), {
        description: t('toast.itemRetiredDescription'),
      });
      setIsRetireDialogOpen(false);
      router.push('/psychometrics/flagged');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.retireFailed');
      toast.error(t('toast.error'), { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkReviewed = async () => {
    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus: ItemValidityStatus.ACTIVE,
        reason: t('actions.reviewedReason'),
      });
      toast.success(t('toast.itemActivated'), {
        description: t('toast.itemMarkedAsReviewed'),
      });
      router.push('/psychometrics/flagged');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.statusUpdateFailed');
      toast.error(t('toast.error'), { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Recalculate */}
            <Button
              variant="outline"
              onClick={handleRecalculate}
              disabled={isRecalculating || isUpdatingStatus}
              className="gap-2"
            >
              {isRecalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t('actions.recalculate')}
            </Button>

            {/* Quick Retire (for critical items) */}
            {item.validityStatus !== ItemValidityStatus.RETIRED && (
              <AlertDialog open={isRetireDialogOpen} onOpenChange={setIsRetireDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={isUpdatingStatus}
                  >
                    <Ban className="h-4 w-4" />
                    {t('actions.retireItem')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      {t('dialog.retireTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('dialog.retireDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isUpdatingStatus}>{t('actions.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleQuickRetire}
                      disabled={isUpdatingStatus}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('actions.retiring')}
                        </>
                      ) : (
                        t('actions.retireConfirm')
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Mark as Reviewed (for flagged items) */}
            {item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
              <Button
                variant="outline"
                onClick={handleMarkReviewed}
                disabled={isUpdatingStatus}
                className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {t('actions.markAsReviewed')}
              </Button>
            )}

            {/* Change Status Dialog */}
            <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {t('actions.changeStatus')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('dialog.changeStatusTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('dialog.changeStatusDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('form.newStatus')}</label>
                    <Select
                      value={newStatus}
                      onValueChange={(value) => setNewStatus(value as ItemValidityStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ItemValidityStatusDisplay).map(([key, display]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{display.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{t('form.changeReason')}</label>
                      <span
                        className={`text-xs tabular-nums ${
                          isReasonTooLong
                            ? 'text-destructive font-medium'
                            : isReasonTooShort
                              ? 'text-amber-600'
                              : isReasonValid
                                ? 'text-emerald-600'
                                : 'text-muted-foreground'
                        }`}
                      >
                        {reasonLength}/{REASON_MAX_LENGTH}
                      </span>
                    </div>
                    <Textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      onBlur={() => setReasonTouched(true)}
                      placeholder={t('form.reasonPlaceholder')}
                      rows={3}
                      className={
                        showReasonError
                          ? 'border-destructive focus-visible:ring-destructive'
                          : isReasonValid
                            ? 'border-emerald-500 focus-visible:ring-emerald-500'
                            : ''
                      }
                      maxLength={REASON_MAX_LENGTH + 50}
                    />
                    {showReasonError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {reasonLength === 0
                          ? t('validation.reasonRequired')
                          : isReasonTooShort
                            ? t('validation.reasonTooShortWithRemaining', { min: REASON_MIN_LENGTH, remaining: REASON_MIN_LENGTH - reasonLength })
                            : t('validation.reasonTooLongBy', { excess: reasonLength - REASON_MAX_LENGTH })}
                      </p>
                    )}
                    {!showReasonError && reasonLength > 0 && reasonLength < REASON_MIN_LENGTH && (
                      <p className="text-xs text-muted-foreground">
                        {t('validation.charsUntilMin', { remaining: REASON_MIN_LENGTH - reasonLength })}
                      </p>
                    )}
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={isUpdatingStatus}
                    onClick={() => {
                      setStatusReason('');
                      setReasonTouched(false);
                    }}
                  >
                    {t('actions.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus || !isReasonValid}
                    className={!isReasonValid ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('actions.saving')}
                      </>
                    ) : (
                      t('actions.save')
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distractor Efficiency */}
        {item.distractorEfficiency && Object.keys(item.distractorEfficiency).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('distractorEfficiency')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(item.distractorEfficiency).map(([option, efficiency]) => (
                  <div key={option} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center">
                      {option}
                    </Badge>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(efficiency * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-mono w-12 text-right">
                      {(efficiency * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {t('distractorDescription')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Change History */}
        {item.statusChangeHistory && item.statusChangeHistory.length > 0 && (
          <Card className={item.distractorEfficiency ? '' : 'lg:col-span-2'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                {t('statusHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.statusChangeHistory.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                      <ValidityStatusBadge status={change.fromStatus} size="sm" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                      <ValidityStatusBadge status={change.toStatus} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {change.reason && (
                        <p className="text-sm">{change.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(change.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
