'use client';

import { useState, useCallback } from "react";
import { z } from "zod";
import { AssessmentQuestion } from "../../../../interfaces/domain-interfaces";
import { QuestionForm } from "../../../components/QuestionForm";
import QuestionPreview from "../../../components/QuestionPreview";
import PageHeader from "@/components/PageHeader";
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
    <div className="container mx-auto p-4">
       <PageHeader
        className="flex flex-1 flex-col gap-4 py-6 pt-4 md:gap-6 md:p-4 pl-0!"
            title="Edit Assessment Question"
        />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <QuestionForm
            question={question}
            competencyId={competencyId}
            behavioralIndicatorId={question.behavioralIndicatorId}
            onUpdatePreview={handleUpdatePreview}
          />
        </div>
        <div className="hidden lg:block">
          <QuestionPreview question={previewQuestion} />
        </div>
      </div>
    </div>
  );
}
