"use client";

import * as React from "react";
import { Eye, Settings2, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { biLevelToColor } from "@/app/utils";
import { useState, useEffect } from "react";
import { AssessmentQuestion, BehavioralIndicator } from "@/app/interfaces/domain-interfaces";
import { assessmentQuestionsApi } from "@/services/api";
import QuestionCard from "./QuestionCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { CompetencyHoverCard } from "../[indicatorId]/components/CompetencyHoverCard";
import { DeleteConfirmationDialog } from "@/app/components/DeleteConfirmationDialog";
import { deleteIndicator } from "@/src/app/actions";
import { toast } from "sonner";
import Link from "next/link";

export default function IndicatorDrawer({
  open,
  onOpenChange,
  indicator,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  indicator: BehavioralIndicator;
}) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

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
              {indicator.title}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-normal">
              Behavioral Indicator Details
            </SheetDescription>
            
            {/* Accessible Badge Layout */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={indicator.isActive ? "default" : "secondary"} 
                className="h-7 text-sm px-2 min-h-7 leading-normal"
                role="status"
                aria-label={`Status: ${indicator.isActive ? "Active" : "Inactive"}`}
              >
                {indicator.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant="outline"
                className={`${biLevelToColor(indicator.observabilityLevel)} h-7 text-sm px-2 min-h-7 leading-normal`}
                role="status"
                aria-label={`Observability Level: ${indicator.observabilityLevel}`}
              >
                {indicator.observabilityLevel}
              </Badge>
              <Badge 
                variant="secondary" 
                className="h-7 text-sm px-2 min-h-7 leading-normal"
                role="status"
                aria-label={`Weight: ${indicator.weight.toFixed(2)}`}
              >
                Weight: {indicator.weight.toFixed(2)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Accessible Content Section */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "p-3" : "p-4"} space-y-4`}>
            <div className="space-y-2.5">
              <h3 className="text-sm font-medium leading-normal">Description</h3>
              <div className="rounded-md border bg-card/50 p-3">
                <p className="text-sm leading-relaxed text-foreground">
                  {indicator.description}
                </p>
              </div>
            </div>
            
            {/* Competency Section */}
            {indicator.competencyId && (
              <div className="space-y-2.5">
                <h3 className="text-sm font-medium leading-normal">Competency</h3>
                <div className="rounded-md border bg-card/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground leading-normal">Part of:</span>
                    <CompetencyHoverCard competencyId={indicator.competencyId}>
                      <Link 
                        href={`/competencies/${indicator.competencyId}`}
                        className="text-sm text-primary hover:text-primary/80 hover:underline font-medium inline-flex items-center gap-1.5 min-h-11 p-1"
                        aria-label="View competency details"
                      >
                        View Competency
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </CompetencyHoverCard>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2.5">
              <h3 className="text-sm font-medium leading-normal">Assessment Questions</h3>
              {loading && <p className="text-sm text-muted-foreground leading-normal">Loading questions...</p>}
              {error && <p className="text-sm text-destructive leading-normal">{error}</p>}
              {!loading && !error && (
                <div className="space-y-2">
                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 leading-normal">No questions found</p>
                  ) : (
                    questions.map((question) => (
                      <div key={question.id} className="rounded-md border bg-card/30 p-3">
                        <QuestionCard question={question} />
                      </div>
                    ))
                  )}
                </div>
              )}
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
              aria-label="Delete behavioral indicator"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
            <Link href={`/behavioral-indicators/${indicator.id}`} passHref className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full min-h-11 text-sm"
                  aria-label="View behavioral indicator details"
                >
                    <Eye className="mr-1.5 h-4 w-4" />
                    View
                </Button>
            </Link>
            <Link href={`/behavioral-indicators/${indicator.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                size="sm"
                className="w-full min-h-11 text-sm"
                aria-label="Edit behavioral indicator"
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
        title="Delete Behavioral Indicator"
        description="Are you sure you want to delete this behavioral indicator? This action will also remove any associated assessment questions."
        entityName={indicator.title}
        isDeleting={isDeleting}
        confirmButtonText="Delete Indicator"
      />
    </Sheet>
  );
}
