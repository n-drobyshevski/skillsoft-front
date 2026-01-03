'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Lightbulb,
  BarChart3,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useEnumTranslation } from '@/hooks/useEnumTranslation';

interface ItemDetailClientProps {
  item: ItemStatisticsDetail;
}

export function ItemDetailClient({ item }: ItemDetailClientProps) {
  const router = useRouter();
  const t = useTranslations('psychometrics');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { translate: translateStatus } = useEnumTranslation<ItemValidityStatus>('itemValidityStatus');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ItemValidityStatus>(item.validityStatus);
  const [statusReason, setStatusReason] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await psychometricsApi.recalculateItem(item.questionId);
      toast.success(t('itemDetail.recalculateSuccess'), {
        description: t('itemDetail.metricsUpdated'),
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('itemDetail.recalculateFailed');
      toast.error(t('itemDetail.error'), { description: message });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusReason.trim()) {
      toast.error(t('itemDetail.reasonRequired'));
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus,
        reason: statusReason,
      });
      toast.success(t('itemDetail.statusUpdated'), {
        description: t('itemDetail.newStatusIs', { status: translateStatus(newStatus) }),
      });
      setIsStatusDialogOpen(false);
      setStatusReason('');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('itemDetail.statusUpdateFailed');
      toast.error(t('itemDetail.error'), { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="gap-2"
        >
          {isRecalculating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {t('itemDetail.recalculate')}
        </Button>

        <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              {t('itemDetail.changeStatus')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('itemDetail.changeStatusTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('itemDetail.changeStatusDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('itemDetail.newStatus')}</label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as ItemValidityStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ItemValidityStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span>{translateStatus(status)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('itemDetail.changeReason')}</label>
                <Textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={t('itemDetail.reasonPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdatingStatus}>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {tCommon('saving')}
                  </>
                ) : (
                  tCommon('save')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distractor Efficiency */}
        {item.distractorEfficiency && Object.keys(item.distractorEfficiency).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('itemDetail.distractorEfficiency')}
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
                {t('itemDetail.distractorDescription')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {item.recommendations && item.recommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                {t('itemDetail.recommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {item.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Status Change History */}
        {item.statusChangeHistory && item.statusChangeHistory.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                {t('itemDetail.statusHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.statusChangeHistory.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <ValidityStatusBadge status={change.fromStatus} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <ValidityStatusBadge status={change.toStatus} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {change.reason && (
                        <p className="text-sm">{change.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(change.timestamp).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Discrimination Index */}
        {item.previousDiscriminationIndex != null && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('itemDetail.metricsComparison')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('itemDetail.previousRpb')}</p>
                  <p className="text-xl font-bold">
                    {item.previousDiscriminationIndex.toFixed(2)}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('itemDetail.currentRpb')}</p>
                  <p className={`text-xl font-bold ${
                    item.discriminationIndex != null
                      ? item.discriminationIndex > item.previousDiscriminationIndex
                        ? 'text-emerald-600'
                        : item.discriminationIndex < item.previousDiscriminationIndex
                          ? 'text-red-600'
                          : ''
                      : ''
                  }`}>
                    {item.discriminationIndex != null ? item.discriminationIndex.toFixed(2) : '-'}
                  </p>
                </div>
              </div>
              {item.discriminationIndex != null && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('itemDetail.change')}:{' '}
                  <span className={
                    item.discriminationIndex > item.previousDiscriminationIndex
                      ? 'text-emerald-600'
                      : item.discriminationIndex < item.previousDiscriminationIndex
                        ? 'text-red-600'
                        : ''
                  }>
                    {(item.discriminationIndex - item.previousDiscriminationIndex) > 0 ? '+' : ''}
                    {(item.discriminationIndex - item.previousDiscriminationIndex).toFixed(2)}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
