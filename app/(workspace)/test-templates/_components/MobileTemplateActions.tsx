'use client';

import React from "react";
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { TestTemplateSummary, AssessmentGoal, AssessmentGoalInfo } from "@/types/domain";
import {
  Eye,
  Settings,
  Pencil,
  X,
  Crosshair,
  Users,
  Briefcase,
} from "lucide-react";
import StartTestDriveButton from "./StartTestDriveButton";

interface MobileTemplateActionsProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Render goal icon component based on assessment goal
 */
function GoalIconDisplay({ goal, className }: { goal: AssessmentGoal | undefined; className?: string }) {
  switch (goal) {
    case AssessmentGoal.JOB_FIT:
      return <Briefcase className={className} />;
    case AssessmentGoal.TEAM_FIT:
      return <Users className={className} />;
    case AssessmentGoal.OVERVIEW:
    default:
      return <Crosshair className={className} />;
  }
}

/**
 * MobileTemplateActions - Bottom sheet drawer for template actions on mobile
 *
 * Features:
 * - Full-width action buttons (48px height for touch targets)
 * - Template info header
 * - Grouped actions: View, Edit (if canEdit), Test Drive (if canEdit)
 * - Proper accessibility with ARIA labels
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
        <DrawerHeader className="text-left pb-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <GoalIconDisplay goal={template.goal} className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-base line-clamp-2">
                {template.name}
              </DrawerTitle>
              <DrawerDescription className="mt-1">
                {goalInfo.displayName}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 py-2 space-y-2">
          {/* View Details */}
          <Link href={`/test-templates/${template.id}`} className="block">
            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3 text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              <Eye className="h-5 w-5 text-muted-foreground" />
              View Details
            </Button>
          </Link>

          {/* Edit Actions - Only for editors */}
          {canEdit && (
            <>
              <div className="pt-2 pb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                  Admin Actions
                </p>
              </div>

              <Link href={`/test-templates/${template.id}/settings`} className="block">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 text-base font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  Settings
                </Button>
              </Link>

              <Link href={`/test-templates/${template.id}/edit`} className="block">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 text-base font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                  Edit Template
                </Button>
              </Link>

              {/* Test Drive */}
              <div className="pt-2">
                <StartTestDriveButton
                  templateId={template.id}
                  templateName={template.name}
                  fullWidth
                />
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full h-12">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
