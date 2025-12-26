'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { X, Check, AlertTriangle, Loader2, type LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BatchAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  tooltip?: string;
  requiresConfirmation?: boolean;
}

interface BatchActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BatchAction[];
  className?: string;
  entityName?: string;
  position?: 'sticky' | 'fixed' | 'static';
  isLoading?: boolean;
}

/**
 * BatchActionToolbar - Floating toolbar for batch operations on selected items
 * Appears when items are selected and provides quick access to bulk actions.
 * Mobile-optimized with full width at bottom and icon-only actions.
 */
export function BatchActionToolbar({
  selectedCount,
  onClearSelection,
  actions,
  className,
  entityName = 'элементов',
  position = 'sticky',
  isLoading = false,
}: BatchActionToolbarProps) {
  const [confirmingAction, setConfirmingAction] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  // Don't render if nothing is selected
  if (selectedCount === 0) {
    return null;
  }

  const positionClasses = {
    sticky: 'sticky bottom-4 left-0 right-0 mx-auto',
    fixed: 'fixed bottom-4 left-1/2 -translate-x-1/2',
    static: '',
  };

  // Mobile position classes - full width at bottom with safe area padding
  const mobilePositionClasses = {
    sticky: 'sticky bottom-0 left-0 right-0',
    fixed: 'fixed bottom-0 left-0 right-0',
    static: '',
  };

  const handleActionClick = (action: BatchAction) => {
    if (action.requiresConfirmation && confirmingAction !== action.id) {
      setConfirmingAction(action.id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirmingAction(null), 3000);
    } else {
      action.onClick();
      setConfirmingAction(null);
    }
  };

  return (
    <div
      className={cn(
        'z-50',
        isMobile
          ? cn(
              mobilePositionClasses[position],
              'w-full pb-safe' // Safe area for notched devices
            )
          : cn(
              positionClasses[position],
              'w-fit max-w-[95vw]'
            ),
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 border bg-background/95 shadow-lg backdrop-blur-sm',
          'animate-in slide-in-from-bottom-2 fade-in-0 duration-200',
          isMobile
            ? 'rounded-none border-x-0 border-b-0 px-4 py-3 justify-between'
            : 'rounded-lg px-3 py-2'
        )}
      >
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-2">
          <div className={cn(
            'flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium',
            isMobile ? 'h-8 w-8 text-sm' : 'h-6 w-6 text-xs'
          )}>
            {selectedCount > 99 ? '99+' : selectedCount}
          </div>
          <span className={cn(
            'font-medium whitespace-nowrap',
            isMobile ? 'text-sm hidden xs:inline' : 'text-sm'
          )}>
            {isMobile ? `${selectedCount} выбр.` : getSelectedLabel(selectedCount, entityName)}
          </span>
        </div>

        {!isMobile && <Separator orientation="vertical" className="h-6" />}

        {/* Action buttons - with labels on mobile for clarity */}
        <div className="flex items-center gap-1.5">
          {actions.map((action) => {
            const isConfirming = confirmingAction === action.id;
            const Icon = action.icon;

            const button = (
              <Button
                key={action.id}
                variant={isConfirming ? 'destructive' : (action.variant || 'outline')}
                size={isMobile ? 'sm' : 'sm'}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled || isLoading}
                className={cn(
                  'gap-1.5',
                  isMobile ? 'h-11 min-h-[44px] px-3' : 'h-8',
                  isConfirming && 'animate-pulse'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Обработка...</span>
                  </>
                ) : isConfirming ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Да?</span>
                  </>
                ) : (
                  <>
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="text-xs">{action.label}</span>
                  </>
                )}
              </Button>
            );

            if (action.tooltip && !isConfirming && !isMobile) {
              return (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    {action.tooltip}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </div>

        {!isMobile && <Separator orientation="vertical" className="h-6" />}

        {/* Clear selection button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isMobile ? 'default' : 'sm'}
              onClick={onClearSelection}
              className={cn(
                'p-0',
                isMobile ? 'h-11 w-11' : 'h-8 w-8'
              )}
            >
              <X className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
              <span className="sr-only">Снять выделение</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Снять выделение</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * Helper to get grammatically correct Russian label
 */
function getSelectedLabel(count: number, entityName: string): string {
  // Simple pluralization for Russian
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `Выбрано ${count} ${entityName}`;
  }

  if (lastDigit === 1) {
    // For singular, we might need to adjust the entity name
    return `Выбран ${count} элемент`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `Выбрано ${count} элемента`;
  }

  return `Выбрано ${count} ${entityName}`;
}

/**
 * Pre-configured batch action toolbar for psychometric items
 */
interface PsychometricBatchToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRetire?: () => void;
  onActivate?: () => void;
  onExport?: () => void;
  canRetire?: boolean;
  canActivate?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function PsychometricBatchToolbar({
  selectedCount,
  onClearSelection,
  onRetire,
  onActivate,
  onExport,
  canRetire = true,
  canActivate = true,
  isLoading = false,
  className,
}: PsychometricBatchToolbarProps) {
  const actions: BatchAction[] = [];

  if (onActivate && canActivate) {
    actions.push({
      id: 'activate',
      label: 'Активировать',
      icon: Check,
      onClick: onActivate,
      variant: 'outline',
      tooltip: 'Активировать выбранные элементы',
    });
  }

  if (onRetire && canRetire) {
    actions.push({
      id: 'retire',
      label: 'Отключить',
      icon: X,
      onClick: onRetire,
      variant: 'destructive',
      tooltip: 'Отключить выбранные элементы',
      requiresConfirmation: true,
    });
  }

  if (onExport) {
    actions.push({
      id: 'export',
      label: 'Экспорт',
      onClick: onExport,
      variant: 'outline',
      tooltip: 'Экспортировать данные выбранных элементов',
    });
  }

  return (
    <BatchActionToolbar
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={actions}
      entityName="элементов"
      isLoading={isLoading}
      className={className}
    />
  );
}

/**
 * Hook for managing batch selection state
 */
export function useBatchSelection<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const isSelected = React.useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = React.useCallback((items: T[]) => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectMany = React.useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectMany = React.useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
    selectMany,
    deselectMany,
    selectedArray: Array.from(selectedIds),
  };
}

export default BatchActionToolbar;
