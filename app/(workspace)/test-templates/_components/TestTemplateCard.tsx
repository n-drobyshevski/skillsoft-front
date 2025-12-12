'use client';

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTemplateSummary, AssessmentGoal, AssessmentGoalInfo } from "@/types/domain";
import {
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Pencil,
  Crosshair,
  Users,
  Briefcase,
  Eye,
  Sparkles,
  Info
} from "lucide-react";
import StartTestSessionButton from "./StartTestSessionButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        className: 'bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        cardAccent: 'border-l-4 border-l-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-950/30'
      };
    case AssessmentGoal.TEAM_FIT:
      return {
        icon: Users,
        variant: 'secondary' as const,
        className: 'bg-violet-100 hover:bg-violet-200 text-violet-800 font-medium border-violet-300 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
        cardAccent: 'border-l-4 border-l-violet-500',
        iconBg: 'bg-violet-100 dark:bg-violet-950/30'
      };
    case AssessmentGoal.OVERVIEW:
    default:
      return {
        icon: Crosshair,
        variant: 'outline' as const,
        className: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        cardAccent: 'border-l-4 border-l-emerald-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/30'
      };
  }
}

export default function TestTemplateCard({
  template,
  canEdit = false,
  isRecommended = false
}: TestTemplateCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  const goalConfig = getGoalConfig(template.goal);
  const GoalIcon = goalConfig.icon;
  const goalInfo = template.goal ? AssessmentGoalInfo[template.goal] : AssessmentGoalInfo[AssessmentGoal.OVERVIEW];

  return (
    <Card
      className={`group flex flex-col h-full transition-all duration-300 hover:shadow-modern-lg hover:-translate-y-2 touch-manipulation relative overflow-hidden ${goalConfig.cardAccent}`}
    >
      {/* Recommended Badge - Top Right Corner */}
      {isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant="default"
            className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Рекомендуем
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 sm:pb-4 space-y-3">
        {/* Title Row with Actions */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {template.name}
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/test-templates/${template.id}/settings`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent/50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Редактировать</TooltipContent>
              </Tooltip>
            )}
            {!isRecommended && (
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Активен</span>
                <span className="sm:hidden">✓</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {template.description && (
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {template.description}
          </CardDescription>
        )}

        {/* Assessment Goal Badge - More Prominent */}
        <div className="flex items-center gap-2">
          <Badge
            variant={goalConfig.variant}
            className={`${goalConfig.className} text-xs transition-all duration-200 group-hover:scale-105 px-3 py-1.5`}
          >
            <GoalIcon className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-semibold">{goalInfo.displayName}</span>
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center cursor-help hover:bg-muted/80 transition-colors">
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{goalInfo.description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      {/* Card Content - Stats Grid */}
      <CardContent className="flex-1 pb-3 sm:pb-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Duration */}
          <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background mb-1.5 shadow-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Время</span>
            <span className="font-semibold text-xs sm:text-sm mt-0.5">{formatDuration(template.timeLimitMinutes)}</span>
          </div>

          {/* Passing Score */}
          <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background mb-1.5 shadow-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Порог</span>
            <span className="font-semibold text-xs sm:text-sm mt-0.5">{template.passingScore}%</span>
          </div>

          {/* Competency Count */}
          <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background mb-1.5 shadow-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Навыки</span>
            <span className="font-semibold text-xs sm:text-sm mt-0.5">{template.competencyCount}</span>
          </div>
        </div>
      </CardContent>

      {/* Card Footer - Primary Actions */}
      <CardFooter className="pt-4 pb-4 border-t border-border/50 flex flex-col gap-2.5">
        {/* Primary Action: Test Drive */}
        <StartTestSessionButton
          templateId={template.id}
          templateName={template.name}
          fullWidth
          variant="hero"
        />

        {/* Secondary Action: View Details */}
        <Link href={`/test-templates/${template.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full group/btn font-medium"
            size="sm"
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            Подробная информация
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
