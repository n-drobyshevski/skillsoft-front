"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { AssessmentQuestion, BehavioralIndicator, Competency } from "../../interfaces/domain-interfaces";
import { competenciesApi, behavioralIndicatorsApi, assessmentQuestionsApi } from "@/services/api";
import { questionDifficultyToColor, questionTypeToIcon } from "../../utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Settings2, ExternalLink, Loader2, Target, Award, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AssessmentQuestionDrawer({
  open,
  onOpenChange,
  question,
  indicator,
  onQuestionDeleted,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  question: AssessmentQuestion;
  indicator?: BehavioralIndicator;
  onQuestionDeleted?: () => void;
}) {
  const isMobile = useIsMobile();
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [currentIndicator, setCurrentIndicator] = useState<BehavioralIndicator | null>(indicator || null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteQuestion = async () => {
    setIsDeleting(true);
    try {
      const competencyId = competency?.id;
      const behavioralIndicatorId = currentIndicator?.id || question.behavioralIndicatorId;
      
      if (!competencyId || !behavioralIndicatorId) {
        throw new Error("Missing required context for deletion");
      }
      
      await assessmentQuestionsApi.deleteQuestion(
        competencyId,
        behavioralIndicatorId,
        question.id
      );
      onQuestionDeleted?.();
      onOpenChange(false);
    } catch {
      // Error handling would go here - for now just stop loading
    } finally {
      setIsDeleting(false);
    }
  };

  // Load competency and indicator context when needed
  useEffect(() => {
    if (!open || !question) return;

    const loadContext = async () => {
      setIsLoadingContext(true);
      try {
        // If we don't have indicator context, try to load it from the question
        if (!indicator && question.behavioralIndicatorId) {
          const indicatorData = await behavioralIndicatorsApi.getIndicatorById(question.behavioralIndicatorId);
          setCurrentIndicator(indicatorData);
        }

        // Load competency data
        const competencyId = indicator?.competencyId || currentIndicator?.competencyId;
        if (competencyId) {
          const competencyData = await competenciesApi.getCompetencyById(competencyId);
          setCompetency(competencyData);
        }
      } catch {
        // Silent error handling - context loading is optional
      } finally {
        setIsLoadingContext(false);
      }
    };

    loadContext();
  }, [open, question, indicator, currentIndicator?.competencyId]);

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
          
          {/* Context Information */}
          {(competency || currentIndicator || isLoadingContext) && (
            <div className="border border-muted rounded-lg p-4 mt-4 space-y-3 bg-muted/30">
              
              {isLoadingContext ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading context...
                </div>
              ) : (
                <div className="space-y-2">
                  {competency && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-muted-foreground">Competency:</span>
                      <Link 
                        href={`/competencies/${competency.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
                      >
                        {competency.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                  
                  {currentIndicator && (
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-muted-foreground">Indicator:</span>
                      <Link 
                        href={`/behavioral-indicators/${currentIndicator.id}`}
                        className="text-green-600 hover:text-green-800 hover:underline font-medium flex items-center gap-1"
                      >
                        {currentIndicator.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
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
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-3 flex items-center gap-2`}>
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
                Answer Options
              </h3>
              <div className="space-y-2">
                {question.answerOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`${isMobile ? "text-sm" : "text-sm"} leading-relaxed p-3 border rounded-lg bg-card flex items-start gap-3`}
                  >
                    <span className="font-semibold text-blue-600 min-w-6 text-center">{String.fromCharCode(65 + index)}</span>
                    <span className="text-card-foreground">{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-3 flex items-center gap-2`}>
              <div className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                S
              </div>
              Scoring Rubric
            </h3>
            <div className="border rounded-lg bg-card p-4">
              <p className={`${isMobile ? "text-sm" : "text-sm"} text-card-foreground leading-relaxed`}>
                {question.scoringRubric}
              </p>
            </div>
          </div>
        </div>
        <SheetFooter className={`${isMobile ? "p-4" : "p-6"} border-t mt-auto`}>
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className={`${isMobile ? "w-full h-12 text-base" : "h-10"} min-h-11 ${isMobile ? "" : "px-4"}`}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isMobile ? "Delete Question" : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this assessment question? This action cannot be undone and will permanently remove the question from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteQuestion}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Question"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
