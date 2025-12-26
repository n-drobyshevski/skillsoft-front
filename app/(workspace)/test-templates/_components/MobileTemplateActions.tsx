'use client';

import {
  Eye,
  Pencil,
  Settings,
  Clock,
  Target,
  BookOpen,
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
import { AssessmentGoal, AssessmentGoalInfo, TestTemplateSummary } from "@/types/domain";
import StartTestDriveButton from "./StartTestDriveButton";
import StartTestSessionButton from "./StartTestSessionButton";

interface MobileTemplateActionsProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Format duration for display
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
}

/**
 * MobileTemplateActions - Bottom sheet drawer for template actions on mobile
 *
 * Features:
 * - Template info with stats
 * - Primary CTA: Start Test
 * - Secondary actions: View Details, Edit (if canEdit), Test Drive (if canEdit)
 * - Full-width action buttons (48px height for touch targets)
 */
export default function MobileTemplateActions({
  template,
  canEdit = false,
  open,
  onOpenChange,
}: MobileTemplateActionsProps) {
  const goalInfo = template.goal
    ? AssessmentGoalInfo[template.goal]
    : AssessmentGoalInfo[AssessmentGoal.OVERVIEW];

  return (
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
              {formatDuration(template.timeLimitMinutes)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1">
              <Target className="size-3" />
              {template.passingScore}%
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3" />
              {template.competencyCount} навыков
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
                Подробнее
              </Button>
            </Link>

            {canEdit ? (
              <StartTestDriveButton
                templateId={template.id}
                templateName={template.name}
                fullWidth
                className="h-11"
              />
            ) : (
              <Button
                variant="outline"
                className="w-full h-11 justify-center gap-2 text-sm font-medium"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
            )}
          </div>

          {/* Edit Actions - Only for editors */}
          {canEdit && (
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/test-templates/${template.id}/settings`} className="block no-underline">
                <Button
                  variant="outline"
                  className="w-full h-11 justify-center gap-2 text-sm font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  <Settings className="h-4 w-4" />
                  Настройки
                </Button>
              </Link>

              <Link href={`/test-templates/${template.id}/builder`} className="block no-underline">
                <Button
                  variant="outline"
                  className="w-full h-11 justify-center gap-2 text-sm font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  <Pencil className="h-4 w-4" />
                  Изменить
                </Button>
              </Link>
            </div>
          )}
        </div>

      </DrawerContent>
    </Drawer>
  );
}
