'use client';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTemplateSummary, AssessmentGoal } from "@/types/domain";
import { GoalBadge, getGoalConfig } from "@/components/catalog/GoalBadge";
import { TemplateStats } from "@/components/catalog/TemplateStats";
import {
  Clock,
  Target,
  BookOpen,
  Pencil,
  Eye,
  MoreVertical,
  Settings,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import StartTestSessionButton from "./StartTestSessionButton";
import MobileTemplateActions from "./MobileTemplateActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { deleteTestTemplate } from '@/app/actions';

interface TestTemplateCardProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
  isRecommended?: boolean;
}


/**
 * Format duration - compact for mobile, full for desktop
 */
function formatDuration(minutes: number, compact = false, t?: ReturnType<typeof useTranslations>): string {
  if (minutes < 60) {
    return compact ? `${minutes}m` : `${minutes} ${t?.('minutes') || 'min'}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (compact) {
    return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours}h`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Mobile Compact Card - Horizontal list item pattern (~64-72px height)
 * Inspired by Linear, Notion, Apple Music patterns
 */
function MobileTemplateCard({
  template,
  canEdit,
  goalConfig,
  onMenuOpen,
}: {
  template: TestTemplateSummary;
  canEdit: boolean;
  goalConfig: ReturnType<typeof getGoalConfig>;
  onMenuOpen: () => void;
}) {
  const t = useTranslations('template');
  const GoalIcon = goalConfig.icon;

  return (
    <Link
      href={`/test-templates/${template.id}/start`}
      className={cn(
        // Base container - horizontal flex, full width
        "flex items-start gap-3 px-3 py-2.5 w-full",
        "bg-card rounded-md border",
        // No underline on link
        "no-underline",
        // Goal indicator as left border
        "border-l-[3px]",
        goalConfig.borderClass,
        // Touch interaction
        "active:bg-accent/50 active:scale-[0.98] transition-all touch-manipulation motion-reduce:transition-none",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
      )}
      role="article"
      aria-labelledby={`template-title-${template.id}`}
    >
      {/* Goal Icon Container */}
      <div
        className={cn(
          "shrink-0 size-9 rounded-lg flex items-center justify-center mt-0.5",
          goalConfig.iconBgClass
        )}
      >
        <GoalIcon className={cn("size-4", goalConfig.iconTextClass)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title Row */}
        <div className="flex items-start gap-1.5">
          <h3
            id={`template-title-${template.id}`}
            className="text-sm font-medium line-clamp-2 no-underline decoration-transparent"
          >
            {template.name}
          </h3>
          {template.version != null && (
            <Badge variant="outline" className="shrink-0 text-xs-safe px-1.5 py-0 h-4 font-medium text-muted-foreground">
              v{template.version}
            </Badge>
          )}
        </div>

        {/* Inline Stats Row */}
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="size-3 shrink-0" aria-hidden="true" />
            {formatDuration(template.timeLimitMinutes, true, t)}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-0.5">
            <Target className="size-3 shrink-0" aria-hidden="true" />
            {template.passingScore}%
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-0.5">
            <BookOpen className="size-3 shrink-0" aria-hidden="true" />
            {template.competencyCount}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-muted-foreground touch-manipulation"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuOpen();
          }}
          aria-label={t('actions')}
        >
          <MoreVertical className="size-4" />
        </Button>
        <ChevronRight className="size-4 text-muted-foreground/50" aria-hidden="true" />
      </div>
    </Link>
  );
}

/**
 * Desktop Card - Vertical layout with full details
 */
function DesktopTemplateCard({
  template,
  canEdit,
  goalConfig,
}: {
  template: TestTemplateSummary;
  canEdit: boolean;
  goalConfig: ReturnType<typeof getGoalConfig>;
}) {
  const router = useRouter();
  const t = useTranslations('template');
  const tCommon = useTranslations('common');

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
    <Card
      className={cn(
        "group flex flex-col h-full bg-card overflow-hidden",
        "hover:shadow-md hover:border-primary/30 hover:-translate-y-px transition-all duration-200 motion-reduce:transition-none",
        // Goal indicator as left border instead of top accent bar
        "border-l-[3px]",
        goalConfig.borderClass
      )}
      tabIndex={0}
      role="article"
      aria-labelledby={`template-title-${template.id}`}
    >
      <CardHeader className="p-4 pb-3">
        {/* Top row: Badges + Menu */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Goal Badge */}
            <GoalBadge goal={template.goal || AssessmentGoal.OVERVIEW} />

            {/* DRAFT Status Badge or Version Badge */}
            {template.status === 'DRAFT' ? (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-medium px-2 py-0.5">
                {t('draft')}
              </Badge>
            ) : template.version != null ? (
              <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 text-muted-foreground">
                v{template.version}
              </Badge>
            ) : null}
          </div>

          {/* Overflow Menu — always visible */}
          <div className="flex items-center -mr-1 -mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t('actions')}
                >
                  <MoreVertical className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/test-templates/${template.id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    {t('details')}
                  </Link>
                </DropdownMenuItem>

                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/test-templates/${template.id}/settings`} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {tCommon('delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h3
          id={`template-title-${template.id}`}
          className="text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors"
        >
          {template.name}
        </h3>

        {/* Description */}
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {template.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        {/* Stats Row */}
        <TemplateStats template={template} variant="pills" />
      </CardContent>

      <Separator className="mx-4 w-auto" />

      <CardFooter className="p-4 pt-3 mt-auto">
        {canEdit ? (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 min-w-0 gap-1.5 touch-manipulation active:scale-[0.98] transition-all motion-reduce:transition-none"
              asChild
            >
              <Link href={`/test-templates/${template.id}/builder`}>
                <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                {tCommon('edit')}
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <StartTestSessionButton
                templateId={template.id}
                templateName={template.name}
                fullWidth
                variant="default"
                size="default"
              />
            </div>
          </div>
        ) : (
          <StartTestSessionButton
            templateId={template.id}
            templateName={template.name}
            fullWidth
            variant="hero"
          />
        )}
      </CardFooter>
    </Card>

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

/**
 * TestTemplateCard - Responsive card with mobile-optimized horizontal layout
 *
 * Mobile (<640px): Compact horizontal list item (~64-72px)
 * - Tappable card navigates to start page
 * - Goal shown as colored left border + icon
 * - Single-line title with truncation
 * - Inline icon-only stats
 * - Menu for secondary actions
 *
 * Desktop (>=640px): Vertical card with full details
 * - Goal badge + description
 * - Full stats with labels
 * - Prominent action buttons
 */
export default function TestTemplateCard({
  template,
  canEdit = false,
  isRecommended = false,
}: TestTemplateCardProps) {
  const isMobile = useIsMobile();
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  const goalConfig = getGoalConfig(template.goal);

  // Mobile: Compact horizontal layout
  if (isMobile) {
    return (
      <>
        <MobileTemplateCard
          template={template}
          canEdit={canEdit}
          goalConfig={goalConfig}
          onMenuOpen={() => setMobileActionsOpen(true)}
        />
        <MobileTemplateActions
          template={template}
          canEdit={canEdit}
          open={mobileActionsOpen}
          onOpenChange={setMobileActionsOpen}
        />
      </>
    );
  }

  // Desktop: Full vertical card
  return (
    <DesktopTemplateCard
      template={template}
      canEdit={canEdit}
      goalConfig={goalConfig}
    />
  );
}
