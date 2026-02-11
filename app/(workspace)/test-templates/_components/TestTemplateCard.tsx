'use client';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTemplateSummary, AssessmentGoal, AssessmentGoalInfo } from "@/types/domain";
import {
  Clock,
  Target,
  BookOpen,
  Pencil,
  Crosshair,
  Users,
  Briefcase,
  Eye,
  Sparkles,
  MoreVertical,
  Settings,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
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
 * Goal configuration for styling - unified for both mobile and desktop
 */
const GOAL_CONFIG = {
  [AssessmentGoal.JOB_FIT]: {
    icon: Briefcase,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    borderClass: 'border-l-blue-500',
    iconBgClass: 'bg-blue-500/10',
    iconTextClass: 'text-blue-600 dark:text-blue-400',
  },
  [AssessmentGoal.TEAM_FIT]: {
    icon: Users,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    borderClass: 'border-l-violet-500',
    iconBgClass: 'bg-violet-500/10',
    iconTextClass: 'text-violet-600 dark:text-violet-400',
  },
  [AssessmentGoal.OVERVIEW]: {
    icon: Crosshair,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    borderClass: 'border-l-emerald-500',
    iconBgClass: 'bg-emerald-500/10',
    iconTextClass: 'text-emerald-600 dark:text-emerald-400',
  },
};

function getGoalConfig(goal: AssessmentGoal | undefined) {
  return GOAL_CONFIG[goal || AssessmentGoal.OVERVIEW];
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
  isRecommended,
  goalConfig,
  onMenuOpen,
}: {
  template: TestTemplateSummary;
  canEdit: boolean;
  isRecommended: boolean;
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
        "flex items-center gap-3 px-3 py-2.5 w-full",
        "bg-card rounded-md border",
        // No underline on link
        "no-underline",
        // Goal indicator as left border
        "border-l-[3px]",
        goalConfig.borderClass,
        // Touch interaction
        "active:bg-accent/50 transition-colors touch-manipulation",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      role="article"
      aria-labelledby={`template-title-${template.id}`}
    >
      {/* Goal Icon Container */}
      <div
        className={cn(
          "shrink-0 size-9 rounded-lg flex items-center justify-center",
          goalConfig.iconBgClass
        )}
      >
        <GoalIcon className={cn("size-4", goalConfig.iconTextClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title Row */}
        <div className="flex items-center gap-1.5">
          <h3
            id={`template-title-${template.id}`}
            className="text-sm font-medium truncate no-underline decoration-transparent"
          >
            {template.name}
          </h3>
          {isRecommended && (
            <Sparkles className="size-3.5 text-amber-500 shrink-0" aria-label={t('recommended')} />
          )}
        </div>

        {/* Inline Stats Row */}
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="size-3" />
            {formatDuration(template.timeLimitMinutes, true, t)}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-0.5">
            <Target className="size-3" />
            {template.passingScore}%
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-0.5">
            <BookOpen className="size-3" />
            {template.competencyCount}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuOpen();
          }}
          aria-label={t('actions')}
        >
          <MoreVertical className="size-4" />
        </Button>
        <ChevronRight className="size-4 text-muted-foreground/50" />
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
  isRecommended,
  goalConfig,
}: {
  template: TestTemplateSummary;
  canEdit: boolean;
  isRecommended: boolean;
  goalConfig: ReturnType<typeof getGoalConfig>;
}) {
  const router = useRouter();
  const t = useTranslations('template');
  const tCommon = useTranslations('common');
  const GoalIcon = goalConfig.icon;
  const goalInfo = template.goal ? AssessmentGoalInfo[template.goal] : AssessmentGoalInfo[AssessmentGoal.OVERVIEW];

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
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
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
            <Badge variant="secondary" className={cn("text-xs font-medium px-2 py-0.5", goalConfig.badgeClass)}>
              <GoalIcon className="h-3 w-3 mr-1" />
              {goalInfo.displayName}
            </Badge>

            {/* Recommended Badge */}
            {isRecommended && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-medium px-2 py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                {t('recommended')}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 -mr-1 -mt-1">
            {/* Edit Button - Icon only */}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={tCommon('edit')}
                asChild
              >
                <Link href={`/test-templates/${template.id}/builder`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Menu Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label={t('actions')}
                >
                  <MoreVertical className="h-4 w-4" />
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
                    <DropdownMenuItem asChild>
                      <Link href={`/test-templates/${template.id}/builder`} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        {tCommon('edit')}
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
        <div className="flex flex-wrap gap-1.5" aria-label={t('testConfiguration')}>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
            <Clock className="h-3 w-3" />
            {formatDuration(template.timeLimitMinutes, false, t)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
            <Target className="h-3 w-3" />
            {template.passingScore}%
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
            <BookOpen className="h-3 w-3" />
            {template.competencyCount} {t('skills')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 mt-auto">
        <StartTestSessionButton
          templateId={template.id}
          templateName={template.name}
          fullWidth
          variant="hero"
        />
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
          isRecommended={isRecommended}
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
      isRecommended={isRecommended}
      goalConfig={goalConfig}
    />
  );
}
