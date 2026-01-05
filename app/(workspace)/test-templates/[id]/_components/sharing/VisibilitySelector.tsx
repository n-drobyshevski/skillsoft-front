'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Globe,
  Lock,
  Link2,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TemplateVisibility,
  getVisibilityDisplayText,
  getVisibilityDescription,
} from '@/types/domain';
import { useChangeVisibility } from '@/hooks/queries';
import { toast } from 'sonner';

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
  const [pendingVisibility, setPendingVisibility] =
    useState<TemplateVisibility | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const changeVisibility = useChangeVisibility();

  const canEdit = isOwner || canManage;

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

      toast.success(`Visibility changed to ${getVisibilityDisplayText(visibility)}`);
      onVisibilityChange?.(visibility);
    } catch (error) {
      toast.error('Failed to change visibility');
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

  return (
    <>
      <RadioGroup
        value={currentVisibility}
        onValueChange={handleVisibilitySelect}
        disabled={!canEdit || changeVisibility.isPending}
        className="grid gap-3"
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
                  'flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer',
                  'transition-all duration-200 ease-out',
                  canEdit && 'hover:shadow-md hover:-translate-y-0.5',
                  isSelected
                    ? `${config.borderColor} ${config.bgColor} shadow-sm`
                    : 'border-border hover:border-primary/50 bg-card',
                  !canEdit && 'cursor-not-allowed opacity-60'
                )}
              >
                <div
                  className={cn(
                    'p-2.5 rounded-lg transition-colors shrink-0',
                    isSelected ? 'bg-white/50 dark:bg-black/20' : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isSelected ? config.color : 'text-muted-foreground'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {getVisibilityDisplayText(visibility)}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-200" />
                    )}
                    {visibility === TemplateVisibility.LINK &&
                      activeLinksCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {activeLinksCount} active
                        </Badge>
                      )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getVisibilityDescription(visibility)}
                  </p>
                </div>

                {changeVisibility.isPending &&
                  (pendingVisibility === visibility ||
                    (!pendingVisibility && isSelected)) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Confirmation Dialog for revoking links */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Revoke Active Share Links?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Changing visibility from <strong>Link</strong> will revoke all{' '}
                <strong>{activeLinksCount}</strong> active share link
                {activeLinksCount !== 1 && 's'}.
              </p>
              <p>
                Anyone with these links will no longer be able to access this
                template.
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
              Revoke & Change
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
      <span className={config.color}>{getVisibilityDisplayText(visibility)}</span>
    </Badge>
  );
}
