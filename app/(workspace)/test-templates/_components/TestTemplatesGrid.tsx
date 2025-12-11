'use client';

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTemplateSummary } from "@/types/domain";
import { AssessmentGoal, AssessmentGoalInfo } from "@/types/domain";
import { Clock, Target, ArrowRight, BookOpen, CheckCircle2, Pencil, Crosshair, Users, Briefcase } from "lucide-react";

interface TestTemplatesGridProps {
  templates: TestTemplateSummary[];
  canEdit?: boolean;
}

export default function TestTemplatesGrid({ templates, canEdit = false }: TestTemplatesGridProps) {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {templates.map((template) => (
        <TestTemplateCard key={template.id} template={template} canEdit={canEdit} />
      ))}
    </div>
  );
}

interface TestTemplateCardProps {
  template: TestTemplateSummary;
  canEdit?: boolean;
}

/**
 * Get icon and color config for assessment goal badge
 * Updated to use monochrome color scheme
 */
function getGoalConfig(goal: AssessmentGoal | undefined) {
  switch (goal) {
    case AssessmentGoal.JOB_FIT:
      return {
        icon: Briefcase,
        variant: 'default' as const,
        className: 'bg-accent hover:bg-accent/80 text-accent-foreground font-medium'
      };
    case AssessmentGoal.TEAM_FIT:
      return {
        icon: Users,
        variant: 'secondary' as const,
        className: 'bg-muted hover:bg-muted/80 text-muted-foreground font-medium border-border'
      };
    case AssessmentGoal.OVERVIEW:
    default:
      return {
        icon: Crosshair,
        variant: 'outline' as const,
        className: 'font-medium hover:bg-accent/50'
      };
  }
}

function TestTemplateCard({ template, canEdit = false }: TestTemplateCardProps) {
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
    <Card className="group flex flex-col h-full transition-all duration-300 hover:shadow-modern-lg hover:-translate-y-1 border-border/50 hover:border-border touch-manipulation">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {canEdit && (
              <Link href={`/test-templates/${template.id}/edit`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-7 sm:w-7 min-h-10 min-w-10 sm:min-h-0 sm:min-w-0 hover:bg-accent/50 transition-colors"
                  title="Редактировать"
                >
                  <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </Link>
            )}
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Активен</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          </div>
        </div>
        {template.description && (
          <CardDescription className="line-clamp-2 mt-2 text-sm leading-relaxed">
            {template.description}
          </CardDescription>
        )}
        {/* Assessment Goal Badge with enhanced styling */}
        <div className="mt-3">
          <Badge
            variant={goalConfig.variant}
            className={`${goalConfig.className} text-xs transition-all duration-200 group-hover:scale-105`}
            title={goalInfo.description}
          >
            <GoalIcon className="h-3.5 w-3.5 mr-1.5" />
            <span>{goalInfo.displayName}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 sm:pb-4">
        <div className="space-y-2.5">
          {/* Duration info with improved layout */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground/80">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground/70">Длительность</span>
              <span className="font-medium text-foreground truncate">{formatDuration(template.timeLimitMinutes)}</span>
            </div>
          </div>

          {/* Passing score info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground/80">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground/70">Проходной балл</span>
              <span className="font-medium text-foreground">{template.passingScore}%</span>
            </div>
          </div>

          {/* Competency count info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground/80">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground/70">Компетенции</span>
              <span className="font-medium text-foreground">{template.competencyCount}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 sm:pt-4 border-t border-border/50">
        <Link href={`/test-templates/${template.id}`} className="w-full">
          <Button
            className="w-full group/btn min-h-11 font-medium shadow-sm hover:shadow-md transition-all"
            variant="default"
          >
            Подробнее
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
