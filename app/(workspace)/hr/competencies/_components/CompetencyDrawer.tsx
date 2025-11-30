"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Competency } from "@/app/interfaces/domain-interfaces";
import { approvalStatusToColor, competencyProficiencyLevelToColor } from "@/app/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Settings2, ExternalLink, Trash2 } from "lucide-react";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { deleteCompetency } from "@/src/app/actions";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export default function CompetencyDrawer({
  open,
  onOpenChange,
  competency,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  competency: Competency;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCompetency(competency.id);
      toast.success('Competency deleted successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete competency. Please try again.');
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
              {competency.name}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-normal">
              Competency Details
            </SheetDescription>
            
            {/* Accessible Badge Layout */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={competency.isActive ? "default" : "secondary"} 
                className="h-7 text-sm px-2 min-h-7 leading-normal"
                role="status"
                aria-label={`Status: ${competency.isActive ? "Active" : "Inactive"}`}
              >
                {competency.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant="outline"
                className={`${approvalStatusToColor(competency.approvalStatus)} h-7 text-sm px-2 min-h-7 leading-normal`}
                role="status"
                aria-label={`Approval Status: ${competency.approvalStatus}`}
              >
                {competency.approvalStatus}
              </Badge>
              <Badge
                variant="outline"
                className={`${competencyProficiencyLevelToColor(competency.level)} h-7 text-sm px-2 min-h-7 leading-normal`}
                role="status"
                aria-label={`Proficiency Level: ${competency.level}`}
              >
                {competency.level}
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
                  {competency.description}
                </p>
              </div>
            </div>

            {competency.behavioralIndicators && competency.behavioralIndicators.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-sm font-medium leading-normal">Behavioral Indicators ({competency.behavioralIndicators.length})</h3>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {competency.behavioralIndicators.map((indicator) => (
                    <AccordionItem 
                      value={indicator.id} 
                      key={indicator.id}
                      className="border rounded-md bg-card/30"
                    >
                      <AccordionTrigger className="text-sm text-left hover:no-underline px-3 py-3 min-h-11">
                        <IndicatorHoverCard indicatorId={indicator.id}>
                          <span className="hover:text-primary transition-colors line-clamp-1 leading-normal">
                            {indicator.title}
                          </span>
                        </IndicatorHoverCard>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="space-y-2.5 text-sm">
                          <p className="leading-relaxed text-muted-foreground">{indicator.description}</p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-1.5">
                              <Badge variant="outline" className="h-6 text-sm px-2">
                                Weight: {indicator.weight.toFixed(2)}
                              </Badge>
                            </div>
                            <Link 
                              href={`/behavioral-indicators/${indicator.id}`}
                              className="text-primary hover:text-primary/80 hover:underline text-sm flex items-center gap-1.5 min-h-11 p-1"
                              aria-label={`View details for ${indicator.title}`}
                            >
                              View Details
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
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
              aria-label="Delete competency"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
            <Link href={`/competencies/${competency.id}`} passHref className="flex-1">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full min-h-11 text-sm"
                aria-label="View competency details"
              >
                <Eye className="mr-1.5 h-4 w-4" />
                View
              </Button>
            </Link>
            <Link href={`/competencies/${competency.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                size="sm"
                className="w-full min-h-11 text-sm"
                aria-label="Edit competency"
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
        title="Delete Competency"
        description="Are you sure you want to delete this competency? This action will also remove all associated behavioral indicators and assessment questions."
        entityName={competency.name}
        isDeleting={isDeleting}
        confirmButtonText="Delete Competency"
      />
    </Sheet>
  );
}
