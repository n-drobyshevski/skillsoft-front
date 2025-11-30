"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AssessmentQuestion, BehavioralIndicator, Competency } from "@/app/interfaces/domain-interfaces";
import { competenciesApi, behavioralIndicatorsApi } from "@/services/api";
import { questionDifficultyToColor } from "@/app/utils";
import { CompetencyHoverCard } from "@/app/(workspace)/hr/behavioral-indicators/[indicatorId]/_components/CompetencyHoverCard";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { deleteAssessmentQuestion } from "@/src/app/actions";
import { toast } from "sonner";
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
            : "sm:max-w-xl"
        } p-0 flex flex-col`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* WCAG 2.1 Compliant Header with Proper SheetTitle */}
        <div className={`${isMobile ? "p-3" : "p-4"} border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60`}>
          <div className="space-y-2.5">
            <SheetTitle className={`${isMobile ? "text-lg" : "text-xl"} font-semibold leading-normal line-clamp-2`}>
              {question.questionText}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-normal">
              Assessment Question Details
            </SheetDescription>
            
            {/* Accessible Badge Layout */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={question.isActive ? "default" : "secondary"} 
                className="h-7 text-sm px-2 min-h-7 leading-normal"
                role="status"
                aria-label={`Status: ${question.isActive ? "Active" : "Inactive"}`}
              >
                {question.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant="outline"
                className={`${questionDifficultyToColor(question.difficultyLevel)} h-7 text-sm px-2 min-h-7 leading-normal`}
                role="status"
                aria-label={`Difficulty Level: ${question.difficultyLevel}`}
              >
                {question.difficultyLevel}
              </Badge>
              <Badge 
                variant="secondary" 
                className="h-7 text-sm px-2 min-h-7 leading-normal"
                role="status"
                aria-label={`Question Type: ${question.questionType.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}`}
              >
                {question.questionType
                  .split("_")
                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                  .join(" ")}
              </Badge>
            </div>

            {/* Accessible Context Information */}
            {(competency || currentIndicator || isLoadingContext) && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                {isLoadingContext ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading context...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {competency && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Competency:</span>
                        <CompetencyHoverCard competencyId={competency.id}>
                          <Link 
                            href={`/competencies/${competency.id}`}
                            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1.5 min-h-11 p-1"
                            aria-label={`View competency: ${competency.name}`}
                          >
                            {competency.name.length > 25 ? `${competency.name.substring(0, 25)}...` : competency.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </CompetencyHoverCard>
                      </div>
                    )}
                    
                    {currentIndicator && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Indicator:</span>
                        <IndicatorHoverCard indicatorId={currentIndicator.id}>
                          <Link 
                            href={`/behavioral-indicators/${currentIndicator.id}`}
                            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1.5 min-h-11 p-1"
                            aria-label={`View indicator: ${currentIndicator.title}`}
                          >
                            {currentIndicator.title.length > 25 ? `${currentIndicator.title.substring(0, 25)}...` : currentIndicator.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </IndicatorHoverCard>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Accessible Content Section */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "p-3" : "p-4"} space-y-4`}>
            {question.answerOptions && question.answerOptions.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-sm font-medium leading-normal">Answer Options</h3>
                <div className="space-y-2">
                  {question.answerOptions.map((option, index) => (
                    <div 
                      key={index} 
                      className="text-sm p-3 border rounded-md bg-card/50 flex gap-2 leading-relaxed"
                    >
                      <span className="font-medium text-primary min-w-4">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-foreground">{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2.5">
              <h3 className="text-sm font-medium leading-normal">Scoring Rubric</h3>
              <div className="rounded-md border bg-card/50 p-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {question.scoringRubric}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessible Footer with Proper Touch Targets */}
        <div className={`${isMobile ? "p-3" : "p-4"} border-t bg-muted/30`}>
          <div className={`flex ${isMobile ? "flex-col gap-2.5" : "gap-2.5"} w-full`}>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 min-h-11 text-sm"
              aria-label="Delete assessment question"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
            <Link href={`/assessment-questions/${question.id}`} passHref className="flex-1">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full min-h-11 text-sm"
                aria-label="View assessment question details"
              >
                <Eye className="mr-1.5 h-4 w-4" />
                View
              </Button>
            </Link>
            <Link href={`/assessment-questions/${question.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                size="sm"
                className="w-full min-h-11 text-sm"
                aria-label="Edit assessment question"
              >
                <Settings2 className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
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
