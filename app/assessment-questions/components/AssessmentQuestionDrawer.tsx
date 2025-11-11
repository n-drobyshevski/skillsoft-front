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
import { questionDifficultyToColor } from "../../utils";
import { CompetencyHoverCard } from "../../behavioral-indicators/[indicatorId]/components/CompetencyHoverCard";
import { IndicatorHoverCard } from "../../components/IndicatorHoverCard";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { deleteAssessmentQuestion } from "@/src/app/actions";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Settings2, ExternalLink, Loader2, Trash2 } from "lucide-react";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const competencyId = competency?.id;
      const behavioralIndicatorId = currentIndicator?.id || question.behavioralIndicatorId;
      
      await deleteAssessmentQuestion(question.id, competencyId, behavioralIndicatorId);
      toast.success('Assessment question deleted successfully');
      onQuestionDeleted?.();
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete question. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const buttonSizeClass = `${isMobile ? "h-12 text-base" : "h-10"} min-h-11`;

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
          <SheetTitle className={`${isMobile ? "text-xl" : "text-2xl"} font-bold leading-tight wrap-break-word flex-1 pr-2`}>
            {question.questionText}
          </SheetTitle>
          <SheetDescription className={`${isMobile ? "text-sm" : "text-base"} leading-relaxed`}>
            Details for the assessment question.
          </SheetDescription>
          
          {/* Context Information */}
          {(competency || currentIndicator || isLoadingContext) && (
            <div className="border border-border rounded-lg p-4 mt-4 space-y-3 bg-muted/20">
              
              {isLoadingContext ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading context...
                </div>
              ) : (
                <div className="space-y-3">
                  {competency && (
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Competency:</span>
                      <div className="mt-1">
                        <CompetencyHoverCard competencyId={competency.id}>
                          <Link 
                            href={`/competencies/${competency.id}`}
                            className="text-primary hover:text-primary/80 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            {competency.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </CompetencyHoverCard>
                      </div>
                    </div>
                  )}
                  
                  {currentIndicator && (
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Behavioral Indicator:</span>
                      <div className="mt-1">
                        <IndicatorHoverCard indicatorId={currentIndicator.id}>
                          <Link 
                            href={`/behavioral-indicators/${currentIndicator.id}`}
                            className="text-primary hover:text-primary/80 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            {currentIndicator.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </IndicatorHoverCard>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-start gap-3 pt-4 flex-wrap">
            <Badge variant={question.isActive ? "default" : "secondary"} className="min-h-8">
              {question.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="outline"
              className={`${questionDifficultyToColor(question.difficultyLevel)} min-h-8`}
            >
              {question.difficultyLevel}
            </Badge>
            <div className="text-sm font-medium text-muted-foreground">
              {question.questionType
                .split("_")
                .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                .join(" ")}
            </div>
          </div>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "p-4" : "p-6"} space-y-6`}>
            {question.answerOptions && question.answerOptions.length > 0 && (
              <div>
                <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-4`}>
                  Answer Options
                </h3>
                <div className="space-y-3">
                  {question.answerOptions.map((option, index) => (
                    <div 
                      key={index} 
                      className={`${isMobile ? "text-sm" : "text-sm"} leading-relaxed p-3 border rounded-lg bg-card flex gap-3`}
                    >
                      <span className="font-semibold text-primary min-w-4">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-foreground">{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-4`}>
                Scoring Rubric
              </h3>
              <div className="border rounded-lg bg-card p-4">
                <p className={`${isMobile ? "text-sm" : "text-sm"} text-foreground leading-relaxed`}>
                  {question.scoringRubric}
                </p>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className={`${isMobile ? "p-4" : "p-6"} bg-muted/40 border-t mt-auto`}>
          <div className={`flex ${isMobile ? "flex-col gap-3" : "flex-row gap-2"} w-full`}>
            <Button 
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className={`${buttonSizeClass} text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Link href={`/assessment-questions/${question.id}`} passHref className="flex-1">
              <Button 
                variant="outline" 
                className={`w-full ${buttonSizeClass}`}
              >
                <Eye className="mr-2 h-4 w-4" />
                Go to Page
              </Button>
            </Link>
            <Link href={`/assessment-questions/${question.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                className={`w-full ${buttonSizeClass}`}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Question
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Assessment Question"
        description="Are you sure you want to delete this assessment question? This action will permanently remove the question from the system."
        entityName={question.questionText}
        isDeleting={isDeleting}
        confirmButtonText="Delete Question"
      />
    </Sheet>
  );
}
