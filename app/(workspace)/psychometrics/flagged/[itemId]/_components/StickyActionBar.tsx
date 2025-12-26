'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ItemValidityStatus,
  ItemValidityStatusDisplay,
  ItemStatisticsDetail,
} from '@/types/psychometrics';
import { psychometricsApi } from '@/services/api';
import {
  RefreshCw,
  Settings2,
  Loader2,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface StickyActionBarProps {
  item: ItemStatisticsDetail;
  className?: string;
}

type SheetView = 'actions' | 'status-form';

/**
 * StickyActionBar - Fixed bottom action bar for mobile flagged item detail
 *
 * Features:
 * - Fixed at bottom with safe-area padding for notched devices
 * - Primary action (Recalculate) always visible
 * - Secondary actions in bottom sheet drawer
 * - Touch-optimized button sizes (min 44px)
 */
export function StickyActionBar({ item, className }: StickyActionBarProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>('actions');

  // Loading states
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Status form state
  const [newStatus, setNewStatus] = useState<ItemValidityStatus>(item.validityStatus);
  const [statusReason, setStatusReason] = useState('');

  const isLoading = isRecalculating || isUpdatingStatus;

  // Handle recalculate
  const handleRecalculate = useCallback(async () => {
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
  }, [item.questionId, router]);

  // Handle quick status change
  const handleQuickStatusChange = useCallback(
    async (targetStatus: ItemValidityStatus, reason: string) => {
      setIsUpdatingStatus(true);
      try {
        await psychometricsApi.updateItemStatus(item.questionId, {
          newStatus: targetStatus,
          reason,
        });
        toast.success('Статус обновлен', {
          description: `Новый статус: ${ItemValidityStatusDisplay[targetStatus]?.label}`,
        });

        // Redirect to list if no longer flagged
        if (targetStatus !== ItemValidityStatus.FLAGGED_FOR_REVIEW) {
          router.push('/psychometrics/flagged');
        } else {
          router.refresh();
        }
        setIsSheetOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
        toast.error('Ошибка', { description: message });
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [item.questionId, router]
  );

  // Handle status form submit
  const handleStatusFormSubmit = useCallback(async () => {
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
        description: `Новый статус: ${ItemValidityStatusDisplay[newStatus]?.label}`,
      });
      setStatusReason('');
      setSheetView('actions');

      if (newStatus !== ItemValidityStatus.FLAGGED_FOR_REVIEW) {
        router.push('/psychometrics/flagged');
      } else {
        router.refresh();
      }
      setIsSheetOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [item.questionId, newStatus, statusReason, router]);

  // Reset sheet state when closing
  const handleSheetOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setSheetView('actions');
        setStatusReason('');
        setNewStatus(item.validityStatus);
      }
      setIsSheetOpen(isOpen);
    },
    [item.validityStatus]
  );

  // Desktop: show regular button group
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Fixed bottom bar */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40',
          'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
          'border-t p-3',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]', // Safe area for notched devices
          className
        )}
      >
        <div className="flex gap-2 max-w-lg mx-auto">
          {/* Primary action: Recalculate */}
          <Button
            variant="outline"
            className="flex-1 gap-2 min-h-[44px]"
            onClick={handleRecalculate}
            disabled={isLoading}
          >
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Пересчитать
          </Button>

          {/* More actions button */}
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => setIsSheetOpen(true)}
            disabled={isLoading}
            aria-label="Больше действий"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Action sheet drawer */}
      <Drawer open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          {/* Drag handle */}
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted" />

          {sheetView === 'actions' ? (
            <>
              <DrawerHeader className="text-left pb-2">
                <DrawerTitle>Действия</DrawerTitle>
                <DrawerDescription>Управление проблемным элементом</DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-2">
                {/* Quick action: Mark as Reviewed */}
                {item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start gap-3 h-14 text-left',
                      'text-emerald-600 hover:text-emerald-700',
                      'hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                    )}
                    onClick={() =>
                      handleQuickStatusChange(ItemValidityStatus.ACTIVE, 'Проверено и одобрено')
                    }
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Отметить как проверенный</div>
                      <div className="text-xs text-muted-foreground">Одобрить после ревью</div>
                    </div>
                  </Button>
                )}

                {/* Quick action: Retire */}
                {item.validityStatus !== ItemValidityStatus.RETIRED && (
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start gap-3 h-14 text-left',
                      'text-red-600 hover:text-red-700',
                      'hover:bg-red-50 dark:hover:bg-red-950/20'
                    )}
                    onClick={() =>
                      handleQuickStatusChange(
                        ItemValidityStatus.RETIRED,
                        'Выведен из использования из-за низких показателей'
                      )
                    }
                    disabled={isLoading}
                  >
                    <Ban className="h-5 w-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Вывести из использования</div>
                      <div className="text-xs text-muted-foreground">Исключить из тестирования</div>
                    </div>
                  </Button>
                )}

                <Separator className="my-3" />

                {/* Full status change form */}
                <Button
                  variant="outline"
                  className="w-full justify-between gap-3 h-14"
                  onClick={() => setSheetView('status-form')}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <Settings2 className="h-5 w-5 shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Изменить статус</div>
                      <div className="text-xs text-muted-foreground">
                        Текущий: {ItemValidityStatusDisplay[item.validityStatus]?.label}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Separator className="my-3" />

                {/* View full stats */}
                <Button variant="ghost" className="w-full justify-start gap-3 h-12" asChild>
                  <a href={`/psychometrics/items/${item.questionId}`}>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span>Полная статистика элемента</span>
                  </a>
                </Button>
              </div>

              <DrawerFooter className="pt-0">
                <DrawerClose asChild>
                  <Button variant="ghost" className="w-full min-h-[44px]">
                    Закрыть
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          ) : (
            /* Status Change Form View */
            <>
              <DrawerHeader className="text-left pb-2">
                <DrawerTitle>Изменить статус</DrawerTitle>
                <DrawerDescription>Выберите новый статус и укажите причину</DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-4">
                {/* Status select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Новый статус</label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as ItemValidityStatus)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ItemValidityStatusDisplay).map(([key, display]) => (
                        <SelectItem key={key} value={key} className="min-h-[44px] py-2">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{display.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Причина изменения <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Опишите причину изменения статуса..."
                    rows={3}
                    className="resize-none min-h-[80px]"
                    disabled={isUpdatingStatus}
                  />
                </div>
              </div>

              <DrawerFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={() => {
                    setSheetView('actions');
                    setStatusReason('');
                    setNewStatus(item.validityStatus);
                  }}
                  disabled={isUpdatingStatus}
                >
                  Назад
                </Button>
                <Button
                  className="flex-1 min-h-[44px]"
                  onClick={handleStatusFormSubmit}
                  disabled={isUpdatingStatus || !statusReason.trim()}
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default StickyActionBar;
