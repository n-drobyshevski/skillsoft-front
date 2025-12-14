'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  MoreHorizontal,
  Settings,
} from "lucide-react";
import StartTestSessionButton from "./StartTestSessionButton";
import StartTestDriveButton from "./StartTestDriveButton";
import MobileTemplateActions from "./MobileTemplateActions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface TestTemplateCardProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
  isRecommended?: boolean;
}

/**
 * Get enhanced icon and color config for assessment goal badge
 */
function getGoalConfig(goal: AssessmentGoal | undefined) {
  switch (goal) {
    case AssessmentGoal.JOB_FIT:
      return {
        icon: Briefcase,
        variant: 'default' as const,
        chipClassName: 'bg-blue-500 text-white hover:bg-blue-600',
        cardAccent: 'border-t-4 border-t-blue-500',
      };
    case AssessmentGoal.TEAM_FIT:
      return {
        icon: Users,
        variant: 'secondary' as const,
        chipClassName: 'bg-violet-500 text-white hover:bg-violet-600',
        cardAccent: 'border-t-4 border-t-violet-500',
      };
    case AssessmentGoal.OVERVIEW:
    default:
      return {
        icon: Crosshair,
        variant: 'outline' as const,
        chipClassName: 'bg-emerald-500 text-white hover:bg-emerald-600',
        cardAccent: 'border-t-4 border-t-emerald-500',
      };
  }
}

/**
 * Format duration in minutes to human-readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * TestTemplateCard - Compact card layout for test templates
 *
 * Features:
 * - Goal badge as colored chip in top-left corner
 * - Inline stats row: duration | passing score | competency count
 * - Consolidated actions: Primary CTA + dropdown for secondary
 * - Mobile: Uses bottom sheet drawer for actions
 * - Hover lift animation
 */
export default function TestTemplateCard({
  template,
  canEdit = false,
  isRecommended = false,
}: TestTemplateCardProps) {
  const isMobile = useIsMobile();
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  const goalConfig = getGoalConfig(template.goal);
  const GoalIcon = goalConfig.icon;
  const goalInfo = template.goal ? AssessmentGoalInfo[template.goal] : AssessmentGoalInfo[AssessmentGoal.OVERVIEW];

  return (
    <>
      <Card
        className={`group flex flex-col h-full transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 touch-manipulation relative overflow-hidden ${goalConfig.cardAccent}`}
        tabIndex={0}
        role="article"
        aria-labelledby={`template-title-${template.id}`}
      >
        {/* Goal Badge - Top Left Corner */}
        <div className="absolute top-3 left-3 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`${goalConfig.chipClassName} px-2.5 py-1 text-xs font-semibold shadow-sm`}>
                <GoalIcon className="h-3 w-3 mr-1.5" />
                {goalInfo.displayName}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              {goalInfo.description}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Recommended Badge - Top Right Corner */}
        {isRecommended && (
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant="default"
              className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          </div>
        )}

        <CardHeader className="pt-12 pb-2 sm:pb-3 space-y-2">
          {/* Title */}
          <CardTitle
            id={`template-title-${template.id}`}
            className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors"
          >
            {template.name}
          </CardTitle>

          {/* Description */}
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          )}
        </CardHeader>

        {/* Card Content - Inline Stats */}
        <CardContent className="flex-1 pb-2 sm:pb-3">
          {/* Inline Stats Row */}
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap"
            aria-label="Template statistics"
          >
            {/* Duration */}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{formatDuration(template.timeLimitMinutes)}</span>
            </span>

            <span className="text-border" aria-hidden="true">|</span>

            {/* Passing Score */}
            <span className="inline-flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{template.passingScore}%</span>
            </span>

            <span className="text-border" aria-hidden="true">|</span>

            {/* Competency Count */}
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{template.competencyCount} skills</span>
            </span>
          </div>
        </CardContent>

        {/* Card Footer - Actions */}
        <CardFooter className="pt-3 pb-3 sm:pb-4 border-t border-border/50 flex items-center gap-2">
          {/* Primary Action: Start Test */}
          <div className="flex-1">
            <StartTestSessionButton
              templateId={template.id}
              templateName={template.name}
              fullWidth
              variant="hero"
            />
          </div>

          {/* Desktop: Dropdown for Secondary Actions */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/test-templates/${template.id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>

                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/test-templates/${template.id}/settings`} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/test-templates/${template.id}/edit`} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Template
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    {/* Test Drive Option in Dropdown */}
                    <div className="px-2 py-1.5">
                      <StartTestDriveButton
                        templateId={template.id}
                        templateName={template.name}
                        fullWidth
                      />
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile: Button to Open Bottom Sheet */}
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() => setMobileActionsOpen(true)}
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <MobileTemplateActions
          template={template}
          canEdit={canEdit}
          open={mobileActionsOpen}
          onOpenChange={setMobileActionsOpen}
        />
      )}
    </>
  );
}
