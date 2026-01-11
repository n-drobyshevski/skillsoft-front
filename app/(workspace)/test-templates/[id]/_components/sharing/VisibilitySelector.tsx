'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Globe,
  Lock,
  Link2,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateVisibility } from '@/types/domain';
import { useChangeVisibility } from '@/hooks/queries';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useMaxBreakpoint } from '@/hooks/use-breakpoint';

interface VisibilitySelectorProps {
  templateId: string;
  currentVisibility: TemplateVisibility;
  activeLinksCount?: number;
  isOwner?: boolean;
  canManage?: boolean;
  onVisibilityChange?: (visibility: TemplateVisibility) => void;
}

const visibilityConfig: Record<
  TemplateVisibility,
  { icon: typeof Globe; color: string; bgColor: string; borderColor: string }
> = {
  [TemplateVisibility.PRIVATE]: {
    icon: Lock,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    borderColor: 'border-slate-300 dark:border-slate-700',
  },
  [TemplateVisibility.PUBLIC]: {
    icon: Globe,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-500',
  },
  [TemplateVisibility.LINK]: {
    icon: Link2,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-500',
  },
};

/**
 * VisibilitySelector - Radio group for changing template visibility
 *
 * Features:
 * - Visual cards for each visibility option
 * - Confirmation dialog when changing from LINK (revokes links)
 * - Loading state during mutation
 * - Toast notifications for success/error
 */
export function VisibilitySelector({
  templateId,
  currentVisibility,
  activeLinksCount = 0,
  isOwner = false,
  canManage = false,
  onVisibilityChange,
}: VisibilitySelectorProps) {
  const t = useTranslations('template.access.visibility');
  const tToast = useTranslations('template.access.toast');

  const [pendingVisibility, setPendingVisibility] =
    useState<TemplateVisibility | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const changeVisibility = useChangeVisibility();

  const canEdit = isOwner || canManage;
  const isMobile = useMaxBreakpoint('md');

  const handleVisibilitySelect = (value: string) => {
    const newVisibility = value as TemplateVisibility;
    if (newVisibility === currentVisibility) return;

    // If changing from LINK and there are active links, show confirmation
    if (
      currentVisibility === TemplateVisibility.LINK &&
      activeLinksCount > 0 &&
      newVisibility !== TemplateVisibility.LINK
    ) {
      setPendingVisibility(newVisibility);
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, change immediately
    performVisibilityChange(newVisibility);
  };

  const performVisibilityChange = async (visibility: TemplateVisibility) => {
    try {
      await changeVisibility.mutateAsync({
        templateId,
        request: { visibility },
      });

      toast.success(t('changedTo', { visibility: t(`options.${visibility.toLowerCase()}`) }));
      onVisibilityChange?.(visibility);
    } catch (error) {
      toast.error(tToast('visibilityFailed'));
      console.error('Visibility change error:', error);
    }
  };

  const handleConfirmChange = async () => {
    if (pendingVisibility) {
      await performVisibilityChange(pendingVisibility);
    }
    setShowConfirmDialog(false);
    setPendingVisibility(null);
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
    setPendingVisibility(null);
  };

  // Mobile: Compact segmented toggle group
  const renderMobileSelector = () => (
    <div className="space-y-2">
      <ToggleGroup
        type="single"
        value={currentVisibility}
        onValueChange={(value) => value && handleVisibilitySelect(value)}
        disabled={!canEdit || changeVisibility.isPending}
        className="w-full grid grid-cols-3 gap-0 p-1 bg-muted rounded-lg"
      >
        {Object.values(TemplateVisibility).map((visibility) => {
          const config = visibilityConfig[visibility];
          const Icon = config.icon;
          const isSelected = currentVisibility === visibility;
          const isPending =
            changeVisibility.isPending &&
            (pendingVisibility === visibility ||
              (!pendingVisibility && isSelected));

          return (
            <Tooltip key={visibility}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={visibility}
                  aria-label={t(`options.${visibility.toLowerCase()}`)}
                  disabled={!canEdit || changeVisibility.isPending}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2',
                    'text-xs font-medium rounded-md transition-all',
                    'data-[state=on]:bg-background data-[state=on]:shadow-sm',
                    isSelected && config.color,
                    !canEdit && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className={cn('h-4 w-4', isSelected && config.color)} />
                  )}
                  <span className="truncate">
                    {t(`options.${visibility.toLowerCase()}`)}
                  </span>
                  {visibility === TemplateVisibility.LINK &&
                    activeLinksCount > 0 && (
                      <span className="ml-0.5 text-[10px] opacity-70">
                        ({activeLinksCount})
                      </span>
                    )}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-center">
                <p className="text-xs">{t(`options.${visibility.toLowerCase()}Desc`)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ToggleGroup>

      {/* Show description of selected option */}
      <p className="text-xs text-muted-foreground text-center px-2">
        {t(`options.${currentVisibility.toLowerCase()}Desc`)}
      </p>
    </div>
  );

  // Desktop: Card-based layout (slightly more compact)
  const renderDesktopSelector = () => (
    <RadioGroup
      value={currentVisibility}
      onValueChange={handleVisibilitySelect}
      disabled={!canEdit || changeVisibility.isPending}
      className="grid gap-2"
    >
      {Object.values(TemplateVisibility).map((visibility) => {
        const config = visibilityConfig[visibility];
        const Icon = config.icon;
        const isSelected = currentVisibility === visibility;

        return (
          <div key={visibility} className="relative">
            <RadioGroupItem
              value={visibility}
              id={`visibility-${visibility}`}
              className="sr-only"
            />
            <Label
              htmlFor={`visibility-${visibility}`}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer',
                'transition-all duration-200',
                canEdit && 'hover:bg-accent/50',
                isSelected
                  ? `${config.borderColor} ${config.bgColor}`
                  : 'border-border bg-card',
                !canEdit && 'cursor-not-allowed opacity-60'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-md transition-colors shrink-0',
                  isSelected ? 'bg-white/50 dark:bg-black/20' : 'bg-muted'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isSelected ? config.color : 'text-muted-foreground'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {t(`options.${visibility.toLowerCase()}`)}
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                  {visibility === TemplateVisibility.LINK &&
                    activeLinksCount > 0 && (
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        {activeLinksCount}
                      </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {t(`options.${visibility.toLowerCase()}Desc`)}
                </p>
              </div>

              {changeVisibility.isPending &&
                (pendingVisibility === visibility ||
                  (!pendingVisibility && isSelected)) && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                )}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );

  return (
    <>
      {isMobile ? renderMobileSelector() : renderDesktopSelector()}

      {/* Confirmation Dialog for revoking links */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('revokeDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t('revokeDialog.message', { count: activeLinksCount })}
              </p>
              <p>
                {t('revokeDialog.warning')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmChange}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {changeVisibility.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('revokeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface VisibilityBadgeProps {
  visibility: TemplateVisibility;
  className?: string;
  size?: 'sm' | 'default';
}

/**
 * VisibilityBadge - Read-only display of visibility status
 */
export function VisibilityBadge({
  visibility,
  className,
  size = 'default',
}: VisibilityBadgeProps) {
  const t = useTranslations('template.access.visibility');
  const config = visibilityConfig[visibility];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 font-normal',
        config.bgColor,
        size === 'sm' ? 'text-xs px-1.5 py-0' : '',
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.color)} />
      <span className={config.color}>{t(`options.${visibility.toLowerCase()}`)}</span>
    </Badge>
  );
}
