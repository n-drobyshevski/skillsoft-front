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
import { approvalStatusToColor, competencyCategoryToIcon, competencyProficiencyLevelToColor } from "../../utils";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Settings2 } from "lucide-react";
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
          <SheetTitle className={`${isMobile ? "text-xl" : "text-2xl"} font-bold flex items-center gap-2 leading-tight`}>
            {competencyCategoryToIcon(competency.category)}
            <span className="wrap-break-word">{competency.name}</span>
          </SheetTitle>
          <SheetDescription className={`${isMobile ? "text-sm" : "text-base"} leading-relaxed`}>
            Details for the competency.
          </SheetDescription>
          <div className={`flex items-center justify-start gap-2 pt-4 flex-wrap`}>
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
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Description</h3>
            <p className={`mt-2 ${isMobile ? "text-sm" : "text-sm"} text-muted-foreground leading-relaxed`}>
              {competency.description}
            </p>
          </div>
          {competency.behavioralIndicators && competency.behavioralIndicators.length > 0 && (
            <div>
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Behavioral Indicators</h3>
              <Accordion type="single" collapsible className="w-full mt-2">
                {competency.behavioralIndicators.map((indicator) => (
                  <AccordionItem value={indicator.id} key={indicator.id}>
                    <AccordionTrigger className={`${isMobile ? "text-sm" : "text-base"} text-left`}>
                      {indicator.title}
                    </AccordionTrigger>
                    <AccordionContent className={`${isMobile ? "text-sm" : "text-sm"} leading-relaxed`}>
                      {indicator.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
        <SheetFooter className={`${isMobile ? "p-4" : "p-6"} bg-muted/40 border-t mt-auto`}>
          <div className={`flex ${isMobile ? "flex-col gap-3" : "flex-row gap-2"} w-full`}>
            <Link href={`/competencies/${competency.id}`} passHref className="flex-1">
              <Button 
                variant="outline" 
                className={`w-full ${isMobile ? "h-12 text-base" : "h-10"} min-h-11`}
              >
                <Eye className="mr-2 h-4 w-4" />
                Go to Page
              </Button>
            </Link>
            <Link href={`/competencies/${competency.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                className={`w-full ${isMobile ? "h-12 text-base" : "h-10"} min-h-11`}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Competency
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
