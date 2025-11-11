"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Competency } from "../../interfaces/domain-interfaces";
import { approvalStatusToColor, competencyProficiencyLevelToColor } from "../../utils";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Settings2, ExternalLink, Trash2 } from "lucide-react";
import { IndicatorHoverCard } from "../../components/IndicatorHoverCard";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
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

  const buttonSizeClass = `${isMobile ? "h-12 text-base" : "h-10"} min-h-11`;

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
            {competency.name}
          </SheetTitle>
          <SheetDescription className={`${isMobile ? "text-sm" : "text-base"} leading-relaxed`}>
            Details for the competency.
          </SheetDescription>
          <div className={`flex items-center justify-start gap-3 pt-4 flex-wrap`}>
            <Badge variant={competency.isActive ? "default" : "secondary"} className="min-h-8">
              {competency.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="outline"
              className={`${approvalStatusToColor(competency.approvalStatus)} min-h-8`}
            >
              {competency.approvalStatus}
            </Badge>
            <Badge
              variant="outline"
              className={`${competencyProficiencyLevelToColor(competency.level)} min-h-8`}
            >
              {competency.level}
            </Badge>
          </div>
        </SheetHeader>
        <Separator />
        <div className={`flex-1 overflow-y-auto ${isMobile ? "p-4" : "p-6"} space-y-6`}>
          <div>
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-4`}>Description</h3>
            <div className="border rounded-lg bg-card p-4">
              <p className={`${isMobile ? "text-sm" : "text-sm"} text-foreground leading-relaxed`}>
                {competency.description}
              </p>
            </div>
          </div>
          {competency.behavioralIndicators && competency.behavioralIndicators.length > 0 && (
            <div>
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-4`}>Behavioral Indicators</h3>
              <Accordion type="single" collapsible className="w-full">
                {competency.behavioralIndicators.map((indicator) => (
                  <AccordionItem value={indicator.id} key={indicator.id}>
                    <AccordionTrigger className={`${isMobile ? "text-sm" : "text-base"} text-left hover:no-underline`}>
                      <IndicatorHoverCard indicatorId={indicator.id}>
                        <span className="hover:text-primary transition-colors">
                          {indicator.title}
                        </span>
                      </IndicatorHoverCard>
                    </AccordionTrigger>
                    <AccordionContent className={`${isMobile ? "text-sm" : "text-sm"} leading-relaxed`}>
                      <div className="space-y-2">
                        <p>{indicator.description}</p>
                        <div className="flex items-center gap-2 pt-2">
                          <Link 
                            href={`/behavioral-indicators/${indicator.id}`}
                            className="text-primary hover:text-primary/80 hover:underline text-xs flex items-center gap-1"
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
            <Link href={`/competencies/${competency.id}`} passHref className="flex-1">
              <Button 
                variant="outline" 
                className={`w-full ${buttonSizeClass}`}
              >
                <Eye className="mr-2 h-4 w-4" />
                Go to Page
              </Button>
            </Link>
            <Link href={`/competencies/${competency.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                className={`w-full ${buttonSizeClass}`}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Competency
              </Button>
            </Link>
          </div>
        </SheetFooter>
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
