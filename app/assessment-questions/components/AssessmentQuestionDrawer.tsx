"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { AssessmentQuestion } from "../../interfaces/domain-interfaces";
import { questionDifficultyToColor, questionTypeToIcon } from "../../utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { Eye, Settings2 } from "lucide-react";

export default function AssessmentQuestionDrawer({
  open,
  onOpenChange,
  question,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  question: AssessmentQuestion;
}) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={`${
          isMobile 
            ? "w-full max-w-full sm:max-w-full" 
            : "sm:max-w-2xl"
        } p-0 flex flex-col`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <SheetHeader className={`${isMobile ? "p-4 pb-2" : "p-6 pb-2"}`}>
          <SheetTitle className={`${isMobile ? "text-xl" : "text-2xl"} font-bold leading-tight wrap-break-word`}>
            {question.questionText}
          </SheetTitle>
          <SheetDescription className={`${isMobile ? "text-sm" : "text-base"} leading-relaxed`}>
            Details for the assessment question.
          </SheetDescription>
          <div className="flex items-center justify-start gap-2 pt-4 flex-wrap">
            <Badge variant={question.isActive ? "default" : "secondary"} className="min-h-8">
              {question.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="outline"
              className={`${questionDifficultyToColor(question.difficultyLevel)} min-h-8`}
            >
              {question.difficultyLevel}
            </Badge>
            <div className="flex items-center gap-2 min-h-8">
              <span>{questionTypeToIcon(question.questionType)}</span>
              <span className={`font-medium ${isMobile ? "text-sm" : "text-base"}`}>
                {question.questionType
                  .split("_")
                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                  .join(" ")}
              </span>
            </div>
          </div>
        </SheetHeader>
        <Separator />
        <div className={`flex-1 overflow-y-auto ${isMobile ? "p-4" : "p-6"} space-y-6`}>
          {question.answerOptions && question.answerOptions.length > 0 && (
            <div>
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Answer Options</h3>
              <ul className="mt-2 space-y-2">
                {question.answerOptions.map((option, index) => (
                  <li key={index} className={`${isMobile ? "text-sm" : "text-sm"} text-muted-foreground leading-relaxed`}>
                    - {option.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Scoring Rubric</h3>
            <p className={`mt-2 ${isMobile ? "text-sm" : "text-sm"} text-muted-foreground leading-relaxed`}>
              {question.scoringRubric}
            </p>
          </div>
        </div>
        <SheetFooter className={`${isMobile ? "p-4" : "p-6"} bg-muted/40 border-t mt-auto`}>
          <div className={`flex ${isMobile ? "flex-col gap-3" : "flex-row gap-2"} w-full`}>
            <Link href={`/assessment-questions/${question.id}`} passHref className="flex-1">
              <Button 
                variant="outline" 
                className={`w-full ${isMobile ? "h-12 text-base" : "h-10"} min-h-11`}
              >
                <Eye className="mr-2 h-4 w-4" />
                Go to Page
              </Button>
            </Link>
            <Link href={`/assessment-questions/${question.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                className={`w-full ${isMobile ? "h-12 text-base" : "h-10"} min-h-11`}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Question
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
