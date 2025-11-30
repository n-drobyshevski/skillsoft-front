'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/app/components/DeleteConfirmationDialog";
import { behavioralIndicatorsApi } from "@/services/api";
import { toast } from 'sonner';
import {
  FileText,
  HelpCircle,
  Info,
  ArrowLeft,
  Lightbulb,
  X,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  BehavioralIndicator,
  AssessmentQuestion,
} from "@/app/interfaces/domain-interfaces";
import { DifficultyLevel } from "@/app/enums/domain_enums";
import AssessmentQuestionDrawer from "@/app/(workspace)/hr/assessment-questions/components/AssessmentQuestionDrawer";
import { CompetencyHoverCard } from "./CompetencyHoverCard";

interface IndicatorPageProps {
  indicator: BehavioralIndicator;
  assessmentQuestions: AssessmentQuestion[];
}

const approvalStatusToColor = (status: string): string => {
    const colors: { [key: string]: string } = {
        DRAFT: "border-gray-500/30 text-gray-400 bg-gray-500/8 dark:text-gray-300",
        PENDING_REVIEW: "border-yellow-500/30 text-yellow-500 bg-yellow-500/8 dark:text-yellow-300",
        APPROVED: "border-emerald-500/30 text-emerald-600 bg-emerald-500/8 dark:text-emerald-300",
        REJECTED: "border-red-500/30 text-red-400 bg-red-500/8 dark:text-red-300",
        ARCHIVED: "border-gray-500/30 text-gray-400 bg-gray-500/8 dark:text-gray-300",
        UNDER_REVISION: "border-blue-500/30 text-blue-600 bg-blue-500/8 dark:text-blue-300",
    };
    return colors[status] || colors["DRAFT"];
};

const levelToColor = (level: string): string => {
    const colors: { [key: string]: string } = {
        NOVICE: "border-red-500/30 text-red-400 bg-red-500/8 dark:text-red-300",
        DEVELOPING:
            "border-orange-500/30 text-orange-500 bg-orange-500/8 dark:text-orange-300",
        PROFICIENT:
            "border-yellow-500/30 text-yellow-600 bg-yellow-500/8 dark:text-yellow-300",
        ADVANCED:
            "border-emerald-500/30 text-emerald-600 bg-emerald-500/8 dark:text-emerald-300",
        EXPERT:
            "border-blue-500/30 text-blue-600 bg-blue-500/8 dark:text-blue-300",
    };
    return colors[level] || colors["NOVICE"];
};

const formatProficiencyLevel = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase().replace("_", " ");
};

export default function IndicatorPage({ indicator, assessmentQuestions }: IndicatorPageProps) {
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await behavioralIndicatorsApi.deleteIndicator(indicator.competencyId, indicator.id);
      toast.success('Behavioral indicator deleted successfully');
      router.push('/behavioral-indicators');
    } catch (error: any) {
      if (error.status === 404) {
        // Handle case where the indicator was already deleted
        toast.warning('This behavioral indicator was already deleted.');
        router.push('/behavioral-indicators');
      } else {
        toast.error('Failed to delete indicator. Please try again.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {indicator.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={levelToColor(indicator.observabilityLevel)}
              >
                {formatProficiencyLevel(indicator.observabilityLevel)}
              </Badge>
              <Badge variant={indicator.isActive ? "default" : "secondary"}>
                {indicator.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant="outline"
                className={approvalStatusToColor(indicator.approvalStatus)}
              >
                {indicator.approvalStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Link href={`/behavioral-indicators/${indicator.id}/edit`} passHref>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

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
                <Badge variant="outline" className={levelToColor(indicator.observabilityLevel)}>
                  {formatProficiencyLevel(indicator.observabilityLevel)}
                </Badge>
              </div>
              <div className="grid gap-1">
                <div className="font-semibold text-muted-foreground">Approval Status</div>
                <Badge variant="outline" className={approvalStatusToColor(indicator.approvalStatus)}>
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
      
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Behavioral Indicator"
        description="Are you sure you want to delete this behavioral indicator? This will also delete all associated assessment questions."
        entityName={indicator.title}
        isDeleting={isDeleting}
        confirmButtonText="Delete Indicator"
      />
    </div>
  );
}
