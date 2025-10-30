"use client";

import * as React from "react";
import { Eye, Settings2 } from "lucide-react";
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
import { biLevelToColor } from "../../utils";
import { useState, useEffect } from "react";
import { AssessmentQuestion, BehavioralIndicator } from "../../interfaces/domain-interfaces";
import { assessmentQuestionsApi } from "@/services/api";
import QuestionCard from "./QuestionCard";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={`${
          isMobile 
            ? "w-full max-w-full sm:max-w-full" 
            : "sm:max-w-3xl"
        } p-0 flex flex-col`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <SheetHeader className={`${isMobile ? "p-4 pb-2" : "p-6 pb-2"}`}>
          <div className="flex items-center justify-between">
            <SheetTitle className={`${isMobile ? "text-xl" : "text-2xl"} font-bold leading-tight wrap-break-word flex-1 pr-2`}>
              {indicator.title}
            </SheetTitle>
          </div>
          <SheetDescription className={`${isMobile ? "text-sm" : "text-base"} leading-relaxed`}>
            Details for the behavioral indicator.
          </SheetDescription>
            <div className="flex items-center justify-start gap-2 pt-4 flex-wrap">
              <Badge variant={indicator.isActive ? "default" : "secondary"} className="min-h-8">
                {indicator.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant="outline"
                className={`${biLevelToColor(indicator.observabilityLevel)} min-h-8`}
              >
                {indicator.observabilityLevel}
              </Badge>
              <Badge variant="secondary" className="min-h-8">
                Weight: {indicator.weight.toFixed(2)}
              </Badge>
            </div>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "p-4" : "p-6"} space-y-6`}>
            <div className="space-y-2">
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Description</h3>
              <p className={`leading-relaxed text-muted-foreground ${isMobile ? "text-sm" : "text-sm"}`}>
                {indicator.description}
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Assessment Questions</h3>
              {loading && <p className={`${isMobile ? "text-sm" : "text-base"}`}>Loading questions...</p>}
              {error && <p className={`text-red-500 ${isMobile ? "text-sm" : "text-base"}`}>{error}</p>}
              {!loading && !error && (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard question={question} key={question.id} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <SheetFooter className={`${isMobile ? "p-4" : "p-6"} bg-muted/40 border-t mt-auto`}>
          <div className={`flex ${isMobile ? "flex-col gap-3" : "flex-row gap-2"} w-full`}>
            <Link href={`/behavioral-indicators/${indicator.id}`} passHref className="flex-1">
                <Button 
                  variant="outline" 
                  className={`w-full ${isMobile ? "h-12 text-base" : "h-10"} min-h-11`}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    Go to Page
                </Button>
            </Link>
            <Link href={`/behavioral-indicators/${indicator.id}/edit`} passHref className="flex-1">
              <Button 
                variant="default" 
                className={`w-full ${isMobile ? "h-12 text-base" : "h-10"} min-h-11`}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Indicator
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
