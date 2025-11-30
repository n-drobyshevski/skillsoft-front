'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  X,
  Plus,
} from "lucide-react";
import type {
  BehavioralIndicator,
  AssessmentQuestion,
} from "@/app/interfaces/domain-interfaces";
import { DifficultyLevel } from "@/app/enums/domain_enums";
import AssessmentQuestionDrawer from "@/app/(workspace)/hr/assessment-questions/components/AssessmentQuestionDrawer";
import { CompetencyHoverCard } from "./CompetencyHoverCard";

interface IndicatorDetailContentProps {
  indicator: BehavioralIndicator;
  assessmentQuestions: AssessmentQuestion[];
}

export default function IndicatorDetailContent({ indicator, assessmentQuestions }: IndicatorDetailContentProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {indicator.description ||
                  "No description available for this indicator."}
              </p>
            </CardContent>
          </Card>

          {/* Examples and Counter Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicator.examples && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2.5 text-sm">
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Examples
                </h4>
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      {indicator.examples}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {indicator.counterExamples && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2.5 text-sm">
                  <div className="p-1 rounded-md bg-red-100 dark:bg-red-900/30">
                    <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  Counter Examples
                </h4>
                <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                      {indicator.counterExamples}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Assessment Questions */}
          {assessmentQuestions.length > 0 ? (
            <Card className="border-none shadow-sm bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Assessment Questions
                  <Badge variant="secondary" className="ml-1 font-medium text-xs">
                    {assessmentQuestions.length}
                  </Badge>
                </CardTitle>
                <Button asChild size="sm" variant="outline" className="h-8">
                  <Link href={`/assessment-questions/new?competencyId=${indicator.competencyId}&behavioralIndicatorId=${indicator.id}`}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Question
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {assessmentQuestions
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((question, index) => (
                    <div
                      key={question.id}
                      className="group relative bg-background/50 border border-border/50 rounded-lg hover:bg-background hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      {/* Main content area */}
                      <div className="flex items-start gap-3 p-3">
                        {/* Question number indicator */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-muted/60 group-hover:bg-primary/20 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200">
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                              {index + 1}
                            </span>
                          </div>
                          
                          {/* Question content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Question text */}
                            <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                              {question.questionText}
                            </p>
                            
                            {/* Question type */}
                            <p className="text-xs text-muted-foreground font-medium">
                              {question.questionType.replace("_", " ")}
                            </p>
                          </div>
                          
                          {/* Difficulty badge */}
                          <div className="shrink-0">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-1 font-medium ${
                                question.difficultyLevel === DifficultyLevel.FOUNDATIONAL
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : question.difficultyLevel === DifficultyLevel.INTERMEDIATE
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                                  : question.difficultyLevel === DifficultyLevel.ADVANCED
                                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                                  : question.difficultyLevel === DifficultyLevel.SPECIALIZED
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {question.difficultyLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-linear-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm bg-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Assessment Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-muted/60 rounded-lg flex items-center justify-center mb-3">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 font-medium">
                    No assessment questions found for this indicator.
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/assessment-questions/new?competencyId=${indicator.competencyId}&behavioralIndicatorId=${indicator.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2.5 text-foreground">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Weight */}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Weight</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                    {indicator.weight}
                  </span>
                </div>
              </div>

              {/* Measurement Type */}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Measurement Type</span>
                <Badge variant="secondary" className="font-medium text-xs px-2.5 py-1">
                  {indicator.measurementType.replace("_", " ")}
                </Badge>
              </div>

              {/* Order Index */}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Order Index</span>
                <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                  {indicator.orderIndex}
                </span>
              </div>

              {/* Observability Level */}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Observability Level</span>
                <Badge variant="secondary" className="font-medium text-xs px-2.5 py-1">
                  {indicator.observabilityLevel}
                </Badge>
              </div>

              {/* Approval Status */}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Approval Status</span>
                <Badge variant="secondary" className="font-medium text-xs px-2.5 py-1">
                  {indicator.approvalStatus.replace("_", " ")}
                </Badge>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">Status</span>
                <Badge 
                  variant={indicator.isActive ? "default" : "secondary"}
                  className="font-medium text-xs px-2.5 py-1"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${indicator.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {indicator.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Competency */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground font-medium">Competency</span>
                <div className="flex items-center gap-2">
                  <CompetencyHoverCard competencyId={indicator.competencyId}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="h-7 px-2.5 text-xs hover:bg-muted/80 text-primary"
                    >
                      <Link href={`/competencies/${indicator.competencyId}`}>
                        View Details
                        <Info className="h-3 w-3 ml-1.5 opacity-60" />
                      </Link>
                    </Button>
                  </CompetencyHoverCard>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedQuestion && (
        <AssessmentQuestionDrawer
          open={!!selectedQuestion}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedQuestion(null);
            }
          }}
          question={selectedQuestion}
        />
      )}
    </>
  );
}