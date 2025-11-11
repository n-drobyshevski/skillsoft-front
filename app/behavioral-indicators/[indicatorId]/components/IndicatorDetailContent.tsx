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
} from "../../../interfaces/domain-interfaces";
import { DifficultyLevel } from "../../../enums/domain_enums";
import AssessmentQuestionDrawer from "../../../assessment-questions/components/AssessmentQuestionDrawer";
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {indicator.description ||
                  "No description available for this indicator."}
              </p>
            </CardContent>
          </Card>

          {/* Examples and Counter Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicator.examples && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-500" />
                  Examples
                </h4>
                <Card className="bg-emerald-500/5 border-emerald-500/20">
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
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  Counter Examples
                </h4>
                <Card className="bg-red-500/5 border-red-500/20">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Assessment Questions ({assessmentQuestions.length})
                </CardTitle>
                <Button asChild size="sm">
                  <Link href={`/assessment-questions/new?competencyId=${indicator.competencyId}&behavioralIndicatorId=${indicator.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentQuestions
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((question) => (
                    <Card
                      key={question.id}
                      className="border-muted hover:border-primary/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm flex-1 leading-relaxed">
                            {question.questionText}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              question.difficultyLevel === DifficultyLevel.FOUNDATIONAL
                                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/8"
                                : question.difficultyLevel === DifficultyLevel.INTERMEDIATE
                                ? "border-yellow-500/30 text-yellow-600 bg-yellow-500/8"
                                : question.difficultyLevel === DifficultyLevel.ADVANCED
                                ? "border-orange-500/30 text-orange-600 bg-orange-500/8"
                                : question.difficultyLevel === DifficultyLevel.SPECIALIZED
                                ? "border-red-500/30 text-red-600 bg-red-500/8"
                                : "border-blue-500/30 text-blue-600 bg-blue-500/8"
                            }
                          >
                            {question.difficultyLevel}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {question.questionType.replace("_", " ")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Assessment Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No assessment questions found for this indicator.</p>
                  <Button asChild>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Weight</div>
                <div>{indicator.weight}</div>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Measurement Type</div>
                <div>{indicator.measurementType.replace("_", " ")}</div>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Order Index</div>
                <div>{indicator.orderIndex}</div>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Observability Level</div>
                <Badge variant="outline">
                  {indicator.observabilityLevel}
                </Badge>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Approval Status</div>
                <Badge variant="outline">
                  {indicator.approvalStatus.replace("_", " ")}
                </Badge>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Status</div>
                <Badge variant={indicator.isActive ? "default" : "secondary"}>
                  {indicator.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Competency</div>
                <CompetencyHoverCard competencyId={indicator.competencyId}>
                  <Link href={`/competencies/${indicator.competencyId}`} className="text-primary hover:underline inline-flex items-center gap-1">
                    View Competency
                    <Info className="h-3 w-3 opacity-60" />
                  </Link>
                </CompetencyHoverCard>
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