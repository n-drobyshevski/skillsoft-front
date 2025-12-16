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

interface ItemDetailClientProps {
  item: ItemStatisticsDetail;
}

export function ItemDetailClient({ item }: ItemDetailClientProps) {
  const router = useRouter();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ItemValidityStatus>(item.validityStatus);
  const [statusReason, setStatusReason] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

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
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast.error('Ошибка', { description: message });
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
          Пересчитать
        </Button>

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
                Показывает долю респондентов, выбравших каждый вариант ответа
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
                Рекомендации
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
                        {new Date(change.timestamp).toLocaleString('ru-RU')}
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
              <CardTitle className="text-base">Сравнение показателей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Предыдущий rpb</p>
                  <p className="text-xl font-bold">
                    {item.previousDiscriminationIndex.toFixed(2)}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Текущий rpb</p>
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
                  Изменение:{' '}
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
