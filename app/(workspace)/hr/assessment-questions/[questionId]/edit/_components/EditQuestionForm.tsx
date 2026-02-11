'use client';

import { useState, useCallback } from "react";
import { z } from "zod";
import { AssessmentQuestion } from "@/types/domain";
import { QuestionForm } from "../../../_components/QuestionForm";
import QuestionPreview from "../../../_components/QuestionPreview";
import PageHeader from "@/components/common/PageHeader";
import { questionSchema } from "../../../validation";

type QuestionFormValues = z.infer<typeof questionSchema>;

interface EditQuestionFormProps {
  question: AssessmentQuestion;
  competencyId: string;
}

export default function EditQuestionForm({ question, competencyId }: EditQuestionFormProps) {
  const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion>(question);

  const handleUpdatePreview = useCallback((data: QuestionFormValues) => {
    // Convert form values to AssessmentQuestion format
    const updatedQuestion: Partial<AssessmentQuestion> = {
      questionText: data.questionText,
      questionType: data.questionType,
      answerOptions: data.answerOptions,
      scoringRubric: data.scoringRubric,
      timeLimit: data.timeLimit,
      difficultyLevel: data.difficultyLevel,
      isActive: data.isActive,
      orderIndex: data.orderIndex,
    };
    setPreviewQuestion({ ...previewQuestion, ...updatedQuestion });
  }, [previewQuestion]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4">
          <PageHeader
            className="py-4 border-0"
            title="Edit Assessment Question"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3">
            <QuestionForm
              question={question}
              competencyId={competencyId}
              behavioralIndicatorId={question.behavioralIndicatorId}
              onUpdatePreview={handleUpdatePreview}
            />
          </div>
          <div className="xl:col-span-2">
            <div className="sticky top-6">
              <QuestionPreview question={previewQuestion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
