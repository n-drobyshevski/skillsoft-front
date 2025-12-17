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

export function FlaggedItemDetailClient({ item }: FlaggedItemDetailClientProps) {
  const router = useRouter();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ItemValidityStatus>(item.validityStatus);
  const [statusReason, setStatusReason] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isRetireDialogOpen, setIsRetireDialogOpen] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await psychometricsApi.recalculateItem(item.questionId);
      toast.success('Пересчет завершен', {
        description: 'Психометрические показатели обновлены',
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить пересчет';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusReason.trim()) {
      toast.error('Укажите причину изменения статуса');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus,
        reason: statusReason,
      });
      toast.success('Статус обновлен', {
        description: `Новый статус: ${ItemValidityStatusDisplay[newStatus].label}`,
      });
      setIsStatusDialogOpen(false);
      setStatusReason('');

      // Redirect to flagged list if item is no longer flagged
      if (newStatus !== ItemValidityStatus.FLAGGED_FOR_REVIEW) {
        router.push('/psychometrics/flagged');
      } else {
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleQuickRetire = async () => {
    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus: ItemValidityStatus.RETIRED,
        reason: 'Отключен из-за низких психометрических показателей',
      });
      toast.success('Элемент отключен', {
        description: 'Элемент больше не будет использоваться в тестах',
      });
      setIsRetireDialogOpen(false);
      router.push('/psychometrics/flagged');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось отключить элемент';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkReviewed = async () => {
    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus: ItemValidityStatus.ACTIVE,
        reason: 'Проверен вручную и одобрен',
      });
      toast.success('Элемент активирован', {
        description: 'Элемент помечен как проверенный',
      });
      router.push('/psychometrics/flagged');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Быстрые действия</CardTitle>
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
              Пересчитать
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
                    Отключить элемент
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Отключить элемент?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Элемент будет помечен как отключенный и не будет использоваться
                      в новых тестах. Это действие можно отменить, изменив статус вручную.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isUpdatingStatus}>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleQuickRetire}
                      disabled={isUpdatingStatus}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Отключение...
                        </>
                      ) : (
                        'Отключить'
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
                Пометить как проверенный
              </Button>
            )}

            {/* Change Status Dialog */}
            <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Изменить статус
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Изменить статус элемента</AlertDialogTitle>
                  <AlertDialogDescription>
                    Выберите новый статус и укажите причину изменения.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Новый статус</label>
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
                    <label className="text-sm font-medium">Причина изменения</label>
                    <Textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Опишите причину изменения статуса..."
                      rows={3}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdatingStatus}>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить'
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
                Эффективность дистракторов
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
                Показывает долю респондентов, выбравших каждый вариант ответа.
                Дистракторы с очень низкими значениями (&lt;5%) неэффективны.
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
                История изменений статуса
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
