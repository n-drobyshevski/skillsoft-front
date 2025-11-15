"use client";

import { Badge } from "@/components/ui/badge";
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

export default function QuestionCard({ question }: { question: AssessmentQuestion }) {
  const isMobile = useIsMobile();

  const getDifficultyColor = (level: string) => {
    return DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.EXPERT;
  };

  const maxVisibleOptions = isMobile ? 2 : 3;
  const visibleOptions = question.answerOptions?.slice(0, maxVisibleOptions) || [];
  const remainingCount = (question.answerOptions?.length || 0) - maxVisibleOptions;

  return (
    <Link 
      href={`/assessment-questions/${question.id}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
    >
      <div className={`
        transition-all duration-200 ease-in-out cursor-pointer min-h-[44px]
        rounded-md border bg-card/50 hover:bg-card hover:shadow-md 
        hover:border-primary/40 group-focus-visible:shadow-md group-focus-visible:border-primary/40
        ${isMobile ? 'p-3' : 'p-4'}
      `}>
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge
            variant="outline"
            className={`
              ${getDifficultyColor(question.difficultyLevel)}
              text-sm px-3 py-1 min-h-[28px] font-medium rounded shrink-0
              leading-tight flex items-center
            `}
          >
            {question.difficultyLevel}
          </Badge>
          
          <ExternalLink className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
        </div>

        {/* Question Text - Enhanced for readability */}
        <div className="mb-3">
          <p className={`
            ${isMobile ? 'text-sm' : 'text-base'} 
            font-medium leading-[1.6] text-foreground
            line-clamp-2 group-hover:line-clamp-3 transition-all
          `}>
            {question.questionText}
          </p>
        </div>

        {/* Question Type - Improved contrast */}
        <div className="flex items-center gap-2 text-foreground/80 mb-3">
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium capitalize leading-tight">
            {question.questionType.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>

        {/* Answer Options - Better touch targets */}
        {question.answerOptions && question.answerOptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-foreground/70" />
              <span className="text-sm font-medium text-foreground/80 leading-tight">
                Options ({question.answerOptions.length})
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {visibleOptions.map((option, idx) => (
                <Badge
                  key={idx}
                  variant={option.correct ? "default" : "secondary"}
                  className={`
                    text-sm px-2.5 py-1 min-h-[28px] font-normal max-w-[100px] truncate rounded
                    leading-tight flex items-center
                    ${option.correct ? 'bg-primary/15 text-primary hover:bg-primary/20 border-primary/30' : 'bg-muted/60 text-foreground/80 hover:bg-muted/80'}
                  `}
                  title={option.text || option.label}
                >
                  {String.fromCharCode(65 + idx)}. {(option.text || option.label || '').substring(0, 10)}
                  {(option.text || option.label || '').length > 10 ? '...' : ''}
                </Badge>
              ))}
              
              {remainingCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-sm px-2.5 py-1 min-h-[28px] font-normal bg-muted/40 text-foreground/70 border-border/60 rounded leading-tight flex items-center"
                >
                  +{remainingCount}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Scoring Rubric Preview - Improved readability */}
        {question.scoringRubric && (
          <div className="border-t border-border/60 pt-3 mt-3">
            <p className="text-sm text-foreground/75 leading-[1.5] line-clamp-1">
              <span className="font-semibold">Scoring: </span>
              {question.scoringRubric}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}