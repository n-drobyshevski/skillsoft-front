"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AssessmentQuestion, BehavioralIndicator, Competency } from "@/types/domain";
import { competenciesApi, behavioralIndicatorsApi } from "@/services/api";
import { questionDifficultyToColor } from "@/lib/ui-utils";
import { CompetencyHoverCard } from "@/app/(workspace)/hr/behavioral-indicators/[indicatorId]/_components/CompetencyHoverCard";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { deleteAssessmentQuestion } from "@/src/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Trash2, 
  ListChecks, 
  FileText,
  Layers,
  Pencil,
  ChevronRight,
} from "lucide-react";

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
  const router = useRouter();
  const isMobile = useIsMobile();
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [currentIndicator, setCurrentIndicator] = useState<BehavioralIndicator | null>(indicator || null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

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
            : "sm:max-w-lg"
        } p-0 flex flex-col gap-0 border-l border-border/50`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Clean Header */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-b border-border/40`}>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex-1 min-w-0 space-y-1">
              <SheetTitle className="text-base font-semibold leading-tight line-clamp-2 text-foreground">
                {question.questionText.length > 80 
                  ? `${question.questionText.substring(0, 80)}...` 
                  : question.questionText}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Assessment Question Overview
              </SheetDescription>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Badge 
              variant={question.isActive ? "default" : "secondary"} 
              className="h-5 text-[11px] px-1.5 font-medium"
            >
              {question.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="outline"
              className={`${questionDifficultyToColor(question.difficultyLevel)} h-5 text-[11px] px-1.5 font-medium`}
            >
              {question.difficultyLevel}
            </Badge>
            <Badge 
              variant="outline" 
              className="h-5 text-[11px] px-1.5 font-medium text-muted-foreground"
            >
              {question.questionType.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
            </Badge>
            
            {/* Context Tags */}
            {question.metadata?.tags && question.metadata.tags.length > 0 && question.metadata.tags.map((tag: string) => (
              <Badge 
                key={tag}
                variant="secondary"
                className={`h-5 text-[11px] px-1.5 font-medium ${
                  tag === 'GENERAL' 
                    ? 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800' 
                    : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Context Information */}
          {(competency || currentIndicator || isLoadingContext) && (
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-2.5 space-y-1.5">
              {isLoadingContext ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading context...
                </div>
              ) : (
                <>
                  {competency && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Competency:</span>
                      <CompetencyHoverCard competencyId={competency.id}>
                        <button 
                          onClick={() => handleNavigate(`/hr/competencies/${competency.id}`)}
                          className="text-primary/80 hover:text-primary flex items-center gap-1 transition-colors font-medium"
                        >
                          {competency.name.length > 20 ? `${competency.name.substring(0, 20)}...` : competency.name}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </CompetencyHoverCard>
                    </div>
                  )}
                  
                  {currentIndicator && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Indicator:</span>
                      <IndicatorHoverCard indicatorId={currentIndicator.id}>
                        <button 
                          onClick={() => handleNavigate(`/hr/behavioral-indicators/${currentIndicator.id}`)}
                          className="text-primary/80 hover:text-primary flex items-center gap-1 transition-colors font-medium"
                        >
                          {currentIndicator.title.length > 20 ? `${currentIndicator.title.substring(0, 20)}...` : currentIndicator.title}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </IndicatorHoverCard>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "px-4 py-4" : "px-5 py-5"} space-y-5`}>
            {/* Answer Options Section */}
            {question.answerOptions && question.answerOptions.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" />
                  <h3 className="text-xs font-medium uppercase tracking-wide">Answer Options</h3>
                  <Badge variant="secondary" className="h-4 text-[10px] px-1.5 ml-auto">
                    {question.answerOptions.length}
                  </Badge>
                </div>
                <div className="space-y-1.5 pl-5">
                  {question.answerOptions.map((option, index) => (
                    <div 
                      key={index} 
                      className="text-sm px-3 py-2 rounded-lg border border-border/40 bg-muted/20 flex gap-2"
                    >
                      <span className="font-medium text-primary/70 text-xs min-w-4">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-foreground/90 text-xs leading-relaxed">
                        {option.text}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Scoring Rubric Section */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <h3 className="text-xs font-medium uppercase tracking-wide">Scoring Rubric</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 pl-5">
                {question.scoringRubric}
              </p>
            </section>
          </div>
        </div>

        {/* Clean Footer */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-t border-border/40 bg-muted/20`}>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigate(`/hr/assessment-questions/${question.id}`)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleNavigate(`/hr/assessment-questions/${question.id}/edit`)}
              className="h-8 px-3 text-xs"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
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
