"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { AssessmentQuestion } from "../../interfaces/domain-interfaces";
import { CheckCircle, HelpCircle, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";

const DIFFICULTY_COLORS = {
  BASIC: "border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
  INTERMEDIATE: "border-yellow-500/30 text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/30",
  ADVANCED: "border-orange-500/30 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30",
  EXPERT: "border-red-500/30 text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30",
} as const;

const MOBILE_BADGE_CLASSES = "text-xs px-2 py-1";
const DESKTOP_BADGE_CLASSES = "text-xs px-3 py-1";

export default function QuestionCard({ question }: { question: AssessmentQuestion }) {
  const isMobile = useIsMobile();

  const getDifficultyColor = (level: string) => {
    return DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.EXPERT;
  };

  const badgeClasses = isMobile ? MOBILE_BADGE_CLASSES : DESKTOP_BADGE_CLASSES;
  const maxVisibleOptions = isMobile ? 3 : 4;
  const visibleOptions = question.answerOptions?.slice(0, maxVisibleOptions) || [];
  const remainingCount = (question.answerOptions?.length || 0) - maxVisibleOptions;

  return (
    <Link 
      href={`/assessment-questions/${question.id}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className={`
        transition-all duration-200 ease-in-out cursor-pointer
        hover:shadow-md hover:border-primary/20 
        group-focus-visible:shadow-md group-focus-visible:border-primary/20
        ${isMobile ? 'card-mobile-padding' : ''}
      `}>
        <CardHeader className={`${isMobile ? 'p-4 pb-3' : 'p-4 pb-3'}`}>
          <div className="flex items-start justify-between gap-3">
            <Badge
              variant="outline"
              className={`
                ${getDifficultyColor(question.difficultyLevel)}
                ${badgeClasses}
                font-medium rounded-full shrink-0 min-h-6
              `}
            >
              {question.difficultyLevel}
            </Badge>
            
            <ExternalLink className={`
              ${isMobile ? 'h-4 w-4' : 'h-4 w-4'} 
              text-muted-foreground/50 group-hover:text-muted-foreground 
              transition-colors shrink-0 mt-0.5
            `} />
          </div>
        </CardHeader>

        <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-4 pt-0'} space-y-4`}>
          {/* Question Text */}
          <div>
            <p className={`
              ${isMobile ? 'text-sm' : 'text-sm'} 
              font-medium leading-relaxed text-foreground
              line-clamp-3 group-hover:line-clamp-none transition-all
            `}>
              {question.questionText}
            </p>
          </div>

          {/* Question Type */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <HelpCircle className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} shrink-0`} />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium capitalize`}>
              {question.questionType.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>

          {/* Answer Options */}
          {question.answerOptions && question.answerOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} shrink-0 text-muted-foreground`} />
                <h4 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-muted-foreground`}>
                  Answer Options
                </h4>
              </div>
              
              <div className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
                {visibleOptions.map((option, idx) => (
                  <Badge
                    key={idx}
                    variant={option.correct ? "default" : "secondary"}
                    className={`
                      ${badgeClasses}
                      font-normal max-w-[120px] truncate
                      ${option.correct ? 'bg-primary/10 text-primary border-primary/20' : ''}
                    `}
                    title={option.text || option.label}
                  >
                    {option.text || option.label}
                    {option.score && ` (${option.score}pt)`}
                  </Badge>
                ))}
                
                {remainingCount > 0 && (
                  <Badge 
                    variant="outline" 
                    className={`${badgeClasses} font-normal`}
                  >
                    +{remainingCount} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Scoring Rubric Preview */}
          {question.scoringRubric && (
            <div className="border-t pt-3 mt-3">
              <p className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-muted-foreground leading-relaxed
                line-clamp-2
              `}>
                <span className="font-medium">Scoring: </span>
                {question.scoringRubric}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}