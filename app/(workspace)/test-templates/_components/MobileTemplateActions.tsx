'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Settings,
  Clock,
  Target,
  BookOpen,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssessmentGoal, AssessmentGoalInfo, TestTemplateSummary } from "@/types/domain";
import StartTestSessionButton from "./StartTestSessionButton";
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { deleteTestTemplate } from '@/app/actions';

interface MobileTemplateActionsProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Format duration for display
 */
function formatDuration(minutes: number, t: ReturnType<typeof useTranslations>): string {
  if (minutes < 60) return `${minutes} ${t('minutes')}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * MobileTemplateActions - Bottom sheet drawer for template actions on mobile
 *
 * Features:
 * - Template info with stats
 * - Primary CTA: Start Test
 * - Secondary actions: View Details, Edit (if canEdit)
 * - Full-width action buttons (48px height for touch targets)
 */
export default function MobileTemplateActions({
  template,
  canEdit = false,
  open,
  onOpenChange,
}: MobileTemplateActionsProps) {
  const router = useRouter();
  const t = useTranslations('template');
  const tCommon = useTranslations('common');
  const goalInfo = template.goal
    ? AssessmentGoalInfo[template.goal]
    : AssessmentGoalInfo[AssessmentGoal.OVERVIEW];

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        await deleteTestTemplate(template.id);
        toast.success(t('testDeleted'), {
          description: t('testDeletedDescription', { name: template.name }),
        });
        setDeleteDialogOpen(false);
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        toast.error(t('deleteError'), {
          description: error instanceof Error ? error.message : t('deleteErrorDescription'),
        });
      }
    });
  };

  return (
    <>
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        {/* Header */}
        <DrawerHeader className="text-center pb-2 pt-2">
          <DrawerTitle className="text-base font-semibold line-clamp-2">
            {template.name}
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-sm">
            {goalInfo.displayName}
          </DrawerDescription>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {formatDuration(template.timeLimitMinutes, t)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1">
              <Target className="size-3" />
              {template.passingScore}%
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3" />
              {template.competencyCount} {t('skills')}
            </span>
          </div>
        </DrawerHeader>

        {/* Actions */}
        <div className="px-4 pb-6 space-y-3">
          {/* Primary Action: Start Test */}
          <StartTestSessionButton
            templateId={template.id}
            templateName={template.name}
            fullWidth
            variant="hero"
          />

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/test-templates/${template.id}`} className="block no-underline">
              <Button
                variant="outline"
                className="w-full h-11 justify-center gap-2 text-sm font-medium"
                onClick={() => onOpenChange(false)}
              >
                <Eye className="h-4 w-4" />
                {t('details')}
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full h-11 justify-center gap-2 text-sm font-medium"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
          </div>

          {/* Edit Actions - Only for editors */}
          {canEdit && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/test-templates/${template.id}/settings`} className="block no-underline">
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-center gap-2 text-sm font-medium"
                    onClick={() => onOpenChange(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {t('settings')}
                  </Button>
                </Link>

                <Link href={`/test-templates/${template.id}/builder`} className="block no-underline">
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-center gap-2 text-sm font-medium"
                    onClick={() => onOpenChange(false)}
                  >
                    <Pencil className="h-4 w-4" />
                    {tCommon('edit')}
                  </Button>
                </Link>
              </div>

              {/* Delete Action */}
              <Button
                variant="outline"
                className="w-full h-11 justify-center gap-2 text-sm font-medium text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                {tCommon('delete')}
              </Button>
            </>
          )}
        </div>

      </DrawerContent>
    </Drawer>

    {/* Delete Confirmation Dialog */}
    {canEdit && (
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTest')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">
                  {t('deleteConfirmation')} <strong>&quot;{template.name}&quot;</strong>?
                </span>
                <span className="block text-muted-foreground/80">
                  {t('deleteWarning')}
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('deleting')}
                </>
              ) : (
                tCommon('delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
    </>
  );
}
