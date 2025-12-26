'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
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
  ItemStatisticsDetail,
  ItemValidityStatus,
  ItemValidityStatusDisplay,
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

interface MobileActionSheetProps {
  /** Item data */
  item: ItemStatisticsDetail;
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
}

type SheetView = 'actions' | 'status-form';

/**
 * MobileActionSheet - Bottom sheet for item actions
 *
 * Features:
 * - Fixed bottom action bar with primary action (Recalculate)
 * - Expandable drawer for secondary actions
 * - Status change form inline (not modal)
 * - 44px minimum touch targets
 * - Safe area padding for notched devices
 */
export function MobileActionSheet({
  item,
  open,
  onOpenChange,
}: MobileActionSheetProps) {
  const router = useRouter();
  const [view, setView] = useState<SheetView>('actions');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ItemValidityStatus>(item.validityStatus);
  const [statusReason, setStatusReason] = useState('');

  const isLoading = isRecalculating || isUpdatingStatus;

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await psychometricsApi.recalculateItem(item.questionId);
      toast.success('Пересчет завершен', {
        description: 'Психометрические показатели обновлены',
      });
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить пересчет';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleQuickStatusChange = async (
    targetStatus: ItemValidityStatus,
    reason: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      await psychometricsApi.updateItemStatus(item.questionId, {
        newStatus: targetStatus,
        reason,
      });
      toast.success('Статус обновлен', {
        description: `Новый статус: ${ItemValidityStatusDisplay[targetStatus]?.label}`,
      });
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusFormSubmit = async () => {
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
      setView('actions');
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast.error('Ошибка', { description: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setView('actions');
      setStatusReason('');
      setNewStatus(item.validityStatus);
    }
    onOpenChange(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        {/* Drag handle */}
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted" />

        {view === 'actions' ? (
          <>
            <DrawerHeader className="text-left pb-2">
              <DrawerTitle>Действия</DrawerTitle>
              <DrawerDescription>
                Управление элементом оценки
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4 space-y-2">
              {/* Primary: Recalculate */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 text-left"
                onClick={handleRecalculate}
                disabled={isLoading}
              >
                {isRecalculating ? (
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                ) : (
                  <RefreshCw className="h-5 w-5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Пересчитать</div>
                  <div className="text-xs text-muted-foreground">
                    Обновить психометрические индексы
                  </div>
                </div>
              </Button>

              <Separator className="my-3" />

              {/* Quick action: Mark as Reviewed (for flagged items) */}
              {item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-14 text-left text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                  onClick={() =>
                    handleQuickStatusChange(
                      ItemValidityStatus.ACTIVE,
                      'Проверено и одобрено'
                    )
                  }
                  disabled={isLoading}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">Отметить как проверенный</div>
                    <div className="text-xs text-muted-foreground">
                      Одобрить после ревью
                    </div>
                  </div>
                </Button>
              )}

              {/* Quick action: Retire (for non-retired items) */}
              {item.validityStatus !== ItemValidityStatus.RETIRED && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-14 text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() =>
                    handleQuickStatusChange(
                      ItemValidityStatus.RETIRED,
                      'Выведен из использования'
                    )
                  }
                  disabled={isLoading}
                >
                  <Ban className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">Вывести из использования</div>
                    <div className="text-xs text-muted-foreground">
                      Исключить из тестирования
                    </div>
                  </div>
                </Button>
              )}

              {/* Full status change form */}
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-14"
                onClick={() => setView('status-form')}
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

              {/* View original question */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                asChild
              >
                <a
                  href={`/assessment-questions/${item.questionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>Открыть вопрос</span>
                </a>
              </Button>
            </div>

            <DrawerFooter className="pt-0">
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full">
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
              <DrawerDescription>
                Выберите новый статус и укажите причину
              </DrawerDescription>
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
                      <SelectItem
                        key={key}
                        value={key}
                        className="min-h-[44px] py-2"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{display.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {display.description}
                          </span>
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
                  setView('actions');
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
  );
}

/**
 * MobileActionBar - Fixed bottom bar that triggers the action sheet
 *
 * This is the always-visible bar at the bottom of the screen on mobile.
 * Contains the primary action (Recalculate) and a button to open more actions.
 */
interface MobileActionBarProps {
  /** Item data for recalculate action */
  item: ItemStatisticsDetail;
  /** Callback to open the action sheet */
  onOpenSheet: () => void;
  /** Additional className */
  className?: string;
}

export function MobileActionBar({
  item,
  onOpenSheet,
  className,
}: MobileActionBarProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Only render on mobile
  if (!isMobile) return null;

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

  return (
    <div
      className={cn(
        // Fixed positioning
        'fixed inset-x-0 bottom-0 z-40',
        // Background with blur
        'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        // Border and padding
        'border-t p-3',
        // Safe area for notched devices
        'pb-safe',
        className
      )}
    >
      <div className="flex gap-2 max-w-lg mx-auto">
        {/* Primary action - Recalculate */}
        <Button
          variant="outline"
          className="flex-1 gap-2 min-h-[44px]"
          onClick={handleRecalculate}
          disabled={isRecalculating}
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
          onClick={onOpenSheet}
          disabled={isRecalculating}
          aria-label="Больше действий"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default MobileActionSheet;
