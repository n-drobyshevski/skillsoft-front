"use client";

import * as React from "react";
import { 
  Trash2, 
  FileText, 
  Link2, 
  HelpCircle,
  Layers,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { biLevelToColor } from "@/lib/ui-utils";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AssessmentQuestion, BehavioralIndicator } from "@/types/domain";
import { assessmentQuestionsApi } from "@/services/api";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import QuestionCard from "./QuestionCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { CompetencyHoverCard } from "../[indicatorId]/_components/CompetencyHoverCard";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { deleteIndicator } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function IndicatorDrawer({
  open,
  onOpenChange,
  indicator,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  indicator: BehavioralIndicator;
}) {
  const router = useRouter();
  const t = useTranslations("indicator");
  const tEnum = useTranslations("enums.observabilityLevel");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  useEffect(() => {
    if (open) {
      const fetchQuestionsForIndicator = async () => {
        setLoading(true);
        setError(null);
        try {
          if (!indicator.competencyId || !indicator.id) {
            throw new Error("Indicator is not defined");
          }
          const questionsData = await assessmentQuestionsApi.getIndicatorQuestions(
            indicator.competencyId,
            indicator.id
          );
          if (!questionsData) {
            throw new Error("Failed to fetch assessment questions");
          }
          setQuestions(questionsData);
        } catch {
          setError("Failed to load questions.");
        } finally {
          setLoading(false);
        }
      };
      fetchQuestionsForIndicator();
    }
  }, [open, indicator]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteIndicator(indicator.id, indicator.competencyId);
      toast.success('Indicator deleted successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 404) {
        // Handle case where the indicator was already deleted
        toast.warning('This behavioral indicator was already deleted.');
        onOpenChange(false);
      } else {
        toast.error('Failed to delete indicator. Please try again.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Clean Header */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-b border-border/40`}>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex-1 min-w-0 space-y-1">
              <SheetTitle className="text-base font-semibold leading-tight line-clamp-2 text-foreground">
                {indicator.title}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Behavioral Indicator Overview
              </SheetDescription>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Badge
              variant={indicator.isActive ? "default" : "secondary"}
              className="h-5 text-[11px] px-1.5 font-medium"
            >
              {indicator.isActive ? t("columns.active") : t("columns.inactive")}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${biLevelToColor(indicator.observabilityLevel)} h-5 text-[11px] px-1.5 font-medium`}
                >
                  {tEnum(indicator.observabilityLevel)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {tEnum(`${indicator.observabilityLevel}_DESC`)}
              </TooltipContent>
            </Tooltip>
            <Badge 
              variant="outline" 
              className="h-5 text-[11px] px-1.5 font-medium text-muted-foreground"
            >
              Weight: {indicator.weight.toFixed(2)}
            </Badge>
            
            {/* Context Scope */}
            {indicator.contextScope && (
              <Badge 
                variant="secondary"
                className={`h-5 text-[11px] px-1.5 font-medium ${
                  indicator.contextScope === 'UNIVERSAL' 
                    ? 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800' 
                    : indicator.contextScope === 'PROFESSIONAL'
                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                    : indicator.contextScope === 'TECHNICAL'
                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {indicator.contextScope}
              </Badge>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "px-4 py-4" : "px-5 py-5"} space-y-5`}>
            {/* Description Section */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <h3 className="text-xs font-medium uppercase tracking-wide">Description</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 pl-5">
                {indicator.description}
              </p>
            </section>
            
            {/* Competency Section */}
            {indicator.competencyId && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" />
                  <h3 className="text-xs font-medium uppercase tracking-wide">Linked Competency</h3>
                </div>
                <div className="pl-5">
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Part of:</span>
                    <CompetencyHoverCard competencyId={indicator.competencyId}>
                      <button 
                        onClick={() => handleNavigate(`/hr/competencies/${indicator.competencyId}`)}
                        className="text-xs text-primary/80 hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        View Competency
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </CompetencyHoverCard>
                  </div>
                </div>
              </section>
            )}
            
            {/* Questions Section */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HelpCircle className="h-3.5 w-3.5" />
                <h3 className="text-xs font-medium uppercase tracking-wide">Assessment Questions</h3>
                {!loading && !error && (
                  <Badge variant="secondary" className="h-4 text-[10px] px-1.5 ml-auto">
                    {questions.length}
                  </Badge>
                )}
              </div>
              <div className="pl-5">
                {loading && (
                  <p className="text-xs text-muted-foreground py-3">Loading questions...</p>
                )}
                {error && (
                  <p className="text-xs text-destructive py-3">{error}</p>
                )}
                {!loading && !error && (
                  <div className="space-y-1.5">
                    {questions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No questions found
                      </p>
                    ) : (
                      questions.map((question) => (
                        <div 
                          key={question.id} 
                          className="rounded-lg border border-border/40 bg-muted/20 p-2.5"
                        >
                          <QuestionCard question={question} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-manipulation"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate(`/hr/behavioral-indicators/${indicator.id}`)}
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleNavigate(`/hr/behavioral-indicators/${indicator.id}/edit`)}
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-4 sm:px-3 text-xs touch-manipulation"
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
        title="Delete Behavioral Indicator"
        description="Are you sure you want to delete this behavioral indicator? This action will also remove any associated assessment questions."
        entityName={indicator.title}
        isDeleting={isDeleting}
        confirmButtonText="Delete Indicator"
      />
    </Sheet>
  );
}
